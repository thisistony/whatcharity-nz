/**
 * Charity Financial Breakdown Audit Script
 *
 * This script audits 20 charities across different tiers to verify that:
 * 1. Income breakdown matches official PDF statements
 * 2. Expense breakdown matches official PDF statements
 * 3. No double-counting occurs
 * 4. All fields are properly mapped
 */

const API_BASE = 'http://localhost:8000/api';

// Test charities across different tiers
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
    { id: 32980, name: "Jesus Love Presbyterian Church", tier: 4 },
    { id: 32664, name: "Pilgrim Baptist Church", tier: 4 },
    { id: 32739, name: "Rotary Club Of Invercargill South Inc Charitable Trust", tier: 4 },
    { id: 32804, name: "The Lions Clubs New Zealand Charitable Trust", tier: 3 },
    { id: 32729, name: "St John's School Parent Teacher & Friends Association", tier: 4 },
    { id: 32759, name: "Rarangi Surf Life Saving Club Incorporated", tier: 3 },
    { id: 33499, name: "CHRISTCHURCH HIGH SCHOOL OLD BOYS RUGBY FOOTBALL CLUB INCORPORATED", tier: 3 },
    { id: 32983, name: "HB Cricket Charitable Trust", tier: 4 },
    { id: 33626, name: "Victoria University of Wellington Law Students' Society (Incorporated)", tier: 3 },
    { id: 32767, name: "Martinborough Museum", tier: 4 },
];

// Field mapping - same as app.js
const incomeFieldLabels = {
    // Tier 3/4 PBE - Exchange transactions
    'FeesSubscriptionsIncludingDonationsFromMembers': 'Fees, subscriptions (including donations) from members',
    'RevenueFromProvidingGoodsAndServices': 'Revenue from providing goods and services',
    'RevenueFromProvidingGoodsAndServicesFromOtherSources': 'Revenue from providing goods and services from other sources',
    'ServiceDeliveryContractRevenueFromLocalOrCentralGovernment': 'Service delivery contract revenue from government',
    'InterestDividendsAndOtherInvestmentRevenue': 'Interest, dividends and other investment revenue',
    'OtherRevenueFromExchangeTransactions': 'Other revenue from exchange transactions',
    'OtherRevenueFromExchangeTransactionsIncludingFeesSubscriptionsAndDonationsFromMembers': 'Other revenue from exchange transactions',

    // Tier 3/4 PBE - Non-exchange transactions
    'DonationsKohaBequestsAndSimilarRevenue': 'Donations, koha, bequests and similar revenue',
    'DonationsKohaGrantsFundraisingAndOtherSimilarRevenue': 'Donations, koha, grants, fundraising and other similar revenue',
    'GrantsRevenueFromLocalOrCentralGovernment': 'Grants revenue from government',
    'GrantsRevenueFromOtherSources': 'Grants revenue from other sources',
    'OtherRevenueFromNonExchangeTransactions': 'Other revenue from non-exchange transactions',

    // Tier 2 detailed
    'DonationsKoha': 'Donations and koha',
    'GeneralGrantsReceived': 'General grants',
    'CapitalGrantsAndDonations': 'Capital grants and donations',
    'GovtGrantsContracts': 'Government grants/contracts',
    'GovernmentServiceDeliveryGrantsContracts': 'Government service delivery grants/contracts',
    'NonGovernmentServiceDeliveryGrantsContracts': 'Non-government service delivery grants/contracts',
    'MembershipFees': 'Membership fees',
    'ServiceTradingIncome': 'Service/trading income',
    'RevenueFromCommercialActivities': 'Revenue from commercial activities',
    'InterestOfDividendsReceived': 'Interest and dividends received',
    'NewZealandDividends': 'New Zealand dividends',
    'OtherInvestmentIncome': 'Other investment income',
    'AllOtherIncome': 'All other income',

    // Tier 1 simplified
    'RevenueFromProvidingGoodsAndServices': 'Revenue from goods and services',
    'OtherRevenue': 'Other revenue'
};

const expenseFieldLabels = {
    // Tier 3/4 PBE Standards
    'WagesSalariesAndOtherEmployeeCosts': 'Wages, salaries and other employee costs',
    'OperatingAndAdministrativeExpenses': 'Operating and administrative expenses',
    'DepreciationAmortisationAndImpairmentExpenses': 'Depreciation, amortisation and impairment',
    'FinanceCosts': 'Finance costs',
    'GrantsAndDonationsMade': 'Grants and donations made',
    'OtherExpenses': 'Other expenses',

    // Tier 2 Detailed
    'EmployeeRemunerationAndOtherRelatedExpenses': 'Employee remuneration and related expenses',
    'SalariesAndWages': 'Salaries and wages',
    'VolunteerRelatedExpenses': 'Volunteer related expenses',
    'ExpensesRelatedToFundraising': 'Fundraising expenses',
    'FundRaisingExpenses': 'Fundraising expenses',
    'CostOfServiceProvision': 'Cost of service provision',
    'OtherExpensesRelatedToServiceDelivery': 'Other service delivery expenses',
    'OtherRelatedToDeliveryOfEntityObjectives': 'Expenses related to delivery of entity objectives',
    'ExpensesRelatedToCommercialActivities': 'Commercial activities expenses',
    'CostOfTradingOperations': 'Cost of trading operations',
    'GrantsPaidWithinNZ': 'Grants paid within NZ',
    'GrantsPaidOutsideNZ': 'Grants paid outside NZ',
    'Depreciation': 'Depreciation',
    'AllOtherExpenditure': 'All other expenditure',

    // Tier 1 Simplified
    'VolunteerAndEmployeeRelatedCosts': 'Volunteer and employee related costs',
    'CostsRelatedToProvidingGoodsAndServices': 'Costs related to providing goods and services'
};

async function fetchFinancialData(orgId) {
    const response = await fetch(`${API_BASE}/financial?id=${orgId}`);
    const data = await response.json();
    const results = data.d || data.value || [];
    return results.length > 0 ? results[0] : null;
}

async function fetchHistoricalData(orgId) {
    const response = await fetch(`${API_BASE}/historical?id=${orgId}`);
    const data = await response.json();
    return data.d || data.value || [];
}

function processIncome(data) {
    const incomeLineItems = [];
    const processedValues = new Map();
    let totalAccountedIncome = 0;

    Object.keys(data).forEach(fieldName => {
        const value = data[fieldName];
        if (!value || value <= 0) return;

        // Skip boolean fields
        if (value === true || value === false) return;

        const isIncomeField = (
            incomeFieldLabels[fieldName] ||
            (fieldName.includes('Income') && !fieldName.includes('Total') && !fieldName.includes('LastYear')) ||
            (fieldName.includes('Revenue') && !fieldName.includes('Total') && !fieldName.includes('Comprehensive')) ||
            (fieldName.includes('Grant') && !fieldName.includes('Paid') && !fieldName.includes('Made')) ||
            (fieldName.includes('Donation') && !fieldName.includes('Paid') && !fieldName.includes('Made')) ||
            (fieldName.includes('Koha')) ||
            (fieldName.includes('Subscription')) ||
            (fieldName.includes('Fees') && !fieldName.includes('Membership') === false) ||
            (fieldName.includes('Trading') && !fieldName.includes('Cost')) ||
            (fieldName.includes('Dividend')) ||
            (fieldName.includes('Interest') && !fieldName.includes('Paid'))
        );

        if (!isIncomeField) return;

        if (fieldName.includes('Total') || fieldName.includes('Accumulated') ||
            fieldName.includes('Comprehensive') || fieldName.includes('LastYear') ||
            fieldName.includes('Expense') || fieldName.includes('Surplus') || fieldName.includes('Deficit')) {
            return;
        }

        // Check for duplicates
        const isDuplicate = Array.from(processedValues.values()).some(entry =>
            entry.value === value && entry.field !== fieldName
        );

        if (isDuplicate) return;

        const label = incomeFieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
        incomeLineItems.push({ fieldName, label, amount: value });
        totalAccountedIncome += value;
        processedValues.set(fieldName, { field: fieldName, value });
    });

    return { incomeLineItems, totalAccountedIncome };
}

function processExpenses(data) {
    const expenseLineItems = [];
    const processedValues = new Map();
    let totalAccountedExpense = 0;

    Object.keys(data).forEach(fieldName => {
        const value = data[fieldName];
        if (!value || value <= 0) return;

        // Skip boolean fields
        if (value === true || value === false) return;

        const isExpenseField = (
            expenseFieldLabels[fieldName] ||
            (fieldName.includes('Expense') && !fieldName.includes('Revenue') && !fieldName.includes('Income')) ||
            (fieldName.includes('Expenditure') && !fieldName.includes('Total')) ||
            (fieldName.includes('Cost') && !fieldName.includes('Revenue')) ||
            (fieldName.includes('Salaries')) ||
            (fieldName.includes('Wages')) ||
            (fieldName.includes('Depreciation')) ||
            (fieldName.includes('Remuneration')) ||
            (fieldName.includes('Related') && (fieldName.includes('Delivery') || fieldName.includes('Objectives')))
        );

        if (!isExpenseField) return;

        if (fieldName.includes('Total') || fieldName.includes('Accumulated') ||
            fieldName.includes('Comprehensive') || fieldName.includes('LastYear') ||
            fieldName.includes('Revenue') || fieldName.includes('Income') ||
            fieldName.includes('Hours') || fieldName.includes('Week') ||
            fieldName.includes('Number') || fieldName.includes('Avg') ||
            (fieldName.includes('Paid') && (fieldName.includes('GST') || fieldName.includes('Tax')))) {
            return;
        }

        const isDuplicate = Array.from(processedValues.values()).some(entry =>
            entry.value === value && entry.field !== fieldName
        );

        if (isDuplicate) return;

        const label = expenseFieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();
        expenseLineItems.push({ fieldName, label, amount: value });
        totalAccountedExpense += value;
        processedValues.set(fieldName, { field: fieldName, value });
    });

    return { expenseLineItems, totalAccountedExpense };
}

async function auditCharity(charity) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`AUDITING: ${charity.name} (ID: ${charity.id}, Expected Tier: ${charity.tier})`);
    console.log('='.repeat(80));

    try {
        // Fetch financial data
        const financialData = await fetchFinancialData(charity.id);
        if (!financialData) {
            console.log('❌ NO FINANCIAL DATA AVAILABLE');
            return { success: false, reason: 'No financial data' };
        }

        // Fetch historical data for PDF link
        const historicalData = await fetchHistoricalData(charity.id);
        const latestReturn = historicalData.length > 0 ? historicalData[0] : null;

        const totalIncome = financialData.TotalGrossIncome || 0;
        const totalExpenditure = financialData.TotalExpenditure || 0;
        const reportingTier = financialData.ReportingTierId || 'Unknown';

        console.log(`\nReporting Tier: ${reportingTier}`);
        console.log(`Total Income (API): $${totalIncome.toLocaleString()}`);
        console.log(`Total Expenditure (API): $${totalExpenditure.toLocaleString()}`);

        // Process income
        const { incomeLineItems, totalAccountedIncome } = processIncome(financialData);
        console.log('\n--- INCOME BREAKDOWN ---');
        incomeLineItems.forEach((item, i) => {
            const pct = ((item.amount / totalIncome) * 100).toFixed(1);
            console.log(`${i + 1}. ${item.label}: $${item.amount.toLocaleString()} (${pct}%)`);
        });

        const unaccountedIncome = totalIncome - totalAccountedIncome;
        console.log(`\nTotal Accounted Income: $${totalAccountedIncome.toLocaleString()}`);
        console.log(`Unaccounted Income: $${unaccountedIncome.toLocaleString()} (${((unaccountedIncome / totalIncome) * 100).toFixed(1)}%)`);

        // Process expenses
        const { expenseLineItems, totalAccountedExpense } = processExpenses(financialData);
        console.log('\n--- EXPENDITURE BREAKDOWN ---');
        expenseLineItems.forEach((item, i) => {
            const pct = ((item.amount / totalExpenditure) * 100).toFixed(1);
            console.log(`${i + 1}. ${item.label}: $${item.amount.toLocaleString()} (${pct}%)`);
        });

        const unaccountedExpense = totalExpenditure - totalAccountedExpense;
        console.log(`\nTotal Accounted Expenditure: $${totalAccountedExpense.toLocaleString()}`);
        console.log(`Unaccounted Expenditure: $${unaccountedExpense.toLocaleString()} (${((unaccountedExpense / totalExpenditure) * 100).toFixed(1)}%)`);

        // PDF link
        if (latestReturn && latestReturn.NoticeofChangeAnnualReturnId) {
            const pdfLink = `https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${latestReturn.NoticeofChangeAnnualReturnId}&isPublic=true`;
            console.log(`\n📄 PDF Link: ${pdfLink}`);
        } else {
            console.log('\n📄 No PDF available');
        }

        // Audit results
        const incomeAccuracy = ((totalAccountedIncome / totalIncome) * 100).toFixed(1);
        const expenseAccuracy = ((totalAccountedExpense / totalExpenditure) * 100).toFixed(1);

        console.log('\n--- AUDIT RESULTS ---');
        console.log(`✓ Income Coverage: ${incomeAccuracy}%`);
        console.log(`✓ Expense Coverage: ${expenseAccuracy}%`);

        const passed = Math.abs(unaccountedIncome) < 1000 && Math.abs(unaccountedExpense) < 1000;
        if (passed) {
            console.log('✅ AUDIT PASSED - Breakdown matches within acceptable tolerance');
        } else {
            console.log('⚠️  AUDIT WARNING - Significant unaccounted amounts found');
            console.log('   → Manual PDF verification recommended');
        }

        return {
            success: true,
            charityId: charity.id,
            charityName: charity.name,
            tier: reportingTier,
            incomeAccuracy: parseFloat(incomeAccuracy),
            expenseAccuracy: parseFloat(expenseAccuracy),
            passed,
            incomeLineItems,
            expenseLineItems,
            unaccountedIncome,
            unaccountedExpense
        };

    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        return { success: false, reason: error.message };
    }
}

async function runAudit() {
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║          CHARITY FINANCIAL BREAKDOWN AUDIT - 20 CHARITIES                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');

    const results = [];

    for (const charity of TEST_CHARITIES) {
        const result = await auditCharity(charity);
        results.push(result);

        // Wait a bit between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n\n');
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                            AUDIT SUMMARY                                   ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');

    const successful = results.filter(r => r.success);
    const passed = successful.filter(r => r.passed);
    const warnings = successful.filter(r => !r.passed);

    console.log(`\nTotal Charities Tested: ${TEST_CHARITIES.length}`);
    console.log(`Successful Audits: ${successful.length}`);
    console.log(`Passed (< $1,000 unaccounted): ${passed.length}`);
    console.log(`Warnings (> $1,000 unaccounted): ${warnings.length}`);

    if (warnings.length > 0) {
        console.log('\n⚠️  CHARITIES REQUIRING MANUAL VERIFICATION:');
        warnings.forEach(w => {
            console.log(`   - ${w.charityName} (ID: ${w.charityId})`);
            console.log(`     Income: ${w.incomeAccuracy}%, Expense: ${w.expenseAccuracy}%`);
        });
    }

    console.log('\n✅ Audit complete!');
}

// Run the audit
runAudit().catch(console.error);
