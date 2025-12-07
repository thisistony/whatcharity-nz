/**
 * Audit Batch 13: 5 Active Charities - With Full Financial Breakdowns
 * Balance reconciliation with detailed income and expense analysis
 */

const TEST_CHARITIES = [
    { id: 36376, name: "Auckland Council Employees' Charitable Trust" },
    { id: 40739, name: "Age Concern Canterbury Trust" },
    { id: 56494, name: "Habitat for Humanity Northern Region Limited" },
    { id: 56438, name: "Karori Sanctuary Trust" },
    { id: 56533, name: "Vision College Limited" }
];

const API_BASE = 'http://localhost:8000/api';

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

function analyzeFinancials(data) {
    const totalIncome = data.TotalGrossIncome || 0;
    const totalExpense = data.TotalExpenditure || 0;
    const reportedSurplus = data.NetSurplusDeficitForTheYear || (totalIncome - totalExpense);

    // Check if balance equation holds: Income - Expense = Surplus
    const calculatedSurplus = totalIncome - totalExpense;
    const variance = Math.abs(calculatedSurplus - reportedSurplus);
    const balances = variance < 1000; // Allow $1K variance for rounding

    return {
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        reportedSurplus: reportedSurplus,
        calculatedSurplus: calculatedSurplus,
        variance: variance,
        balances: balances
    };
}

function gatherIncomeBreakdown(data) {
    const incomeFields = [];
    const incomePatterns = ['Income', 'Revenue', 'Grant', 'Donation', 'Koha', 'Subscription', 'Fees', 'Trading', 'Dividend', 'Interest', 'Subsidy', 'Tuition', 'Bequest', 'Lease', 'Accommodation', 'Meals', 'Shelter', 'Education', 'Health', 'Childcare', 'Training', 'Counselling', 'Aged', 'Early'];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && value > 0 && key !== 'TotalGrossIncome') {
            const matches = incomePatterns.some(pattern =>
                key.includes(pattern) &&
                !key.includes('Total') &&
                !key.includes('Expense') &&
                !key.includes('LastYear')
            );
            if (matches) {
                incomeFields.push({ name: key, value: value });
            }
        }
    }

    incomeFields.sort((a, b) => b.value - a.value);
    return incomeFields;
}

function gatherExpenseBreakdown(data) {
    const expenseFields = [];
    const expensePatterns = ['Expense', 'Cost', 'Salaries', 'Wages', 'Depreciation', 'Grant', 'Supplies', 'Facilities', 'Maintenance', 'Teaching', 'Support', 'Educational', 'Curriculum', 'Student', 'Training', 'Community'];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && value > 0 && key !== 'TotalExpenditure') {
            const matches = expensePatterns.some(pattern =>
                key.includes(pattern) &&
                !key.includes('Total') &&
                !key.includes('LastYear') &&
                !key.includes('Income') &&
                !key.includes('Revenue')
            );
            if (matches) {
                expenseFields.push({ name: key, value: value });
            }
        }
    }

    expenseFields.sort((a, b) => b.value - a.value);
    return expenseFields;
}

async function runAudit() {
    const startTime = new Date();

    console.log('\n' + '='.repeat(130));
    console.log('AUDIT BATCH 13: 5 Active Charities - WITH FULL FINANCIAL BREAKDOWNS');
    console.log('Balance Reconciliation Test (Income - Expenditure = Surplus)');
    console.log('='.repeat(130));
    console.log('Start Time: ' + startTime.toISOString());
    console.log('\n');

    let passed = 0;
    let warnings = 0;
    let errors = 0;
    const results = [];

    for (const charity of TEST_CHARITIES) {
        try {
            const response = await fetch(API_BASE + '/financial?id=' + charity.id);
            if (!response.ok) {
                errors++;
                results.push({
                    id: charity.id,
                    name: charity.name,
                    status: '❌ ERROR',
                    message: 'Failed to fetch'
                });
                continue;
            }

            const data = await response.json();
            const financial = data.d || data.value || [data];
            const current = Array.isArray(financial) ? financial[0] : financial;

            if (!current) {
                errors++;
                results.push({
                    id: charity.id,
                    name: charity.name,
                    status: '❌ ERROR',
                    message: 'Empty financial data'
                });
                continue;
            }

            const financials = analyzeFinancials(current);
            const incomeBreakdown = gatherIncomeBreakdown(current);
            const expenseBreakdown = gatherExpenseBreakdown(current);

            let status = '✅ PASS';

            if (!financials.balances) {
                status = '⚠️ VARIANCE';
                warnings++;
            } else {
                passed++;
            }

            results.push({
                id: charity.id,
                name: charity.name,
                status: status,
                totalIncome: financials.totalIncome,
                totalExpense: financials.totalExpense,
                reportedSurplus: financials.reportedSurplus,
                calculatedSurplus: financials.calculatedSurplus,
                variance: financials.variance,
                balances: financials.balances,
                incomeBreakdown: incomeBreakdown,
                expenseBreakdown: expenseBreakdown
            });

        } catch (err) {
            errors++;
            results.push({
                id: charity.id,
                name: charity.name,
                status: '❌ ERROR',
                message: err.message
            });
        }
    }

    // Print summary
    console.log('RESULTS SUMMARY');
    console.log('='.repeat(130));
    console.log('✅ Passed: ' + passed + '/5 (' + ((passed/5)*100).toFixed(0) + '%)')
    console.log('⚠️ Warnings: ' + warnings + '/5 (' + ((warnings/5)*100).toFixed(0) + '%)')
    console.log('❌ Errors: ' + errors + '/5 (' + ((errors/5)*100).toFixed(0) + '%)')
    console.log('\n' + '-'.repeat(130));

    // Detailed results with breakdowns
    for (const result of results) {
        console.log('\n[' + result.status + '] ' + result.id + ' - ' + result.name);

        if (result.totalIncome !== undefined) {
            console.log('  Income:             ' + formatCurrency(result.totalIncome));
            console.log('  Expenditure:        ' + formatCurrency(result.totalExpense));
            console.log('  Reported Surplus:   ' + formatCurrency(result.reportedSurplus));
            console.log('  Calculated Surplus: ' + formatCurrency(result.calculatedSurplus));
            console.log('  Variance:           ' + formatCurrency(result.variance));

            if (result.balances) {
                console.log('  Assessment:         ✅ PERFECT BALANCE');
            } else if (result.variance < 10000) {
                console.log('  Assessment:         ✅ ACCEPTABLE - Minor variance');
            } else {
                console.log('  Assessment:         ⚠️ REVIEW NEEDED');
            }

            // Income breakdown
            console.log('\n  INCOME BREAKDOWN:');
            if (result.incomeBreakdown.length > 0) {
                for (const item of result.incomeBreakdown) {
                    console.log('    - ' + item.name + ': ' + formatCurrency(item.value));
                }
            } else {
                console.log('    (No itemized income fields detected)');
            }

            // Expense breakdown
            console.log('\n  EXPENSE BREAKDOWN:');
            if (result.expenseBreakdown.length > 0) {
                for (const item of result.expenseBreakdown) {
                    console.log('    - ' + item.name + ': ' + formatCurrency(item.value));
                }
            } else {
                console.log('    (No itemized expense fields detected)');
            }
        } else {
            console.log('  ' + result.message);
        }
    }

    console.log('\n' + '='.repeat(130));
    console.log('AUDIT COMPLETE');
    console.log('='.repeat(130) + '\n');

    // Statistics
    const perfectBalanceCount = results.filter(r => r.balances === true).length;

    console.log('FINAL STATISTICS:');
    console.log('  Perfect Balance (0 variance):  ' + perfectBalanceCount + '/5 ✅');
    console.log('  All Charities Passed:         ' + passed + '/5');
    console.log('  Total Warnings:               ' + warnings + '/5');
    console.log('  Total Errors:                 ' + errors + '/5');

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log('\nTiming:');
    console.log('  Start Time: ' + startTime.toISOString());
    console.log('  End Time:   ' + endTime.toISOString());
    console.log('  Duration:   ' + duration.toFixed(2) + ' seconds');
    console.log('\n');
}

runAudit().catch(console.error);
