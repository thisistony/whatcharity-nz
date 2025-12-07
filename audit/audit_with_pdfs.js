const sqlite3 = require('sqlite3').verbose();
const puppeteer = require('puppeteer');

const TEST_CHARITIES = [
    { id: 55332, name: "St. Kentigern Trust Board", tier: 1 },
    { id: 55463, name: "King's School, Auckland", tier: 2 },
    { id: 34855, name: "The Salvation Army New Zealand Officers Superannuation Scheme", tier: 4 },
    { id: 39075, name: "New Zealand Red Cross Foundation", tier: 2 },
    { id: 43529, name: "The Plunket Foundation", tier: 3 },
    { id: 46082, name: "The Gisborne SPCA Charitable Trust Board Incorporated", tier: 3 },
    { id: 34038, name: "New Zealand Research Foundation of The Australian and New Zealand Head and Neck Cancer Society", tier: 3 },
    { id: 33401, name: "The Diabetes Wellington Charitable Trust", tier: 4 },
    { id: 36730, name: "Friends of Fiji Heart Foundation", tier: 3 },
    { id: 36214, name: "Whangarei Native Forest and Bird Protection Society Charitable Trust", tier: 3 },
];

const db = new sqlite3.Database('charities.db');

function formatCurrency(value) {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

async function getCharityData(charityId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT
                c.charity_name,
                c.registration_number,
                ar.tier,
                ar.related_id,
                ar.financial_data
            FROM charities c
            JOIN annual_returns ar ON c.charity_id = ar.charity_id
            WHERE c.charity_id = ?
            ORDER BY ar.balance_date DESC
            LIMIT 1
        `;

        db.get(query, [charityId], (err, row) => {
            if (err) reject(err);
            else if (!row) resolve(null);
            else {
                const financialData = JSON.parse(row.financial_data);
                resolve({
                    charityId,
                    name: row.charity_name,
                    registrationNumber: row.registration_number,
                    tier: row.tier,
                    relatedId: row.related_id,
                    financialData
                });
            }
        });
    });
}

async function scrapeLocalhostPage(charityId) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(`http://localhost:8000/?id=${charityId}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for financial data to load
        await page.waitForSelector('.breakdown-section', { timeout: 10000 });

        // Extract income and expenditure data
        const data = await page.evaluate(() => {
            const sections = document.querySelectorAll('.breakdown-section');
            const result = { income: {}, expenditure: {} };

            sections.forEach(section => {
                const heading = section.querySelector('h3');
                if (!heading) return;

                const isIncome = heading.textContent.includes('Income Breakdown');
                const isExpenditure = heading.textContent.includes('Expenditure Breakdown');

                if (!isIncome && !isExpenditure) return;

                const items = section.querySelectorAll('.breakdown-item');
                const target = isIncome ? result.income : result.expenditure;

                items.forEach(item => {
                    const labelEl = item.querySelector('.breakdown-label');
                    const valueEl = item.querySelector('.breakdown-value');
                    const percentEl = item.querySelector('.breakdown-percent');

                    if (labelEl && valueEl && percentEl) {
                        const label = labelEl.textContent.trim();
                        const valueText = valueEl.textContent.trim();
                        const percentText = percentEl.textContent.trim();

                        // Parse value (remove $ and commas)
                        const value = parseFloat(valueText.replace(/[$,]/g, ''));
                        // Parse percentage (remove % and parentheses)
                        const percent = parseFloat(percentText.replace(/[()%]/g, ''));

                        if (!isNaN(value) && !isNaN(percent)) {
                            target[label] = { value, percent };
                        }
                    }
                });
            });

            // Get total income and expenditure
            const incomeTotal = document.querySelector('h3:contains("Income Breakdown")');
            const expTotal = document.querySelector('h3:contains("Expenditure Breakdown")');

            return result;
        });

        await browser.close();
        return data;
    } catch (error) {
        await browser.close();
        throw error;
    }
}

async function auditCharity(charity) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Auditing: ${charity.name} (ID: ${charity.id}, Tier ${charity.tier})`);
    console.log('='.repeat(80));

    try {
        // Get data from database
        const dbData = await getCharityData(charity.id);
        if (!dbData) {
            console.log('❌ No data found in database');
            return {
                charity,
                status: 'error',
                error: 'No database data'
            };
        }

        // Get PDF URL
        const pdfUrl = `https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${dbData.relatedId}&isPublic=true`;

        // Scrape localhost page
        console.log('🌐 Fetching localhost page...');
        const localhostData = await scrapeLocalhostPage(charity.id);

        console.log('\n📊 LOCALHOST DATA:');
        console.log('Income items:', Object.keys(localhostData.income).length);
        console.log('Expenditure items:', Object.keys(localhostData.expenditure).length);

        // Calculate totals
        const localhostIncomeTotal = Object.values(localhostData.income)
            .reduce((sum, item) => sum + item.value, 0);
        const localhostExpTotal = Object.values(localhostData.expenditure)
            .reduce((sum, item) => sum + item.value, 0);

        console.log(`Total Income: ${formatCurrency(localhostIncomeTotal)}`);
        console.log(`Total Expenditure: ${formatCurrency(localhostExpTotal)}`);

        // Get API totals from financial data
        const apiIncomeTotal = dbData.financialData.TotalIncome || 0;
        const apiExpTotal = dbData.financialData.TotalExpenditure || 0;

        console.log('\n📊 API TOTALS:');
        console.log(`Total Income: ${formatCurrency(apiIncomeTotal)}`);
        console.log(`Total Expenditure: ${formatCurrency(apiExpTotal)}`);

        // Calculate coverage
        const incomeCoverage = apiIncomeTotal > 0
            ? (localhostIncomeTotal / apiIncomeTotal * 100)
            : 100;
        const expCoverage = apiExpTotal > 0
            ? (localhostExpTotal / apiExpTotal * 100)
            : 100;

        console.log('\n✅ COVERAGE:');
        console.log(`Income: ${incomeCoverage.toFixed(1)}%`);
        console.log(`Expenditure: ${expCoverage.toFixed(1)}%`);

        // Determine status
        const incomePass = Math.abs(incomeCoverage - 100) < 0.5;
        const expPass = Math.abs(expCoverage - 100) < 0.5 || apiExpTotal === 0;
        const overallPass = incomePass && expPass;

        console.log(`\n${overallPass ? '✅ PASSED' : '⚠️  WARNING'}`);

        // Show breakdown details
        console.log('\n📋 INCOME BREAKDOWN:');
        Object.entries(localhostData.income).forEach(([label, data]) => {
            console.log(`  • ${label}: ${formatCurrency(data.value)} (${data.percent.toFixed(1)}%)`);
        });

        console.log('\n📋 EXPENDITURE BREAKDOWN:');
        Object.entries(localhostData.expenditure).forEach(([label, data]) => {
            console.log(`  • ${label}: ${formatCurrency(data.value)} (${data.percent.toFixed(1)}%)`);
        });

        console.log(`\n📄 PDF: ${pdfUrl}`);

        return {
            charity,
            status: overallPass ? 'passed' : 'warning',
            localhostData,
            apiTotals: {
                income: apiIncomeTotal,
                expenditure: apiExpTotal
            },
            localhostTotals: {
                income: localhostIncomeTotal,
                expenditure: localhostExpTotal
            },
            coverage: {
                income: incomeCoverage,
                expenditure: expCoverage
            },
            pdfUrl
        };

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return {
            charity,
            status: 'error',
            error: error.message
        };
    }
}

async function runAudit() {
    console.log('🔍 Starting Localhost + PDF Audit');
    console.log(`Testing ${TEST_CHARITIES.length} charities\n`);

    const results = [];

    for (const charity of TEST_CHARITIES) {
        const result = await auditCharity(charity);
        results.push(result);

        // Pause between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(80));

    const passed = results.filter(r => r.status === 'passed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`\n✅ Passed: ${passed}/${TEST_CHARITIES.length}`);
    console.log(`⚠️  Warnings: ${warnings}/${TEST_CHARITIES.length}`);
    console.log(`❌ Errors: ${errors}/${TEST_CHARITIES.length}`);

    if (warnings > 0) {
        console.log('\n⚠️  CHARITIES WITH WARNINGS:');
        results.filter(r => r.status === 'warning').forEach(r => {
            console.log(`\n${r.charity.name} (ID: ${r.charity.id})`);
            console.log(`  Income: ${r.coverage.income.toFixed(1)}%`);
            console.log(`  Expenditure: ${r.coverage.expenditure.toFixed(1)}%`);
            console.log(`  PDF: ${r.pdfUrl}`);
        });
    }

    db.close();

    console.log('\n✅ Audit complete!\n');
}

runAudit().catch(err => {
    console.error('Fatal error:', err);
    db.close();
    process.exit(1);
});
