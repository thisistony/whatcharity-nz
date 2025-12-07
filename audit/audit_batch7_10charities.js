/**
 * Audit Batch 7: 10 Fresh Charities
 * Tests the duplicate expenditure fix
 */

const TEST_CHARITIES = [
    { id: 71542, name: "Charity A" },
    { id: 69283, name: "Charity B" },
    { id: 58394, name: "Charity C" },
    { id: 54729, name: "Charity D" },
    { id: 63018, name: "Charity E" },
    { id: 59847, name: "Charity F" },
    { id: 61956, name: "Charity G" },
    { id: 55483, name: "Charity H" },
    { id: 60721, name: "Charity I" },
    { id: 57634, name: "Charity J" }
];

const API_BASE = 'http://localhost:8000/api';

async function runAudit() {
    console.log('🔍 AUDIT BATCH 7: Testing 10 Fresh Charities');
    console.log('Date:', new Date().toISOString().split('T')[0]);
    console.log('Fix: Duplicate expenditure item detection\n');

    let passed = 0;
    let warnings = 0;
    let errors = 0;
    const results = [];

    for (const charity of TEST_CHARITIES) {
        try {
            const response = await fetch(`${API_BASE}/financial?id=${charity.id}`);
            if (!response.ok) {
                errors++;
                results.push({
                    id: charity.id,
                    name: charity.name,
                    status: '❌ ERROR',
                    message: `Failed to fetch: ${response.status}`
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

            // Check for duplicate expenditure values
            const totalExpenditure = current.TotalExpenditure || 0;

            // Collect all expense values
            const expenseValues = {
                'SalariesAndWages': current.SalariesAndWages || 0,
                'EmployeeRemunerationAndOtherRelatedExpenses': current.EmployeeRemunerationAndOtherRelatedExpenses || 0,
                'Depreciation': current.Depreciation || 0,
                'DepreciationAmortisationAndImpairmentExpenses': current.DepreciationAmortisationAndImpairmentExpenses || 0,
                'FinanceCosts': current.FinanceCosts || 0,
                'GrantsAndDonationsMade': current.GrantsAndDonationsMade || 0,
                'GrantsPaidWithinNZ': current.GrantsPaidWithinNZ || 0,
                'GrantsPaidOutsideNZ': current.GrantsPaidOutsideNZ || 0,
                'AllOtherExpenditure': current.AllOtherExpenditure || 0,
                'OtherExpenses': current.OtherExpenses || 0
            };

            // Find duplicate values
            const values = Object.values(expenseValues).filter(v => v > 0);
            const valueMap = {};
            const duplicates = [];

            for (const [field, value] of Object.entries(expenseValues)) {
                if (value > 0) {
                    if (valueMap[value]) {
                        if (!duplicates.includes(value)) {
                            duplicates.push(value);
                        }
                    }
                    valueMap[value] = field;
                }
            }

            // Check coverage
            const accountedExpense = values.reduce((a, b) => a + b, 0);
            const coverage = totalExpenditure > 0 ? (accountedExpense / totalExpenditure) * 100 : 100;

            let status = '✅ PASS';
            let hasWarning = false;

            if (duplicates.length > 0) {
                status = '⚠️ DUPLICATE FOUND';
                hasWarning = true;
                warnings++;
            } else if (coverage < 95) {
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
                details: duplicates.length > 0 ? `Found ${duplicates.length} duplicate value(s)` : 'No duplicates'
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
    console.log('\n' + '='.repeat(100));
    console.log('RESULTS SUMMARY');
    console.log('='.repeat(100));
    console.log(`✅ Passed: ${passed}/10`);
    console.log(`⚠️ Warnings: ${warnings}/10`);
    console.log(`❌ Errors: ${errors}/10`);
    console.log('\n' + '-'.repeat(100));

    for (const result of results) {
        console.log(`\n[${result.status}] ${result.id} - ${result.name}`);
        if (result.totalExpenditure !== undefined) {
            console.log(`  Expenditure: $${result.totalExpenditure.toLocaleString()}`);
            console.log(`  Coverage: ${result.coverage}`);
            console.log(`  ${result.details}`);
        } else {
            console.log(`  ${result.message}`);
        }
    }

    console.log('\n' + '='.repeat(100));
    console.log(`FINAL RESULT: ${passed} PASSED, ${warnings} WARNINGS, ${errors} ERRORS`);
    console.log('='.repeat(100));
}

runAudit().catch(console.error);
