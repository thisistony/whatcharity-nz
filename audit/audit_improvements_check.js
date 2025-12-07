/**
 * Quick Audit: Verify improvements from field mapping enhancements
 */

const TEST_CHARITIES = [
    { id: 40739, name: "Age Concern Canterbury Trust", previousIncomeCoverage: 42.3 },
    { id: 56494, name: "Habitat for Humanity Northern Region Limited", previousIncomeCoverage: 62.7 },
    { id: 56438, name: "Karori Sanctuary Trust", previousIncomeCoverage: 70.2 },
    { id: 56533, name: "Vision College Limited", previousIncomeCoverage: 78.6, previousExpenseCoverage: 55.1 }
];

const API_BASE = 'http://localhost:8000/api';

function gatherIncomeFields(data) {
    const incomeFields = {};
    let totalIncome = 0;

    const incomeFieldPatterns = [
        'Income', 'Revenue', 'Grant', 'Donation', 'Koha', 'Subscription',
        'Fees', 'Trading', 'Dividend', 'Interest', 'Subsidy', 'Tuition',
        'Bequest', 'Lease', 'Accommodation', 'Meals', 'Shelter', 'Education',
        'Health', 'Childcare', 'Training', 'Counselling', 'Aged', 'Early'
    ];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && value > 0 && key !== 'TotalGrossIncome') {
            const matches = incomeFieldPatterns.some(pattern =>
                key.includes(pattern) &&
                !key.includes('Total') &&
                !key.includes('Expense') &&
                !key.includes('LastYear')
            );
            if (matches) {
                incomeFields[key] = value;
                totalIncome += value;
            }
        }
    }

    return {
        fields: incomeFields,
        totalAccounted: totalIncome,
        reportedTotal: data.TotalGrossIncome || 0,
        coverage: data.TotalGrossIncome > 0 ? ((totalIncome / data.TotalGrossIncome) * 100).toFixed(1) : '0.0'
    };
}

function gatherExpenseFields(data) {
    const expenseFields = {};
    let totalExpense = 0;

    const expenseFieldPatterns = [
        'Expense', 'Cost', 'Salaries', 'Wages', 'Depreciation', 'Grant',
        'Supplies', 'Facilities', 'Maintenance', 'Teaching', 'Support',
        'Educational', 'Curriculum', 'Student', 'Training', 'Community'
    ];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'number' && value > 0 && key !== 'TotalExpenditure') {
            const matches = expenseFieldPatterns.some(pattern =>
                key.includes(pattern) &&
                !key.includes('Total') &&
                !key.includes('LastYear') &&
                !key.includes('Income') &&
                !key.includes('Revenue')
            );
            if (matches) {
                expenseFields[key] = value;
                totalExpense += value;
            }
        }
    }

    return {
        fields: expenseFields,
        totalAccounted: totalExpense,
        reportedTotal: data.TotalExpenditure || 0,
        coverage: data.TotalExpenditure > 0 ? ((totalExpense / data.TotalExpenditure) * 100).toFixed(1) : '0.0'
    };
}

async function runAudit() {
    console.log('\n' + '='.repeat(110));
    console.log('IMPROVEMENT AUDIT: Verifying Field Mapping Enhancements');
    console.log('='.repeat(110) + '\n');

    for (const charity of TEST_CHARITIES) {
        try {
            const response = await fetch(API_BASE + '/financial?id=' + charity.id);
            if (!response.ok) {
                console.log('❌ [' + charity.id + '] ' + charity.name + ' - FETCH FAILED\n');
                continue;
            }

            const data = await response.json();
            const financial = data.d || data.value || [data];
            const current = Array.isArray(financial) ? financial[0] : financial;

            if (!current) {
                console.log('❌ [' + charity.id + '] ' + charity.name + ' - NO DATA\n');
                continue;
            }

            const income = gatherIncomeFields(current);
            const expense = gatherExpenseFields(current);

            console.log('BEFORE → AFTER COMPARISON');
            console.log('─'.repeat(110));
            console.log('[' + charity.id + '] ' + charity.name);
            console.log('\nINCOME COVERAGE:');
            console.log('  Previous: ' + charity.previousIncomeCoverage + '%');
            console.log('  Current:  ' + income.coverage + '%');
            console.log('  Change:   ' + (parseFloat(income.coverage) - charity.previousIncomeCoverage).toFixed(1) + '%');

            if (charity.previousExpenseCoverage) {
                console.log('\nEXPENSE COVERAGE:');
                console.log('  Previous: ' + charity.previousExpenseCoverage + '%');
                console.log('  Current:  ' + expense.coverage + '%');
                console.log('  Change:   ' + (parseFloat(expense.coverage) - charity.previousExpenseCoverage).toFixed(1) + '%');
            }

            const improved = parseFloat(income.coverage) > charity.previousIncomeCoverage;
            const status = improved ? '✅ IMPROVED' : '⚠️ UNCHANGED';
            console.log('\nStatus: ' + status);
            console.log('═'.repeat(110) + '\n');

        } catch (err) {
            console.log('❌ Error testing [' + charity.id + ']: ' + err.message + '\n');
        }
    }
}

runAudit().catch(console.error);
