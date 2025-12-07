/**
 * Test script to check how negative values are displayed
 */

const puppeteer = require('puppeteer');

async function testNegativeValue() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Test charity 58539 (Samoan Assembly Of God) - known to have deficit
    const charityId = 58539;
    console.log(`Testing charity ${charityId}...`);

    await page.goto(`http://localhost:8000/?id=${charityId}`, { waitUntil: 'networkidle0' });

    // Wait for financial data to load
    await page.waitForSelector('#netSurplus', { timeout: 10000 });

    // Give animations time to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };

        return {
            charityName: getText('#charityName'),
            totalIncome: getText('#totalIncome'),
            totalExpenditure: getText('#totalExpenditure'),
            netSurplus: getText('#netSurplus'),
            netSurplusHTML: document.querySelector('#netSurplus').innerHTML
        };
    });

    console.log('\nDisplayed values:');
    console.log('Charity Name:', data.charityName);
    console.log('Total Income:', data.totalIncome);
    console.log('Total Expenditure:', data.totalExpenditure);
    console.log('Net Surplus/Deficit:', data.netSurplus);
    console.log('Net Surplus HTML:', data.netSurplusHTML);

    // Now fetch API data to compare
    const apiUrl = `http://localhost:8000/api/financial?id=${charityId}`;
    const apiResponse = await page.evaluate(async (url) => {
        const response = await fetch(url);
        return await response.json();
    }, apiUrl);

    const apiData = apiResponse.value[0];

    console.log('\nAPI values:');
    console.log('Total Income:', apiData.TotalGrossIncome);
    console.log('Total Expenditure:', apiData.TotalExpenditure);
    console.log('Net Surplus/Deficit:', apiData.NetSurplusDeficitForTheYear);
    console.log('Calculated (Income - Expenditure):', apiData.TotalGrossIncome - apiData.TotalExpenditure);

    await browser.close();
}

testNegativeValue().catch(console.error);
