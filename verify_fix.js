const API_BASE = 'http://localhost:8000/api';

async function testCharity(id, name) {
    try {
        const response = await fetch(`${API_BASE}/financial?id=${id}`);
        const data = await response.json();
        const financial = data.d || data.value || [data];
        const current = Array.isArray(financial) ? financial[0] : financial;

        // Get all expense fields
        const expenseFields = {};
        for (const [key, value] of Object.entries(current)) {
            if ((key.match(/MaterialExpense\d+/) ||
                 key === 'AllOtherExpenditure' ||
                 key === 'AllOtherExpenditure') &&
                typeof value === 'number' && value > 0) {
                expenseFields[key] = value;
            }
        }

        // Find duplicates
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

        console.log(`ID ${id} - ${name}`);
        if (duplicates.length === 0) {
            console.log(`  ✅ PASS - No duplicates\n`);
        } else {
            console.log(`  ❌ FAIL - ${duplicates.length} duplicate(s)\n`);
        }

    } catch (err) {
        console.error(`ID ${id} - Error: ${err.message}\n`);
    }
}

async function runTests() {
    console.log('Verifying Duplicate Fix\n' + '='.repeat(50) + '\n');
    await testCharity(41083, 'Charity that had duplicates');
    await testCharity(41465, 'Diocesan School For Girls');
    await testCharity(69283, 'Test Charity B');
}

runTests();
