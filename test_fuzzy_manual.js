/**
 * Manual test - Open browser to localhost and let user interact
 */

const puppeteer = require('puppeteer');

async function manualTest() {
    console.log('\n🔍 Opening localhost:8000 in browser for manual testing...\n');
    console.log('Test these searches:');
    console.log('  1. "st mary" → should find "Saint Mary" charities');
    console.log('  2. "methodist" → should find Methodist churches');
    console.log('  3. "cancer society" → should find Cancer Society charities');
    console.log('  4. "salvasion army" (typo) → should find Salvation Army\n');
    console.log('Browser will stay open. Press Ctrl+C when done.\n');

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    // Keep browser open
    await new Promise(() => {});
}

manualTest().catch(console.error);
