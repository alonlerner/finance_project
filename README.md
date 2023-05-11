# finance_project
# Notes
Documentation for this project can be found in the CS488 Final Report pdf.

* The difference between earnings_impact.csv and earnings_impact2.csv is that earnings_impact2.csv does not include the stocks the script failed to scrape.

* The difference between earnings_impact2.csv and earnings_impact3.csv is that earnings_impact3.csv also contains the average return of the day after earnings.

* get_earnings.js retrieves a list of the dates of earnings releases, their posted earnings per share, their estimated earnings for share, and their timing (0 for before market hours, 1 for during, and 2 for after). This file retrieves only the earnings that are presented on the first page of that website (approximately back until 1998). get_earnings2.js is able to scrape all pages but is slower. get_earnings3.js uses the Yahoo Finance calendar to retrieve more accurate timing. However, these timings turned out to be incorrect as well.