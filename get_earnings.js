const puppeteer = require('puppeteer')
const fs = require('fs/promises')

async function start() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`https://finance.yahoo.com/calendar/earnings?symbol=${process.argv[2]}`)
    
    const eps = await page.$$eval("#cal-res-table > div > table > tbody > tr > td:nth-child(5)", el => el.map(e => e.textContent))
    const edates = await page.$$eval("#cal-res-table > div > table > tbody > tr > td:nth-child(3)", el => el.map(e => e.textContent))

    let earnings = []
    for(let i = 0 ; i < eps.length ; i++) {
        await earnings.push([new Date(edates[i].slice(0,12)).toISOString().slice(0,10), parseFloat(eps[i])])
    }
    
    const json = await JSON.stringify(earnings, null, 2)
    fs.writeFile(`${process.argv[2]}.json`, json, 'utf8')
    
    await browser.close()
}

start()