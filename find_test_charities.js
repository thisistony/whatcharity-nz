/**
 * Find 20 diverse test charities for audit
 * We'll pick well-known charities across different sizes and tiers
 */

// Known charity IDs to test
const TEST_CHARITIES = [
    // Large well-known charities
    { id: 55332, name: "St. Kentigern Trust Board", search: "St Kentigern" },
    { id: 55463, name: "King's School, Auckland", search: "Kings School Auckland" },

    // More charities - we'll search for these
    { search: "Salvation Army" },
    { search: "Red Cross" },
    { search: "Plunket" },
    { search: "SPCA" },
    { search: "Cancer Society" },
    { search: "Diabetes" },
    { search: "Heart Foundation" },
    { search: "Forest and Bird" },
    { search: "Presbyterian" },
    { search: "Baptist" },
    { search: "Rotary" },
    { search: "Lions" },
    { search: "St John" },
    { search: "Surf Life Saving" },
    { search: "Rugby" },
    { search: "Cricket" },
    { search: "University" },
    { search: "Museum" }
];

const API_BASE = 'http://localhost:8000/api';

async function searchCharity(searchTerm) {
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        const results = data.d || data.value || [];
        return results.length > 0 ? results[0] : null; // Return first match
    } catch (error) {
        console.error(`Error searching for ${searchTerm}:`, error);
        return null;
    }
}

async function getFinancialInfo(orgId) {
    try {
        const response = await fetch(`${API_BASE}/financial?id=${orgId}`);
        const data = await response.json();
        const results = data.d || data.value || [];
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        return null;
    }
}

async function findTestCharities() {
    const charities = [];

    console.log('Finding 20 diverse test charities...\n');

    for (const item of TEST_CHARITIES) {
        if (charities.length >= 20) break;

        let charity;

        if (item.id) {
            // Already have ID
            charity = { OrganisationId: item.id, Name: item.name };
        } else {
            // Search for it
            charity = await searchCharity(item.search);
        }

        if (!charity) {
            console.log(`❌ Not found: ${item.search}`);
            continue;
        }

        // Get financial data to check tier
        const financial = await getFinancialInfo(charity.OrganisationId);
        const tier = financial ? (financial.ReportingTierId || 'Unknown') : 'No data';
        const totalIncome = financial ? (financial.TotalGrossIncome || 0) : 0;

        if (financial) {
            charities.push({
                id: charity.OrganisationId,
                name: charity.Name,
                tier: tier,
                income: totalIncome
            });

            console.log(`✓ ${charities.length}. ${charity.Name} (ID: ${charity.OrganisationId}, Tier: ${tier}, Income: $${totalIncome.toLocaleString()})`);
        } else {
            console.log(`⚠️  ${charity.Name} - No financial data`);
        }

        // Be nice to the API
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log(`\n\nFound ${charities.length} charities with financial data\n`);
    console.log('Copy this array into audit_charities.js:\n');
    console.log('const TEST_CHARITIES = [');
    charities.forEach(c => {
        console.log(`    { id: ${c.id}, name: "${c.name}", tier: ${c.tier} },`);
    });
    console.log('];\n');

    return charities;
}

// Run
findTestCharities().catch(console.error);
