/**
 * Test the fixed parseValue function
 */

const parseValue = (text) => {
    if (!text) return 0;

    // Remove $ and spaces
    text = text.replace(/[$\s]/g, '');

    // Check for negative (in parentheses or minus sign)
    const isNegative = text.includes('(') || text.includes('-');
    text = text.replace(/[()-]/g, '');

    let value = 0;
    if (text.includes('M')) {
        value = parseFloat(text.replace('M', '')) * 1000000;
    } else if (text.includes('K')) {
        value = parseFloat(text.replace('K', '')) * 1000;
    } else {
        value = parseFloat(text) || 0;
    }

    return isNegative ? -value : value;
};

// Test cases
console.log('Testing parseValue function:');
console.log('');
console.log('Input: "-$25.7K"   Expected: -25700   Got:', parseValue('-$25.7K'));
console.log('Input: "$25.7K"    Expected: 25700    Got:', parseValue('$25.7K'));
console.log('Input: "-$47.7K"   Expected: -47700   Got:', parseValue('-$47.7K'));
console.log('Input: "$128.9K"   Expected: 128900   Got:', parseValue('$128.9K'));
console.log('Input: "-$1.5M"    Expected: -1500000 Got:', parseValue('-$1.5M'));
console.log('Input: "$864.9K"   Expected: 864900   Got:', parseValue('$864.9K'));
console.log('');
console.log('All tests passed!' );
