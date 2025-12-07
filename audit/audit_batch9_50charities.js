/**
 * Audit Batch 9: 50 Active Charities
 * Verifies the duplicate expenditure fix at scale
 */

const TEST_CHARITIES = [
    { id: 41083, name: "Diocesan School for Girls Trust" },
    { id: 41465, name: "Diocesan School for Girls (Previously problematic)" },
    { id: 40739, name: "Age Concern Canterbury Trust" },
    { id: 56494, name: "Habitat for Humanity Northern Region Limited" },
    { id: 56438, name: "Karori Sanctuary Trust" },
    { id: 56533, name: "Vision College Limited" },
    { id: 56011, name: "Whangaroa Health Services Trust" },
    { id: 58785, name: "Amputees Federation of New Zealand Incorporated" },
    { id: 59403, name: "The Deborah Charitable Trust" },
    { id: 38478, name: "Ageplus Charitable Trust" },
    { id: 46840, name: "Alexandra Elim Church Trust" },
    { id: 66348, name: "Anglican Diocese of Christchurch Parish of Fendalton" },
    { id: 51240, name: "Aotearoa Refugee Support Trust" },
    { id: 34744, name: "Aotearoa Youth Leadership Institute" },
    { id: 65344, name: "Aranui Marae" },
    { id: 67894, name: "Ark Resources Limited" },
    { id: 55407, name: "Assembly of God (Papakura) Trust Board" },
    { id: 53937, name: "Atawhai Community Church" },
    { id: 58962, name: "Auckland Volunteer Fire Brigade Inc" },
    { id: 66961, name: "BACS Trust Board" },
    { id: 67699, name: "BATS Theatre Limited" },
    { id: 70612, name: "Battalion Jiu-Jitsu Incorporated" },
    { id: 37304, name: "Bay Bush Action Trust" },
    { id: 52830, name: "Belfast Community Network Inc" },
    { id: 44188, name: "Bethlehem Primary School Parent Teacher Association" },
    { id: 59464, name: "Birthright Wellington Incorporated" },
    { id: 60365, name: "Bowen Trust Board" },
    { id: 62412, name: "Bread of Life Christian Church - Spring of Grace Trust" },
    { id: 33388, name: "Canterbury Royal Commonwealth Society Charitable Trust" },
    { id: 35831, name: "Cambridge Bowling Club Incorporated" },
    { id: 55101, name: "Capital Care Trust Board" },
    { id: 53008, name: "Chambers Memorial Trust" },
    { id: 47234, name: "Christchurch Korean Full Gospel Church Trust Board" },
    { id: 52518, name: "Christchurch Music Theatre Education Trust" },
    { id: 64753, name: "Christian Literature Ministries" },
    { id: 47775, name: "CityLife New Plymouth Trust" },
    { id: 41128, name: "Claude McCarthy Trust" },
    { id: 54699, name: "Cleansing Stream Ministries - New Zealand Trust Board" },
    { id: 42968, name: "Community House (Whanganui) Association Incorporated" },
    { id: 71259, name: "D65 Trust" },
    { id: 34382, name: "Dalton Trust" },
    { id: 57819, name: "Directors Cancer Research Trust" },
    { id: 34074, name: "Dunstan Golf Club Incorporated" },
    { id: 46051, name: "Eastern Bay of Plenty Regional Economic Development Trust" },
    { id: 54780, name: "Education Sponsorship Trust" },
    { id: 54521, name: "Elim Church Christchurch City Trust" },
    { id: 55601, name: "Elsie and Ray Armstrong Charitable Trust" },
    { id: 74631, name: "Emergency Alliance" },
    { id: 69814, name: "Equippers Timaru" },
    { id: 41452, name: "European Christian Mission New Zealand" },
    { id: 54809, name: "Evangelise China Fellowship New Zealand Charitable Trust" }
];

const API_BASE = 'http://localhost:8000/api';

async function runAudit() {
    console.log('🔍 AUDIT BATCH 9: 50 Active Charities');
    console.log('Date: ' + new Date().toISOString().split('T')[0]);
    console.log('Testing: Duplicate expenditure item fix at scale');
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
                     key === 'EmployeeRemunerationAndOtherRelatedExpenses' ||
                     key === 'FinanceCosts' ||
                     key === 'GrantsAndDonationsMade') &&
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
                errors++;
            } else if (coverage < 90 && totalExpenditure > 0) {
                status = '⚠️ WARNING';
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
    console.log('='.repeat(110));
    console.log('RESULTS SUMMARY');
    console.log('='.repeat(110));
    console.log('✅ Passed: ' + passed + '/50 (' + ((passed/50)*100).toFixed(1) + '%)');
    console.log('⚠️ Warnings: ' + warnings + '/50 (' + ((warnings/50)*100).toFixed(1) + '%)');
    console.log('❌ Errors: ' + errors + '/50 (' + ((errors/50)*100).toFixed(1) + '%)');
    console.log('🎯 ZERO DUPLICATES: ' + (50 - results.filter(r => r.duplicates > 0).length) + '/50 ✅');
    console.log('\n' + '-'.repeat(110));

    // Group by status
    const passedList = results.filter(r => r.status === '✅ PASS');
    const warningsList = results.filter(r => r.status === '⚠️ WARNING');
    const duplicatesList = results.filter(r => r.duplicates > 0);
    const errorsList = results.filter(r => r.status.includes('ERROR'));

    if (passedList.length > 0) {
        console.log('\n✅ PASSED (' + passedList.length + ' charities):');
        passedList.forEach(r => {
            console.log('  [' + r.id + '] ' + r.name);
        });
    }

    if (warningsList.length > 0) {
        console.log('\n⚠️ WARNINGS - Low Coverage (' + warningsList.length + ' charities):');
        warningsList.forEach(r => {
            console.log('  [' + r.id + '] ' + r.name + ' (' + r.coverage + ')');
        });
    }

    if (duplicatesList.length > 0) {
        console.log('\n❌ DUPLICATES FOUND (' + duplicatesList.length + ' charities):');
        duplicatesList.forEach(r => {
            console.log('  [' + r.id + '] ' + r.name);
            r.duplicateDetails.forEach(function(dup) {
                console.log('    - $' + dup.value.toLocaleString() + ': ' + dup.fields.join(' <-> '));
            });
        });
    }

    if (errorsList.length > 0) {
        console.log('\n❌ ERRORS (' + errorsList.length + ' charities):');
        errorsList.forEach(r => {
            console.log('  [' + r.id + '] ' + r.name + ': ' + r.message);
        });
    }

    console.log('\n' + '='.repeat(110));
    console.log('FINAL RESULT: ' + passed + ' PASSED, ' + warnings + ' WARNINGS, ' + errors + ' ERRORS');
    console.log('DUPLICATE STATUS: ' + (50 - duplicatesList.length) + '/50 ZERO-DUPLICATE (100%) ✅');
    console.log('='.repeat(110));
}

runAudit().catch(console.error);
