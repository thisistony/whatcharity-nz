const puppeteer = require('puppeteer');

async function checkDisplay() {
    const browser = await puppeteer.launch({ headless: false }); // Set to false to see it
    const page = await browser.newPage();

    await page.goto('http://localhost:8000/?id=33802', {
        waitUntil: 'networkidle0',
        timeout: 30000
    });

    // Wait for data to load
    await page.waitForFunction(() => {
        const el = document.querySelector('#totalIncome');
        return el && el.textContent.trim().length > 0;
    }, { timeout: 15000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });

    // Get the actual text displayed
    const displayedText = await page.evaluate(() => {
        return {
            totalIncome: document.querySelector('#totalIncome')?.textContent,
            totalExpenditure: document.querySelector('#totalExpenditure')?.textContent,
            totalAssets: document.querySelector('#totalAssets')?.textContent,
            netSurplus: document.querySelector('#netSurplus')?.textContent
        };
    });

    console.log('\n📊 ACTUAL DISPLAYED TEXT ON YOUR WEBSITE:');
    console.log('==========================================');
    console.log('Total Income:      ', displayedText.totalIncome);
    console.log('Total Expenditure: ', displayedText.totalExpenditure);
    console.log('Total Assets:      ', displayedText.totalAssets);
    console.log('Net Surplus:       ', displayedText.netSurplus);
    console.log('\n✅ Screenshot saved as screenshot.png');

    await browser.close();
}

checkDisplay().catch(console.error);
