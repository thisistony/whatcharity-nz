/**
 * Audit Batch 8: 10 Fresh Random Charities with Real Names
 * Verifies the duplicate expenditure fix
 */

const TEST_CHARITIES = [
    { id: 72154, name: "Kiwicare Trust" },
    { id: 71829, name: "Habitat Community Centre Limited" },
    { id: 70945, name: "South Island Charitable Foundation" },
    { id: 69756, name: "Rural Health Alliance Trust" },
    { id: 68432, name: "Community Education Services Limited" },
    { id: 67821, name: "Waikato Environmental Trust" },
    { id: 66309, name: "Arts Access Limited" },
    { id: 65187, name: "Wellness For All Foundation" },
    { id: 64563, name: "Pacific Islander Health Trust" },
    { id: 63941, name: "Green Future Initiative" }
];

const API_BASE = 'http://localhost:8000/api';

async function runAudit() {
    console.log('🔍 AUDIT BATCH 8: 10 Fresh Random Charities');
    console.log('Date: ' + new Date().toISOString().split('T')[0]);
    console.log('Testing: Duplicate expenditure item fix');
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
                    message: 'Failed to fetch: ' + response.status
                });
                continue;
            }

            const data = await response.json();
            const financial = data.d || data.value || data;

            if (!financial || !Array.isArray(financial)) {
                errors++;
                results.push({
                    id: charity.id,
                    name: charity.name,
                    status: '❌ ERROR',
                    message: 'No financial data'
                });
                continue;
            }

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

            // Collect all expense fields
            const expenseFields = {};
            for (const [key, value] of Object.entries(current)) {
                if ((key.match(/^MaterialExpense\d+$/) ||
                     key === 'AllOtherExpenditure' ||
                     key === 'SalariesAndWages' ||
                     key === 'Depreciation' ||
                     key === 'EmployeeRemunerationAndOtherRelatedExpenses') &&
                    typeof value === 'number' && value > 0) {
                    expenseFields[key] = value;
                }
            }

            // Find duplicate values
            const valueMap = {};
            const duplicates = [];

            for (const [field, value] of Object.entries(expenseFields)) {
                if (valueMap[value]) {
                    if (!duplicates.find(d => d.value === value)) {
                        duplicates.push({
                            value: value,
                            fields: [valueMap[value], field]
                        });
                    }
                }
                valueMap[value] = field;
            }

            const totalExpenditure = current.TotalExpenditure || 0;
            const accountedExpense = Object.values(expenseFields).reduce((a, b) => a + b, 0);
            const coverage = totalExpenditure > 0 ? (accountedExpense / totalExpenditure) * 100 : 100;

            let status = '✅ PASS';
            let hasWarning = false;

            if (duplicates.length > 0) {
                status = '❌ DUPLICATES';
                hasWarning = true;
                errors++;
            } else if (coverage < 90) {
                status = '⚠️ LOW COVERAGE';
                hasWarning = true;
                warnings++;
            } else {
                passed++;
            }

            results.push({
                id: charity.id,
                name: charity.name,
                status: status,
                totalExpenditure: totalExpenditure,
                coverage: coverage.toFixed(1) + '%',
                duplicates: duplicates.length,
                duplicateDetails: duplicates.length > 0 ? duplicates : null
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

    // Print results
    console.log('='.repeat(100));
    console.log('RESULTS SUMMARY');
    console.log('='.repeat(100));
    console.log('✅ Passed: ' + passed + '/10');
    console.log('⚠️ Warnings: ' + warnings + '/10');
    console.log('❌ Errors: ' + errors + '/10');
    console.log('\n' + '-'.repeat(100));

    for (const result of results) {
        console.log('\n[' + result.status + '] ' + result.id + ' - ' + result.name);
        if (result.totalExpenditure !== undefined) {
            console.log('  Expenditure: $' + result.totalExpenditure.toLocaleString());
            console.log('  Coverage: ' + result.coverage);
            if (result.duplicates > 0) {
                console.log('  DUPLICATES FOUND: ' + result.duplicates);
                result.duplicateDetails.forEach(function(dup) {
                    console.log('    - $' + dup.value.toLocaleString() + ' found in: ' + dup.fields.join(', '));
                });
            } else {
                console.log('  ✓ No duplicate expenditure items');
            }
        } else {
            console.log('  ' + result.message);
        }
    }

    console.log('\n' + '='.repeat(100));
    console.log('FINAL RESULT: ' + passed + ' PASSED, ' + warnings + ' WARNINGS, ' + errors + ' ERRORS');
    console.log('='.repeat(100));
}

runAudit().catch(console.error);
