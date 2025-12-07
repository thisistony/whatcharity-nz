🔍 COMPREHENSIVE 200-CHARITY AUDIT
Testing 197 charities...
This will take approximately 10-15 minutes...

const TEST_CHARITIES = [
    { id: 38813, name: "Bay Reach Community Trust" },
    { id: 41195, name: "RBC Ministries New Zealand Trust" },
    { id: 55776, name: "John McGlashan College Charitable Trust" },
    { id: 75420, name: "Friends of Bullock Creek Trust" },
    { id: 38478, name: "Ageplus Charitable Trust" },
    { id: 54370, name: "Karangahape Marae Trust" },
    { id: 58962, name: "Auckland Volunteer Fire Brigade Inc" },
    { id: 34074, name: "Dunstan Golf Club Incorporated" },
    { id: 55407, name: "Assembly of God (Papakura) Trust Board" },
    { id: 67894, name: "Ark Resources Limited" },
    { id: 62969, name: "Falkenstein AUT Charitable Trust" },
    { id: 72548, name: "Korou Digital (Charitable) Trust" },
    { id: 74544, name: "He Whenua Taurikura - National Centre of Research Excellence" },
    { id: 60365, name: "Bowen Trust Board" },
    { id: 34382, name: "Dalton Trust" },
    { id: 73686, name: "Home & Family Charitable Trust" },
    { id: 42968, name: "Community House (Whanganui) Association Incorporated" },
    { id: 67699, name: "BATS Theatre Limited" },
    { id: 42935, name: "New Zealand Cadet And GEMS National Board" },
    { id: 57770, name: "Rail Heritage Trust of New Zealand" },
    { id: 41452, name: "European Christian Mission New Zealand" },
    { id: 54809, name: "Evangelise China Fellowship New Zealand Charitable Trust" },
    { id: 64733, name: "St Margaret's College Foundation Trust" },
    { id: 39710, name: "Kiddy Winks Kindy Trust" },
    { id: 54780, name: "Education Sponsorship Trust" },
    { id: 53064, name: "The South Island (Te Waipounamu) Branch of the Muscular Dystrophy Association of" },
    { id: 38996, name: "IARC Charitable Trust" },
    { id: 56416, name: "M. E. Armitage Charitable Trust" },
    { id: 69272, name: "South Marlborough Landscape Restoration Trust" },
    { id: 43846, name: "Ngati Rangatahi Whanaunga (Association)" },
    { id: 44184, name: "The Royal Australasian College of Physicians" },
    { id: 61551, name: "New Zealand Epoch Times Limited" },
    { id: 71851, name: "Just Atelier Trust" },
    { id: 59464, name: "Birthright Wellington Incorporated" },
    { id: 37635, name: "Petone Sportsville Incorporated" },
    { id: 56729, name: "St James Union Parish Church Greerton" },
    { id: 57514, name: "Kaiapoi Co-Operating Parish Methodist-Presbyterian" },
    { id: 59736, name: "Graeme Dingle Foundation Southern" },
    { id: 69557, name: "Whaiora Marae Maori Catholic Society Incorporated" },
    { id: 65026, name: "New Zealand Methodist Women's Fellowship" },
    { id: 52830, name: "Belfast Community Network Inc" },
    { id: 39618, name: "Maxim Institute" },
    { id: 49590, name: "Herne Bay Playcentre" },
    { id: 71137, name: "TARAMEA FRAGRANCE LIMITED" },
    { id: 44517, name: "St Laurence's Social Service Trust Board" },
    { id: 52008, name: "The Suter Art Gallery Te Aratoi o Whakatu Trust" },
    { id: 49526, name: "Samaritans Of Wellington Incorporated" },
    { id: 56253, name: "New Zealand Sikh Womens Association Incorporated" },
    { id: 54699, name: "Cleansing Stream Ministries - New Zealand Trust Board" },
    { id: 43657, name: "Lions Club of Kapakapanui Charitable Trust" },
    { id: 35351, name: "Hamilton Arts Trust" },
    { id: 50340, name: "Motueka Events Charitable Trust" },
    { id: 65810, name: "Howick Presbyterian Church" },
    { id: 63662, name: "Servants Health Centre Trust" },
    { id: 67149, name: "METHODIST CHURCH SAMOA (NEW ZEALAND) OTAHUHU PARISH" },
    { id: 55319, name: "W Crighton Charitable Co Ltd" },
    { id: 62412, name: "Bread of Life Christian Church - Spring of Grace Trust" },
    { id: 61599, name: "Wellington College Old Boys Association Incorporated" },
    { id: 73588, name: "Kōrero Mai Charitable Trust" },
    { id: 54887, name: "Waikato City Assembly of God Trust Board" },
    { id: 75084, name: "The Jabez Initiative Limited" },
    { id: 55630, name: "Tauranga Budget Advisory Service Incorporated" },
    { id: 40288, name: "The Methodist Church Of New Zealand Te Haahi Weteriana O Aotearoa Otara Tongan P" },
    { id: 47549, name: "Sarjeant Gallery Trust Board" },
    { id: 33598, name: "Neuroendocrine Cancer New Zealand" },
    { id: 58539, name: "Samoan Assembly Of God (Hamilton) Trust Board" },
    { id: 69425, name: "Vogelmorn Community Group Charitable Trust" },
    { id: 38533, name: "Tokelauan Congregational Christian Church Trust Board" },
    { id: 71071, name: "Te Whare Aio - Maori Women's Refuge Incorporated" },
    { id: 71259, name: "D65 Trust" },
    { id: 44429, name: "Rape and Abuse Support Centre Southland Incorporated" },
    { id: 52989, name: "Te Awhina Tangata" },
    { id: 51972, name: "Tryphina House Whangarei Women's Refuge Incorporated" },
    { id: 46798, name: "Te Maori Manaaki Taonga Trust" },
    { id: 75642, name: "TUCKER BEACH WILDLIFE TRUST" },
    { id: 54051, name: "Royal Academy of Dance" },
    { id: 56541, name: "Waiora Community Trust (Taupo) Incorporated" },
    { id: 61184, name: "Gracebooks Community Trust" },
    { id: 52834, name: "The Bay Of Whales Childrens Trust Incorporated" },
    { id: 53916, name: "Waikowhai Community Trust" },
    { id: 38115, name: "Mount Roskill Islamic Trust" },
    { id: 63814, name: "The Psalm 2:8 Trust" },
    { id: 50485, name: "Tennis Otago Incorporated" },
    { id: 50999, name: "Ngaruawahia Community House Incorporated" },
    { id: 39858, name: "Stratford Baptist Church" },
    { id: 69796, name: "Fountainblue Limited" },
    { id: 60304, name: "The Rotorua Branch of The Royal New Zealand Society For The Prevention Of Cruelt" },
    { id: 50146, name: "Moteo Marae" },
    { id: 41128, name: "Claude McCarthy Trust" },
    { id: 60534, name: "Saint Davids Memorial Church Fund" },
    { id: 66188, name: "Live For More Charitable Trust" },
    { id: 69814, name: "Equippers Timaru" },
    { id: 55444, name: "Kauri Coast Community Pool Trust" },
    { id: 35500, name: "The South Canterbury Drama League Incorporated" },
    { id: 39114, name: "Te Ora Hou Ōtautahi Incorporated" },
    { id: 53937, name: "Atawhai Community Church" },
    { id: 65344, name: "Aranui Marae" },
    { id: 36097, name: "Haleema Kindergarten Trust" },
    { id: 39060, name: "South Canterbury Free Kindergarten Association Incorporated" },
    { id: 51533, name: "Tauranga Baptist Church Trust" }
];

module.exports = { TEST_CHARITIES };
[1/197] ✅ Samoan Assembly Of God (Hamilton) Trust Board      (CC58539)
[2/197] ✅ Waiora Community Trust (Taupo) Incorporated        (CC56541)
[3/197] ❌ Te Hui Amorangi Ki Te Tairawhiti Trust Board       (CC45497)
     ⚠️  Net Surplus/Deficit: 0.48% diff (Local: -$3,700 vs API: -$3,718)
[4/197] ❌ Manukau Concert Band Incorporated                  (CC51543)
     ⚠️  Net Surplus/Deficit: 0.32% diff (Local: -$11,500 vs API: -$11,463)
[5/197] ❌ Ruahine Playhouse                                  (CC42815)
     ⚠️  Total Income: 1.92% diff (Local: $2,200 vs API: $2,243)
     ⚠️  Total Assets: 0.62% diff (Local: $3,100 vs API: $3,081)
[6/197] ✅ Bay Reach Community Trust                          (CC38813)
[7/197] ❌ Rotary Club of Botany East Tamaki Charitable Trust (CC44324)
     ⚠️  Total Expenditure: 0.41% diff (Local: $3,200 vs API: $3,187)
     ⚠️  Total Assets: 0.25% diff (Local: $16,500 vs API: $16,459)
[8/197] ❌ South Christchurch Community Trust                 (CC37844)
     ⚠️  Total Income: 1.53% diff (Local: $1,800 vs API: $1,828)
     ⚠️  Total Expenditure: 1.98% diff (Local: $1,600 vs API: $1,569)
[9/197] ✅ New Zealand Cadet And GEMS National Board          (CC42935)
[10/197] ❌ Saint Davids Memorial Church Fund                  (CC60534)
     ⚠️  Total Income: 2.76% diff (Local: $1,200 vs API: $1,234)
     ⚠️  Total Expenditure: 0.33% diff (Local: $1,200 vs API: $1,204)
[11/197] ✅ Pacific Cooperation Broadcasting Trust             (CC70229)
[12/197] ❌ Rail Heritage Trust of New Zealand                 (CC57770)
     ⚠️  Net Surplus/Deficit: 0.23% diff (Local: $13,800 vs API: $13,832)
[13/197] ✅ Rangitane Investments Limited                      (CC34560)
[14/197] ✅ Safe Network Charitable Trust                      (CC66418)
[15/197] ✅ Sarjeant Gallery Trust Board                       (CC47549)
[16/197] ✅ South Canterbury Free Kindergarten Association Inc (CC39060)
[17/197] ✅ St Margaret's College Foundation Trust             (CC64733)
[18/197] ✅ Tauranga Baptist Church Trust                      (CC51533)
[19/197] ✅ Te Hauora o Turanganui a Kiwa Limited              (CC58143)
[20/197] ✅ The Royal Australasian College of Physicians       (CC44184)
[21/197] ❌ The Suter Art Gallery Te Aratoi o Whakatu Trust    (CC52008)
     ⚠️  Total Income: 0.31% diff (Local: $1,480,000 vs API: $1,475,496)
[22/197] ✅ Thorrington Village Limited                        (CC66210)
[23/197] ❌ Volunteer Service Abroad Te Tuao Tawahi Incorporat (CC42253)
     ⚠️  Net Surplus/Deficit: 0.28% diff (Local: -$2,500 vs API: -$2,493)
[24/197] ✅ Whaiora Marae Maori Catholic Society Incorporated  (CC69557)
[25/197] ✅ Ageplus Charitable Trust                           (CC38478)
[26/197] ✅ Alexandra Elim Church Trust                        (CC46840)
[27/197] ✅ Anglican Diocese of Christchurch Parish of Fendalt (CC66348)
[28/197] ❌ Aotearoa Refugee Support Trust                     (CC51240)
     ⚠️  Total Expenditure: 0.28% diff (Local: $1,020,000 vs API: $1,022,913)
[29/197] ❌ Aotearoa Youth Leadership Institute                (CC34744)
     ⚠️  Net Surplus/Deficit: 0.24% diff (Local: $7,000 vs API: $6,983)
[30/197] ✅ Aranui Marae                                       (CC65344)
[31/197] ✅ Ark Resources Limited                              (CC67894)
[32/197] ❌ Assembly of God (Papakura) Trust Board             (CC55407)
     ⚠️  Net Surplus/Deficit: 0.47% diff (Local: $7,400 vs API: $7,435)
[33/197] ✅ Atawhai Community Church                           (CC53937)
[34/197] ✅ Auckland Volunteer Fire Brigade Inc                (CC58962)
[35/197] ❌ BACS Trust Board                                   (CC66961)
     ⚠️  Total Expenditure: 0.41% diff (Local: $11,400 vs API: $11,353)
     ⚠️  Net Surplus/Deficit: 0.29% diff (Local: $12,900 vs API: $12,863)
[36/197] ❌ BATS Theatre Limited                               (CC67699)
     ⚠️  Total Income: 0.33% diff (Local: $1,060,000 vs API: $1,056,501)
     ⚠️  Total Expenditure: 0.27% diff (Local: $1,160,000 vs API: $1,163,178)
[37/197] ❌ Battalion Jiu-Jitsu Incorporated                   (CC70612)
     ⚠️  Net Surplus/Deficit: 0.29% diff (Local: -$16,400 vs API: -$16,352)
[38/197] ✅ Bay Bush Action Trust                              (CC37304)
[39/197] ❌ Belfast Community Network Inc                      (CC52830)
     ⚠️  Net Surplus/Deficit: 0.21% diff (Local: -$21,800 vs API: -$21,755)
[40/197] ❌ Bethlehem Primary School Parent Teacher Associatio (CC44188)
     ⚠️  Total Income: 0.43% diff (Local: $11,100 vs API: $11,053)
[41/197] ✅ Birthright Wellington Incorporated                 (CC59464)
[42/197] ✅ Bowen Trust Board                                  (CC60365)
[43/197] ✅ Bread of Life Christian Church - Spring of Grace T (CC62412)
[44/197] ❌ CANTERBURY ROYAL COMMONWEALTH SOCIETY CHARITABLE T (CC33388)
     ⚠️  Total Income: 0.32% diff (Local: $10,300 vs API: $10,333)
[45/197] ❌ Cambridge Bowling Club Incorporated                (CC35831)
     ⚠️  Net Surplus/Deficit: 0.28% diff (Local: -$6,700 vs API: -$6,681)
[46/197] ❌ Capital Care Trust Board                           (CC55101)
     ⚠️  Total Expenditure: 0.22% diff (Local: $1,150,000 vs API: $1,147,478)
     ⚠️  Net Surplus/Deficit: 0.54% diff (Local: -$7,700 vs API: -$7,659)
[47/197] ❌ Chambers Memorial Trust                            (CC53008)
     ⚠️  Net Surplus/Deficit: 0.69% diff (Local: -$4,200 vs API: -$4,229)
[48/197] ✅ Christchurch Korean Full Gospel Church (Assembly o (CC47234)
[49/197] ✅ Christchurch Music Theatre Education Trust         (CC52518)
[50/197] ❌ Christian Literature Ministries                    (CC64753)
     ⚠️  Total Expenditure: 0.63% diff (Local: $7,600 vs API: $7,648)
[51/197] ✅ CityLife New Plymouth Trust                        (CC47775)
[52/197] ✅ Claude McCarthy Trust                              (CC41128)
[53/197] ✅ Cleansing Stream Ministries - New Zealand Trust Bo (CC54699)
[54/197] ✅ Community House (Whanganui) Association Incorporat (CC42968)
[55/197] ✅ D65 Trust                                          (CC71259)
[56/197] ❌ Dalton Trust                                       (CC34382)
     ⚠️  Net Surplus/Deficit: 0.22% diff (Local: -$15,400 vs API: -$15,366)
[57/197] ✅ Directors Cancer Research Trust                    (CC57819)
[58/197] ✅ Dunstan Golf Club Incorporated                     (CC34074)
[59/197] ❌ Eastern Bay Of Plenty Regional Economic Developmen (CC46051)
     ⚠️  Total Expenditure: 0.30% diff (Local: $1,050,000 vs API: $1,046,850)
     ⚠️  Total Assets: 0.35% diff (Local: $1,030,000 vs API: $1,033,666)
[60/197] ✅ Education Sponsorship Trust                        (CC54780)
[61/197] ✅ Elim Church Christchurch City Trust                (CC54521)
[62/197] ✅ Elsie & Ray Armstrong Charitable Trust             (CC55601)
[63/197] ✅ Emergency Alliance                                 (CC74631)
[64/197] ❌ Equippers Timaru                                   (CC69814)
     ⚠️  Total Income: 1.03% diff (Local: $2,700 vs API: $2,728)
[65/197] ✅ European Christian Mission New Zealand             (CC41452)
[66/197] ❌ Evangelise China Fellowship New Zealand Charitable (CC54809)
     ⚠️  Net Surplus/Deficit: 0.65% diff (Local: $4,100 vs API: $4,127)
[67/197] ✅ Falkenstein AUT Charitable Trust                   (CC62969)
[68/197] ❌ Feilding Playcentre                                (CC61139)
     ⚠️  Net Surplus/Deficit: 2.85% diff (Local: $1,300 vs API: $1,264)
[69/197] ❌ Fountain of Peace Children's Foundation New Zealan (CC32900)
     ⚠️  Net Surplus/Deficit: 1.12% diff (Local: -$1,800 vs API: -$1,780)
[70/197] ✅ Fountainblue Limited                               (CC69796)
[71/197] ✅ Friends of Bullock Creek Trust                     (CC75420)
[72/197] ✅ Gisborne Volunteer Centre                          (CC55057)
[73/197] ✅ Grace Bible Church Dunedin Trust                   (CC34181)
[74/197] ✅ Grace Christian Trust Napier                       (CC68043)
[75/197] ✅ Gracebooks Community Trust                         (CC61184)
[76/197] ✅ Graeme Dingle Foundation Southern                  (CC59736)
[77/197] ❌ Haleema Kindergarten Trust                         (CC36097)
     ⚠️  Net Surplus/Deficit: 1.19% diff (Local: -$1,700 vs API: -$1,680)
[78/197] ✅ Hamilton Arts Trust                                (CC35351)
[79/197] ✅ Hastings Christadelphian Ecclesia Central Fellowsh (CC44869)
[80/197] ❌ He Whenua Taurikura - National Centre of Research  (CC74544)
     ⚠️  Total Assets: 0.28% diff (Local: $1,580,000 vs API: $1,584,363)
[81/197] ✅ Herne Bay Playcentre                               (CC49590)
[82/197] ❌ Home & Family Charitable Trust                     (CC73686)
     ⚠️  Total Income: 0.27% diff (Local: $1,850,000 vs API: $1,854,955)
     ⚠️  Total Assets: 0.24% diff (Local: $1,910,000 vs API: $1,905,426)
[83/197] ✅ Hot Water Beach Lifeguard Service Incorporated     (CC39530)
[84/197] ✅ Howick Presbyterian Church                         (CC65810)
[85/197] ✅ IARC Charitable Trust                              (CC38996)
[86/197] ✅ Invercargill Elim Community Church Trust           (CC33592)
[87/197] ✅ John McGlashan College Charitable Trust            (CC55776)
[88/197] ❌ Just Atelier Trust                                 (CC71851)
     ⚠️  Net Surplus/Deficit: 0.21% diff (Local: $12,100 vs API: $12,075)
[89/197] ❌ Kaiapoi Co-Operating Parish Methodist-Presbyterian (CC57514)
     ⚠️  Total Assets: 0.22% diff (Local: $1,650,000 vs API: $1,653,614)
[90/197] ✅ Karangahape Marae Trust                            (CC54370)
[91/197] ✅ Kauri Coast Community Pool Trust                   (CC55444)
[92/197] ✅ Kiddy Winks Kindy Trust                            (CC39710)
[93/197] ✅ Korou Digital (Charitable) Trust                   (CC72548)
[94/197] ✅ Kotahitanga Charitable Trust                       (CC33722)
[95/197] ❌ Kōrero Mai Charitable Trust                        (CC73588)
     ⚠️  Total Assets: 0.24% diff (Local: $1,170,000 vs API: $1,167,182)
[96/197] ❌ Lions Club of Kapakapanui Charitable Trust         (CC43657)
     ⚠️  Net Surplus/Deficit: 0.82% diff (Local: $2,100 vs API: $2,083)
     ⚠️  Total Assets: 0.89% diff (Local: $4,100 vs API: $4,064)
[97/197] ✅ Live For More Charitable Trust                     (CC66188)
[98/197] ✅ Living Water Worship Centre Christian Church       (CC69805)
[99/197] ✅ Living Waters Wesleyan Church                      (CC48315)
[100/197] ❌ M A Tonkinson Charitable Trust                     (CC51826)
     ⚠️  Net Surplus/Deficit: 0.54% diff (Local: -$2,800 vs API: -$2,785)
[101/197] ✅ M. E. Armitage Charitable Trust                    (CC56416)
[102/197] ❌ METHODIST CHURCH SAMOA (NEW ZEALAND) OTAHUHU PARIS (CC67149)
     ⚠️  Total Assets: 0.22% diff (Local: $2,130,000 vs API: $2,125,371)
[103/197] ✅ Maca Sports Leadership Charitable Trust            (CC73000)
[104/197] ✅ Manaaki Rangatahi                                  (CC74251)
[105/197] ✅ Mangawhai Golf Club Incorporated                   (CC67556)
[106/197] ✅ Mangere Congregation Church Of Jesus Trust Board   (CC57309)
[107/197] ✅ Manukau Hope Trust                                 (CC42614)
[108/197] ✅ Marian School PTFA                                 (CC38392)
[109/197] ✅ Maxim Institute                                    (CC39618)
[110/197] ✅ Moteo Marae                                        (CC50146)
[111/197] ❌ Motueka Events Charitable Trust                    (CC50340)
     ⚠️  Net Surplus/Deficit: 2.28% diff (Local: -$2,100 vs API: -$2,149)
     ⚠️  Total Assets: 0.44% diff (Local: $11,000 vs API: $10,952)
[112/197] ✅ Mount Roskill Islamic Trust                        (CC38115)
[113/197] ❌ Mountainview High School Parent Teacher Associatio (CC46772)
     ⚠️  Total Income: 4.07% diff (Local: $1,100 vs API: $1,057)
[114/197] ✅ National Science Technology Roadshow Trust Board   (CC42402)
[115/197] ✅ Neuroendocrine Cancer New Zealand                  (CC33598)
[116/197] ✅ New Zealand Epoch Times Limited                    (CC61551)
[117/197] ✅ New Zealand Methodist Women's Fellowship           (CC65026)
[118/197] ❌ New Zealand Sikh Womens Association Incorporated   (CC56253)
     ⚠️  Net Surplus/Deficit: 0.22% diff (Local: $20,200 vs API: $20,156)
[119/197] ✅ Ngaruawahia Community House Incorporated           (CC50999)
[120/197] ✅ Ngati Rangatahi Whanaunga (Association)            (CC43846)
[121/197] ✅ Ngati Rarua Wahi Mahi Limited                      (CC34336)
[122/197] ✅ North Harbour Touch Association Incorporated       (CC63075)
[123/197] ❌ Otatara Community Centre Trust                     (CC64785)
     ⚠️  Net Surplus/Deficit: 1.51% diff (Local: -$2,800 vs API: -$2,843)
[124/197] ✅ Otautahi Women's Refuge Incorporated               (CC32592)
[125/197] ✅ Oxford Community Trust                             (CC39084)
[126/197] ❌ Palmerston North Jaycee Trust                      (CC44500)
     ⚠️  Total Income: 0.40% diff (Local: $6,200 vs API: $6,225)
     ⚠️  Total Expenditure: 0.40% diff (Local: $12,000 vs API: $11,952)
     ⚠️  Net Surplus/Deficit: 0.47% diff (Local: -$5,700 vs API: -$5,727)
[127/197] ❌ Papa O Te Aroha Marae Charitable Trust             (CC74794)
     ⚠️  Total Income: 0.41% diff (Local: $6,100 vs API: $6,125)
[128/197] ❌ Papakura Theatre Company Incorporated              (CC61345)
     ⚠️  Net Surplus/Deficit: 0.24% diff (Local: -$20,700 vs API: -$20,749)
[129/197] ❌ Petone Sportsville Incorporated                    (CC37635)
     ⚠️  Total Income: 0.22% diff (Local: $14,300 vs API: $14,332)
     ⚠️  Net Surplus/Deficit: 0.46% diff (Local: -$9,700 vs API: -$9,656)
     ⚠️  Total Assets: 0.30% diff (Local: $15,800 vs API: $15,847)
[130/197] ✅ Powerhouse Christian Trust                         (CC42054)
[131/197] ✅ RBC Ministries New Zealand Trust                   (CC41195)
[132/197] ✅ Rangitikei Environment Group Incorporated          (CC39374)
[133/197] ❌ Rape and Abuse Support Centre Southland Incorporat (CC44429)
     ⚠️  Total Income: 0.21% diff (Local: $1,280,000 vs API: $1,282,729)
     ⚠️  Total Expenditure: 0.38% diff (Local: $1,180,000 vs API: $1,184,524)
[134/197] ✅ Robert McIsaac Charitable Trust                    (CC39000)
[135/197] ✅ Rotorua Rowing Club Incorporated                   (CC65877)
[136/197] ✅ Royal Academy of Dance                             (CC54051)
[137/197] ✅ Samaritans Of Wellington Incorporated              (CC49526)
[138/197] ✅ Seaside Charitable Trust                           (CC58671)
[139/197] ✅ Servants Health Centre Trust                       (CC63662)
[140/197] ❌ South Island Kokako Charitable Trust               (CC37574)
     ⚠️  Total Income: 0.49% diff (Local: $10,300 vs API: $10,250)
     ⚠️  Net Surplus/Deficit: 1.21% diff (Local: -$3,500 vs API: -$3,543)
[141/197] ❌ South Marlborough Landscape Restoration Trust      (CC69272)
     ⚠️  Net Surplus/Deficit: 0.72% diff (Local: $6,300 vs API: $6,255)
[142/197] ✅ St James Union Parish Church Greerton              (CC56729)
[143/197] ✅ St Laurence's Social Service Trust Board           (CC44517)
[144/197] ✅ St Mary's Parish, Paeroa                           (CC59658)
[145/197] ✅ St Paul's Co-operating Church Papamoa              (CC56735)
[146/197] ✅ Stratford  Baptist Church                          (CC39858)
[147/197] ✅ TARAMEA FRAGRANCE LIMITED                          (CC71137)
[148/197] ✅ TUCKER BEACH WILDLIFE TRUST                        (CC75642)
[149/197] ❌ Ta Tupu Foundation Trust                           (CC71284)
     ⚠️  Total Income: 0.74% diff (Local: $5,500 vs API: $5,541)
     ⚠️  Net Surplus/Deficit: 0.41% diff (Local: -$6,600 vs API: -$6,573)
[150/197] ❌ Taumata O Tapuhi Marae                             (CC45794)
     ⚠️  Total Expenditure: 0.20% diff (Local: $13,200 vs API: $13,227)
     ⚠️  Net Surplus/Deficit: 0.36% diff (Local: -$3,300 vs API: -$3,312)
[151/197] ❌ Tauranga Budget Advisory Service Incorporated      (CC55630)
     ⚠️  Total Assets: 0.24% diff (Local: $1,290,000 vs API: $1,286,891)
[152/197] ✅ Te Awhina Tangata                                  (CC52989)
[153/197] ✅ Te Hui Amorangi Ki Te Manawa O Te Wheke Trust Boar (CC45799)
[154/197] ✅ Te Kapua Whakapipi Charitable Trust                (CC71946)
[155/197] ✅ Te Kōwhatu Tū Moana Trust                          (CC73517)
[156/197] ✅ Te Maori Manaaki Taonga Trust                      (CC46798)
[157/197] ✅ Te Ora Hou Ōtautahi Incorporated                   (CC39114)
[158/197] ✅ Te Ropu Marutau o Aotearoa                         (CC73889)
[159/197] ❌ Te Whaiti-Nui-A-Toi Trust                          (CC63747)
     ⚠️  Total Assets: 0.22% diff (Local: $1,310,000 vs API: $1,307,131)
[160/197] ❌ Te Whare Aio - Maori Women's Refuge Incorporated   (CC71071)
     ⚠️  Total Expenditure: 0.43% diff (Local: $1,110,000 vs API: $1,114,800)
[161/197] ✅ Ted Manson Charitable Trust                        (CC34629)
[162/197] ✅ Temple Basin Ski Club Incorporated                 (CC50164)
[163/197] ❌ Tennis Otago Incorporated                          (CC50485)
     ⚠️  Total Assets: 0.29% diff (Local: $1,440,000 vs API: $1,435,902)
[164/197] ✅ The Bay Of Whales Childrens Trust Incorporated     (CC52834)
[165/197] ✅ The Community Of The Sacred Name Society Or Trust  (CC39309)
[166/197] ✅ The Congregational Christian Church of Samoa (Bloc (CC44078)
[167/197] ❌ The Frank & Margaret Whiteley Charitable Trust     (CC36083)
     ⚠️  Net Surplus/Deficit: 0.26% diff (Local: $7,700 vs API: $7,720)
[168/197] ❌ The Good Collective Limited                        (CC69232)
     ⚠️  Net Surplus/Deficit: 0.49% diff (Local: -$8,000 vs API: -$7,961)
[169/197] ❌ The Jabez Initiative Limited                       (CC75084)
     ⚠️  Total Income: 0.36% diff (Local: $1,230,000 vs API: $1,225,548)
     ⚠️  Total Assets: 0.30% diff (Local: $1,210,000 vs API: $1,213,664)
[170/197] ✅ The Kaitaia Community House Society Incorporated   (CC39042)
[171/197] ✅ The Leedstown Trust                                (CC41952)
[172/197] ✅ The Methodist Church Of New Zealand Te Haahi Weter (CC40288)
[173/197] ✅ The New Zealand Resident Doctors Association Educa (CC47518)
[174/197] ❌ The Phil Lamason Heritage Centre Trust Incorporate (CC65803)
     ⚠️  Total Expenditure: 0.66% diff (Local: $4,900 vs API: $4,868)
[175/197] ❌ The Psalm 2:8 Trust                                (CC63814)
     ⚠️  Net Surplus/Deficit: 0.34% diff (Local: -$9,100 vs API: -$9,131)
[176/197] ❌ The Rotorua Branch of The Royal New Zealand Societ (CC60304)
     ⚠️  Total Assets: 0.42% diff (Local: $1,030,000 vs API: $1,034,342)
[177/197] ✅ The South Canterbury Drama League Incorporated     (CC35500)
[178/197] ✅ The South Island (Te Waipounamu) Branch of the Mus (CC53064)
[179/197] ❌ The Talking Matters Charitable Trust               (CC73747)
     ⚠️  Total Income: 0.38% diff (Local: $1,050,000 vs API: $1,046,033)
[180/197] ❌ The Tauranga Community Trust                       (CC68405)
     ⚠️  Total Expenditure: 1.14% diff (Local: $3,200 vs API: $3,237)
     ⚠️  Net Surplus/Deficit: 0.26% diff (Local: $13,100 vs API: $13,134)
[181/197] ✅ Titirangi Baptist Church                           (CC40234)
[182/197] ❌ Tokelauan Congregational Christian Church Trust Bo (CC38533)
     ⚠️  Total Assets: 0.30% diff (Local: $1,410,000 vs API: $1,405,784)
[183/197] ❌ Transport Research and Educational Trust Board     (CC60262)
     ⚠️  Total Income: 0.22% diff (Local: $13,200 vs API: $13,229)
     ⚠️  Total Expenditure: 0.23% diff (Local: $8,500 vs API: $8,520)
[184/197] ✅ Trinity Ministries Incorporated                    (CC52675)
[185/197] ❌ Tryphina House Whangarei Women's Refuge Incorporat (CC51972)
     ⚠️  Net Surplus/Deficit: 0.67% diff (Local: $3,300 vs API: $3,278)
[186/197] ❌ Vincent House Trust                                (CC42095)
     ⚠️  Total Income: 0.42% diff (Local: $1,120,000 vs API: $1,124,738)
     ⚠️  Total Expenditure: 0.35% diff (Local: $1,300,000 vs API: $1,295,468)
[187/197] ❌ Vogelmorn Community Group Charitable Trust         (CC69425)
     ⚠️  Net Surplus/Deficit: 0.70% diff (Local: -$6,800 vs API: -$6,753)
[188/197] ✅ W Crighton Charitable Co Ltd                       (CC55319)
[189/197] ✅ W and W.A.R Fraser Charitable Trust                (CC41593)
[190/197] ✅ Waikato City Assembly of God Trust Board           (CC54887)
[191/197] ❌ Waikowhai Community Trust                          (CC53916)
     ⚠️  Net Surplus/Deficit: 2.79% diff (Local: $1,400 vs API: $1,362)
[192/197] ✅ Waipa Community Trust                              (CC52867)
[193/197] ❌ Wellington College Old Boys Association Incorporat (CC61599)
     ⚠️  Net Surplus/Deficit: 1.09% diff (Local: -$4,000 vs API: -$4,044)
[194/197] ❌ Western Bay Heritage Trust Board                   (CC66866)
     ⚠️  Net Surplus/Deficit: 0.34% diff (Local: -$8,200 vs API: -$8,228)
[195/197] ✅ Whangamata Baptist Church                          (CC41938)
[196/197] ✅ Whanganui Enterprises Trust                        (CC57233)
[197/197] ✅ Whangarei Native Bird Recovery Centre Incorporated (CC52743)


⏱️  Audit completed in 11.4 minutes


████████████████████████████████████████████████████████████████████████████████████████████████████
200 CHARITY AUDIT - COMPREHENSIVE REPORT
████████████████████████████████████████████████████████████████████████████████████████████████████

📊 OVERALL STATISTICS:
   Total Charities Tested: 197
   ✅ Perfect Match:      127 (64.5%)
   ❌ Discrepancies:      70 (35.5%)
   ⚠️  Errors:             0 (0.0%)

💰 FINANCIAL SCOPE:
   Total Income Audited: $224,240,441

📈 ACCURACY RATE: 64.47%


❌ FAILED AUDITS (70):
────────────────────────────────────────────────────────────────────────────────────────────────────

1. Te Hui Amorangi Ki Te Tairawhiti Trust Board (CC45497)
   ⚠️  Net Surplus/Deficit: 0.48% difference
       Localhost: -$3,700
       Official:  -$3,718

2. Manukau Concert Band Incorporated (CC51543)
   ⚠️  Net Surplus/Deficit: 0.32% difference
       Localhost: -$11,500
       Official:  -$11,463

3. Ruahine Playhouse (CC42815)
   ⚠️  Total Income: 1.92% difference
       Localhost: $2,200
       Official:  $2,243
   ⚠️  Total Assets: 0.62% difference
       Localhost: $3,100
       Official:  $3,081

4. Rotary Club of Botany East Tamaki Charitable Trust (CC44324)
   ⚠️  Total Expenditure: 0.41% difference
       Localhost: $3,200
       Official:  $3,187
   ⚠️  Total Assets: 0.25% difference
       Localhost: $16,500
       Official:  $16,459

5. South Christchurch Community Trust (CC37844)
   ⚠️  Total Income: 1.53% difference
       Localhost: $1,800
       Official:  $1,828
   ⚠️  Total Expenditure: 1.98% difference
       Localhost: $1,600
       Official:  $1,569

6. Saint Davids Memorial Church Fund (CC60534)
   ⚠️  Total Income: 2.76% difference
       Localhost: $1,200
       Official:  $1,234
   ⚠️  Total Expenditure: 0.33% difference
       Localhost: $1,200
       Official:  $1,204

7. Rail Heritage Trust of New Zealand (CC57770)
   ⚠️  Net Surplus/Deficit: 0.23% difference
       Localhost: $13,800
       Official:  $13,832

8. The Suter Art Gallery Te Aratoi o Whakatu Trust (CC52008)
   ⚠️  Total Income: 0.31% difference
       Localhost: $1,480,000
       Official:  $1,475,496

9. Volunteer Service Abroad Te Tuao Tawahi Incorporated (CC42253)
   ⚠️  Net Surplus/Deficit: 0.28% difference
       Localhost: -$2,500
       Official:  -$2,493

10. Aotearoa Refugee Support Trust (CC51240)
   ⚠️  Total Expenditure: 0.28% difference
       Localhost: $1,020,000
       Official:  $1,022,913

11. Aotearoa Youth Leadership Institute (CC34744)
   ⚠️  Net Surplus/Deficit: 0.24% difference
       Localhost: $7,000
       Official:  $6,983

12. Assembly of God (Papakura) Trust Board (CC55407)
   ⚠️  Net Surplus/Deficit: 0.47% difference
       Localhost: $7,400
       Official:  $7,435

13. BACS Trust Board (CC66961)
   ⚠️  Total Expenditure: 0.41% difference
       Localhost: $11,400
       Official:  $11,353
   ⚠️  Net Surplus/Deficit: 0.29% difference
       Localhost: $12,900
       Official:  $12,863

14. BATS Theatre Limited (CC67699)
   ⚠️  Total Income: 0.33% difference
       Localhost: $1,060,000
       Official:  $1,056,501
   ⚠️  Total Expenditure: 0.27% difference
       Localhost: $1,160,000
       Official:  $1,163,178

15. Battalion Jiu-Jitsu Incorporated (CC70612)
   ⚠️  Net Surplus/Deficit: 0.29% difference
       Localhost: -$16,400
       Official:  -$16,352

16. Belfast Community Network Inc (CC52830)
   ⚠️  Net Surplus/Deficit: 0.21% difference
       Localhost: -$21,800
       Official:  -$21,755

17. Bethlehem Primary School Parent Teacher Association (CC44188)
   ⚠️  Total Income: 0.43% difference
       Localhost: $11,100
       Official:  $11,053

18. CANTERBURY ROYAL COMMONWEALTH SOCIETY CHARITABLE TRUST (CC33388)
   ⚠️  Total Income: 0.32% difference
       Localhost: $10,300
       Official:  $10,333

19. Cambridge Bowling Club Incorporated (CC35831)
   ⚠️  Net Surplus/Deficit: 0.28% difference
       Localhost: -$6,700
       Official:  -$6,681

20. Capital Care Trust Board (CC55101)
   ⚠️  Total Expenditure: 0.22% difference
       Localhost: $1,150,000
       Official:  $1,147,478
   ⚠️  Net Surplus/Deficit: 0.54% difference
       Localhost: -$7,700
       Official:  -$7,659

21. Chambers Memorial Trust (CC53008)
   ⚠️  Net Surplus/Deficit: 0.69% difference
       Localhost: -$4,200
       Official:  -$4,229

22. Christian Literature Ministries (CC64753)
   ⚠️  Total Expenditure: 0.63% difference
       Localhost: $7,600
       Official:  $7,648

23. Dalton Trust (CC34382)
   ⚠️  Net Surplus/Deficit: 0.22% difference
       Localhost: -$15,400
       Official:  -$15,366

24. Eastern Bay Of Plenty Regional Economic Development Trust (CC46051)
   ⚠️  Total Expenditure: 0.30% difference
       Localhost: $1,050,000
       Official:  $1,046,850
   ⚠️  Total Assets: 0.35% difference
       Localhost: $1,030,000
       Official:  $1,033,666

25. Equippers Timaru (CC69814)
   ⚠️  Total Income: 1.03% difference
       Localhost: $2,700
       Official:  $2,728

26. Evangelise China Fellowship New Zealand Charitable Trust (CC54809)
   ⚠️  Net Surplus/Deficit: 0.65% difference
       Localhost: $4,100
       Official:  $4,127

27. Feilding Playcentre (CC61139)
   ⚠️  Net Surplus/Deficit: 2.85% difference
       Localhost: $1,300
       Official:  $1,264

28. Fountain of Peace Children's Foundation New Zealand (CC32900)
   ⚠️  Net Surplus/Deficit: 1.12% difference
       Localhost: -$1,800
       Official:  -$1,780

29. Haleema Kindergarten Trust (CC36097)
   ⚠️  Net Surplus/Deficit: 1.19% difference
       Localhost: -$1,700
       Official:  -$1,680

30. He Whenua Taurikura - National Centre of Research Excellence (CC74544)
   ⚠️  Total Assets: 0.28% difference
       Localhost: $1,580,000
       Official:  $1,584,363

31. Home & Family Charitable Trust (CC73686)
   ⚠️  Total Income: 0.27% difference
       Localhost: $1,850,000
       Official:  $1,854,955
   ⚠️  Total Assets: 0.24% difference
       Localhost: $1,910,000
       Official:  $1,905,426

32. Just Atelier Trust (CC71851)
   ⚠️  Net Surplus/Deficit: 0.21% difference
       Localhost: $12,100
       Official:  $12,075

33. Kaiapoi Co-Operating Parish Methodist-Presbyterian (CC57514)
   ⚠️  Total Assets: 0.22% difference
       Localhost: $1,650,000
       Official:  $1,653,614

34. Kōrero Mai Charitable Trust (CC73588)
   ⚠️  Total Assets: 0.24% difference
       Localhost: $1,170,000
       Official:  $1,167,182

35. Lions Club of Kapakapanui Charitable Trust (CC43657)
   ⚠️  Net Surplus/Deficit: 0.82% difference
       Localhost: $2,100
       Official:  $2,083
   ⚠️  Total Assets: 0.89% difference
       Localhost: $4,100
       Official:  $4,064

36. M A Tonkinson Charitable Trust (CC51826)
   ⚠️  Net Surplus/Deficit: 0.54% difference
       Localhost: -$2,800
       Official:  -$2,785

37. METHODIST CHURCH SAMOA (NEW ZEALAND) OTAHUHU PARISH (CC67149)
   ⚠️  Total Assets: 0.22% difference
       Localhost: $2,130,000
       Official:  $2,125,371

38. Motueka Events Charitable Trust (CC50340)
   ⚠️  Net Surplus/Deficit: 2.28% difference
       Localhost: -$2,100
       Official:  -$2,149
   ⚠️  Total Assets: 0.44% difference
       Localhost: $11,000
       Official:  $10,952

39. Mountainview High School Parent Teacher Association (CC46772)
   ⚠️  Total Income: 4.07% difference
       Localhost: $1,100
       Official:  $1,057

40. New Zealand Sikh Womens Association Incorporated (CC56253)
   ⚠️  Net Surplus/Deficit: 0.22% difference
       Localhost: $20,200
       Official:  $20,156

41. Otatara Community Centre Trust (CC64785)
   ⚠️  Net Surplus/Deficit: 1.51% difference
       Localhost: -$2,800
       Official:  -$2,843

42. Palmerston North Jaycee Trust (CC44500)
   ⚠️  Total Income: 0.40% difference
       Localhost: $6,200
       Official:  $6,225
   ⚠️  Total Expenditure: 0.40% difference
       Localhost: $12,000
       Official:  $11,952
   ⚠️  Net Surplus/Deficit: 0.47% difference
       Localhost: -$5,700
       Official:  -$5,727

43. Papa O Te Aroha Marae Charitable Trust (CC74794)
   ⚠️  Total Income: 0.41% difference
       Localhost: $6,100
       Official:  $6,125

44. Papakura Theatre Company Incorporated (CC61345)
   ⚠️  Net Surplus/Deficit: 0.24% difference
       Localhost: -$20,700
       Official:  -$20,749

45. Petone Sportsville Incorporated (CC37635)
   ⚠️  Total Income: 0.22% difference
       Localhost: $14,300
       Official:  $14,332
   ⚠️  Net Surplus/Deficit: 0.46% difference
       Localhost: -$9,700
       Official:  -$9,656
   ⚠️  Total Assets: 0.30% difference
       Localhost: $15,800
       Official:  $15,847

46. Rape and Abuse Support Centre Southland Incorporated (CC44429)
   ⚠️  Total Income: 0.21% difference
       Localhost: $1,280,000
       Official:  $1,282,729
   ⚠️  Total Expenditure: 0.38% difference
       Localhost: $1,180,000
       Official:  $1,184,524

47. South Island Kokako Charitable Trust (CC37574)
   ⚠️  Total Income: 0.49% difference
       Localhost: $10,300
       Official:  $10,250
   ⚠️  Net Surplus/Deficit: 1.21% difference
       Localhost: -$3,500
       Official:  -$3,543

48. South Marlborough Landscape Restoration Trust (CC69272)
   ⚠️  Net Surplus/Deficit: 0.72% difference
       Localhost: $6,300
       Official:  $6,255

49. Ta Tupu Foundation Trust (CC71284)
   ⚠️  Total Income: 0.74% difference
       Localhost: $5,500
       Official:  $5,541
   ⚠️  Net Surplus/Deficit: 0.41% difference
       Localhost: -$6,600
       Official:  -$6,573

50. Taumata O Tapuhi Marae (CC45794)
   ⚠️  Total Expenditure: 0.20% difference
       Localhost: $13,200
       Official:  $13,227
   ⚠️  Net Surplus/Deficit: 0.36% difference
       Localhost: -$3,300
       Official:  -$3,312

51. Tauranga Budget Advisory Service Incorporated (CC55630)
   ⚠️  Total Assets: 0.24% difference
       Localhost: $1,290,000
       Official:  $1,286,891

52. Te Whaiti-Nui-A-Toi Trust (CC63747)
   ⚠️  Total Assets: 0.22% difference
       Localhost: $1,310,000
       Official:  $1,307,131

53. Te Whare Aio - Maori Women's Refuge Incorporated (CC71071)
   ⚠️  Total Expenditure: 0.43% difference
       Localhost: $1,110,000
       Official:  $1,114,800

54. Tennis Otago Incorporated (CC50485)
   ⚠️  Total Assets: 0.29% difference
       Localhost: $1,440,000
       Official:  $1,435,902

55. The Frank & Margaret Whiteley Charitable Trust (CC36083)
   ⚠️  Net Surplus/Deficit: 0.26% difference
       Localhost: $7,700
       Official:  $7,720

56. The Good Collective Limited (CC69232)
   ⚠️  Net Surplus/Deficit: 0.49% difference
       Localhost: -$8,000
       Official:  -$7,961

57. The Jabez Initiative Limited (CC75084)
   ⚠️  Total Income: 0.36% difference
       Localhost: $1,230,000
       Official:  $1,225,548
   ⚠️  Total Assets: 0.30% difference
       Localhost: $1,210,000
       Official:  $1,213,664

58. The Phil Lamason Heritage Centre Trust Incorporated (CC65803)
   ⚠️  Total Expenditure: 0.66% difference
       Localhost: $4,900
       Official:  $4,868

59. The Psalm 2:8 Trust (CC63814)
   ⚠️  Net Surplus/Deficit: 0.34% difference
       Localhost: -$9,100
       Official:  -$9,131

60. The Rotorua Branch of The Royal New Zealand Society For The Prevention Of Cruelty To Animals Incorporated (CC60304)
   ⚠️  Total Assets: 0.42% difference
       Localhost: $1,030,000
       Official:  $1,034,342

61. The Talking Matters Charitable Trust (CC73747)
   ⚠️  Total Income: 0.38% difference
       Localhost: $1,050,000
       Official:  $1,046,033

62. The Tauranga Community Trust (CC68405)
   ⚠️  Total Expenditure: 1.14% difference
       Localhost: $3,200
       Official:  $3,237
   ⚠️  Net Surplus/Deficit: 0.26% difference
       Localhost: $13,100
       Official:  $13,134

63. Tokelauan Congregational Christian Church Trust Board (CC38533)
   ⚠️  Total Assets: 0.30% difference
       Localhost: $1,410,000
       Official:  $1,405,784

64. Transport Research and Educational Trust Board (CC60262)
   ⚠️  Total Income: 0.22% difference
       Localhost: $13,200
       Official:  $13,229
   ⚠️  Total Expenditure: 0.23% difference
       Localhost: $8,500
       Official:  $8,520

65. Tryphina House Whangarei Women's Refuge Incorporated (CC51972)
   ⚠️  Net Surplus/Deficit: 0.67% difference
       Localhost: $3,300
       Official:  $3,278

66. Vincent House Trust (CC42095)
   ⚠️  Total Income: 0.42% difference
       Localhost: $1,120,000
       Official:  $1,124,738
   ⚠️  Total Expenditure: 0.35% difference
       Localhost: $1,300,000
       Official:  $1,295,468

67. Vogelmorn Community Group Charitable Trust (CC69425)
   ⚠️  Net Surplus/Deficit: 0.70% difference
       Localhost: -$6,800
       Official:  -$6,753

68. Waikowhai Community Trust (CC53916)
   ⚠️  Net Surplus/Deficit: 2.79% difference
       Localhost: $1,400
       Official:  $1,362

69. Wellington College Old Boys Association Incorporated (CC61599)
   ⚠️  Net Surplus/Deficit: 1.09% difference
       Localhost: -$4,000
       Official:  -$4,044

70. Western Bay Heritage Trust Board (CC66866)
   ⚠️  Net Surplus/Deficit: 0.34% difference
       Localhost: -$8,200
       Official:  -$8,228


████████████████████████████████████████████████████████████████████████████████████████████████████
PRODUCTION READINESS VERDICT
████████████████████████████████████████████████████████████████████████████████████████████████████

⚠️  STATUS: NEEDS REVIEW

64.47% accuracy across 197 charities.
Some issues detected that should be investigated.

████████████████████████████████████████████████████████████████████████████████████████████████████

💾 Results saved to audit_200_results.json

