const API_BASE = 'http://localhost:8000/api';

async function testCharity() {
    const charityId = 41083;

    try {
        const response = await fetch(`${API_BASE}/financial?id=${charityId}`);
        const data = await response.json();
        const financial = data.d || data.value || [data];
        const current = Array.isArray(financial) ? financial[0] : financial;

        console.log('🔍 Testing Charity ID 41083 (Previously had duplicates)');
        console.log('This charity had DUPLICATE expenditure items in previous audit\n');

        // Check for duplicate expense values
        const expenseFields = {
            'SalariesAndWages': current.SalariesAndWages || 0,
            'EmployeeRemunerationAndOtherRelatedExpenses': current.EmployeeRemunerationAndOtherRelatedExpenses || 0,
            'Depreciation': current.Depreciation || 0,
            'DepreciationAmortisationAndImpairmentExpenses': current.DepreciationAmortisationAndImpairmentExpenses || 0,
            'FinanceCosts': current.FinanceCosts || 0,
            'GrantsAndDonationsMade': current.GrantsAndDonationsMade || 0,
            'AllOtherExpenditure': current.AllOtherExpenditure || 0,
            'OtherExpenses': current.OtherExpenses || 0
        };

        console.log('Expense Field Values:');
        for (const [field, value] of Object.entries(expenseFields)) {
            if (value > 0) {
                console.log(`  ${field}: $${value.toLocaleString()}`);
            }
        }

        // Find duplicates
        const valueMap = {};
        const duplicates = [];

        for (const [field, value] of Object.entries(expenseFields)) {
            if (value > 0) {
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
        }

        console.log('\n' + '='.repeat(60));
        if (duplicates.length === 0) {
            console.log('✅ NO DUPLICATES FOUND - FIX IS WORKING!');
        } else {
            console.log(`❌ DUPLICATES FOUND: ${duplicates.length}`);
            duplicates.forEach(dup => {
                console.log(`   $${dup.value.toLocaleString()} appears in: ${dup.fields.join(', ')}`);
            });
        }
        console.log('='.repeat(60));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testCharity();
