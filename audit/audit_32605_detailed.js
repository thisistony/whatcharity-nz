const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CHARITY_ID = 32605;
const LOCALHOST_URL = `http://localhost:8000/?id=${CHARITY_ID}`;
const PDF_URL = 'https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=5a3707e0-bf0e-f011-bb41-0022480ffcd1&isPublic=true';

async function getLocalhostData() {
    const browser = await puppeteer.launch({ headless: true });
    try {
        const page = await browser.newPage();

        // Wait for page to load and extract data
        await page.goto(LOCALHOST_URL, { waitUntil: 'networkidle2', timeout: 30000 });

        // Wait for financial data to load
        await page.waitForSelector('#totalIncome', { timeout: 10000 }).catch(() => {});

        // Give extra time for all data to render
        await page.waitForTimeout(2000);

        // Extract all financial data from the page
        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const elem = document.querySelector(selector);
                return elem ? elem.textContent.trim() : null;
            };

            return {
                charityName: getText('#charityName'),
                regNumber: getText('#regNumber'),
                yearEnded: getText('#yearEnded'),
                totalIncome: getText('#totalIncome'),
                totalExpenditure: getText('#totalExpenditure'),
                netSurplus: getText('#netSurplus'),
                totalAssets: getText('#totalAssets'),

                // Expenditure breakdown
                salariesAmount: getText('#salariesAmount'),
                fundraisingAmount: getText('#fundraisingAmount'),
                serviceAmount: getText('#serviceAmount'),
                grantsAmount: getText('#grantsAmount'),
                tradingAmount: getText('#tradingAmount'),
                volunteerAmount: getText('#volunteerAmount'),
                otherExpAmount: getText('#otherExpAmount'),
                unaccountedAmount: getText('#unaccountedAmount'),
                expenditureTotalAmount: getText('#expenditureTotalAmount'),

                // Income breakdown
                donationsAmount: getText('#donationsAmount'),
                generalGrantsAmount: getText('#generalGrantsAmount'),
                capitalGrantsAmount: getText('#capitalGrantsAmount'),
                govGrantsAmount: getText('#govGrantsAmount'),
                nonGovGrantsAmount: getText('#nonGovGrantsAmount'),
                membershipFeesAmount: getText('#membershipFeesAmount'),
                commercialRevenueAmount: getText('#commercialRevenueAmount'),
                investmentAmount: getText('#investmentAmount'),
                otherIncomeAmount: getText('#otherIncomeAmount'),
                unaccountedIncomeAmount: getText('#unaccountedIncomeAmount'),
                incomeTotalAmount: getText('#incomeTotalAmount'),

                // Assets
                cashAssets: getText('#cashAssets'),
                investments: getText('#investments'),
                landBuildings: getText('#landBuildings'),
                otherAssets: getText('#otherAssets'),
                totalLiabilities: getText('#totalLiabilities'),
                totalEquity: getText('#totalEquity'),

                // Insights
                programEfficiency: getText('#programEfficiency'),
                staffRatio: getText('#staffRatio'),
                overseasSpending: getText('#overseasSpending'),

                // People
                volunteersCount: getText('#volunteersCount'),
                volunteerHours: getText('#volunteerHours'),
                employeesCount: getText('#employeesCount'),
                employeeHours: getText('#employeeHours'),
            };
        });

        console.log('✓ Successfully extracted localhost data');
        return data;
    } finally {
        await browser.close();
    }
}

async function getPdfData() {
    console.log('Fetching PDF from Charities Services...');
    console.log(`PDF URL: ${PDF_URL}`);
    console.log('\nNote: You need to manually extract data from the PDF.');
    console.log('Please visit the URL above and record the following values:\n');

    return {
        note: 'Manual PDF extraction required',
        url: PDF_URL
    };
}

function cleanValue(val) {
    if (!val) return 0;
    return parseFloat(val.toString().replace(/[$,\s%]/g, '')) || 0;
}

function formatCurrency(val) {
    return '$' + Number(val).toLocaleString('en-NZ', { maximumFractionDigits: 0 });
}

async function runAudit() {
    console.log('========================================');
    console.log('AUDIT: Charity ID ' + CHARITY_ID);
    console.log('========================================\n');

    console.log('Step 1: Extracting Localhost Data...');
    const localhostData = await getLocalhostData();

    console.log('\n========================================');
    console.log('LOCALHOST DATA EXTRACTED');
    console.log('========================================\n');

    console.log(`Charity: ${localhostData.charityName}`);
    console.log(`Registration: ${localhostData.regNumber}`);
    console.log(`Year Ended: ${localhostData.yearEnded}\n`);

    console.log('MAIN FINANCIAL FIGURES:');
    console.log(`  Total Income: ${localhostData.totalIncome}`);
    console.log(`  Total Expenditure: ${localhostData.totalExpenditure}`);
    console.log(`  Net Surplus/Deficit: ${localhostData.netSurplus}`);
    console.log(`  Total Assets: ${localhostData.totalAssets}\n`);

    console.log('EXPENDITURE BREAKDOWN:');
    console.log(`  Salaries/Employee Related: ${localhostData.salariesAmount}`);
    console.log(`  Fundraising: ${localhostData.fundraisingAmount}`);
    console.log(`  Service Provision: ${localhostData.serviceAmount}`);
    console.log(`  Grants/Donations Made: ${localhostData.grantsAmount}`);
    console.log(`  Trading Operations: ${localhostData.tradingAmount}`);
    console.log(`  Volunteer Expenses: ${localhostData.volunteerAmount}`);
    console.log(`  Other Expenses: ${localhostData.otherExpAmount}`);
    console.log(`  Unaccounted: ${localhostData.unaccountedAmount}`);
    console.log(`  TOTAL: ${localhostData.expenditureTotalAmount}\n`);

    console.log('INCOME BREAKDOWN:');
    console.log(`  Donations/Koha/Bequests: ${localhostData.donationsAmount}`);
    console.log(`  General Grants: ${localhostData.generalGrantsAmount}`);
    console.log(`  Capital Grants: ${localhostData.capitalGrantsAmount}`);
    console.log(`  Government Service Delivery Grants: ${localhostData.govGrantsAmount}`);
    console.log(`  Non-Government Service Delivery Grants: ${localhostData.nonGovGrantsAmount}`);
    console.log(`  Membership Fees: ${localhostData.membershipFeesAmount}`);
    console.log(`  Commercial Revenue: ${localhostData.commercialRevenueAmount}`);
    console.log(`  Investment Income: ${localhostData.investmentAmount}`);
    console.log(`  Other Revenue: ${localhostData.otherIncomeAmount}`);
    console.log(`  Unaccounted: ${localhostData.unaccountedIncomeAmount}`);
    console.log(`  TOTAL: ${localhostData.incomeTotalAmount}\n`);

    console.log('ASSETS & LIABILITIES:');
    console.log(`  Cash & Bank Balances: ${localhostData.cashAssets}`);
    console.log(`  Investments: ${localhostData.investments}`);
    console.log(`  Land & Buildings: ${localhostData.landBuildings}`);
    console.log(`  Other Assets: ${localhostData.otherAssets}`);
    console.log(`  Total Liabilities: ${localhostData.totalLiabilities}`);
    console.log(`  Net Equity: ${localhostData.totalEquity}\n`);

    console.log('KEY INSIGHTS:');
    console.log(`  Non-Salary Expenditure: ${localhostData.programEfficiency}`);
    console.log(`  Staff Cost Ratio: ${localhostData.staffRatio}`);
    console.log(`  Overseas Spending: ${localhostData.overseasSpending}\n`);

    console.log('PEOPLE & OPERATIONS:');
    console.log(`  Volunteers: ${localhostData.volunteersCount}`);
    console.log(`  Volunteer Hours: ${localhostData.volunteerHours}`);
    console.log(`  Employees: ${localhostData.employeesCount}`);
    console.log(`  Employee Hours: ${localhostData.employeeHours}\n`);

    console.log('\n========================================');
    console.log('NEXT STEP: MANUAL PDF VERIFICATION');
    console.log('========================================\n');
    console.log('Please visit the following PDF link and manually verify');
    console.log('that all the above figures match exactly:\n');
    console.log(PDF_URL);
    console.log('\n✓ Copy each value from the PDF and compare with the');
    console.log('  localhost values above to identify any discrepancies.\n');

    // Save the extracted data to a file for reference
    const reportPath = path.join(__dirname, `AUDIT_32605_DETAILED.md`);
    const report = `# Audit Report: Charity ID ${CHARITY_ID}

## Charity Information
- **Name:** ${localhostData.charityName}
- **Registration Number:** ${localhostData.regNumber}
- **Year Ended:** ${localhostData.yearEnded}

## Main Financial Figures (Localhost)
- **Total Income:** ${localhostData.totalIncome}
- **Total Expenditure:** ${localhostData.totalExpenditure}
- **Net Surplus/Deficit:** ${localhostData.netSurplus}
- **Total Assets:** ${localhostData.totalAssets}

## Expenditure Breakdown (Localhost)
| Category | Amount |
|----------|--------|
| Salaries/Employee Related | ${localhostData.salariesAmount} |
| Fundraising | ${localhostData.fundraisingAmount} |
| Service Provision | ${localhostData.serviceAmount} |
| Grants/Donations Made | ${localhostData.grantsAmount} |
| Trading Operations | ${localhostData.tradingAmount} |
| Volunteer Expenses | ${localhostData.volunteerAmount} |
| Other Expenses | ${localhostData.otherExpAmount} |
| Unaccounted | ${localhostData.unaccountedAmount} |
| **TOTAL** | **${localhostData.expenditureTotalAmount}** |

## Income Breakdown (Localhost)
| Source | Amount |
|--------|--------|
| Donations/Koha/Bequests | ${localhostData.donationsAmount} |
| General Grants | ${localhostData.generalGrantsAmount} |
| Capital Grants | ${localhostData.capitalGrantsAmount} |
| Government Service Delivery Grants | ${localhostData.govGrantsAmount} |
| Non-Government Service Delivery Grants | ${localhostData.nonGovGrantsAmount} |
| Membership Fees | ${localhostData.membershipFeesAmount} |
| Commercial Revenue | ${localhostData.commercialRevenueAmount} |
| Investment Income | ${localhostData.investmentAmount} |
| Other Revenue | ${localhostData.otherIncomeAmount} |
| Unaccounted | ${localhostData.unaccountedIncomeAmount} |
| **TOTAL** | **${localhostData.incomeTotalAmount}** |

## Assets & Liabilities (Localhost)
| Item | Amount |
|------|--------|
| Cash & Bank Balances | ${localhostData.cashAssets} |
| Investments | ${localhostData.investments} |
| Land & Buildings | ${localhostData.landBuildings} |
| Other Assets | ${localhostData.otherAssets} |
| Total Liabilities | ${localhostData.totalLiabilities} |
| Net Equity | ${localhostData.totalEquity} |

## Key Insights (Localhost)
- Non-Salary Expenditure: ${localhostData.programEfficiency}
- Staff Cost Ratio: ${localhostData.staffRatio}
- Overseas Spending: ${localhostData.overseasSpending}

## People & Operations (Localhost)
- Volunteers: ${localhostData.volunteersCount}
- Volunteer Hours: ${localhostData.volunteerHours}
- Employees: ${localhostData.employeesCount}
- Employee Hours: ${localhostData.employeeHours}

## PDF Verification
**PDF URL:** ${PDF_URL}

### Instructions for Manual Verification:
1. Visit the PDF link above
2. Compare each figure in the PDF with the "Localhost" values above
3. Record any discrepancies
4. Update this report with findings

---
Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync(reportPath, report);
    console.log(`✓ Report saved to: ${reportPath}\n`);
}

runAudit().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
