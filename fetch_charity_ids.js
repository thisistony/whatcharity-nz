/**
 * Fetch active charity IDs from the Charities Register
 * to build a list of real charities for auditing
 */

const API_BASE = 'http://localhost:8000/api';

async function fetchCharityIds() {
    console.log('Fetching charity IDs from system...\n');

    const charityIds = new Set();
    let page = 1;
    const pageSize = 100;
    let totalFetched = 0;

    try {
        // Try to fetch charities in batches
        // Since we don't know the exact endpoint, we'll try multiple approaches

        // Approach 1: Try a charities list endpoint
        console.log('Attempting to fetch charities list...');

        const response = await fetch(API_BASE + '/charities?$top=' + pageSize);
        if (response.ok) {
            const data = await response.json();
            console.log('Found charities endpoint');
            console.log(JSON.stringify(data, null, 2).substring(0, 500));
        } else {
            console.log('Charities endpoint not available, status: ' + response.status);
        }

        // Approach 2: Search through financial records
        console.log('\nAttempting to fetch through financial records...');

        // We'll use a range of IDs we know exist
        const knownIds = [36376, 40739, 56494, 56438, 56533, 56011, 58785, 59403, 41083, 41465, 70229, 57770, 34560, 66418, 47549, 39060, 64733, 51533, 58143, 44184];

        for (const id of knownIds) {
            const response = await fetch(API_BASE + '/financial?id=' + id);
            if (response.ok) {
                const data = await response.json();
                const financial = data.d || data.value || [data];
                const current = Array.isArray(financial) ? financial[0] : financial;

                if (current && current.CharityId) {
                    charityIds.add(current.CharityId);
                    totalFetched++;
                }
            }
        }

        console.log('Found ' + totalFetched + ' charities with data');
        console.log('Charity IDs: ' + Array.from(charityIds).join(', '));

    } catch (error) {
        console.error('Error fetching charities: ' + error.message);
    }
}

fetchCharityIds().catch(console.error);
