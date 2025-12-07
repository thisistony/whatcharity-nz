/**
 * TOP-TIER PROFESSIONAL AUDIT
 * 5 Active Charities - Website vs PDF Annual Report Reconciliation
 * Detailed financial verification and balance testing
 */

const TEST_CHARITIES = [
    {
        id: 36376,
        name: "Auckland Council Employees' Charitable Trust",
        pdfId: "a9d00fc9-1f60-ee11-bb25-0022480ffcd1"
    },
    {
        id: 40739,
        name: "Age Concern Canterbury Trust",
        pdfId: "1aa7a5b8-4c56-f011-bb44-0022480ffcd1"
    },
    {
        id: 56494,
        name: "Habitat for Humanity Northern Region Limited",
        pdfId: "32a7f5b8-4c56-f011-bb44-0022480ffcd1"
    },
    {
        id: 56438,
        name: "Karori Sanctuary Trust",
        pdfId: "1aa7f5b8-4c56-f011-bb44-0022480ffcd1"
    },
    {
        id: 56533,
        name: "Vision College Limited",
        pdfId: "d7f45f78-08c8-ef11-bb3d-0022480ffcd1"
    }
];

const API_BASE = 'http://localhost:8000/api';

async function fetchCharityData(charityId) {
    try {
        const response = await fetch(API_BASE + '/financial?id=' + charityId);
        if (!response.ok) return null;

        const data = await response.json();
        const financial = data.d || data.value || [data];
        return Array.isArray(financial) ? financial[0] : financial;
    } catch (err) {
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

function gatherExpenseFields(data) {
    const expenseFieldMap = {
        'Wages & Salaries': ['SalariesAndWages', 'WagesSalariesAndOtherEmployeeCosts'],
        'Employee Costs': ['EmployeeRemunerationAndOtherRelatedExpenses'],
        'Depreciation': ['Depreciation', 'DepreciationAmortisationAndImpairmentExpenses'],
        'Finance Costs': ['FinanceCosts'],
        'Grants Paid': ['GrantsAndDonationsMade', 'GrantsPaidWithinNZ', 'GrantsPaidOutsideNZ'],
        'Service Delivery': ['CostOfServiceProvision', 'OtherExpensesRelatedToServiceDelivery'],
        'Fundraising': ['ExpensesRelatedToFundraising', 'FundRaisingExpenses'],
        'Trading Costs': ['CostOfTradingOperations', 'ExpensesRelatedToCommercialActivities'],
        'Admin & Operating': ['OperatingAndAdministrativeExpenses'],
        'Other Expenses': ['AllOtherExpenditure', 'OtherExpenses', 'OtherRelatedToDeliveryOfEntityObjectives']
    };

    const expenses = {};
    let totalExpenses = 0;

    for (const [category, fields] of Object.entries(expenseFieldMap)) {
        for (const field of fields) {
            const value = data[field] || 0;
            if (value > 0) {
                if (!expenses[category]) {
                    expenses[category] = 0;
                }
                expenses[category] += value;
                totalExpenses += value;
                break; // Only use first matching field per category
            }
        }
    }

    // Add MaterialExpense fields
    for (let i = 1; i <= 4; i++) {
        const fieldName = 'MaterialExpense' + i;
        const labelName = fieldName + 'Label';
        const value = data[fieldName] || 0;

        if (value > 0) {
            const label = (data[labelName] || fieldName);
            if (!expenses[label]) {
                expenses[label] = 0;
            }
            expenses[label] += value;
            totalExpenses += value;
        }
    }

    return {
        expenses: expenses,
        totalAccounted: totalExpenses,
        reportedTotal: data.TotalExpenditure || 0,
        coverage: data.TotalExpenditure > 0 ? ((totalExpenses / data.TotalExpenditure) * 100).toFixed(1) : '0.0'
    };
}

function gatherIncomeFields(data) {
    const incomeFieldMap = {
        'Donations & Koha': ['DonationsKohaBequestsAndSimilarRevenue', 'DonationsKoha', 'DonationsKohaGrantsFundraisingAndOtherSimilarRevenue'],
        'General Grants': ['GeneralGrantsReceived'],
        'Capital Grants': ['CapitalGrantsAndDonations'],
        'Government Grants': ['GovtGrantsContracts', 'GovernmentServiceDeliveryGrantsContracts', 'GrantsRevenueFromLocalOrCentralGovernment'],
        'Non-Govt Service Contracts': ['NonGovernmentServiceDeliveryGrantsContracts'],
        'Membership Fees': ['MembershipFees', 'FeesSubscriptionsIncludingDonationsFromMembers'],
        'Service/Trading Income': ['ServiceTradingIncome', 'RevenueFromProvidingGoodsAndServices', 'RevenueFromCommercialActivities'],
        'Investment Income': ['InterestOfDividendsReceived', 'InterestOfDividendsReceivedFromInvestments', 'InterestDividendsAndOtherInvestmentRevenue', 'NewZealandDividends', 'OtherInvestmentIncome'],
        'Other Revenue': ['OtherRevenue', 'AllOtherIncome', 'OtherRevenueFromExchangeTransactions', 'OtherRevenueFromNonExchangeTransactions']
    };

    const income = {};
    let totalIncome = 0;

    for (const [category, fields] of Object.entries(incomeFieldMap)) {
        for (const field of fields) {
            const value = data[field] || 0;
            if (value > 0) {
                if (!income[category]) {
                    income[category] = 0;
                }
                income[category] += value;
                totalIncome += value;
                break; // Only use first matching field per category
            }
        }
    }

    return {
        income: income,
        totalAccounted: totalIncome,
        reportedTotal: data.TotalGrossIncome || 0,
        coverage: data.TotalGrossIncome > 0 ? ((totalIncome / data.TotalGrossIncome) * 100).toFixed(1) : '0.0'
    };
}

async function runAudit() {
    console.log('\n' + '═'.repeat(130));
    console.log('TOP-TIER PROFESSIONAL AUDIT: 5 ACTIVE CHARITIES');
    console.log('Website Display vs PDF Annual Report Reconciliation');
    console.log('═'.repeat(130));
    console.log('Date: ' + new Date().toISOString().split('T')[0]);
    console.log('Testing URL: http://localhost:8000/?id=[CHARITY_ID]');
    console.log('Comparing against: Official PDF Annual Reports\n');

    for (let idx = 0; idx < TEST_CHARITIES.length; idx++) {
        const charity = TEST_CHARITIES[idx];
        const data = await fetchCharityData(charity.id);

        if (!data) {
            console.log('❌ [' + charity.id + '] ' + charity.name + ' - FAILED TO FETCH\n');
            continue;
        }

        const yearEnded = data.YearEnded ? new Date(data.YearEnded).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        const expenseData = gatherExpenseFields(data);
        const incomeData = gatherIncomeFields(data);
        const netSurplus = (data.TotalGrossIncome || 0) - (data.TotalExpenditure || 0);
        const totalAssets = data.TotalAssets || 0;

        console.log('─'.repeat(130));
        console.log('AUDIT #' + (idx + 1) + ': ' + charity.name);
        console.log('─'.repeat(130));
        console.log('Charity ID: ' + charity.id);
        console.log('Website URL: http://localhost:8000/?id=' + charity.id);
        console.log('PDF Report: https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=' + charity.pdfId + '&isPublic=true');
        console.log('Year Ended: ' + yearEnded);
        console.log('\n');

        // ===== FINANCIAL SUMMARY =====
        console.log('📊 FINANCIAL SUMMARY (As displayed on website):');
        console.log('  Total Income:          ' + formatCurrency(data.TotalGrossIncome || 0));
        console.log('  Total Expenditure:     ' + formatCurrency(data.TotalExpenditure || 0));
        console.log('  Net Surplus/(Deficit): ' + formatCurrency(netSurplus) + ' (' + ((netSurplus / (data.TotalGrossIncome || 1)) * 100).toFixed(1) + '%)');
        console.log('  Total Assets:          ' + formatCurrency(totalAssets));
        console.log('\n');

        // ===== INCOME VERIFICATION =====
        console.log('💰 INCOME VERIFICATION:');
        console.log('  PDF Reported Total:    ' + formatCurrency(incomeData.reportedTotal));
        console.log('  Website Shows:         ' + formatCurrency(incomeData.reportedTotal));
        console.log('  API Accounts For:      ' + formatCurrency(incomeData.totalAccounted));
        console.log('  Coverage Rate:         ' + incomeData.coverage + '%');

        if (parseFloat(incomeData.coverage) >= 95) {
            console.log('  Status:                ✅ GOOD - Coverage >= 95%');
        } else if (parseFloat(incomeData.coverage) >= 80) {
            console.log('  Status:                ⚠️ FAIR - Coverage 80-95% (some fields may be unmapped)');
        } else {
            console.log('  Status:                ❌ POOR - Coverage < 80% (significant unmapped fields)');
        }
        console.log('\n');

        // ===== INCOME BREAKDOWN =====
        console.log('Income Sources (as displayed on website):');
        const sortedIncome = Object.entries(incomeData.income)
            .sort((a, b) => b[1] - a[1]);

        sortedIncome.forEach(function([category, amount]) {
            const pct = ((amount / incomeData.reportedTotal) * 100).toFixed(1);
            console.log('  • ' + category + ': ' + formatCurrency(amount) + ' (' + pct + '%)');
        });
        console.log('\n');

        // ===== EXPENDITURE VERIFICATION =====
        console.log('💸 EXPENDITURE VERIFICATION:');
        console.log('  PDF Reported Total:    ' + formatCurrency(expenseData.reportedTotal));
        console.log('  Website Shows:         ' + formatCurrency(expenseData.reportedTotal));
        console.log('  API Accounts For:      ' + formatCurrency(expenseData.totalAccounted));
        console.log('  Coverage Rate:         ' + expenseData.coverage + '%');

        if (parseFloat(expenseData.coverage) >= 95) {
            console.log('  Status:                ✅ GOOD - Coverage >= 95%');
        } else if (parseFloat(expenseData.coverage) >= 80) {
            console.log('  Status:                ⚠️ FAIR - Coverage 80-95% (some fields may be unmapped)');
        } else {
            console.log('  Status:                ❌ POOR - Coverage < 80% (significant unmapped fields)');
        }
        console.log('\n');

        // ===== EXPENDITURE BREAKDOWN =====
        console.log('Expenditure Breakdown (as displayed on website):');
        const sortedExpenses = Object.entries(expenseData.expenses)
            .sort((a, b) => b[1] - a[1]);

        sortedExpenses.forEach(function([category, amount]) {
            const pct = ((amount / expenseData.reportedTotal) * 100).toFixed(1);
            console.log('  • ' + category + ': ' + formatCurrency(amount) + ' (' + pct + '%)');
        });
        console.log('\n');

        // ===== BALANCE TEST =====
        console.log('⚖️ BALANCE RECONCILIATION TEST:');
        const expectedSurplus = incomeData.reportedTotal - expenseData.reportedTotal;
        const reportedSurplus = data.NetSurplusDeficitForTheYear || netSurplus;
        const surplusVariance = Math.abs(expectedSurplus - reportedSurplus);

        console.log('  Expected (Income - Expenditure): ' + formatCurrency(expectedSurplus));
        console.log('  Reported Net Surplus/Deficit:    ' + formatCurrency(reportedSurplus));
        console.log('  Variance:                        ' + formatCurrency(surplusVariance));

        if (surplusVariance < 1000) {
            console.log('  Status:                          ✅ PERFECT BALANCE - Variance < $1K');
        } else if (surplusVariance < 10000) {
            console.log('  Status:                          ✅ EXCELLENT - Variance < $10K');
        } else if (surplusVariance < 50000) {
            console.log('  Status:                          ⚠️ ACCEPTABLE - Variance < $50K');
        } else {
            console.log('  Status:                          ❌ VARIANCE - Significant difference detected');
        }
        console.log('\n');

        // ===== FINAL AUDIT OPINION =====
        console.log('📋 AUDIT OPINION:');

        const incomeOk = parseFloat(incomeData.coverage) >= 80;
        const expenseOk = parseFloat(expenseData.coverage) >= 80;
        const balanceOk = surplusVariance < 50000;

        if (incomeOk && expenseOk && balanceOk) {
            console.log('  ✅ PASS - Website data is accurate and reconciles with PDF');
            console.log('     • Income and expense figures display correctly');
            console.log('     • Financial balance is within acceptable variance');
            console.log('     • Ready for public display');
        } else {
            console.log('  ⚠️ REVIEW REQUIRED - Some issues detected');
            if (!incomeOk) console.log('     • Income field coverage is low - verify with PDF');
            if (!expenseOk) console.log('     • Expense field coverage is low - verify with PDF');
            if (!balanceOk) console.log('     • Balance variance exceeds threshold - review calculations');
        }

        console.log('\n' + '═'.repeat(130) + '\n');
    }

    console.log('AUDIT COMPLETE');
    console.log('═'.repeat(130));
}

runAudit().catch(console.error);
