# Online Scraper

# How to Run 
`AGENT_INDEX` = The agent index of the phantomjs user agent.

```sh
$ NODE_ENV=production node bin/www
```

## Sample POST request to the server
`POST /api/crawler`
```json
{
	"url": "https://www.amazon.com/s/?field-keywords=beanie+for+men",
	"schema":{
		"title": {
			"selector": "title",
			"how": "text"
		},
		"count": "#s-result-count",
		"results":{
			"listItems": {
				"selector": ["ul#s-results-list-atf li[data-result-rank]"],
				"data":{
					"rank": {
						"how": "attr",
						"params":["data-result-rank"]
					},
					"asin": {
						"how": "attr",
						"params":["data-asin"]
					},
					"sponsoredLink":{
						"selector":"h5[data-alt-pixel-url]",
						"context": "li[data-result-rank]",
						"how": "attr",
						"params":["data-alt-pixel-url"]
					}
				
				}
			}
			
		},
		"nextLink":{
			"selector": "#pagnNextLink",
			"how": "attr",
			"params":["href"]
		}
	}
}
```

## Response
```json
{
    "url": "https://www.amazon.com/s/?field-keywords=beanie+for+men",
    "results": {
        "title": "Amazon.com: beanie for men",
        "count": "1-48 of 276,791 results for \"beanie for men\"",
        "results": [
            {
                "rank": "48",
                "asin": "B008BRS1O6"
            },
            {
                "rank": "49",
                "asin": "B019EL288W"
            },
            {
                "rank": "50",
                "asin": "B01LI3VE1G"
            }
        ],
        "nextLink": "/s/ref=sr_pg_2?rh=i%3Aaps%2Ck%3Abeanie+for+men&page=2&keywords=beanie+for+men&ie=UTF8&qid=1513236048"
    }
}
```
