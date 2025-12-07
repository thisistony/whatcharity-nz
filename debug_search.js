/**
 * Debug: Test the exact search flow
 */

const puppeteer = require('puppeteer');

async function debugSearch() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Capture ALL console messages
    page.on('console', async msg => {
        const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => 'complex_object')));
        console.log('🔷 Browser Console:', msg.type(), ...args);
    });

    // Capture errors
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
    });

    // Track network requests
    const requests = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            requests.push(request.url());
            console.log('📡 API Request:', request.url());
        }
    });

    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            let body = '';
            try {
                body = await response.text();
                const json = JSON.parse(body);
                const count = (json.d || json.value || []).length;
                console.log(`📥 API Response: ${status} - ${count} results`);
            } catch (e) {
                console.log(`📥 API Response: ${status} - ${body.substring(0, 100)}`);
            }
        }
    });

    console.log('\n🔍 Opening localhost:8000...\n');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if the function exists
    const hasFunction = await page.evaluate(() => {
        return typeof normalizeSearchQuery === 'function';
    });

    console.log(`\n✓ normalizeSearchQuery function exists: ${hasFunction}\n`);

    if (hasFunction) {
        // Test the function
        const variations = await page.evaluate(() => {
            return normalizeSearchQuery('st marys community');
        });
        console.log('Generated variations for "st marys community":');
        variations.forEach((v, i) => {
            console.log(`  ${i + 1}. "${v}"`);
        });
        console.log('');
    }

    console.log('Now typing "st marys community" and pressing Enter...\n');

    // Clear the input first
    await page.click('#searchInput');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');

    // Type the search
    await page.type('#searchInput', 'st marys community');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Press Enter
    await page.keyboard.press('Enter');

    // Wait for API calls
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(`\n📊 Total API requests made: ${requests.length}\n`);

    // Check results in the page
    const resultCount = await page.evaluate(() => {
        return document.querySelectorAll('.search-result-item').length;
    });

    console.log(`Results displayed on page: ${resultCount}\n`);

    if (resultCount > 0) {
        const results = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.search-result-item').forEach(item => {
                const name = item.querySelector('.result-name')?.textContent || '';
                items.push(name);
            });
            return items;
        });

        console.log('Results:');
        results.forEach((name, i) => {
            console.log(`  ${i + 1}. ${name}`);
        });
    }

    console.log('\nBrowser will stay open. Press Ctrl+C when done.');
    await new Promise(() => {});
}

debugSearch().catch(console.error);
