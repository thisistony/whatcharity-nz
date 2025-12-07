/**
 * Comprehensive 200 Charity Audit
 * Tests accuracy across all charity tiers
 */

const puppeteer = require('puppeteer');

// 200 test charities from various tiers
const TEST_CHARITIES = [
    { id: 58539, name: "Samoan Assembly Of God (Hamilton) Trust Board" },
    { id: 56541, name: "Waiora Community Trust (Taupo) Incorporated" },
    { id: 45497, name: "Te Hui Amorangi Ki Te Tairawhiti Trust Board" },
    { id: 51543, name: "Manukau Concert Band Incorporated" },
    { id: 42815, name: "Ruahine Playhouse" },
    { id: 38813, name: "Bay Reach Community Trust" },
    { id: 44324, name: "Rotary Club of Botany East Tamaki Charitable Trust" },
    { id: 37844, name: "South Christchurch Community Trust" },
    { id: 42935, name: "New Zealand Cadet And GEMS National Board" },
    { id: 60534, name: "Saint Davids Memorial Church Fund" },
    { id: 70229, name: "Pacific Cooperation Broadcasting Trust" },
    { id: 57770, name: "Rail Heritage Trust of New Zealand" },
    { id: 34560, name: "Rangitane Investments Limited" },
    { id: 66418, name: "Safe Network Charitable Trust" },
    { id: 47549, name: "Sarjeant Gallery Trust Board" },
    { id: 39060, name: "South Canterbury Free Kindergarten Association Incorporated" },
    { id: 64733, name: "St Margaret's College Foundation Trust" },
    { id: 51533, name: "Tauranga Baptist Church Trust" },
    { id: 58143, name: "Te Hauora o Turanganui a Kiwa Limited" },
    { id: 44184, name: "The Royal Australasian College of Physicians" },
    { id: 52008, name: "The Suter Art Gallery Te Aratoi o Whakatu Trust" },
    { id: 66210, name: "Thorrington Village Limited" },
    { id: 42253, name: "Volunteer Service Abroad Te Tuao Tawahi Incorporated" },
    { id: 69557, name: "Whaiora Marae Maori Catholic Society Incorporated" },
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
    { id: 33388, name: "CANTERBURY ROYAL COMMONWEALTH SOCIETY CHARITABLE TRUST" },
    { id: 35831, name: "Cambridge Bowling Club Incorporated" },
    { id: 55101, name: "Capital Care Trust Board" },
    { id: 53008, name: "Chambers Memorial Trust" },
    { id: 47234, name: "Christchurch Korean Full Gospel Church (Assembly of God) Trust Board" },
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
    { id: 46051, name: "Eastern Bay Of Plenty Regional Economic Development Trust" },
    { id: 54780, name: "Education Sponsorship Trust" },
    { id: 54521, name: "Elim Church Christchurch City Trust" },
    { id: 55601, name: "Elsie & Ray Armstrong Charitable Trust" },
    { id: 74631, name: "Emergency Alliance" },
    { id: 69814, name: "Equippers Timaru" },
    { id: 41452, name: "European Christian Mission New Zealand" },
    { id: 54809, name: "Evangelise China Fellowship New Zealand Charitable Trust" },
    { id: 62969, name: "Falkenstein AUT Charitable Trust" },
    { id: 61139, name: "Feilding Playcentre" },
    { id: 32900, name: "Fountain of Peace Children's Foundation New Zealand" },
    { id: 69796, name: "Fountainblue Limited" },
    { id: 75420, name: "Friends of Bullock Creek Trust" },
    { id: 55057, name: "Gisborne Volunteer Centre" },
    { id: 34181, name: "Grace Bible Church Dunedin Trust" },
    { id: 68043, name: "Grace Christian Trust Napier" },
    { id: 61184, name: "Gracebooks Community Trust" },
    { id: 59736, name: "Graeme Dingle Foundation Southern" },
    { id: 36097, name: "Haleema Kindergarten Trust" },
    { id: 35351, name: "Hamilton Arts Trust" },
    { id: 44869, name: "Hastings Christadelphian Ecclesia Central Fellowship" },
    { id: 74544, name: "He Whenua Taurikura - National Centre of Research Excellence" },
    { id: 49590, name: "Herne Bay Playcentre" },
    { id: 73686, name: "Home & Family Charitable Trust" },
    { id: 39530, name: "Hot Water Beach Lifeguard Service Incorporated" },
    { id: 65810, name: "Howick Presbyterian Church" },
    { id: 38996, name: "IARC Charitable Trust" },
    { id: 33592, name: "Invercargill Elim Community Church Trust" },
    { id: 55776, name: "John McGlashan College Charitable Trust" },
    { id: 71851, name: "Just Atelier Trust" },
    { id: 57514, name: "Kaiapoi Co-Operating Parish Methodist-Presbyterian" },
    { id: 54370, name: "Karangahape Marae Trust" },
    { id: 55444, name: "Kauri Coast Community Pool Trust" },
    { id: 39710, name: "Kiddy Winks Kindy Trust" },
    { id: 72548, name: "Korou Digital (Charitable) Trust" },
    { id: 33722, name: "Kotahitanga Charitable Trust" },
    { id: 73588, name: "Kōrero Mai Charitable Trust" },
    { id: 43657, name: "Lions Club of Kapakapanui Charitable Trust" },
    { id: 66188, name: "Live For More Charitable Trust" },
    { id: 69805, name: "Living Water Worship Centre Christian Church" },
    { id: 48315, name: "Living Waters Wesleyan Church" },
    { id: 51826, name: "M A Tonkinson Charitable Trust" },
    { id: 56416, name: "M. E. Armitage Charitable Trust" },
    { id: 67149, name: "METHODIST CHURCH SAMOA (NEW ZEALAND) OTAHUHU PARISH" },
    { id: 73000, name: "Maca Sports Leadership Charitable Trust" },
    { id: 74251, name: "Manaaki Rangatahi" },
    { id: 67556, name: "Mangawhai Golf Club Incorporated" },
    { id: 57309, name: "Mangere Congregation Church Of Jesus Trust Board" },
    { id: 42614, name: "Manukau Hope Trust" },
    { id: 38392, name: "Marian School PTFA" },
    { id: 39618, name: "Maxim Institute" },
    { id: 50146, name: "Moteo Marae" },
    { id: 50340, name: "Motueka Events Charitable Trust" },
    { id: 38115, name: "Mount Roskill Islamic Trust" },
    { id: 46772, name: "Mountainview High School Parent Teacher Association" },
    { id: 42402, name: "National Science Technology Roadshow Trust Board" },
    { id: 33598, name: "Neuroendocrine Cancer New Zealand" },
    { id: 61551, name: "New Zealand Epoch Times Limited" },
    { id: 65026, name: "New Zealand Methodist Women's Fellowship" },
    { id: 56253, name: "New Zealand Sikh Womens Association Incorporated" },
    { id: 50999, name: "Ngaruawahia Community House Incorporated" },
    { id: 43846, name: "Ngati Rangatahi Whanaunga (Association)" },
    { id: 34336, name: "Ngati Rarua Wahi Mahi Limited" },
    { id: 63075, name: "North Harbour Touch Association Incorporated" },
    { id: 64785, name: "Otatara Community Centre Trust" },
    { id: 32592, name: "Otautahi Women's Refuge Incorporated" },
    { id: 39084, name: "Oxford Community Trust" },
    { id: 44500, name: "Palmerston North Jaycee Trust" },
    { id: 74794, name: "Papa O Te Aroha Marae Charitable Trust" },
    { id: 61345, name: "Papakura Theatre Company Incorporated" },
    { id: 37635, name: "Petone Sportsville Incorporated" },
    { id: 42054, name: "Powerhouse Christian Trust" },
    { id: 41195, name: "RBC Ministries New Zealand Trust" },
    { id: 39374, name: "Rangitikei Environment Group Incorporated" },
    { id: 44429, name: "Rape and Abuse Support Centre Southland Incorporated" },
    { id: 39000, name: "Robert McIsaac Charitable Trust" },
    { id: 65877, name: "Rotorua Rowing Club Incorporated" },
    { id: 54051, name: "Royal Academy of Dance" },
    { id: 49526, name: "Samaritans Of Wellington Incorporated" },
    { id: 58671, name: "Seaside Charitable Trust" },
    { id: 63662, name: "Servants Health Centre Trust" },
    { id: 37574, name: "South Island Kokako Charitable Trust" },
    { id: 69272, name: "South Marlborough Landscape Restoration Trust" },
    { id: 56729, name: "St James Union Parish Church Greerton" },
    { id: 44517, name: "St Laurence's Social Service Trust Board" },
    { id: 59658, name: "St Mary's Parish, Paeroa" },
    { id: 56735, name: "St Paul's Co-operating Church Papamoa" },
    { id: 39858, name: "Stratford Baptist Church" },
    { id: 71137, name: "TARAMEA FRAGRANCE LIMITED" },
    { id: 75642, name: "TUCKER BEACH WILDLIFE TRUST" },
    { id: 71284, name: "Ta Tupu Foundation Trust" },
    { id: 45794, name: "Taumata O Tapuhi Marae" },
    { id: 55630, name: "Tauranga Budget Advisory Service Incorporated" },
    { id: 52989, name: "Te Awhina Tangata" },
    { id: 45799, name: "Te Hui Amorangi Ki Te Manawa O Te Wheke Trust Board" },
    { id: 71946, name: "Te Kapua Whakapipi Charitable Trust" },
    { id: 73517, name: "Te Kōwhatu Tū Moana Trust" },
    { id: 46798, name: "Te Maori Manaaki Taonga Trust" },
    { id: 39114, name: "Te Ora Hou Ōtautahi Incorporated" },
    { id: 73889, name: "Te Ropu Marutau o Aotearoa" },
    { id: 63747, name: "Te Whaiti-Nui-A-Toi Trust" },
    { id: 71071, name: "Te Whare Aio - Maori Women's Refuge Incorporated" },
    { id: 34629, name: "Ted Manson Charitable Trust" },
    { id: 50164, name: "Temple Basin Ski Club Incorporated" },
    { id: 50485, name: "Tennis Otago Incorporated" },
    { id: 52834, name: "The Bay Of Whales Childrens Trust Incorporated" },
    { id: 39309, name: "The Community Of The Sacred Name Society Or Trust Board" },
    { id: 44078, name: "The Congregational Christian Church of Samoa (Blockhouse Bay) Trust Board" },
    { id: 36083, name: "The Frank & Margaret Whiteley Charitable Trust" },
    { id: 69232, name: "The Good Collective Limited" },
    { id: 75084, name: "The Jabez Initiative Limited" },
    { id: 39042, name: "The Kaitaia Community House Society Incorporated" },
    { id: 41952, name: "The Leedstown Trust" },
    { id: 40288, name: "The Methodist Church Of New Zealand Te Haahi Weteriana O Aotearoa Otara Tongan P" },
    { id: 47518, name: "The New Zealand Resident Doctors Association Education Trust" },
    { id: 65803, name: "The Phil Lamason Heritage Centre Trust Incorporated" },
    { id: 63814, name: "The Psalm 2:8 Trust" },
    { id: 60304, name: "The Rotorua Branch of The Royal New Zealand Society For The Prevention Of Cruelt" },
    { id: 35500, name: "The South Canterbury Drama League Incorporated" },
    { id: 53064, name: "The South Island (Te Waipounamu) Branch of the Muscular Dystrophy Association of" },
    { id: 73747, name: "The Talking Matters Charitable Trust" },
    { id: 68405, name: "The Tauranga Community Trust" },
    { id: 40234, name: "Titirangi Baptist Church" },
    { id: 38533, name: "Tokelauan Congregational Christian Church Trust Board" },
    { id: 60262, name: "Transport Research and Educational Trust Board" },
    { id: 52675, name: "Trinity Ministries Incorporated" },
    { id: 51972, name: "Tryphina House Whangarei Women's Refuge Incorporated" },
    { id: 42095, name: "Vincent House Trust" },
    { id: 69425, name: "Vogelmorn Community Group Charitable Trust" },
    { id: 55319, name: "W Crighton Charitable Co Ltd" },
    { id: 41593, name: "W and W.A.R Fraser Charitable Trust" },
    { id: 54887, name: "Waikato City Assembly of God Trust Board" },
    { id: 53916, name: "Waikowhai Community Trust" },
    { id: 52867, name: "Waipa Community Trust" },
    { id: 61599, name: "Wellington College Old Boys Association Incorporated" },
    { id: 66866, name: "Western Bay Heritage Trust Board" },
    { id: 41938, name: "Whangamata Baptist Church" },
    { id: 57233, name: "Whanganui Enterprises Trust" },
    { id: 52743, name: "Whangarei Native Bird Recovery Centre Incorporated" }
];

async function fetchAPIData(charityId) {
    const response = await fetch(`http://localhost:8000/api/financial?id=${charityId}`);
    if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}`);
    }
    const data = await response.json();
    const annualReturns = data.d || [];

    if (annualReturns.length === 0) {
        throw new Error('No annual returns found');
    }

    return annualReturns[0];
}

async function fetchLocalhostPage(charityId, browser) {
    const page = await browser.newPage();

    try {
        await page.goto(`http://localhost:8000/?id=${charityId}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for financial data to load
        await page.waitForFunction(() => {
            const el = document.querySelector('#totalIncome');
            return el && el.textContent.trim().length > 0;
        }, { timeout: 15000 });

        await new Promise(resolve => setTimeout(resolve, 500));

        // Extract financial data from the page
        const data = await page.evaluate(() => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : '';
            };

            // Parse currency values that may include K (thousands) or M (millions)
            const parseValue = (text) => {
                if (!text) return 0;

                // Remove $ and spaces
                text = text.replace(/[$\s]/g, '');

                // Check for negative (in parentheses or minus sign)
                const isNegative = text.includes('(') || text.includes('-');
                text = text.replace(/[()-]/g, '');

                let value = 0;
                if (text.includes('M')) {
                    // Millions
                    value = parseFloat(text.replace('M', '')) * 1000000;
                } else if (text.includes('K')) {
                    // Thousands
                    value = parseFloat(text.replace('K', '')) * 1000;
                } else {
                    value = parseFloat(text);
                }

                return isNegative ? -value : value;
            };

            return {
                charityName: getText('#charityName'),
                totalIncome: parseValue(getText('#totalIncome')),
                totalExpenditure: parseValue(getText('#totalExpenditure')),
                netSurplus: parseValue(getText('#netSurplus')),
                totalAssets: parseValue(getText('#totalAssets'))
            };
        });

        await page.close();
        return data;

    } catch (error) {
        await page.close();
        throw error;
    }
}

function compareFinancials(localhost, api) {
    const discrepancies = [];

    const checks = [
        {
            name: 'Total Income',
            local: localhost.totalIncome,
            api: api.TotalGrossIncome || 0,
            critical: true
        },
        {
            name: 'Total Expenditure',
            local: localhost.totalExpenditure,
            api: api.TotalExpenditure || 0,
            critical: true
        },
        {
            name: 'Net Surplus/Deficit',
            local: localhost.netSurplus,
            api: (api.TotalGrossIncome || 0) - (api.TotalExpenditure || 0),
            critical: true
        },
        {
            name: 'Total Assets',
            local: localhost.totalAssets,
            api: api.TotalAssets || 0,
            critical: true
        }
    ];

    for (const check of checks) {
        // Allow for rounding differences up to 0.2% due to K/M abbreviation
        const diff = Math.abs(check.local - check.api);
        const percentDiff = check.api !== 0 ? (diff / Math.abs(check.api) * 100) : 0;

        // Flag if difference is more than 0.2% (accounting for K/M rounding)
        if (percentDiff > 0.2) {
            discrepancies.push({
                field: check.name,
                localhost: check.local,
                api: check.api,
                difference: diff,
                percentDiff: percentDiff.toFixed(2),
                critical: check.critical
            });
        }
    }

    return discrepancies;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

async function auditCharity(charity, browser, index, total) {
    const progressBar = `[${index}/${total}]`;

    try {
        // Fetch data from both sources
        const [apiData, localhostData] = await Promise.all([
            fetchAPIData(charity.id),
            fetchLocalhostPage(charity.id, browser)
        ]);

        const charityName = localhostData.charityName || charity.name || `Charity ${charity.id}`;

        // Compare
        const discrepancies = compareFinancials(localhostData, apiData);

        const status = discrepancies.length === 0 ? 'PASS' : 'FAIL';
        const icon = status === 'PASS' ? '✅' : '❌';

        console.log(`${progressBar} ${icon} ${charityName.substring(0, 50).padEnd(50)} (CC${charity.id})`);

        if (discrepancies.length > 0) {
            discrepancies.forEach(d => {
                console.log(`     ⚠️  ${d.field}: ${d.percentDiff}% diff (Local: ${formatCurrency(d.localhost)} vs API: ${formatCurrency(d.api)})`);
            });
        }

        return {
            charity,
            charityName,
            status,
            discrepancies,
            totals: {
                income: apiData.TotalGrossIncome || 0,
                expenditure: apiData.TotalExpenditure || 0
            }
        };

    } catch (error) {
        const errorName = charity.name || `Charity ${charity.id}`;
        console.log(`${progressBar} ⚠️  ${errorName.substring(0, 50).padEnd(50)} (CC${charity.id}) - ERROR: ${error.message}`);
        return {
            charity,
            charityName: errorName,
            status: 'ERROR',
            error: error.message
        };
    }
}

async function generateReport(results) {
    console.log(`\n\n${'█'.repeat(100)}`);
    console.log('200 CHARITY AUDIT - COMPREHENSIVE REPORT');
    console.log('█'.repeat(100));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    const total = results.length;

    console.log(`\n📊 OVERALL STATISTICS:`);
    console.log(`   Total Charities Tested: ${total}`);
    console.log(`   ✅ Perfect Match:      ${passed} (${(passed/total*100).toFixed(1)}%)`);
    console.log(`   ❌ Discrepancies:      ${failed} (${(failed/total*100).toFixed(1)}%)`);
    console.log(`   ⚠️  Errors:             ${errors} (${(errors/total*100).toFixed(1)}%)`);

    // Calculate total amount audited
    const totalAudited = results
        .filter(r => r.totals)
        .reduce((sum, r) => sum + (r.totals.income || 0), 0);

    console.log(`\n💰 FINANCIAL SCOPE:`);
    console.log(`   Total Income Audited: ${formatCurrency(totalAudited)}`);

    // Accuracy rate
    const accuracyRate = (passed / (total - errors) * 100).toFixed(2);
    console.log(`\n📈 ACCURACY RATE: ${accuracyRate}%`);

    if (failed > 0) {
        console.log(`\n\n❌ FAILED AUDITS (${failed}):`);
        console.log('─'.repeat(100));

        results.filter(r => r.status === 'FAIL').forEach((result, idx) => {
            console.log(`\n${idx + 1}. ${result.charityName} (CC${result.charity.id})`);
            result.discrepancies.forEach(disc => {
                console.log(`   ⚠️  ${disc.field}: ${disc.percentDiff}% difference`);
                console.log(`       Localhost: ${formatCurrency(disc.localhost)}`);
                console.log(`       Official:  ${formatCurrency(disc.api)}`);
            });
        });
    }

    if (errors > 0) {
        console.log(`\n\n⚠️  ERRORS ENCOUNTERED (${errors}):`);
        console.log('─'.repeat(100));

        results.filter(r => r.status === 'ERROR').slice(0, 10).forEach((result, idx) => {
            console.log(`${idx + 1}. ${result.charityName} (CC${result.charity.id}): ${result.error}`);
        });

        if (errors > 10) {
            console.log(`\n... and ${errors - 10} more errors`);
        }
    }

    // Final verdict
    console.log(`\n\n${'█'.repeat(100)}`);
    console.log('PRODUCTION READINESS VERDICT');
    console.log('█'.repeat(100));

    if (accuracyRate >= 99.5) {
        console.log('\n🎉 STATUS: ✅ EXCELLENT - PRODUCTION READY\n');
        console.log(`Outstanding performance! ${accuracyRate}% accuracy across ${total} charities.`);
        console.log('Your website consistently delivers accurate financial data.\n');
    } else if (accuracyRate >= 95) {
        console.log('\n✅ STATUS: GOOD - PRODUCTION READY WITH MINOR NOTES\n');
        console.log(`Good performance! ${accuracyRate}% accuracy across ${total} charities.`);
        console.log('A few edge cases detected but overall very reliable.\n');
    } else {
        console.log('\n⚠️  STATUS: NEEDS REVIEW\n');
        console.log(`${accuracyRate}% accuracy across ${total} charities.`);
        console.log('Some issues detected that should be investigated.\n');
    }

    console.log('█'.repeat(100));
}

async function runAudit() {
    console.log('🔍 COMPREHENSIVE 200-CHARITY AUDIT');
    console.log(`Testing ${TEST_CHARITIES.length} charities...`);
    console.log('This will take approximately 10-15 minutes...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const results = [];
    const startTime = Date.now();

    try {
        for (let i = 0; i < TEST_CHARITIES.length; i++) {
            const result = await auditCharity(TEST_CHARITIES[i], browser, i + 1, TEST_CHARITIES.length);
            results.push(result);

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log(`\n\n⏱️  Audit completed in ${duration} minutes`);

        await generateReport(results);

    } finally {
        await browser.close();
    }

    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('audit_200_results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results saved to audit_200_results.json\n');
}

// Run the audit
runAudit().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
