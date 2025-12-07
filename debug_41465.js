// Simulate the data for charity 41465
const data = {
    MaterialExpense1: 28949125,
    MaterialExpense1Label: "Wages and Salaries",
    MaterialExpense2: 4946792,
    MaterialExpense2Label: "Depreciation",
    MaterialExpense3: 435019,
    MaterialExpense3Label: "Interest",
    AllOtherExpenditure: 11512544,
    TotalExpenditure: 45843480
};

const expenseFieldLabels = {
    'WagesSalariesAndOtherEmployeeCosts': 'Wages, salaries and other employee costs',
    'SalariesAndWages': 'Salaries and wages',
    'Depreciation': 'Depreciation',
    'FinanceCosts': 'Finance costs',
    'AllOtherExpenditure': 'All other expenditure',
};

console.log('SIMULATING MAIN LOOP (Object.keys):');
console.log('='.repeat(80));

const expenseLineItems = [];
const processedExpenseValues = new Map();

Object.keys(data).forEach(fieldName => {
    const value = data[fieldName];

    if (fieldName.match(/Label$/)) {
        console.log(`⏭️ SKIPPED (label field): ${fieldName}`);
        return;
    }
    if (!value || value <= 0) return;
    if (value === true || value === false) return;

    const isExpenseField = (
        expenseFieldLabels[fieldName] ||
        (fieldName.includes('Expense') && !fieldName.includes('Revenue') && !fieldName.includes('Income')) ||
        (fieldName.includes('Cost') && !fieldName.includes('Revenue')) ||
        (fieldName.includes('Total')) // This might match MaterialExpense!
    );

    if (!isExpenseField) {
        console.log(`❌ SKIPPED (not expense field): ${fieldName}`);
        return;
    }

    if (fieldName.includes('Total') || fieldName.includes('LastYear')) {
        console.log(`⏭️ SKIPPED (total/lastyear): ${fieldName}`);
        return;
    }

    const isDuplicate = Array.from(processedExpenseValues.values()).some(entry =>
        entry.value === value && entry.field !== fieldName
    );

    if (isDuplicate) {
        console.log(`⏭️ SKIPPED (duplicate): ${fieldName}: $${value}`);
        return;
    }

    let label = expenseFieldLabels[fieldName];
    if (!label) {
        label = fieldName.replace(/([A-Z])/g, ' $1').trim();
    }

    console.log(`✅ ADDED: ${fieldName}: $${value.toLocaleString()} → "${label}"`);
    expenseLineItems.push({ fieldName, label, amount: value });
    processedExpenseValues.set(fieldName, { field: fieldName, value });
});

console.log('\nAfter main loop: ' + expenseLineItems.length + ' items\n');

console.log('SIMULATING MATERIALEXPENSE LOOP:');
console.log('='.repeat(80));

for (let i = 1; i <= 4; i++) {
    const fieldName = 'MaterialExpense' + i;
    const value = data[fieldName];

    if (!value || typeof value !== 'number' || value <= 0) {
        console.log('⏭️ SKIPPED (no value): ' + fieldName);
        continue;
    }

    const isDuplicate = Array.from(processedExpenseValues.values()).some(entry =>
        entry.value === value && entry.field !== fieldName
    );

    if (isDuplicate) {
        console.log('⏭️ SKIPPED (duplicate): ' + fieldName + ': $' + value);
        continue;
    }

    const labelFieldName = fieldName + 'Label';
    const customLabel = data[labelFieldName];
    let label = (customLabel && typeof customLabel === 'string')
        ? customLabel
        : fieldName.replace(/([A-Z])/g, ' $1').trim();

    console.log('✅ ADDED: ' + fieldName + ': $' + value.toLocaleString() + ' → "' + label + '"');
    expenseLineItems.push({ fieldName, label, amount: value });
    processedExpenseValues.set(fieldName, { field: fieldName, value });
}

console.log('\n' + '='.repeat(80));
console.log('FINAL EXPENSE LINE ITEMS: ' + expenseLineItems.length);
console.log('='.repeat(80));
expenseLineItems.forEach(function(item, idx) {
    console.log((idx + 1) + '. ' + item.label + ': $' + item.amount.toLocaleString());
});
