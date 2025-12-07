const API_BASE = 'http://localhost:8000/api';

async function testCharity() {
    const charityId = 41465;

    try {
        const response = await fetch(`${API_BASE}/financial?id=${charityId}`);
        const data = await response.json();
        const financial = data.d || data.value || [data];
        const current = Array.isArray(financial) ? financial[0] : financial;

        console.log('🔍 Testing Charity ID 41465 - Diocesan School For Girls');
        console.log('Checking for duplicate expenditure values\n');

        // Get all fields
        console.log('ALL EXPENSE FIELDS IN API RESPONSE:');
        console.log('='.repeat(80));

        let expenseCount = 0;
        const allExpenses = {};

        for (const [key, value] of Object.entries(current)) {
            // Check if it looks like an expense field
            if ((key.includes('Expense') || key.includes('Cost') ||
                 key.includes('Salaries') || key.includes('Wages') ||
                 key.includes('Depreciation') || key.includes('Remuneration') ||
                 key.includes('Grant') || key.includes('Other')) &&
                !key.includes('Total') && !key.includes('LastYear') && !key.includes('Income') &&
                typeof value === 'number' && value > 0) {

                console.log(`${key}: $${value.toLocaleString()}`);
                allExpenses[key] = value;
                expenseCount++;
            }
        }

        console.log('='.repeat(80));
        console.log(`Total expense fields found: ${expenseCount}\n`);

        // Find duplicates
        console.log('DUPLICATE DETECTION:');
        console.log('='.repeat(80));

        const valueMap = {};
        const duplicates = [];

        for (const [field, value] of Object.entries(allExpenses)) {
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

        if (duplicates.length === 0) {
            console.log('✅ NO DUPLICATES FOUND\n');
        } else {
            console.log(`❌ DUPLICATES FOUND: ${duplicates.length}\n`);
            duplicates.forEach(dup => {
                console.log(`   Value: $${dup.value.toLocaleString()}`);
                console.log(`   Fields: ${dup.fields.join(', ')}`);
                console.log('');
            });
        }

        // Also check MaterialExpense fields specifically
        console.log('MATERIAL EXPENSE FIELDS:');
        console.log('='.repeat(80));
        for (let i = 1; i <= 4; i++) {
            const fieldName = `MaterialExpense${i}`;
            const value = current[fieldName];
            const labelName = `MaterialExpense${i}Label`;
            const label = current[labelName];

            if (value && value > 0) {
                console.log(`${fieldName}: $${value.toLocaleString()}`);
                if (label) console.log(`  Label: ${label}`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testCharity();
