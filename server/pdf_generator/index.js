  
  const puppeteer = require('puppeteer')
  const jwt = require('jsonwebtoken')
  const fs = require('fs')
  const path = require('path')
  const uri = require('urijs')
  
  // TODO:
  // - check for memory leak

  const token = jwt.sign(
    { username: 'ahmed@sam-media.com' }
    , process.env.secret
    , { expiresIn: '1d' }
  )

  const headerStyles = 'font-size: 10px; margin: 20px; color: black; height: 200px;'
  const footerStyles = 'font-size: 10px; margin: 10px auto 10px auto; color: black;'
  const imgStyles = 'height: 50px; width: 193px;'

  const base64_encode = (file) => {
    const bitmap = fs.readFileSync(file)
    return new Buffer(bitmap).toString('base64')
  }

  const base64str = base64_encode(path.join(__dirname, 'new_logo.png'))

  const generate_report = async (url) => {
    const browser = await puppeteer.launch({
      args: ['--disable-dev-shm-usage']
    })
    const urlinsidepup = url
    console.log(url)
    const fullURL = uri(url).query({ token })
    console.log('here' + fullURL)
    const affiliate_name = url.split('e=')[1]
    const page = await browser.newPage()
    
    await page.goto(`${fullURL}`,
      {
        waitUntil: 'networkidle2'
      })
      
    await page.waitForSelector('.invoice')

    const pdf = await page.pdf({
      format: 'A4'
    , printBackground: true
    , displayHeaderFooter: true
    , headerTemplate: `<div style="${headerStyles}"><div styles="width: 49%;"><img style="${imgStyles}" src="data:image/png;base64,${base64str}" /></div><div styles="width: 49%;"><h2>Performance Stats</h2> Affiliate : ${decodeURIComponent(affiliate_name)}</div></div>`
    , footerTemplate: `<p style="${footerStyles}"><span class="pageNumber"></span>/<span class="totalPages"></span></p>`
    , margin: { top: 200, bottom: 50 }
    })
    await page.close()
    await browser.close()
    return pdf
  }

  module.exports = (url) => {
    return generate_report(url)
  }
