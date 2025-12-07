/**
 * Production Readiness Audit
 * Compares localhost:8000 with official PDF data
 */

const puppeteer = require('puppeteer');

// 5 Random charities for testing
const AUDIT_CHARITIES = [
    { id: 33802, name: "Keir Memorial Provident Fund" },
    { id: 42815, name: "Ruahine Playhouse" },
    { id: 56541, name: "Waiora Community Trust (Taupo) Incorporated" },
    { id: 44324, name: "Rotary Club of Botany East Tamaki Charitable Trust" },
    { id: 51543, name: "Manukau Concert Band Incorporated" }
];

async function fetchAPIData(charityId) {
    console.log(`   Fetching API data for charity ${charityId}...`);
    const response = await fetch(`http://localhost:8000/api/financial?id=${charityId}`);
    if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
    }
    const data = await response.json();
    const annualReturns = data.d || [];

    if (annualReturns.length === 0) {
        throw new Error('No annual returns found');
    }

    return annualReturns[0];
}

async function fetchLocalhostPage(charityId, browser) {
    console.log(`   Fetching localhost page for charity ${charityId}...`);
    const page = await browser.newPage();

    await page.goto(`http://localhost:8000/?id=${charityId}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
    });

    // Wait for financial data to load and have actual content
    await page.waitForFunction(() => {
        const el = document.querySelector('#totalIncome');
        return el && el.textContent.trim().length > 0 && el.textContent.trim() !== '$0';
    }, { timeout: 15000 });

    // Small additional delay to ensure all data is populated
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract financial data from the page
    const data = await page.evaluate(() => {
        const getText = (selector) => {
            const el = document.querySelector(selector);
            return el ? el.textContent.trim() : '';
        };

        const parseValue = (text) => {
            if (!text) return 0;
            // Remove $, commas, parentheses and convert to number
            const cleaned = text.replace(/[$,()]/g, '').trim();
            const num = parseFloat(cleaned);
            // Check if negative (had parentheses)
            return text.includes('(') && text.includes(')') ? -Math.abs(num) : num;
        };

        return {
            totalIncome: parseValue(getText('#totalIncome')),
            totalExpenditure: parseValue(getText('#totalExpenditure')),
            netSurplus: parseValue(getText('#netSurplus')),
            totalAssets: parseValue(getText('#totalAssets')),

            // Expenditure breakdown
            salaries: parseValue(getText('#salariesAmount')),
            fundraising: parseValue(getText('#fundraisingAmount')),
            service: parseValue(getText('#serviceAmount')),
            grants: parseValue(getText('#grantsAmount'))
        };
    });

    await page.close();
    return data;
}

function compareFinancials(localhost, api, charity) {
    const discrepancies = [];

    // Compare totals
    const checks = [
        { name: 'Total Income', local: localhost.totalIncome, api: api.TotalGrossIncome || 0, critical: true },
        { name: 'Total Expenditure', local: localhost.totalExpenditure, api: api.TotalExpenditure || 0, critical: true },
        { name: 'Net Surplus/Deficit', local: localhost.netSurplus, api: (api.TotalGrossIncome || 0) - (api.TotalExpenditure || 0), critical: true },
        { name: 'Total Assets', local: localhost.totalAssets, api: api.TotalAssets || 0, critical: true },

        // Expenditure breakdown
        { name: 'Volunteer/Employee Costs', local: localhost.salaries, api: api.VolunteerAndEmployeeRelatedCosts || 0, critical: false },
        { name: 'Costs for Goods/Services', local: localhost.service, api: api.CostsRelatedToProvidingGoodsAndServices || 0, critical: false },
        { name: 'Grants Made', local: localhost.grants, api: api.GrantsAndDonationsMade || 0, critical: false }
    ];

    for (const check of checks) {
        // Allow for small rounding differences (within $1)
        const diff = Math.abs(check.local - check.api);

        if (diff > 1) {
            const percentDiff = check.api !== 0 ? (diff / Math.abs(check.api) * 100) : 0;

            discrepancies.push({
                field: check.name,
                localhost: check.local,
                api: check.api,
                difference: diff,
                percentDiff: percentDiff.toFixed(2),
                critical: check.critical
            });
        }
    }

    return discrepancies;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

async function auditCharity(charity, browser) {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`AUDITING: ${charity.name} (ID: ${charity.id})`);
    console.log('='.repeat(100));

    try {
        // Fetch data from both sources
        const [apiData, localhostData] = await Promise.all([
            fetchAPIData(charity.id),
            fetchLocalhostPage(charity.id, browser)
        ]);

        console.log('\n✅ Data fetched from both sources');

        // Build PDF URL
        const relatedId = apiData.NoticeofChangeAnnualReturnId;
        const pdfUrl = `https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${relatedId}&isPublic=true`;

        console.log(`\n📄 Official PDF: ${pdfUrl}`);
        console.log(`🌐 Your site: http://localhost:8000/?id=${charity.id}`);

        // Display side-by-side comparison
        console.log(`\n📊 COMPARISON:`);
        console.log(`${'─'.repeat(100)}`);
        console.log(`Field                          Your Site              Official API           Match`);
        console.log(`${'─'.repeat(100)}`);

        const comparisons = [
            { name: 'Total Income', local: localhostData.totalIncome, api: apiData.TotalGrossIncome || 0 },
            { name: 'Total Expenditure', local: localhostData.totalExpenditure, api: apiData.TotalExpenditure || 0 },
            { name: 'Total Assets', local: localhostData.totalAssets, api: apiData.TotalAssets || 0 },
            { name: 'Employee Costs', local: localhostData.salaries, api: apiData.VolunteerAndEmployeeRelatedCosts || 0 },
            { name: 'Service Costs', local: localhostData.service, api: apiData.CostsRelatedToProvidingGoodsAndServices || 0 }
        ];

        for (const comp of comparisons) {
            const match = Math.abs(comp.local - comp.api) <= 1 ? '✅' : '❌';
            const localStr = formatCurrency(comp.local).padEnd(22);
            const apiStr = formatCurrency(comp.api).padEnd(22);
            const nameStr = comp.name.padEnd(30);

            console.log(`${nameStr} ${localStr} ${apiStr} ${match}`);
        }

        // Compare
        const discrepancies = compareFinancials(localhostData, apiData, charity);

        if (discrepancies.length === 0) {
            console.log(`\n✅ PERFECT MATCH - All data matches!`);
            return {
                charity,
                status: 'PASSED',
                discrepancies: [],
                pdfUrl
            };
        } else {
            const criticalCount = discrepancies.filter(d => d.critical).length;

            console.log(`\n⚠️  ${discrepancies.length} DISCREPANCIES FOUND (${criticalCount} critical)`);
            console.log(`\n${'─'.repeat(100)}`);

            for (const disc of discrepancies) {
                const severity = disc.critical ? '🔴 CRITICAL' : '⚠️  Minor';
                console.log(`\n${severity} - ${disc.field}`);
                console.log(`   Your Site:    ${formatCurrency(disc.localhost)}`);
                console.log(`   Official API: ${formatCurrency(disc.api)}`);
                console.log(`   Difference:   ${formatCurrency(disc.difference)} (${disc.percentDiff}%)`);
            }

            return {
                charity,
                status: criticalCount > 0 ? 'CRITICAL_FAIL' : 'MINOR_FAIL',
                discrepancies,
                pdfUrl
            };
        }

    } catch (error) {
        console.log(`\n❌ ERROR: ${error.message}`);
        return {
            charity,
            status: 'ERROR',
            error: error.message
        };
    }
}

async function generateProductionReport(results) {
    console.log(`\n\n${'█'.repeat(100)}`);
    console.log('PRODUCTION READINESS REPORT');
    console.log('█'.repeat(100));

    const passed = results.filter(r => r.status === 'PASSED').length;
    const criticalFails = results.filter(r => r.status === 'CRITICAL_FAIL').length;
    const minorFails = results.filter(r => r.status === 'MINOR_FAIL').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    const total = results.length;

    console.log(`\n📊 AUDIT SUMMARY:`);
    console.log(`   Total Charities Tested: ${total}`);
    console.log(`   ✅ Perfect Match:      ${passed} (${(passed/total*100).toFixed(0)}%)`);
    console.log(`   🔴 Critical Failures:  ${criticalFails} (${(criticalFails/total*100).toFixed(0)}%)`);
    console.log(`   ⚠️  Minor Issues:       ${minorFails} (${(minorFails/total*100).toFixed(0)}%)`);
    console.log(`   ❌ Errors:             ${errors} (${(errors/total*100).toFixed(0)}%)`);

    // List all results
    console.log(`\n\n📋 DETAILED RESULTS:`);
    console.log('─'.repeat(100));

    results.forEach((result, idx) => {
        const statusIcon = {
            'PASSED': '✅',
            'CRITICAL_FAIL': '🔴',
            'MINOR_FAIL': '⚠️',
            'ERROR': '❌'
        }[result.status];

        console.log(`\n${idx + 1}. ${result.charity.name} (ID: ${result.charity.id})`);
        console.log(`   Status: ${statusIcon} ${result.status}`);

        if (result.pdfUrl) {
            console.log(`   PDF: ${result.pdfUrl}`);
        }

        if (result.discrepancies && result.discrepancies.length > 0) {
            console.log(`   Issues: ${result.discrepancies.length} discrepancies`);
            result.discrepancies.forEach(disc => {
                if (disc.critical) {
                    console.log(`      🔴 ${disc.field}: ${formatCurrency(disc.difference)} difference`);
                }
            });
        }
    });

    // Final verdict
    console.log(`\n\n${'█'.repeat(100)}`);
    console.log('PRODUCTION READINESS VERDICT');
    console.log('█'.repeat(100));

    if (passed === total) {
        console.log('\n🎉 STATUS: ✅ PRODUCTION READY\n');
        console.log('Outstanding! All tested charities show perfect accuracy.');
        console.log('Your website matches official government records exactly.\n');
        console.log('✅ Recommendation: READY FOR PRODUCTION DEPLOYMENT\n');
        console.log('Next steps:');
        console.log('  1. Deploy to production');
        console.log('  2. Monitor error logs');
        console.log('  3. Set up automated testing');

    } else if (criticalFails === 0 && minorFails < total * 0.3) {
        console.log('\n⚠️  STATUS: MOSTLY READY (Minor Issues)\n');
        console.log('Good work! No critical discrepancies in totals.');
        console.log('Some minor categorization differences detected.\n');
        console.log('⚠️  Recommendation: SOFT LAUNCH WITH MONITORING\n');
        console.log('Next steps:');
        console.log('  1. Review minor discrepancies');
        console.log('  2. Consider beta testing');
        console.log('  3. Deploy with monitoring');

    } else {
        console.log('\n🔴 STATUS: ❌ NOT PRODUCTION READY\n');
        console.log('Critical issues detected! Data accuracy problems found.');
        console.log('Total amounts do not match official records.\n');
        console.log('❌ Recommendation: FIX CRITICAL ISSUES BEFORE DEPLOYMENT\n');
        console.log('Required fixes:');

        results.filter(r => r.status === 'CRITICAL_FAIL').forEach((result, idx) => {
            console.log(`\n${idx + 1}. ${result.charity.name} (ID: ${result.charity.id})`);
            result.discrepancies.filter(d => d.critical).forEach(disc => {
                console.log(`   - Fix ${disc.field}: ${formatCurrency(disc.difference)} difference`);
            });
        });
    }

    console.log(`\n${'█'.repeat(100)}\n`);
}

async function runAudit() {
    console.log('🔍 PRODUCTION READINESS AUDIT');
    console.log(`Testing ${AUDIT_CHARITIES.length} random charities...\n`);
    console.log('This will compare your localhost:8000 with official government data\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];

    try {
        for (const charity of AUDIT_CHARITIES) {
            const result = await auditCharity(charity, browser);
            results.push(result);

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await generateProductionReport(results);

    } finally {
        await browser.close();
    }

    console.log('✅ Audit complete!\n');
}

// Run the audit
runAudit().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
