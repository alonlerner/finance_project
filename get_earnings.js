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
        let timing, am, time = await parseInt(edates[i].slice(-8,-5).trim())
        await edates[i].slice(-5,-3) === 'AM' ? am = true : am = false
        if((time < 9 || time === 12) && am) 
            timing = 0
        else if (time >=4 && time < 12 && !am)
            timing = 2
        else
            timing = 1
        // timing=0: announcment before trading period, timing=1: announcment during trading period, timing=2: announcment after trading period
        await earnings.push([new Date(edates[i].slice(0,12)).toISOString().slice(0,10), parseFloat(eps[i]), timing])
    }
    
    const json = await JSON.stringify(earnings, null, 2)
    fs.writeFile(`${process.argv[2]}.json`, json, 'utf8')
    
    await browser.close()
}

start()