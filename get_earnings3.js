// finds earnings data from Yahoo Finance and then finds the time data from the Yahoo earnings calendar page
const puppeteer = require('puppeteer')
const fs = require('fs/promises')

async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    let earnings = []
    for(let offset = 0 ; offset < 101 ; offset += 100) {
        await page.goto(`https://finance.yahoo.com/calendar/earnings?symbol=${process.argv[2]}&offset=${offset}`)
        
        const eps = await page.$$eval("#cal-res-table > div > table > tbody > tr > td:nth-child(5)", el => el.map(e => e.textContent))
        const estimated_eps = await page.$$eval("#cal-res-table > div > table > tbody > tr > td:nth-child(4)", el => el.map(e => e.textContent))
        const edates = await page.$$eval("#cal-res-table > div > table > tbody > tr > td:nth-child(3)", el => el.map(e => e.textContent))
        
        for(let i = 0 ; i < eps.length ; i++) {
            let timing
            console.log(new Date(edates[i].slice(0,12)).toISOString().slice(0,10))
            await page.goto(`https://finance.yahoo.com/calendar/earnings?day=${new Date(edates[i].slice(0,12)).toISOString().slice(0,10)}`)

            const tickers = await page.$$eval("#cal-res-table > div > table > tbody > tr > td > a", el => el.map(e => e.textContent))
            console.log(tickers.indexOf(process.argv[2]))
            let releaseTime
            if (tickers.indexOf(process.argv[2]) !== -1) {
                try {
                    releaseTime = await page.$eval(`#cal-res-table > div > table > tbody > tr:nth-child(${tickers.indexOf(process.argv[2]) + 1}) > td > span`, el => el.textContent)
                    console.log(releaseTime)
                }
                catch {
                    releaseTime = await page.$eval(`#cal-res-table > div > table > tbody > tr:nth-child(${tickers.indexOf(process.argv[2]) + 1}) > td:nth-child(4)`, el => el.textContent)
                    console.log(releaseTime)
                }
            }
            if (tickers.indexOf(process.argv[2]) === -1 || releaseTime && releaseTime === "Time Not Supplied") {
                timing = -1
            }
            else if (releaseTime === "Before Market Open") {
                timing = 0
            }
            else if (releaseTime === "TAS") {
                timing = 1
            }
            else if (releaseTime === "After Market Close") {
                timing = 2
            }
            // timing=0: announcment before trading period, timing=1: announcment during trading period, timing=2: announcment after trading period
            await earnings.push({
                date: new Date(edates[i].slice(0,12)).toISOString().slice(0,10), 
                eps: parseFloat(eps[i]), 
                estimated_eps: parseFloat(estimated_eps[i]), 
                timing: timing
            })
        }
    }
    const json = await JSON.stringify(earnings, null, 2)
    fs.writeFile(`${process.argv[2]}.json`, json, 'utf8')
    
    await browser.close()
}

start()