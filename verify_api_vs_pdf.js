/**
 * Verify: Does API data match the official PDF?
 * Test with charity CC33802 as mentioned by user
 */

const puppeteer = require('puppeteer');

async function testCharity33802() {
    const browser = await puppeteer.launch({ headless: false });

    console.log('🔍 Testing Charity CC33802');
    console.log('Comparing: Localhost → API → Official PDF\n');

    // 1. Get localhost data
    const page1 = await browser.newPage();
    await page1.goto('http://localhost:8000/?id=33802', { waitUntil: 'networkidle0' });
    await page1.waitForSelector('#netSurplus', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const localhostData = await page1.evaluate(() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };
        return {
            name: getText('#charityName'),
            income: getText('#totalIncome'),
            expenditure: getText('#totalExpenditure'),
            surplus: getText('#netSurplus'),
            assets: getText('#totalAssets')
        };
    });
    await page1.close();

    // 2. Get API data
    const apiUrl = 'http://localhost:8000/api/financial?id=33802';
    const apiResponse = await page1.evaluate(async (url) => {
        const response = await fetch(url);
        return await response.json();
    }, apiUrl);

    // Use a new page for API request
    const page2 = await browser.newPage();
    const apiData = await page2.evaluate(async () => {
        const response = await fetch('http://localhost:8000/api/financial?id=33802');
        const data = await response.json();
        const latest = data.value[0];
        return {
            income: latest.TotalGrossIncome,
            expenditure: latest.TotalExpenditure,
            surplus: latest.NetSurplusDeficitForTheYear,
            assets: latest.TotalAssets,
            returnId: latest.NoticeofChangeAnnualReturnId
        };
    });
    await page2.close();

    // 3. Open the official PDF
    console.log('Opening official PDF in browser...');
    console.log('PDF URL: https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=' + apiData.returnId + '&isPublic=true\n');

    const pdfPage = await browser.newPage();
    await pdfPage.goto(`https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${apiData.returnId}&isPublic=true`);

    console.log('📊 COMPARISON:');
    console.log('═'.repeat(80));
    console.log('Localhost Display:');
    console.log('  Name:', localhostData.name);
    console.log('  Income:', localhostData.income);
    console.log('  Expenditure:', localhostData.expenditure);
    console.log('  Surplus:', localhostData.surplus);
    console.log('  Assets:', localhostData.assets);
    console.log('');
    console.log('API Data:');
    console.log('  Income:', apiData.income);
    console.log('  Expenditure:', apiData.expenditure);
    console.log('  Surplus:', apiData.surplus);
    console.log('  Assets:', apiData.assets);
    console.log('');
    console.log('Please manually check the PDF and verify the numbers match!');
    console.log('PDF is now open in the browser window.');
    console.log('');
    console.log('Press Ctrl+C when done reviewing...');

    // Keep browser open for manual inspection
    await new Promise(() => {}); // Never resolves - keeps browser open
}

testCharity33802().catch(console.error);
