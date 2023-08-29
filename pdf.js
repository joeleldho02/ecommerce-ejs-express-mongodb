const puppeteer = require('puppeteer');

async function generatePDF(url, outputFile){
    try{
        //launch browser
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();

        //navigate to page
        await page.goto(url);

        //generate pdf
        await page.pdf({path: outputFile, format: 'A4'});

        //close browser
        await browser.close();
    } catch(err){
        console.log(err);
    }
}

const url = "http://localhost:8080/user/order-invoice/64ec2e9b2a52b11d633d9229";
const outputFile = "out.pdf";
generatePDF(url, outputFile);