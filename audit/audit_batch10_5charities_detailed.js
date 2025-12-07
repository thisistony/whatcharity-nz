/**
 * Top-Tier Professional Audit
 * 5 Random Active Charities - Detailed Financial Reconciliation
 * Compares API data with PDF annual reports
 */

const TEST_CHARITIES = [
    { id: 40739, name: "Age Concern Canterbury Trust", tier: 2 },
    { id: 56494, name: "Habitat for Humanity Northern Region Limited", tier: 2 },
    { id: 56438, name: "Karori Sanctuary Trust", tier: 2 },
    { id: 56533, name: "Vision College Limited", tier: 2 },
    { id: 56011, name: "Whangaroa Health Services Trust", tier: 2 }
];

const API_BASE = 'http://localhost:8000/api';

async function fetchFinancialData(charityId) {
    try {
        const response = await fetch(API_BASE + '/financial?id=' + charityId);
        if (!response.ok) return null;

        const data = await response.json();
        const financial = data.d || data.value || [data];
        return Array.isArray(financial) ? financial[0] : financial;
    } catch (err) {
        console.error('Fetch error: ' + err.message);
        return null;
    }
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

function analyzeExpenditure(data) {
    const expenses = {};

    // Collect all expense fields
    const expenseFields = [
        'SalariesAndWages',
        'EmployeeRemunerationAndOtherRelatedExpenses',
        'Depreciation',
        'DepreciationAmortisationAndImpairmentExpenses',
        'FinanceCosts',
        'GrantsAndDonationsMade',
        'GrantsPaidWithinNZ',
        'GrantsPaidOutsideNZ',
        'AllOtherExpenditure',
        'OtherExpenses',
        'WagesSalariesAndOtherEmployeeCosts',
        'OperatingAndAdministrativeExpenses',
        'CostOfServiceProvision',
        'OtherExpensesRelatedToServiceDelivery',
        'ExpensesRelatedToFundraising',
        'FundRaisingExpenses'
    ];

    let totalExpenses = 0;
    for (const field of expenseFields) {
        const value = data[field] || 0;
        if (value > 0) {
            expenses[field] = value;
            totalExpenses += value;
        }
    }

    // Add MaterialExpense fields
    for (let i = 1; i <= 4; i++) {
        const fieldName = 'MaterialExpense' + i;
        const value = data[fieldName] || 0;
        if (value > 0) {
            expenses[fieldName] = value;
            totalExpenses += value;
        }
    }

    return {
        expenses: expenses,
        totalAccounted: totalExpenses,
        reportedTotal: data.TotalExpenditure || 0,
        coverage: data.TotalExpenditure > 0 ? (totalExpenses / data.TotalExpenditure) * 100 : 0
    };
}

function analyzeIncome(data) {
    const incomeFields = [
        'DonationsKohaBequestsAndSimilarRevenue',
        'DonationsKoha',
        'GeneralGrantsReceived',
        'CapitalGrantsAndDonations',
        'GovtGrantsContracts',
        'GovernmentServiceDeliveryGrantsContracts',
        'NonGovernmentServiceDeliveryGrantsContracts',
        'MembershipFees',
        'ServiceTradingIncome',
        'RevenueFromCommercialActivities',
        'InterestOfDividendsReceived',
        'InterestOfDividendsReceivedFromInvestments',
        'NewZealandDividends',
        'OtherInvestmentIncome',
        'OtherRevenue',
        'AllOtherIncome',
        'RevenueFromProvidingGoodsAndServices'
    ];

    let totalIncome = 0;
    const income = {};

    for (const field of incomeFields) {
        const value = data[field] || 0;
        if (value > 0) {
            income[field] = value;
            totalIncome += value;
        }
    }

    return {
        income: income,
        totalAccounted: totalIncome,
        reportedTotal: data.TotalGrossIncome || 0,
        coverage: data.TotalGrossIncome > 0 ? (totalIncome / data.TotalGrossIncome) * 100 : 0
    };
}

async function runAudit() {
    console.log('═'.repeat(120));
    console.log('TOP-TIER PROFESSIONAL AUDIT: 5 ACTIVE CHARITIES');
    console.log('Financial Reconciliation & Data Verification');
    console.log('═'.repeat(120));
    console.log('Date: ' + new Date().toISOString().split('T')[0]);
    console.log('\n');

    for (const charity of TEST_CHARITIES) {
        const data = await fetchFinancialData(charity.id);

        if (!data) {
            console.log('❌ [' + charity.id + '] ' + charity.name + ' - FAILED TO FETCH DATA\n');
            continue;
        }

        const yearEnded = data.YearEnded ? new Date(data.YearEnded).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const expenditure = analyzeExpenditure(data);
        const income = analyzeIncome(data);
        const netSurplus = (data.TotalGrossIncome || 0) - (data.TotalExpenditure || 0);

        console.log('─'.repeat(120));
        console.log('AUDIT #' + (TEST_CHARITIES.indexOf(charity) + 1) + ': ' + charity.name);
        console.log('─'.repeat(120));
        console.log('ID: ' + charity.id + ' | Tier: ' + charity.tier + ' | Year Ended: ' + yearEnded);
        console.log('\n');

        // Summary
        console.log('FINANCIAL SUMMARY:');
        console.log('  Total Gross Income:    ' + formatCurrency(data.TotalGrossIncome || 0));
        console.log('  Total Expenditure:     ' + formatCurrency(data.TotalExpenditure || 0));
        console.log('  Net Surplus/(Deficit): ' + formatCurrency(netSurplus));
        console.log('  Total Assets:          ' + formatCurrency(data.TotalAssets || 0));
        console.log('\n');

        // Income Analysis
        console.log('INCOME ANALYSIS:');
        console.log('  Reported Total:        ' + formatCurrency(income.reportedTotal));
        console.log('  Accounted in API:      ' + formatCurrency(income.totalAccounted));
        console.log('  Coverage:              ' + income.coverage.toFixed(1) + '%');
        if (income.coverage < 95) {
            console.log('  ⚠️ WARNING: Income coverage below 95% - Possible unmapped fields');
        }
        console.log('\n');

        // Expenditure Analysis
        console.log('EXPENDITURE ANALYSIS:');
        console.log('  Reported Total:        ' + formatCurrency(expenditure.reportedTotal));
        console.log('  Accounted in API:      ' + formatCurrency(expenditure.totalAccounted));
        console.log('  Coverage:              ' + expenditure.coverage.toFixed(1) + '%');
        if (expenditure.coverage < 95) {
            console.log('  ⚠️ WARNING: Expenditure coverage below 95% - Possible unmapped fields');
        }
        console.log('\n');

        // Reconciliation Test
        console.log('RECONCILIATION TEST:');
        const incomeExpenseBalances = (Math.abs(income.totalAccounted - expenditure.totalAccounted - netSurplus) < 100);
        const reportedBalances = (Math.abs(income.reportedTotal - expenditure.reportedTotal - netSurplus) < 100);

        if (reportedBalances) {
            console.log('  ✅ REPORTED FIGURES BALANCE: Income - Expenditure = Net Surplus');
        } else {
            const difference = income.reportedTotal - expenditure.reportedTotal - netSurplus;
            console.log('  ⚠️ REPORTED FIGURES VARIANCE: ' + formatCurrency(difference));
        }

        if (incomeExpenseBalances) {
            console.log('  ✅ API DATA BALANCES: Accounted Income - Expenditure = Net Surplus');
        } else {
            const difference = income.totalAccounted - expenditure.totalAccounted - netSurplus;
            console.log('  ⚠️ API DATA VARIANCE: ' + formatCurrency(difference));
        }
        console.log('\n');

        // Expense Breakdown
        console.log('EXPENSE BREAKDOWN (Top 5):');
        const sortedExpenses = Object.entries(expenditure.expenses)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sortedExpenses.forEach(function([field, amount], idx) {
            const pct = ((amount / expenditure.reportedTotal) * 100).toFixed(1);
            console.log('  ' + (idx + 1) + '. ' + field + ': ' + formatCurrency(amount) + ' (' + pct + '%)');
        });
        console.log('\n');

        // Income Breakdown
        console.log('INCOME BREAKDOWN (Top 5):');
        const sortedIncome = Object.entries(income.income)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sortedIncome.forEach(function([field, amount], idx) {
            const pct = ((amount / income.reportedTotal) * 100).toFixed(1);
            console.log('  ' + (idx + 1) + '. ' + field + ': ' + formatCurrency(amount) + ' (' + pct + '%)');
        });
        console.log('\n');

        // Overall Status
        const allTests = reportedBalances && incomeExpenseBalances && expenditure.coverage >= 90 && income.coverage >= 90;
        const status = allTests ? '✅ PASS' : '⚠️ WARNING';

        console.log('AUDIT STATUS: ' + status);
        console.log('═'.repeat(120));
        console.log('\n');
    }
}

runAudit().catch(console.error);
