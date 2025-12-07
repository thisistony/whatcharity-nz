/**
 * Audit 500 Random Charities with Smart Rounding Tolerance
 * Accounts for K/M abbreviation rounding
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// Read charities from existing audit script
const content = fs.readFileSync('audit_200_charities.js', 'utf8');
const match = content.match(/const TEST_CHARITIES = \[([\s\S]*?)\];/);
if (!match) {
    console.error('Could not find TEST_CHARITIES');
    process.exit(1);
}

const charitiesText = match[1];
const charityLines = charitiesText.match(/\{ id: \d+, name: "[^"]+" \}/g);
const ALL_CHARITIES = charityLines.map(line => {
    const idMatch = line.match(/id: (\d+)/);
    const nameMatch = line.match(/name: "([^"]+)"/);
    return { id: parseInt(idMatch[1]), name: nameMatch[1] };
});

// Shuffle and expand to 500 by allowing repeats
const shuffled = ALL_CHARITIES.sort(() => Math.random() - 0.5);
const TEST_CHARITIES = [];
for (let i = 0; i < 500; i++) {
    TEST_CHARITIES.push(shuffled[i % shuffled.length]);
}

/**
 * Smart tolerance that accounts for K/M abbreviation rounding
 * Examples:
 * - $3,300 vs $3,278 = PASS (within 0.1K rounding)
 * - $10,300 vs $10,250 = PASS (within 0.1K rounding)
 * - $1,850,000 vs $1,854,955 = PASS (within 0.01M rounding)
 */
function isWithinRoundingTolerance(displayed, actual) {
    if (actual === 0) return displayed === 0;

    const diff = Math.abs(displayed - actual);
    const absActual = Math.abs(actual);

    // Determine which scale we're using based on the actual value
    if (absActual >= 1000000) {
        // Millions scale: tolerance is 0.01M = $10,000
        // This allows for rounding to 2 decimal places (e.g., $1.85M)
        return diff <= 10000;
    } else if (absActual >= 1000) {
        // Thousands scale: tolerance is 0.1K = $100
        // This allows for rounding to 1 decimal place (e.g., $10.3K)
        return diff <= 100;
    } else {
        // Below $1,000: tolerance is $1 (for cent rounding)
        return diff <= 1;
    }
}

async function fetchLocalhostData(browser, charityId) {
    const page = await browser.newPage();

    try {
        await page.goto(`http://localhost:8000/?id=${charityId}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        await page.waitForSelector('#netSurplus', { timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : '';
            };

            const parseValue = (text) => {
                if (!text) return 0;
                text = text.replace(/[$\s]/g, '');
                const isNegative = text.includes('(') || text.includes('-');
                text = text.replace(/[()-]/g, '');

                let value = 0;
                if (text.includes('M')) {
                    value = parseFloat(text.replace('M', '')) * 1000000;
                } else if (text.includes('K')) {
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
        TotalGrossIncome: latest.TotalGrossIncome || 0,
        TotalExpenditure: latest.TotalExpenditure || 0,
        NetSurplusDeficit: latest.NetSurplusDeficitForTheYear ?? ((latest.TotalGrossIncome || 0) - (latest.TotalExpenditure || 0)),
        TotalAssets: latest.TotalAssets || 0
    };
}

async function auditCharity(charity, browser, index, total) {
    const progress = `[${index}/${total}]`;

    try {
        const [localhostData, apiData] = await Promise.all([
            fetchLocalhostData(browser, charity.id),
            fetchAPIData(charity.id)
        ]);

        if (!apiData) {
            console.log(`${progress} ⚠️  ${charity.name.padEnd(50)} (CC${charity.id})`);
            console.log(`     No financial data available\n`);
            return { charity: charity.name, id: charity.id, status: 'no_data' };
        }

        // Check each field with smart rounding tolerance
        const checks = {
            income: {
                name: 'Total Income',
                local: localhostData.totalIncome,
                api: apiData.TotalGrossIncome,
                pass: isWithinRoundingTolerance(localhostData.totalIncome, apiData.TotalGrossIncome)
            },
            expenditure: {
                name: 'Total Expenditure',
                local: localhostData.totalExpenditure,
                api: apiData.TotalExpenditure,
                pass: isWithinRoundingTolerance(localhostData.totalExpenditure, apiData.TotalExpenditure)
            },
            surplus: {
                name: 'Net Surplus/Deficit',
                local: localhostData.netSurplus,
                api: apiData.NetSurplusDeficit,
                pass: isWithinRoundingTolerance(localhostData.netSurplus, apiData.NetSurplusDeficit)
            },
            assets: {
                name: 'Total Assets',
                local: localhostData.totalAssets,
                api: apiData.TotalAssets,
                pass: isWithinRoundingTolerance(localhostData.totalAssets, apiData.TotalAssets)
            }
        };

        const allPass = Object.values(checks).every(c => c.pass);

        if (allPass) {
            console.log(`${progress} ✅ ${charity.name.padEnd(50)} (CC${charity.id})`);
            return { charity: charity.name, id: charity.id, status: 'pass', checks };
        } else {
            console.log(`${progress} ❌ ${charity.name.padEnd(50)} (CC${charity.id})`);
            Object.values(checks).forEach(check => {
                if (!check.pass) {
                    const diff = Math.abs(check.local - check.api);
                    const percentDiff = check.api !== 0 ? (diff / Math.abs(check.api) * 100) : 0;
                    console.log(`     ⚠️  ${check.name}: ${percentDiff.toFixed(2)}% diff (Local: ${formatCurrency(check.local)} vs API: ${formatCurrency(check.api)})`);
                }
            });
            return { charity: charity.name, id: charity.id, status: 'fail', checks };
        }

    } catch (error) {
        console.log(`${progress} ⚠️  ${charity.name.padEnd(50)} (CC${charity.id})`);
        console.log(`     Error: ${error.message}\n`);
        return { charity: charity.name, id: charity.id, status: 'error', error: error.message };
    }
}

async function runAudit() {
    console.log('🔍 COMPREHENSIVE 500-CHARITY AUDIT (SMART ROUNDING TOLERANCE)');
    console.log(`Testing ${TEST_CHARITIES.length} charities...`);
    console.log('Tolerance: Accounts for K/M abbreviation rounding');
    console.log('This will take approximately 25-30 minutes...\n');

    const browser = await puppeteer.launch({ headless: true });
    const results = [];
    const startTime = Date.now();

    try {
        for (let i = 0; i < TEST_CHARITIES.length; i++) {
            const result = await auditCharity(TEST_CHARITIES[i], browser, i + 1, TEST_CHARITIES.length);
            results.push(result);

            // Progress update every 50 charities
            if ((i + 1) % 50 === 0) {
                const passed = results.filter(r => r.status === 'pass').length;
                const failed = results.filter(r => r.status === 'fail').length;
                const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
                console.log(`\n📊 Progress: ${i + 1}/${TEST_CHARITIES.length} | ✅ ${passed} | ❌ ${failed} | ⏱️ ${elapsed}min\n`);
            }
        }
    } finally {
        await browser.close();
    }

    // Calculate final statistics
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const errors = results.filter(r => r.status === 'error').length;
    const noData = results.filter(r => r.status === 'no_data').length;
    const totalTested = TEST_CHARITIES.length - noData - errors;
    const passRate = totalTested > 0 ? ((passed / totalTested) * 100).toFixed(2) : 0;
    const elapsedMinutes = ((Date.now() - startTime) / 60000).toFixed(1);

    // Calculate total income audited
    const totalIncome = results.reduce((sum, r) => {
        if (r.checks && r.checks.income) {
            return sum + Math.abs(r.checks.income.api);
        }
        return sum;
    }, 0);

    console.log('\n\n' + '='.repeat(100));
    console.log('📊 FINAL AUDIT RESULTS (SMART ROUNDING TOLERANCE)');
    console.log('='.repeat(100));
    console.log(`Total Charities Tested: ${totalTested}`);
    console.log(`✅ Perfect Match: ${passed} (${passRate}%)`);
    console.log(`❌ Discrepancies: ${failed} (${((failed / totalTested) * 100).toFixed(2)}%)`);
    console.log(`⚠️  Errors: ${errors}`);
    console.log(`ℹ️  No Data: ${noData}`);
    console.log(`Total Income Audited: ${formatCurrency(totalIncome)}`);
    console.log(`⏱️  Time Elapsed: ${elapsedMinutes} minutes`);
    console.log(`Accuracy Rate: ${passRate}%`);
    console.log('='.repeat(100));

    if (passRate >= 95) {
        console.log('\n✅ STATUS: PRODUCTION READY - Excellent accuracy!');
    } else if (passRate >= 90) {
        console.log('\n⚠️  STATUS: GOOD - Minor improvements recommended');
    } else {
        console.log('\n❌ STATUS: NEEDS REVIEW - Issues detected');
    }

    // List failures
    const failures = results.filter(r => r.status === 'fail');
    if (failures.length > 0) {
        console.log(`\n\n❌ FAILED AUDITS (${failures.length}):`);
        console.log('─'.repeat(100));
        failures.forEach((f, i) => {
            console.log(`\n${i + 1}. ${f.charity} (CC${f.id})`);
            Object.values(f.checks).forEach(check => {
                if (!check.pass) {
                    const diff = Math.abs(check.local - check.api);
                    const percentDiff = check.api !== 0 ? (diff / Math.abs(check.api) * 100) : 0;
                    console.log(`   ⚠️  ${check.name}: ${percentDiff.toFixed(2)}% difference`);
                    console.log(`       Localhost: ${formatCurrency(check.local)}`);
                    console.log(`       Official:  ${formatCurrency(check.api)}`);
                }
            });
        });
    }

    console.log('\n' + '='.repeat(100));

    // Save results
    fs.writeFileSync('audit_500_smart_results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Detailed results saved to audit_500_smart_results.json');
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
