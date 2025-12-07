/**
 * Test fuzzy search implementation
 * Testing:
 * 1. "St." vs "Saint" matching
 * 2. "&" vs "and" matching
 * 3. General fuzzy matching quality
 */

const puppeteer = require('puppeteer');

async function testFuzzySearch() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log('🔍 Testing Fuzzy Search Implementation\n');
    console.log('Opening localhost:8000...\n');

    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });

    // Test 1: "st mary" should find "Saint Mary" charities
    console.log('Test 1: Searching for "st mary" (should find Saint Mary charities)');
    await page.type('#searchInput', 'st mary');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const test1Results = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.search-results .result-card').forEach(card => {
            const name = card.querySelector('h3').textContent;
            results.push(name);
        });
        return results;
    });

    console.log('  Results found:', test1Results.length);
    test1Results.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });
    console.log('');

    // Clear search
    await page.evaluate(() => {
        document.querySelector('#searchInput').value = '';
        document.querySelector('#searchResults').classList.add('hidden');
        document.querySelector('#searchResults').innerHTML = '';
    });

    // Test 2: "methodist" should find Methodist churches
    console.log('Test 2: Searching for "methodist"');
    await page.type('#searchInput', 'methodist');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const test2Results = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.search-results .result-card').forEach(card => {
            const name = card.querySelector('h3').textContent;
            results.push(name);
        });
        return results;
    });

    console.log('  Results found:', test2Results.length);
    test2Results.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });
    console.log('');

    // Clear search
    await page.evaluate(() => {
        document.querySelector('#searchInput').value = '';
        document.querySelector('#searchResults').classList.add('hidden');
        document.querySelector('#searchResults').innerHTML = '';
    });

    // Test 3: Try a charity with "&" in the name
    console.log('Test 3: Searching for "cancer society" (should find Cancer Society charities)');
    await page.type('#searchInput', 'cancer society');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const test3Results = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.search-results .result-card').forEach(card => {
            const name = card.querySelector('h3').textContent;
            results.push(name);
        });
        return results;
    });

    console.log('  Results found:', test3Results.length);
    test3Results.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });
    console.log('');

    // Clear search
    await page.evaluate(() => {
        document.querySelector('#searchInput').value = '';
        document.querySelector('#searchResults').classList.add('hidden');
        document.querySelector('#searchResults').innerHTML = '';
    });

    // Test 4: Typo handling
    console.log('Test 4: Searching for "salvasion army" (typo - should find Salvation Army)');
    await page.type('#searchInput', 'salvasion army');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const test4Results = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('.search-results .result-card').forEach(card => {
            const name = card.querySelector('h3').textContent;
            results.push(name);
        });
        return results;
    });

    console.log('  Results found:', test4Results.length);
    test4Results.forEach((name, i) => {
        console.log(`  ${i + 1}. ${name}`);
    });
    console.log('');

    console.log('═'.repeat(80));
    console.log('✅ Fuzzy search testing complete!');
    console.log('Browser will remain open for manual inspection.');
    console.log('Press Ctrl+C when done reviewing...');

    // Keep browser open for manual inspection
    await new Promise(() => {});
}

testFuzzySearch().catch(console.error);
