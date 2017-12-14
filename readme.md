# Online Scraper


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
				"selector": "ul#s-results-list-atf li[data-result-rank]",
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
                "rank": "0",
                "asin": "B075QFSZ63",
                "sponsoredLink": "/gp/sponsored-products/logging/log-action.html?qualifier=1513236048&id=6591034175205448&widgetName=sp_atf&adId=200004752900651&eventType=2&adIndex=0"
            },
            {
                "rank": "1",
                "asin": "B076YJPK7X",
                "sponsoredLink": "/gp/sponsored-products/logging/log-action.html?qualifier=1513236048&id=6591034175205448&widgetName=sp_atf&adId=200005223315231&eventType=2&adIndex=1"
            },
            {
                "rank": "2",
                "asin": "B077GSPC2M",
                "sponsoredLink": "/gp/sponsored-products/logging/log-action.html?qualifier=1513236048&id=6591034175205448&widgetName=sp_atf&adId=200004595147881&eventType=2&adIndex=2"
            },
            {
                "rank": "3",
                "asin": "B002G9UDYG"
            },
            {
                "rank": "4",
                "asin": "B00NB40H9Q"
            },
            {
                "rank": "5",
                "asin": "B075GM5DQV"
            },
            {
                "rank": "6",
                "asin": "B01LI2VW28"
            },
            {
                "rank": "7",
                "asin": "B01LZPMVKH"
            },
            {
                "rank": "8",
                "asin": "B076FT5J1X"
            },
            {
                "rank": "9",
                "asin": "B01LEAIK9C"
            },
            {
                "rank": "10",
                "asin": "B075XMM6J8"
            },
            {
                "rank": "11",
                "asin": "B0761L2ZP6"
            },
            {
                "rank": "12",
                "asin": "B003TJ9EYC"
            },
            {
                "rank": "13",
                "asin": "B00MJHRQR2"
            },
            {
                "rank": "14",
                "asin": "B01G9VJ0HW"
            },
            {
                "rank": "15",
                "asin": "B075GK8TMP"
            },
            {
                "rank": "16",
                "asin": "B01N3L49J5"
            },
            {
                "rank": "17",
                "asin": "B01NAXPNTL"
            },
            {
                "rank": "18",
                "asin": "B003E7GUZU"
            },
            {
                "rank": "19",
                "asin": "B01606VL1E"
            },
            {
                "rank": "20",
                "asin": "B0154AJ0N8"
            },
            {
                "rank": "21",
                "asin": "B001GQSK36"
            },
            {
                "rank": "22",
                "asin": "B06X9BH8F6"
            },
            {
                "rank": "23",
                "asin": "B018DBVGC8"
            },
            {
                "rank": "24",
                "asin": "B01AIG4HTK"
            },
            {
                "rank": "25",
                "asin": "B075GDVWF9"
            },
            {
                "rank": "26",
                "asin": "B01LI3COIS"
            },
            {
                "rank": "27",
                "asin": "B076YJPK7X"
            },
            {
                "rank": "28",
                "asin": "B0761HM9VY"
            },
            {
                "rank": "29",
                "asin": "B077P7MCBK"
            },
            {
                "rank": "30",
                "asin": "B074T3KT39"
            },
            {
                "rank": "31",
                "asin": "B003ASURJS"
            },
            {
                "rank": "32",
                "asin": "B073NF8MVB"
            },
            {
                "rank": "33",
                "asin": "B015R1VW3K"
            },
            {
                "rank": "34",
                "asin": "B003UATJE0"
            },
            {
                "rank": "35",
                "asin": "B009OLYMG4"
            },
            {
                "rank": "36",
                "asin": "B076Q4PN8K"
            },
            {
                "rank": "37",
                "asin": "B075GKK427"
            },
            {
                "rank": "38",
                "asin": "B01I8CDX0A"
            },
            {
                "rank": "39",
                "asin": "B074S6ND1C"
            },
            {
                "rank": "40",
                "asin": "B01LI3FUIO"
            },
            {
                "rank": "41",
                "asin": "B076R94118"
            },
            {
                "rank": "42",
                "asin": "B0784WBKF2"
            },
            {
                "rank": "43",
                "asin": "B0778XGX1N"
            },
            {
                "rank": "44",
                "asin": "B01LORCVJK"
            },
            {
                "rank": "45",
                "asin": "B01780U7YI"
            },
            {
                "rank": "46",
                "asin": "B075ZG8698"
            },
            {
                "rank": "47",
                "asin": "B075G9P1L2"
            },
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