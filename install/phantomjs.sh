#!

clear
echo ""
echo "Updating ...."
sudo apt-get update
sudo apt-get install build-essential chrpath libssl-dev libxft-dev
sudo apt-get install libfreetype6 libfreetype6-dev libfontconfig1 libfontconfig1-dev

echo "Downloading phantomjs tarball..."

wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
tar xvjf phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /usr/local/share/
sudo ln -sf /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin

echo "Clean up download file..."
echo ""
rm phantomjs-2.1.1-linux-x86_64.tar.bz2

echo ""
echo "Checking phantomjs"
phantomjs --version