  
  const puppeteer = require('puppeteer')
  const jwt = require('jsonwebtoken')
  const fs = require('fs')
  const path = require('path')
  const uri = require('urijs')

// TODO:
// -test puppeteer for memory leaks
// move header template from 'https://codesandbox.io/s/7y5w2m7yv1' to project
//<img src="data:image/png;base64,${base64str}" height="50" width="193"/>

  const token = jwt.sign(
    { username: 'info@sam-media.com' }
    , process.env.secret
    , { expiresIn: '1d' }
  )

  const footerStyles = 'font-size: 10px; margin: 10px auto 10px auto; color: black;'

  const base64_encode = (file) => {
    const bitmap = fs.readFileSync(file)
    return new Buffer(bitmap).toString('base64')
  }

  const base64str = base64_encode(path.join(__dirname, 'new_logo.png'))

  const generate_report = async (body) => {
    const { url, affiliate_name, date_from, date_to, name, email } = body

    const browser = await puppeteer.launch({ args: ['--disable-dev-shm-usage'] })

    const fullURL = uri(url).query({ token }).removeSearch('nocache')

    const page = await browser.newPage()

    await page.goto(`${fullURL}`, { waitUntil: 'networkidle2' })
    await page.waitForSelector('.invoice')
    await page.type('#name', name)
    await page.type('#email', email)

    const pdf = await page.pdf({
      format: 'A4'
    , printBackground: true
    , displayHeaderFooter: true
    , headerTemplate: `<div style="border-bottom:1px solid grey;font-family:Helvetica;font-size:12px;text-align:center;width:85%;margin:0 auto"><div style="display:flex;margin:0;color:black;flex-shrink:0;flex-grow:1;text-align:left"><div style="flex:2;padding:0.5em 0"><img src="data:image/png;base64,${base64str}" height="50" width="193"/></div><div style="flex:1;padding:0.5em 0"><p style="font-size:6pt"><span style="font-weight:bolder">Affiliate Name&#9;:&ensp;</span>${affiliate_name}</p><p style="font-size:6pt"><span style="font-weight:bolder">From&#9;:&#9;</span>${date_from}</p><p style="font-size:6pt"><span style="font-weight:bolder">To&#9;:&#9;</span>${date_to}</p></div></div><h3 style="margin:0.5em 0">Affiliate Performance Stats</h3></div>`
    , footerTemplate: `<p style="${footerStyles}"><span class="pageNumber"></span>/<span class="totalPages"></span></p>`
    , margin: { top: 160, bottom: 50 }
    })

    await page.close()
    await browser.close()
    return pdf
  }

  module.exports = (body) => {
    return generate_report(body)
  }
