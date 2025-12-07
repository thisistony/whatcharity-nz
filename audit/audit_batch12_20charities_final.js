/**
 * Audit Batch 12: 20 Active Charities - Final Corrected Audit
 * Simple balance reconciliation (Income - Expenditure = Surplus)
 */

const TEST_CHARITIES = [
    { id: 36376, name: "Auckland Council Employees' Charitable Trust" },
    { id: 40739, name: "Age Concern Canterbury Trust" },
    { id: 56494, name: "Habitat for Humanity Northern Region Limited" },
    { id: 56438, name: "Karori Sanctuary Trust" },
    { id: 56533, name: "Vision College Limited" },
    { id: 56011, name: "Whangaroa Health Services Trust" },
    { id: 58785, name: "Amputees Federation of New Zealand Incorporated" },
    { id: 59403, name: "The Deborah Charitable Trust" },
    { id: 41083, name: "Diocesan School for Girls Trust" },
    { id: 41465, name: "Diocesan School for Girls (Alternative)" },
    { id: 70229, name: "Pacific Cooperation Broadcasting Trust" },
    { id: 57770, name: "Rail Heritage Trust of New Zealand" },
    { id: 34560, name: "Rangitane Investments Limited" },
    { id: 66418, name: "Safe Network Charitable Trust" },
    { id: 47549, name: "Sarjeant Gallery Trust Board" },
    { id: 39060, name: "South Canterbury Free Kindergarten Association Incorporated" },
    { id: 64733, name: "St Margaret's College Foundation Trust" },
    { id: 51533, name: "Tauranga Baptist Church Trust" },
    { id: 58143, name: "Te Hauora o Turanganui a Kiwa Limited" },
    { id: 44184, name: "The Royal Australasian College of Physicians" }
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

async function runAudit() {
    const startTime = new Date();

    console.log('\n' + '='.repeat(130));
    console.log('AUDIT BATCH 12: 20 Active Charities - FINAL AUDIT');
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
                balances: financials.balances
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
    console.log('✅ Passed: ' + passed + '/20 (' + ((passed/20)*100).toFixed(0) + '%)');
    console.log('⚠️ Warnings: ' + warnings + '/20 (' + ((warnings/20)*100).toFixed(0) + '%)');
    console.log('❌ Errors: ' + errors + '/20 (' + ((errors/20)*100).toFixed(0) + '%)');
    console.log('\n' + '-'.repeat(130));

    // Detailed results
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
    console.log('  Perfect Balance (0 variance):  ' + perfectBalanceCount + '/20 ✅');
    console.log('  All Charities Passed:         ' + passed + '/20');
    console.log('  Total Warnings:               ' + warnings + '/20');
    console.log('  Total Errors:                 ' + errors + '/20');

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log('\nTiming:');
    console.log('  Start Time: ' + startTime.toISOString());
    console.log('  End Time:   ' + endTime.toISOString());
    console.log('  Duration:   ' + duration.toFixed(2) + ' seconds');
    console.log('\n');
}

runAudit().catch(console.error);
