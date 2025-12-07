/**
 * Audit 100 Random Charities
 * Tests accuracy with fixed negative value parsing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Fetch 100 random charities from the API
async function fetchRandomCharities() {
    console.log('Fetching random charities from API...');

    const url = 'http://www.odata.charities.govt.nz/Organisations?$orderby=OrganisationId&$select=OrganisationId,Name&$top=30000';
    const response = await fetch(url);
    const data = await response.json();
    const allCharities = data.value || data.d || [];

    // Shuffle and take 100
    const shuffled = allCharities.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 100);

    console.log(`Selected ${selected.length} random charities\n`);
    return selected.map(c => ({ id: c.OrganisationId, name: c.Name }));
}

async function fetchLocalhostData(browser, charityId) {
    const page = await browser.newPage();

    try {
        await page.goto(`http://localhost:8000/?id=${charityId}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for financial data to load
        await page.waitForSelector('#netSurplus', { timeout: 10000 });

        // Give animations time to complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : '';
            };

            // Parse currency values that may include K (thousands) or M (millions)
            const parseValue = (text) => {
                if (!text) return 0;

                // Remove $ and spaces
                text = text.replace(/[$\s]/g, '');

                // Check for negative (in parentheses or minus sign)
                const isNegative = text.includes('(') || text.includes('-');
                text = text.replace(/[()-]/g, '');

                let value = 0;
                if (text.includes('M')) {
                    // Millions
                    value = parseFloat(text.replace('M', '')) * 1000000;
                } else if (text.includes('K')) {
                    // Thousands
                    value = parseFloat(text.replace('K', '')) * 1000;
                } else {
                    value = parseFloat(text) || 0;
                }

                return isNegative ? -value : value;
            };

            return {
                charityName: getText('#charityName'),
                totalIncome: parseValue(getText('#totalIncome')),
                totalExpenditure: parseValue(getText('#totalExpenditure')),
                netSurplus: parseValue(getText('#netSurplus')),
                totalAssets: parseValue(getText('#totalAssets'))
            };
        });

        await page.close();
        return data;

    } catch (error) {
        await page.close();
        throw error;
    }
}

async function fetchAPIData(charityId) {
    const url = `http://localhost:8000/api/financial?id=${charityId}`;
    const response = await fetch(url);
    const data = await response.json();
    const results = data.d || data.value || [];

    if (results.length === 0) return null;

    const latest = results[0];
    return {
        totalIncome: latest.TotalGrossIncome || 0,
        totalExpenditure: latest.TotalExpenditure || 0,
        netSurplus: latest.NetSurplusDeficitForTheYear ?? ((latest.TotalGrossIncome || 0) - (latest.TotalExpenditure || 0)),
        totalAssets: latest.TotalAssets || 0
    };
}

function calculateDifference(local, api) {
    if (api === 0) return local === 0 ? 0 : 100;
    return Math.abs((local - api) / api * 100);
}

async function runAudit() {
    const TOLERANCE = 0.5; // 0.5% tolerance for rounding

    console.log('🔍 COMPREHENSIVE 100 RANDOM CHARITY AUDIT');
    console.log('Testing with FIXED negative value parsing');
    console.log('This will take approximately 5-8 minutes...\n');

    const charities = await fetchRandomCharities();
    const browser = await puppeteer.launch({ headless: true });

    let passed = 0;
    let failed = 0;
    let errors = 0;
    let totalIncomeAudited = 0;

    const results = [];

    for (let i = 0; i < charities.length; i++) {
        const charity = charities[i];
        const progress = `[${i + 1}/${charities.length}]`;

        try {
            const [localhostData, apiData] = await Promise.all([
                fetchLocalhostData(browser, charity.id),
                fetchAPIData(charity.id)
            ]);

            if (!apiData) {
                console.log(`${progress} ⚠️  ${charity.name.padEnd(50)} (CC${charity.id})`);
                console.log(`     No financial data available\n`);
                errors++;
                continue;
            }

            totalIncomeAudited += apiData.totalIncome;

            const diffs = {
                income: calculateDifference(localhostData.totalIncome, apiData.totalIncome),
                expenditure: calculateDifference(localhostData.totalExpenditure, apiData.totalExpenditure),
                surplus: calculateDifference(localhostData.netSurplus, apiData.netSurplus),
                assets: calculateDifference(localhostData.totalAssets, apiData.totalAssets)
            };

            const maxDiff = Math.max(diffs.income, diffs.expenditure, diffs.surplus, diffs.assets);
            const isPassing = maxDiff <= TOLERANCE;

            const result = {
                charity: charity.name,
                id: charity.id,
                passed: isPassing,
                diffs,
                localhostData,
                apiData
            };

            results.push(result);

            if (isPassing) {
                console.log(`${progress} ✅ ${charity.name.padEnd(50)} (CC${charity.id})`);
                passed++;
            } else {
                console.log(`${progress} ❌ ${charity.name.padEnd(50)} (CC${charity.id})`);
                if (diffs.income > TOLERANCE) {
                    console.log(`     ⚠️  Total Income: ${diffs.income.toFixed(2)}% diff (Local: ${formatCurrency(localhostData.totalIncome)} vs API: ${formatCurrency(apiData.totalIncome)})`);
                }
                if (diffs.expenditure > TOLERANCE) {
                    console.log(`     ⚠️  Total Expenditure: ${diffs.expenditure.toFixed(2)}% diff (Local: ${formatCurrency(localhostData.totalExpenditure)} vs API: ${formatCurrency(apiData.totalExpenditure)})`);
                }
                if (diffs.surplus > TOLERANCE) {
                    console.log(`     ⚠️  Net Surplus/Deficit: ${diffs.surplus.toFixed(2)}% diff (Local: ${formatCurrency(localhostData.netSurplus)} vs API: ${formatCurrency(apiData.netSurplus)})`);
                }
                if (diffs.assets > TOLERANCE) {
                    console.log(`     ⚠️  Total Assets: ${diffs.assets.toFixed(2)}% diff (Local: ${formatCurrency(localhostData.totalAssets)} vs API: ${formatCurrency(apiData.totalAssets)})`);
                }
                failed++;
            }

        } catch (error) {
            console.log(`${progress} ⚠️  ${charity.name.padEnd(50)} (CC${charity.id})`);
            console.log(`     Error: ${error.message}\n`);
            errors++;
        }
    }

    await browser.close();

    // Calculate statistics
    const total = charities.length;
    const passRate = ((passed / total) * 100).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL AUDIT RESULTS (WITH FIXED PARSING)');
    console.log('='.repeat(80));
    console.log(`Total Charities Tested: ${total}`);
    console.log(`✅ Perfect Match: ${passed} (${passRate}%)`);
    console.log(`❌ Discrepancies: ${failed} (${((failed / total) * 100).toFixed(2)}%)`);
    console.log(`⚠️  Errors: ${errors} (${((errors / total) * 100).toFixed(2)}%)`);
    console.log(`Total Income Audited: ${formatCurrency(totalIncomeAudited)}`);
    console.log(`Accuracy Rate: ${passRate}%`);
    console.log('='.repeat(80));

    if (passRate >= 95) {
        console.log('\n✅ STATUS: PRODUCTION READY - Excellent accuracy!');
    } else if (passRate >= 90) {
        console.log('\n⚠️  STATUS: GOOD - Minor improvements recommended');
    } else {
        console.log('\n❌ STATUS: NEEDS REVIEW - Issues detected');
    }

    // Save detailed results
    fs.writeFileSync('audit_100_random_results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Detailed results saved to audit_100_random_results.json');
}

function formatCurrency(value) {
    if (value == null || isNaN(value)) return 'N/A';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        return sign + '$' + (absValue / 1000000).toFixed(2) + 'M';
    } else if (absValue >= 1000) {
        return sign + '$' + (absValue / 1000).toFixed(1) + 'K';
    }
    return sign + '$' + absValue.toFixed(2);
}

runAudit().catch(console.error);
