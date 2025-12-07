/**
 * Test what variations the frontend is actually generating and sending to API
 */

const puppeteer = require('puppeteer');

async function testVariations() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Capture console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Browser Error:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
    });

    // Intercept network requests to see what's being sent
    const apiCalls = [];
    await page.on('request', request => {
        if (request.url().includes('/api/search.php')) {
            apiCalls.push(request.url());
        }
    });

    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    console.log('\n🔍 Testing: "St marys community"\n');

    // Type the search
    await page.type('#searchInput', 'St marys community');
    await page.keyboard.press('Enter');

    // Wait for searches to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('API calls made:');
    console.log('═'.repeat(80));
    apiCalls.forEach((url, i) => {
        // Decode the URL to make it readable
        const decoded = decodeURIComponent(url);
        console.log(`${i + 1}. ${decoded}`);
    });
    console.log('═'.repeat(80));
    console.log(`Total API calls: ${apiCalls.length}\n`);

    // Check results
    const resultCount = await page.evaluate(() => {
        return document.querySelectorAll('.search-result-item').length;
    });

    console.log(`Results displayed: ${resultCount}\n`);

    console.log('Browser will stay open. Press Ctrl+C when done.');
    await new Promise(() => {});
}

testVariations().catch(console.error);
