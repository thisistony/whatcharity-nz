/**
 * Test API directly to see what it returns
 */

async function testAPI() {
    const queries = [
        'St marys communi',
        'St marys community',
        'St mary community',
        "St mary's community"
    ];

    for (const query of queries) {
        console.log('\n' + '='.repeat(80));
        console.log(`Query: "${query}"`);
        console.log('='.repeat(80));

        const encodedQuery = encodeURIComponent(query);
        const url = `http://localhost:8000/api/search.php?q=${encodedQuery}`;

        console.log('URL:', url);

        try {
            const response = await fetch(url);
            const data = await response.json();
            const results = data.d || data.value || [];

            console.log(`Results: ${results.length}`);
            if (results.length > 0) {
                results.slice(0, 5).forEach((r, i) => {
                    console.log(`  ${i + 1}. ${r.Name} (CC${r.CharityRegistrationNumber})`);
                });
            } else {
                console.log('  (no results)');
            }
        } catch (err) {
            console.error('Error:', err.message);
        }
    }
}

testAPI().catch(console.error);
