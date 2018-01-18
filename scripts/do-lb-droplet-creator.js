const axios = require('axios').default;

const TOKEN = '4a8f0c26144982621fb0d04f411dfbc6b0ab6b6dec6a6e3256e88492f5ff4e03';
const IMAGE_ID = '30626530';
const REGION_ID = '8';
const SSH_KEYS = [15862826, 9068054];
let ctr = 0;
// list lodbalancer droplets
// remove mark as down
// create droplet from snapshots
// attached created droplet to loadbalancer

const LOAD_BALANCER_ID = '6b011db3-7080-4914-9e72-e22535e061e4';

const APP_PORT = 3000;
const APP_PATH = '/health-check';


const doAPI = axios.create({
  baseURL: 'https://api.digitalocean.com/v2/',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Content-Type': 'application/json'
  }
});


const Droplet = {
  create() {
    const names = ["james-online-scraper-" + Date.now() + '-' + (ctr++)]

    const data = {
      "names": names,
      "region": "nyc3",
      "size": "512mb",
      "image": IMAGE_ID,
      "ssh_keys": SSH_KEYS,
      "backups": false,
      "ipv6": false,
      "user_data": getUserData(),
      "private_networking": null,
      "tags": null
    };
    return doAPI.post('droplets', data);
  },
  remove(id) {
    return doAPI.delete('droplets/' + id);
  },
  get(id) {
    return doAPI.get('droplets/' + id).then(({ data }) => {
      return data.droplet || {}
    })
  }
}

const LoadBalancer = {
  addDroplets(ids) {
    const data = {
      "droplet_ids": ids
    };

    return doAPI.post('load_balancers/' + LOAD_BALANCER_ID + '/droplets', data);
  },

  removeDroplets(ids) {
    const data = {
      "droplet_ids": ids
    };
    return doAPI.delete('load_balancers/' + LOAD_BALANCER_ID + '/droplets', data);
  },

  list() {
    return doAPI.get('load_balancers')
      .then(({ data }) => {
        return data
      })
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function getUserData() {
  const agentIndex = randomIntFromInterval(1, 16);
  return `rm cookies.json;pm2 delete all;NODE_ENV=production AGENT_INDEX=${agentIndex} pm2 start online-scraper/bin/www -i 1 --name "crawler"`
}

function createDroplet() {

  return Droplet.create().then(rs => {
    console.log('Created success', rs.data.droplets);

    const droplets = rs.data.droplets || [];
    const ids = droplets.map(droplet => droplet.id);

    console.log('Adding', ids, ' to loadbalancer');
    return LoadBalancer.addDroplets(ids).then(
      (rs) => console.log("Added to load balancer"),
      (e) => console.log('Error on adding to load balancer', e.message)
    )
  }).catch(e => {
    console.log('Create droplet error', e.code, e.message);
  })
}

function startCheck() {
  LoadBalancer.list().then(({ load_balancers }) => {
    const lb = load_balancers.filter(d => d.id === LOAD_BALANCER_ID).pop();
    const { droplet_ids } = lb;
    const numberOfDroplets = droplet_ids.length;

    const job = (done) => {
      const dropletId = droplet_ids.pop();

      if (!dropletId) return done();

      Droplet.get(dropletId)
        .then(dropletData => {
          const { networks } = dropletData;
          const ip = networks.v4[0].ip_address;
          const healthCheck = `http://${ip}:${APP_PORT}${APP_PATH}`;

          axios.get(healthCheck).then(
            (rs) => {
              console.log('dropletId', dropletId, rs.data);
              job(done);
            },
            (e) => {
              console.log('Error', dropletData.name, e.code, e.message);
              Promise.all([
                Droplet.remove(dropletId),
                createDroplet()
              ]).then(
                () => job(done),
                () => console.log('Error processing all promisses', e.message)
                );
            }
          );
        },
        (e) => {
          console.log('Error on fetching droplets', e.message)
          LoadBalancer.removeDroplets([dropletId]).then(
            () => job(done),
            (e) => {
              console.log('Error on removing droplet from load balancer', e.message);
              job(done);
            }
          )
        }
        );
    }
    job(() => {
      console.log('done checking of droplets');
      if (numberOfDroplets < 6) {
        console.log('Number of droplets below the required of 6');
        const numberRequired = 6 - numberOfDroplets;

        console.log('Need more', numberOfDroplets, 'to create');

        const promises = [];
        for (let x = 0; x < numberRequired; x++) {
          promises.push(createDroplet())
        }

        Promise.all(promises).then(
          () => startCheck(),
          (e) => {
            console.error('Error on adding more droplets', e.message)
            startCheck();
          }
        )
      } else {
        setTimeout(() => {
          startCheck();
        }, 10 * 60 * 1000);
      }
    })
  })

}

startCheck();