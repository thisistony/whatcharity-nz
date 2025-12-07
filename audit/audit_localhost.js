/**
 * Localhost Audit Script
 *
 * Fetches charity data from localhost:8000/api and displays:
 * - Income breakdown with coverage %
 * - Expenditure breakdown with coverage %
 * - PDF link for manual verification
 */

const TEST_CHARITIES = [
    { id: 58539, name: "Samoan Assembly Of God (Hamilton) Trust Board", tier: 3 },
    { id: 56541, name: "Waiora Community Trust (Taupo) Incorporated", tier: 3 },
    { id: 45497, name: "Te Hui Amorangi Ki Te Tairawhiti Trust Board", tier: 3 },
    { id: 51543, name: "Manukau Concert Band Incorporated", tier: 3 },
    { id: 42815, name: "Ruahine Playhouse", tier: 4 },
    { id: 38813, name: "Bay Reach Community Trust", tier: 4 },
    { id: 44324, name: "Rotary Club of Botany East Tamaki Charitable Trust", tier: 4 },
    { id: 37844, name: "South Christchurch Community Trust", tier: 4 },
    { id: 42935, name: "New Zealand Cadet And GEMS National Board", tier: 4 },
    { id: 60534, name: "Saint Davids Memorial Church Fund", tier: 4 },
];
    { id: 70229, name: "Pacific Cooperation Broadcasting Trust", tier: 2 },
    { id: 57770, name: "Rail Heritage Trust of New Zealand", tier: 2 },
    { id: 34560, name: "Rangitane Investments Limited", tier: 2 },
    { id: 66418, name: "Safe Network Charitable Trust", tier: 2 },
    { id: 47549, name: "Sarjeant Gallery Trust Board", tier: 2 },
    { id: 39060, name: "South Canterbury Free Kindergarten Association Incorporated", tier: 2 },
    { id: 64733, name: "St Margaret's College Foundation Trust", tier: 2 },
    { id: 51533, name: "Tauranga Baptist Church Trust", tier: 2 },
    { id: 58143, name: "Te Hauora o Turanganui a Kiwa Limited", tier: 2 },
    { id: 44184, name: "The Royal Australasian College of Physicians", tier: 2 },
    { id: 52008, name: "The Suter Art Gallery Te Aratoi o Whakatu Trust", tier: 2 },
    { id: 66210, name: "Thorrington Village Limited", tier: 2 },
    { id: 42253, name: "Volunteer Service Abroad Te Tuao Tawahi Incorporated", tier: 2 },
    { id: 69557, name: "Whaiora Marae Maori Catholic Society Incorporated", tier: 2 },
    { id: 38478, name: "Ageplus Charitable Trust", tier: 3 },
    { id: 46840, name: "Alexandra Elim Church Trust", tier: 3 },
    { id: 66348, name: "Anglican Diocese of Christchurch Parish of Fendalton", tier: 3 },
    { id: 51240, name: "Aotearoa Refugee Support Trust", tier: 3 },
    { id: 34744, name: "Aotearoa Youth Leadership Institute", tier: 3 },
    { id: 65344, name: "Aranui Marae", tier: 3 },
    { id: 67894, name: "Ark Resources Limited", tier: 3 },
    { id: 55407, name: "Assembly of God (Papakura) Trust Board", tier: 3 },
    { id: 53937, name: "Atawhai Community Church", tier: 3 },
    { id: 58962, name: "Auckland Volunteer Fire Brigade Inc", tier: 3 },
    { id: 66961, name: "BACS Trust Board", tier: 3 },
    { id: 67699, name: "BATS Theatre Limited", tier: 3 },
    { id: 70612, name: "Battalion Jiu-Jitsu Incorporated", tier: 3 },
    { id: 37304, name: "Bay Bush Action Trust", tier: 3 },
    { id: 52830, name: "Belfast Community Network Inc", tier: 3 },
    { id: 44188, name: "Bethlehem Primary School Parent Teacher Association", tier: 3 },
    { id: 59464, name: "Birthright Wellington Incorporated", tier: 3 },
    { id: 60365, name: "Bowen Trust Board", tier: 3 },
    { id: 62412, name: "Bread of Life Christian Church - Spring of Grace Trust", tier: 3 },
    { id: 33388, name: "CANTERBURY ROYAL COMMONWEALTH SOCIETY CHARITABLE TRUST", tier: 3 },
    { id: 35831, name: "Cambridge Bowling Club Incorporated", tier: 3 },
    { id: 55101, name: "Capital Care Trust Board", tier: 3 },
    { id: 53008, name: "Chambers Memorial Trust", tier: 3 },
    { id: 47234, name: "Christchurch Korean Full Gospel Church (Assembly of God) Trust Board", tier: 3 },
    { id: 52518, name: "Christchurch Music Theatre Education Trust", tier: 3 },
    { id: 64753, name: "Christian Literature Ministries", tier: 3 },
    { id: 47775, name: "CityLife New Plymouth Trust", tier: 3 },
    { id: 41128, name: "Claude McCarthy Trust", tier: 3 },
    { id: 54699, name: "Cleansing Stream Ministries - New Zealand Trust Board", tier: 3 },
    { id: 42968, name: "Community House (Whanganui) Association Incorporated", tier: 3 },
    { id: 71259, name: "D65 Trust", tier: 3 },
    { id: 34382, name: "Dalton Trust", tier: 3 },
    { id: 57819, name: "Directors Cancer Research Trust", tier: 3 },
    { id: 34074, name: "Dunstan Golf Club Incorporated", tier: 3 },
    { id: 46051, name: "Eastern Bay Of Plenty Regional Economic Development Trust", tier: 3 },
    { id: 54780, name: "Education Sponsorship Trust", tier: 3 },
    { id: 54521, name: "Elim Church Christchurch City Trust", tier: 3 },
    { id: 55601, name: "Elsie & Ray Armstrong Charitable Trust", tier: 3 },
    { id: 74631, name: "Emergency Alliance", tier: 3 },
    { id: 69814, name: "Equippers Timaru", tier: 3 },
    { id: 41452, name: "European Christian Mission New Zealand", tier: 3 },
    { id: 54809, name: "Evangelise China Fellowship New Zealand Charitable Trust", tier: 3 },
    { id: 62969, name: "Falkenstein AUT Charitable Trust", tier: 3 },
    { id: 61139, name: "Feilding Playcentre", tier: 3 },
    { id: 32900, name: "Fountain of Peace Children's Foundation New Zealand", tier: 3 },
    { id: 69796, name: "Fountainblue Limited", tier: 3 },
    { id: 75420, name: "Friends of Bullock Creek Trust", tier: 3 },
    { id: 55057, name: "Gisborne Volunteer Centre", tier: 3 },
    { id: 34181, name: "Grace Bible Church Dunedin Trust", tier: 3 },
    { id: 68043, name: "Grace Christian Trust Napier", tier: 3 },
    { id: 61184, name: "Gracebooks Community Trust", tier: 3 },
    { id: 59736, name: "Graeme Dingle Foundation Southern", tier: 3 },
    { id: 36097, name: "Haleema Kindergarten Trust", tier: 3 },
    { id: 35351, name: "Hamilton Arts Trust", tier: 3 },
    { id: 44869, name: "Hastings Christadelphian Ecclesia Central Fellowship", tier: 3 },
    { id: 74544, name: "He Whenua Taurikura - National Centre of Research Excellence", tier: 3 },
    { id: 49590, name: "Herne Bay Playcentre", tier: 3 },
    { id: 73686, name: "Home & Family Charitable Trust", tier: 3 },
    { id: 39530, name: "Hot Water Beach Lifeguard Service Incorporated", tier: 3 },
    { id: 65810, name: "Howick Presbyterian Church", tier: 3 },
    { id: 38996, name: "IARC Charitable Trust", tier: 3 },
    { id: 33592, name: "Invercargill Elim Community Church Trust", tier: 3 },
    { id: 55776, name: "John McGlashan College Charitable Trust", tier: 3 },
    { id: 71851, name: "Just Atelier Trust", tier: 3 },
    { id: 57514, name: "Kaiapoi Co-Operating Parish Methodist-Presbyterian", tier: 3 },
    { id: 54370, name: "Karangahape Marae Trust", tier: 3 },
    { id: 55444, name: "Kauri Coast Community Pool Trust", tier: 3 },
    { id: 39710, name: "Kiddy Winks Kindy Trust", tier: 3 },
    { id: 72548, name: "Korou Digital (Charitable) Trust", tier: 3 },
    { id: 33722, name: "Kotahitanga Charitable Trust", tier: 3 },
    { id: 73588, name: "Kōrero Mai Charitable Trust", tier: 3 },
    { id: 43657, name: "Lions Club of Kapakapanui Charitable Trust", tier: 3 },
    { id: 66188, name: "Live For More Charitable Trust", tier: 3 },
    { id: 69805, name: "Living Water Worship Centre Christian Church", tier: 3 },
    { id: 48315, name: "Living Waters Wesleyan Church", tier: 3 },
    { id: 51826, name: "M A Tonkinson Charitable Trust", tier: 3 },
    { id: 56416, name: "M. E. Armitage Charitable Trust", tier: 3 },
    { id: 67149, name: "METHODIST CHURCH SAMOA (NEW ZEALAND) OTAHUHU PARISH", tier: 3 },
    { id: 73000, name: "Maca Sports Leadership Charitable Trust", tier: 3 },
    { id: 74251, name: "Manaaki Rangatahi", tier: 3 },
    { id: 67556, name: "Mangawhai Golf Club Incorporated", tier: 3 },
    { id: 57309, name: "Mangere Congregation Church Of Jesus Trust Board", tier: 3 },
    { id: 42614, name: "Manukau Hope Trust", tier: 3 },
    { id: 38392, name: "Marian School PTFA", tier: 3 },
    { id: 39618, name: "Maxim Institute", tier: 3 },
    { id: 50146, name: "Moteo Marae", tier: 3 },
    { id: 50340, name: "Motueka Events Charitable Trust", tier: 3 },
    { id: 38115, name: "Mount Roskill Islamic Trust", tier: 3 },
    { id: 46772, name: "Mountainview High School Parent Teacher Association", tier: 3 },
    { id: 42402, name: "National Science Technology Roadshow Trust Board", tier: 3 },
    { id: 33598, name: "Neuroendocrine Cancer New Zealand", tier: 3 },
    { id: 61551, name: "New Zealand Epoch Times Limited", tier: 3 },
    { id: 65026, name: "New Zealand Methodist Women's Fellowship", tier: 3 },
    { id: 56253, name: "New Zealand Sikh Womens Association Incorporated", tier: 3 },
    { id: 50999, name: "Ngaruawahia Community House Incorporated", tier: 3 },
    { id: 43846, name: "Ngati Rangatahi Whanaunga (Association)", tier: 3 },
    { id: 34336, name: "Ngati Rarua Wahi Mahi Limited", tier: 3 },
    { id: 63075, name: "North Harbour Touch Association Incorporated", tier: 3 },
    { id: 64785, name: "Otatara Community Centre Trust", tier: 3 },
    { id: 32592, name: "Otautahi Women's Refuge Incorporated", tier: 3 },
    { id: 39084, name: "Oxford Community Trust", tier: 3 },
    { id: 44500, name: "Palmerston North Jaycee Trust", tier: 3 },
    { id: 74794, name: "Papa O Te Aroha Marae Charitable Trust", tier: 3 },
    { id: 61345, name: "Papakura Theatre Company Incorporated", tier: 3 },
    { id: 37635, name: "Petone Sportsville Incorporated", tier: 3 },
    { id: 42054, name: "Powerhouse Christian Trust", tier: 3 },
    { id: 41195, name: "RBC Ministries New Zealand Trust", tier: 3 },
    { id: 39374, name: "Rangitikei Environment Group Incorporated", tier: 3 },
    { id: 44429, name: "Rape and Abuse Support Centre Southland Incorporated", tier: 3 },
    { id: 39000, name: "Robert McIsaac Charitable Trust", tier: 3 },
    { id: 65877, name: "Rotorua Rowing Club Incorporated", tier: 3 },
    { id: 54051, name: "Royal Academy of Dance", tier: 3 },
    { id: 49526, name: "Samaritans Of Wellington Incorporated", tier: 3 },
    { id: 58671, name: "Seaside Charitable Trust", tier: 3 },
    { id: 63662, name: "Servants Health Centre Trust", tier: 3 },
    { id: 37574, name: "South Island Kokako Charitable Trust", tier: 3 },
    { id: 69272, name: "South Marlborough Landscape Restoration Trust", tier: 3 },
    { id: 56729, name: "St James Union Parish Church Greerton", tier: 3 },
    { id: 44517, name: "St Laurence's Social Service Trust Board", tier: 3 },
    { id: 59658, name: "St Mary's Parish, Paeroa", tier: 3 },
    { id: 56735, name: "St Paul's Co-operating Church Papamoa ", tier: 3 },
    { id: 39858, name: "Stratford  Baptist Church", tier: 3 },
    { id: 71137, name: "TARAMEA FRAGRANCE LIMITED", tier: 3 },
    { id: 75642, name: "TUCKER BEACH WILDLIFE TRUST", tier: 3 },
    { id: 71284, name: "Ta Tupu Foundation Trust", tier: 3 },
    { id: 45794, name: "Taumata O Tapuhi Marae", tier: 3 },
    { id: 55630, name: "Tauranga Budget Advisory Service Incorporated", tier: 3 },
    { id: 52989, name: "Te Awhina Tangata", tier: 3 },
    { id: 45799, name: "Te Hui Amorangi Ki Te Manawa O Te Wheke Trust Board", tier: 3 },
    { id: 71946, name: "Te Kapua Whakapipi Charitable Trust", tier: 3 },
    { id: 73517, name: "Te Kōwhatu Tū Moana Trust", tier: 3 },
    { id: 46798, name: "Te Maori Manaaki Taonga Trust", tier: 3 },
    { id: 39114, name: "Te Ora Hou Ōtautahi Incorporated", tier: 3 },
    { id: 73889, name: "Te Ropu Marutau o Aotearoa", tier: 3 },
    { id: 63747, name: "Te Whaiti-Nui-A-Toi Trust", tier: 3 },
    { id: 71071, name: "Te Whare Aio - Maori Women's Refuge Incorporated", tier: 3 },
    { id: 34629, name: "Ted Manson Charitable Trust", tier: 3 },
    { id: 50164, name: "Temple Basin Ski Club Incorporated", tier: 3 },
    { id: 50485, name: "Tennis Otago Incorporated", tier: 3 },
    { id: 52834, name: "The Bay Of Whales Childrens Trust Incorporated", tier: 3 },
    { id: 39309, name: "The Community Of The Sacred Name Society Or Trust Board", tier: 3 },
    { id: 44078, name: "The Congregational Christian Church of Samoa (Blockhouse Bay) Trust Board", tier: 3 },
    { id: 36083, name: "The Frank & Margaret Whiteley Charitable Trust", tier: 3 },
    { id: 69232, name: "The Good Collective Limited", tier: 3 },
    { id: 75084, name: "The Jabez Initiative Limited", tier: 3 },
    { id: 39042, name: "The Kaitaia Community House Society Incorporated", tier: 3 },
    { id: 41952, name: "The Leedstown Trust", tier: 3 },
    { id: 40288, name: "The Methodist Church Of New Zealand Te Haahi Weteriana O Aotearoa Otara Tongan P", tier: 3 },
    { id: 47518, name: "The New Zealand Resident Doctors Association Education Trust", tier: 3 },
    { id: 65803, name: "The Phil Lamason Heritage Centre Trust Incorporated", tier: 3 },
    { id: 63814, name: "The Psalm 2:8 Trust", tier: 3 },
    { id: 60304, name: "The Rotorua Branch of The Royal New Zealand Society For The Prevention Of Cruelt", tier: 3 },
    { id: 35500, name: "The South Canterbury Drama League Incorporated", tier: 3 },
    { id: 53064, name: "The South Island (Te Waipounamu) Branch of the Muscular Dystrophy Association of", tier: 3 },
    { id: 73747, name: "The Talking Matters Charitable Trust", tier: 3 },
    { id: 68405, name: "The Tauranga Community Trust", tier: 3 },
    { id: 40234, name: "Titirangi Baptist Church", tier: 3 },
    { id: 38533, name: "Tokelauan Congregational Christian Church Trust Board", tier: 3 },
    { id: 60262, name: "Transport Research and Educational Trust Board", tier: 3 },
    { id: 52675, name: "Trinity Ministries Incorporated", tier: 3 },
    { id: 51972, name: "Tryphina House Whangarei Women's Refuge Incorporated", tier: 3 },
    { id: 42095, name: "Vincent House Trust", tier: 3 },
    { id: 69425, name: "Vogelmorn Community Group Charitable Trust", tier: 3 },
    { id: 55319, name: "W Crighton Charitable Co Ltd", tier: 3 },
    { id: 41593, name: "W and W.A.R Fraser Charitable Trust", tier: 3 },
    { id: 54887, name: "Waikato City Assembly of God Trust Board", tier: 3 },
    { id: 53916, name: "Waikowhai Community Trust", tier: 3 },
    { id: 52867, name: "Waipa Community Trust", tier: 3 },
    { id: 61599, name: "Wellington College Old Boys Association Incorporated", tier: 3 },
    { id: 66866, name: "Western Bay Heritage Trust Board", tier: 3 },
    { id: 41938, name: "Whangamata Baptist Church", tier: 3 },
    { id: 57233, name: "Whanganui Enterprises Trust", tier: 3 },
    { id: 52743, name: "Whangarei Native Bird Recovery Centre Incorporated", tier: 3 },
    { id: 69705, name: "Whare Tiaki Hauora Limited", tier: 3 },
    { id: 42209, name: "Wycliffe Bible Translators New Zealand", tier: 3 },
    { id: 40326, name: "Wyndham and Districts Community Rest Home Incorporated", tier: 3 },
    { id: 33734, name: "Youth Voices Action (YVA) Incorporated", tier: 3 },
    { id: 55155, name: "Zion Baptist Church", tier: 3 },
    { id: 77085, name: "Abide Charitable Trust Board", tier: 4 },
    { id: 50224, name: "Academy of Judo New Plymouth Incorporated", tier: 4 },
    { id: 71984, name: "Alive Worship Ministry Trust", tier: 4 },
    { id: 66396, name: "Anglican Diocese of Christchurch - Parish of Methven", tier: 4 },
    { id: 73896, name: "Annabelle Johri Memorial Charitable Trust", tier: 4 },
    { id: 67811, name: "Aroha Ministries", tier: 4 },
    { id: 36998, name: "Arthur's Pass Wildlife Trust", tier: 4 },
    { id: 57594, name: "Arts and Language International Trust", tier: 4 },
    { id: 48535, name: "Assembly Of Christ - Papakura", tier: 4 },
    { id: 53387, name: "Asthma Education Charitable Trust", tier: 4 },
    { id: 51550, name: "Auckland Academy of Fine Arts", tier: 4 },
    { id: 68603, name: "Bay of Islands Amateur Radio Club Incorporated", tier: 4 },
    { id: 41631, name: "Bay of Plenty Medical Research Trust", tier: 4 },
    { id: 43334, name: "Bayfield Park Community Sports Trust", tier: 4 },
    { id: 74124, name: "Bhartiya Samaj Queenstown Charitable Trust", tier: 4 },
    { id: 71554, name: "Blindsided NZ", tier: 4 },
    { id: 75740, name: "Bras and Brass Foundation", tier: 4 },
    { id: 49165, name: "Browns Volunteer Fire Brigade", tier: 4 },
    { id: 66651, name: "Bulls and District Friendship Club (Incorporated)", tier: 4 },
    { id: 64968, name: "Bush Railway And Old Sawmill Trust", tier: 4 },
    { id: 75191, name: "COMMUNITY MUSIC AOTEAROA CHARITABLE TRUST", tier: 4 },
    { id: 61669, name: "Cambridge Playcentre", tier: 4 },
    { id: 68611, name: "Canterbury Older Persons Welfare Trust", tier: 4 },
    { id: 62613, name: "Canterbury Steam Preservation Society Incorporated", tier: 4 },
    { id: 68481, name: "Centenary Legacy Trust Board", tier: 4 },
    { id: 41052, name: "Central Otago Ecological Trust", tier: 4 },
    { id: 65734, name: "Child Abuse Prevention Foundation", tier: 4 },
    { id: 64074, name: "Christ For Salvation Ministries International", tier: 4 },
    { id: 34672, name: "Christchurch Pops Choir Incorporated", tier: 4 },
    { id: 68515, name: "Christian Mission Fellowship International Counties Manukau Trust", tier: 4 },
    { id: 57721, name: "City Faith Centre Gisborne", tier: 4 },
    { id: 48486, name: "City Of Gisborne Highland Pipe Band Incorporated", tier: 4 },
    { id: 71615, name: "Cobden Aromahana Sanctuary and Recreation Areas Incorporated", tier: 4 },
    { id: 54421, name: "Community Action Nelson Trust", tier: 4 },
    { id: 39195, name: "Community Birth Services Charitable Trust", tier: 4 },
    { id: 34171, name: "Community Heart Beat", tier: 4 },
    { id: 66160, name: "Connected for Life", tier: 4 },
    { id: 70682, name: "Contemporary HUM Arts Trust", tier: 4 },
    { id: 69192, name: "Coromandel Pier and Railway Development Trust", tier: 4 },
    { id: 69463, name: "Cromwell Primary School SOKs (Supporting Our Kids) Group", tier: 4 },
    { id: 48505, name: "Cust Oscar Group Incorporated", tier: 4 },
    { id: 43607, name: "Dashmesh Sports & Cultural Society 2007 Incorporated", tier: 4 },
    { id: 36680, name: "DayZ-V Charitable Trust", tier: 4 },
    { id: 64168, name: "Deborah Bay Residents Association Incorporated", tier: 4 },
    { id: 40980, name: "Disblair Charitable Trust", tier: 4 },
    { id: 38379, name: "Dragons Den Charitable Trust", tier: 4 },
    { id: 63794, name: "Drum Corps New Zealand Incorporated", tier: 4 },
    { id: 63782, name: "Edgar Olympic Foundation", tier: 4 },
    { id: 69473, name: "Ehlers-Danlos Society New Zealand Incorporated", tier: 4 },
    { id: 44657, name: "Ekalesia Kerisitiano Kuki Airani (Porirua) Trust Board", tier: 4 },
    { id: 74483, name: "Enchanting Productions Trust", tier: 4 },
    { id: 66034, name: "Enner Glynn School Friends of the School", tier: 4 },
    { id: 56641, name: "Estate Frederick Hansen", tier: 4 },
    { id: 39355, name: "Estate Of Henry Marfell", tier: 4 },
    { id: 41975, name: "Estate of Alfred Charles Hook", tier: 4 },
    { id: 69726, name: "Evangelical Samoan Wesleyan Methodist Church of NZ - Avondale Parish", tier: 4 },
    { id: 33190, name: "Experimental Theatre Incorporated", tier: 4 },
    { id: 34229, name: "FTAC Limited", tier: 4 },
    { id: 50218, name: "Face Nepal Charitable Trust Board New Zealand", tier: 4 },
    { id: 36528, name: "Fairview Charitable Trust", tier: 4 },
    { id: 68313, name: "Faithful Living Charitable Trust", tier: 4 },
    { id: 55736, name: "Field Collection Trust", tier: 4 },
    { id: 64373, name: "Flaxmere Community Patrol Affiliated", tier: 4 },
    { id: 36960, name: "Flemington School's Parent And Friends Group", tier: 4 },
    { id: 49616, name: "Florence Smaill Charitable Trust", tier: 4 },
    { id: 33458, name: "Food with Love Mission New Zealand Charitable Trust", tier: 4 },
    { id: 71993, name: "Frank Sargeson Trust", tier: 4 },
    { id: 52787, name: "Frederick And Josephine Parker Trust", tier: 4 },
    { id: 45976, name: "Friends Of The Fortune Theatre Incorporated", tier: 4 },
    { id: 59630, name: "Friends of Edmonds Factory Garden Incorporated", tier: 4 },
    { id: 47056, name: "Friends of New Zealand Schools Debating Foundation", tier: 4 },
    { id: 61631, name: "Friends of Northcote School", tier: 4 },
    { id: 73578, name: "Fur Paws Sake", tier: 4 },
    { id: 50213, name: "Grovetown School Parent Support Group Incorporated", tier: 4 },
    { id: 44825, name: "HUMIA (Indonesian Muslim Society in Auckland)", tier: 4 },
    { id: 49787, name: "Hanmer Heritage Forest Trust", tier: 4 },
    { id: 65340, name: "Hearing Association New Zealand Incorporated", tier: 4 },
    { id: 39788, name: "Heart Reach Fund", tier: 4 },
    { id: 46877, name: "Highland Piping Society of Canterbury Incorporated", tier: 4 },
    { id: 35295, name: "Historic Places Wellington Incorporated", tier: 4 },
    { id: 66540, name: "Howick Radio Charitable Trust", tier: 4 },
    { id: 49166, name: "Hunterville Volunteer Fire Brigade", tier: 4 },
    { id: 38758, name: "In Time Trust", tier: 4 },
    { id: 69016, name: "Independent Samoan Methodist Church of New Zealand", tier: 4 },
    { id: 57910, name: "International Centre for Children Charitable Trust", tier: 4 },
    { id: 70376, name: "Invercargill Intercultural Church", tier: 4 },
    { id: 42313, name: "Iona College Foundation", tier: 4 },
    { id: 33402, name: "Jin-Gang-Dhyana Wang Xin De Foundation (New Zealand) Trust", tier: 4 },
    { id: 35054, name: "Just Another Day's Enough", tier: 4 },
    { id: 71999, name: "Kai 4 Communities Incorporated", tier: 4 },
    { id: 48880, name: "Kaiapoi Congregation of Jehovah's Witnesses", tier: 4 },
    { id: 53681, name: "Kaiapoi District Historical Society Inc", tier: 4 },
    { id: 63067, name: "Kapiti Basketball Association Incorporated", tier: 4 },
    { id: 70848, name: "Karearea Mission Trust", tier: 4 },
    { id: 38018, name: "Kauaeranga Hall Society Incorporated", tier: 4 },
    { id: 66177, name: "Kauri Glen Bush Society Incorporated", tier: 4 },
    { id: 52641, name: "Keep Motueka Beautiful Society Incorporated", tier: 4 },
    { id: 68642, name: "Kelly McGarry Foundation", tier: 4 },
    { id: 67123, name: "Kerikeri Community Patrol Incorporated", tier: 4 },
    { id: 45652, name: "Korean Church of the Nazarene", tier: 4 },
    { id: 34216, name: "Korean Young-Adults Christian Fellowship", tier: 4 },
    { id: 71575, name: "Kotuku Property Trust", tier: 4 },
    { id: 72237, name: "LOVE AND LIGHT EDUCATION TRUST", tier: 4 },
    { id: 67069, name: "Lions Club of Clyde and Districts Charitable Trust", tier: 4 },
    { id: 63098, name: "Lions Club of Greytown Charitable Trust", tier: 4 },
    { id: 63388, name: "Lions Club of Kowhai Coast Charitable Trust", tier: 4 },
    { id: 33030, name: "Mahanaim Trust", tier: 4 },
    { id: 33706, name: "Mana Tree Aid Foundation", tier: 4 },
    { id: 72064, name: "Mana Whānau Charitable Trust ", tier: 4 },
    { id: 72126, name: "Manapouri Art Group Incorporated", tier: 4 },
    { id: 64566, name: "Maori Hill School PTA", tier: 4 },
    { id: 46634, name: "Maramarua Volunteer Rural Fire Force", tier: 4 },
    { id: 60742, name: "Margaret and Peter Shirtcliffe Foundation", tier: 4 },
    { id: 69542, name: "Marlborough Community Gardens Charitable Trust", tier: 4 },
    { id: 34210, name: "Martinborough Events Trust", tier: 4 },
    { id: 68713, name: "Massey University Primary Industry Accounting Research Trust Fund", tier: 4 },
    { id: 36401, name: "Meadowlands Multisport Limited", tier: 4 },
    { id: 70499, name: "Mental Health Therapies NZ Charitable Trust", tier: 4 },
    { id: 50300, name: "Methven Tennis Club", tier: 4 },
    { id: 49650, name: "Mid Western First Response Society Incorporated", tier: 4 },
    { id: 61162, name: "Milton District Sports Trust", tier: 4 },
    { id: 67594, name: "Mobilise Thames Charitable Trust", tier: 4 },
    { id: 50939, name: "Mokoia Pa", tier: 4 },
    { id: 41084, name: "Morrinsville Spiritualist Church Trust", tier: 4 },
    { id: 71126, name: "Mosgiel Playcentre", tier: 4 },
    { id: 35364, name: "Multiples Bay of Plenty", tier: 4 },
    { id: 54579, name: "Murchison Community Resource Incorporated", tier: 4 },
    { id: 48256, name: "Natural Heritage Society Oamaru Incorporated", tier: 4 },
    { id: 67356, name: "Neighbourhood Support South Taranaki Incorporated", tier: 4 },
    { id: 48837, name: "Nelson Congregation Of Jehovah's Witnesses", tier: 4 },
    { id: 57175, name: "Nelson District Spiritualist Church of New Zealand Incorporated", tier: 4 },
    { id: 75198, name: "Neon Competition Society", tier: 4 },
    { id: 33939, name: "New Zealand Asia Trust", tier: 4 },
    { id: 34220, name: "New Zealand Firefighters Charitable Trust", tier: 4 },
    { id: 63878, name: "New Zealand Homeopathic Society Incorporated", tier: 4 },
    { id: 43177, name: "New Zealand Military History Committee ", tier: 4 },
    { id: 72864, name: "Nga Ara Ki Tamatea Tipuna Trust", tier: 4 },
    { id: 45632, name: "Ngai Tumapuhiaarangi Ki Okautete Incorporated", tier: 4 },
    { id: 74896, name: "Ngunguru Volunteer Fire Brigade", tier: 4 },
    { id: 75536, name: "No Laughing Me Publications Trust", tier: 4 },
    { id: 38730, name: "Norman & Joan Heaphy Charitable Trust", tier: 4 },
    { id: 44814, name: "North East Valley Normal School Parent Teachers Association", tier: 4 },
    { id: 58441, name: "Northern Dance Network Incorporated", tier: 4 },
    { id: 56556, name: "Northland Vintage Machinery Club (Whangarei) Incorporated", tier: 4 },
    { id: 66018, name: "OBHS Hostel Charitable Trust", tier: 4 },
    { id: 65121, name: "Old Cromwell Incorporated", tier: 4 },
    { id: 50418, name: "Onslow Historical Society Incorporated", tier: 4 },
    { id: 46883, name: "Onyx Militaires Marching Teams", tier: 4 },
    { id: 48956, name: "Otterburn Trust", tier: 4 },
    { id: 69635, name: "Our Back Yard Charitable Trust", tier: 4 },
    { id: 67868, name: "Our Seas Our Future Charitable Trust", tier: 4 },
    { id: 33521, name: "Pacific Spine Consulting & Research Charitable Trust", tier: 4 },
    { id: 53695, name: "Pahiatua Repertory Society (Incorporated)", tier: 4 },
    { id: 44727, name: "Palmerston North City Environmental Trust", tier: 4 },
    { id: 74789, name: "Palmerston North Fire Brigade Vintage Equipment Society Incorporated", tier: 4 },
    { id: 48377, name: "Papakura Congregation of Jehovah's Witnesses, Auckland", tier: 4 },
    { id: 48831, name: "Papamoa Congregation Of Jehovah's Witnesses", tier: 4 },
    { id: 67340, name: "Parawai Marae Charitable Trust", tier: 4 },
    { id: 33552, name: "Parihaka Network - Ngā Manu Kōrihi Ōtautahi Trust", tier: 4 },
    { id: 41308, name: "Pirongia Netball Club Incorporated", tier: 4 },
    { id: 74763, name: "Pokeno Good News Church Trust Board", tier: 4 },
    { id: 59489, name: "Primary Health Alliance Incorporated", tier: 4 },
    { id: 67659, name: "Punjab Kesri Incorporated", tier: 4 },
    { id: 42137, name: "Rhema International Church", tier: 4 },
    { id: 67940, name: "Robotics and Computer Science in Schools Educational Trust", tier: 4 },
    { id: 42740, name: "Rotary Club of Palmerston North Charitable Fundraising Trust", tier: 4 },
    { id: 35059, name: "Rotary Club of Whakatu Charitable Trust", tier: 4 },
    { id: 67452, name: "Rotorua Police Welfare Fund and Charitable Trust", tier: 4 },
    { id: 38282, name: "Roxburgh Gorge Trail Charitable Trust", tier: 4 },
    { id: 57344, name: "Sacred Heart Waitaruke Ecclesiastical Goods Trust", tier: 4 },
    { id: 48919, name: "Saint Joseph's School Parent Teacher Association (Pukekohe)", tier: 4 },
    { id: 66187, name: "Salam Trust", tier: 4 },
    { id: 70407, name: "Samoan Assembly of God Invercargill Trust Board", tier: 4 },
    { id: 34409, name: "Sands Manawatu-Horowhenua", tier: 4 },
    { id: 58486, name: "Sherenden Hall Society (Incorporated)", tier: 4 },
    { id: 72814, name: "Sister Eveleen Retreat House", tier: 4 },
    { id: 71943, name: "Soundraise", tier: 4 },
    { id: 59539, name: "South Catlins Promotions Incorporated", tier: 4 },
    { id: 71094, name: "South Dunedin Blokes Shed", tier: 4 },
    { id: 54559, name: "South West New Zealand Endangered Species Charitable Trust", tier: 4 },
    { id: 76080, name: "Southern Lakes Jewish Community Charitable Trust ", tier: 4 },
    { id: 62204, name: "Special Olympics Hawke's Bay Trust", tier: 4 },
    { id: 66662, name: "Squash Wellington Districts Incorporated", tier: 4 },
    { id: 43245, name: "St Albans Tennis Club Incorporated", tier: 4 },
    { id: 57346, name: "St Anthony's Waiuku Ecclesiastical Goods Trust", tier: 4 },
    { id: 45176, name: "St Benedict's School Help Our Kids Committee", tier: 4 },
    { id: 66197, name: "St Columba's Parents Teachers Friends Association", tier: 4 },
    { id: 57352, name: "St Mary's Wellsford Ecclesiastical Goods Trust", tier: 4 },
    { id: 65781, name: "St Paul's Presbyterian Church Ashburton", tier: 4 },
    { id: 74561, name: "Steadfast Ministry Church Auckland New Zealand", tier: 4 },
    { id: 40055, name: "Sturges West Community House Incorporated", tier: 4 },
    { id: 68958, name: "THE CHURCH IN INVERCARGILL", tier: 4 },
    { id: 43512, name: "TJ's Way Trust", tier: 4 },
    { id: 74122, name: "TTTM Charitable Trust", tier: 4 },
    { id: 65908, name: "Ta'angafonua", tier: 4 },
    { id: 65066, name: "Taieri Age Connect Incorporated", tier: 4 },
    { id: 39446, name: "Taupo Community Patrol", tier: 4 },
    { id: 57699, name: "Taupo Pakeke Lions Charitable Trust", tier: 4 },
    { id: 47616, name: "Tawa Community Patrol", tier: 4 },
    { id: 67289, name: "Te Anau Community Toy Library", tier: 4 },
    { id: 74004, name: "Te Arohanui Pregnancy Trust", tier: 4 },
    { id: 50059, name: "Te Koutu E141 Trust", tier: 4 },
    { id: 76560, name: "Te Manawa Ora ki Te Whanganui-a-Tara", tier: 4 },
    { id: 72110, name: "Te Pahī o Āio Nuku", tier: 4 },
    { id: 43452, name: "Te Rau Oriwa Trust Board", tier: 4 },
    { id: 56026, name: "Te Wairoa - Iti Marae Komiti", tier: 4 },
    { id: 67563, name: "Te Whakarewarewa Military Remembrance Trust", tier: 4 },
    { id: 51282, name: "Te Whakaritorito Trust", tier: 4 },
    { id: 37624, name: "Te Whare Rongoaa", tier: 4 },
    { id: 66518, name: "Technology in Schools Education Trust", tier: 4 },
    { id: 58695, name: "The Animal Sanctuary Charitable Trust", tier: 4 },
    { id: 66836, name: "The Beatrice Ratcliffe Charitable Trust", tier: 4 },
    { id: 66235, name: "The Community Performing Arts Trust", tier: 4 },
    { id: 59403, name: "The Deborah Charitable Trust", tier: 4 },
    { id: 59020, name: "The First Church of Wicca and Heathens of New Zealand", tier: 4 },
    { id: 72590, name: "The Food Basket Central Hawkes' Bay", tier: 4 },
    { id: 61958, name: "The Gaiety Trust", tier: 4 },
    { id: 52091, name: "The Hearing Association Manawatu Incorporated", tier: 4 },
    { id: 66567, name: "The Heritage & Future Charitable Trust", tier: 4 },
    { id: 47772, name: "The Inangahua Childrens Trust", tier: 4 },
    { id: 46504, name: "The Inglewood Branch of the New Zealand Society of Genealogists", tier: 4 },
    { id: 63989, name: "The James D'Auvergne Sport Marlborough Development Trust", tier: 4 },
    { id: 48287, name: "The James Meikle Shrewsbury Scholarship", tier: 4 },
    { id: 65837, name: "The Kawakawa and District RSA Poppy Trust", tier: 4 },
    { id: 63062, name: "The Kihikihi Lions Charitable Trust", tier: 4 },
    { id: 66528, name: "The Kiwi Kids Charity", tier: 4 },
    { id: 46142, name: "The Lions Club of Onerahi and Whangarei Heads Charitable Trust", tier: 4 },
    { id: 54435, name: "The Manna Healing Centre Trust", tier: 4 },
    { id: 35756, name: "The Massey High School Foundation ", tier: 4 },
    { id: 35118, name: "The Methodist Church of New Zealand Te Haahi Weteriana O Aotearoa - Wasewase ko ", tier: 4 },
    { id: 50442, name: "The Methven Fire Fighters Support Group Incorporated", tier: 4 },
    { id: 34189, name: "The Mike Pero Foundation", tier: 4 },
    { id: 46534, name: "The Morrinsville Branch of the New Zealand Society of Genealogists", tier: 4 },
    { id: 53053, name: "The New Lynn Friendship Club Incorporated", tier: 4 },
    { id: 62642, name: "The Omaha Shorebird Protection Trust", tier: 4 },
    { id: 72234, name: "The Place Charitable Trust Board", tier: 4 },
    { id: 36893, name: "The Sage Trust", tier: 4 },
    { id: 42602, name: "The Silk Tent Theatre Company Incorporated", tier: 4 },
    { id: 57909, name: "The Station Community Church", tier: 4 },
    { id: 67504, name: "The Streams Community Charitable Trust", tier: 4 },
    { id: 69363, name: "The Supporting Families in Mental Illness New Zealand Charitable Trust", tier: 4 },
    { id: 69514, name: "The Taupo Korean Methodist Church Trust", tier: 4 },
    { id: 49667, name: "The Unitarian Church Of Auckland Trust Board ", tier: 4 },
    { id: 68656, name: "The Waikato Eye Foundation", tier: 4 },
    { id: 69178, name: "The Well Church New Zealand Trust Board", tier: 4 },
    { id: 74090, name: "Toa Kenepuru Transition Limited", tier: 4 },
    { id: 57436, name: "Toi Rakiura - Arts Trust Stewart Island", tier: 4 },
    { id: 44203, name: "Tokomaru Home And School Association", tier: 4 },
    { id: 77234, name: "Transport Well New Zealand", tier: 4 },
    { id: 67793, name: "Tremains Community Trust", tier: 4 },
    { id: 73718, name: "True-Orthodox Church Rīpeka Trust", tier: 4 },
    { id: 38131, name: "Trustees in the Rotary Club of New Lynn Charitable Trust", tier: 4 },
    { id: 41653, name: "Tung Jung Association of New Zealand", tier: 4 },
    { id: 56987, name: "Turakina Caledonian Society Incorporated", tier: 4 },
    { id: 35307, name: "Tuwharetoa Sports", tier: 4 },
    { id: 36596, name: "Valley Of Peace Cricket Club Incorporated", tier: 4 },
    { id: 73113, name: "Vision Rehabilitation Services Trust ", tier: 4 },
    { id: 75263, name: "Wahangaoterangi", tier: 4 },
    { id: 44309, name: "Waihi and Waihi Beach Disabled Support Group Trust", tier: 4 },
    { id: 39637, name: "Waikato Filipino Association", tier: 4 },
    { id: 72059, name: "Waikato Tongan Community Charity Trust ", tier: 4 },
    { id: 72579, name: "Waimate Parenting Hub", tier: 4 },
    { id: 32879, name: "Waipawa Primary School Whanau and Friends Association", tier: 4 },
    { id: 37704, name: "Waipu Caledonian Charitable Trust", tier: 4 },
    { id: 60909, name: "Wairarapa Herb Society Incorporated", tier: 4 },
    { id: 71802, name: "Wanaka Community Garden", tier: 4 },
    { id: 46216, name: "Wanganui Ozanam Villa Trust", tier: 4 },
    { id: 69876, name: "Weber Community Committee Incorporated", tier: 4 },
    { id: 48346, name: "Wellington City Congregation Of Jehovah's Witnesses", tier: 4 },
    { id: 76861, name: "Wellington Temple Sinai Charitable Trust", tier: 4 },
    { id: 61594, name: "West Auckland Seventh Day Baptist Church", tier: 4 },
    { id: 46127, name: "West Harbour Congregational Christian And Missionary Church", tier: 4 },
    { id: 66863, name: "Westland Petrel Conservation Trust", tier: 4 },
    { id: 72216, name: "Whariki Church Trust", tier: 4 },
    { id: 63256, name: "Whiti Te Ra Marae Maori Reservation", tier: 4 },
    { id: 47017, name: "Winton Congregation of Jehovah's Witnesses", tier: 4 },
    { id: 33114, name: "Winton Skate Park Trust", tier: 4 },
    { id: 67516, name: "Women Entrepreneurship Centre Charitable Trust", tier: 4 },
    { id: 69645, name: "Zonta Club of Ashburton Charitable Trust", tier: 4 },
    { id: 73174, name: "Zonta Club of Auckland Incorporated", tier: 4 },
    { id: 45599, name: "Auckland Women's Loan Fund", tier: 6 },
    { id: 35347, name: "Building Champions Trust", tier: 6 },
    { id: 53909, name: "Diabetes Marlborough Incorporated", tier: 6 },
    { id: 63572, name: "Figjam Workshops", tier: 6 },
    { id: 43722, name: "Grey And Westland Districts Victim Support Group", tier: 6 },
    { id: 40710, name: "Henry Ah Hee Trust Fund", tier: 6 },
    { id: 48325, name: "Te Iwi O Rakaipaaka Incorporated", tier: 6 },
    { id: 32849, name: "YMCA Tauranga Holdings Trust (Inc.)", tier: 6 },
];
async function fetchCharityData(charityId) {
    const response = await fetch(`http://localhost:8000/api/financial?id=${charityId}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

async function auditCharity(charity) {
    console.log(`\n${'='.repeat(100)}`);
    console.log(`${charity.name}`);
    console.log(`ID: ${charity.id} | Tier: ${charity.tier}`);
    console.log('='.repeat(100));

    try {
        const response = await fetchCharityData(charity.id);
        const annualReturns = response.d || [];

        if (annualReturns.length === 0) {
            console.log('❌ No annual returns found');
            return { charity, status: 'error', error: 'No annual returns' };
        }

        const latestReturn = annualReturns[0];
        const financialData = latestReturn;
        const relatedId = latestReturn.NoticeofChangeAnnualReturnId;

        // Build PDF URL
        const pdfUrl = `https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${relatedId}&isPublic=true`;

        // Get totals
        const totalIncome = financialData.TotalGrossIncome || 0;
        const totalExpenditure = financialData.TotalExpenditure || 0;

        console.log(`\n📊 TOTALS (from API):`);
        console.log(`   Total Income: ${formatCurrency(totalIncome)}`);
        console.log(`   Total Expenditure: ${formatCurrency(totalExpenditure)}`);

        // Calculate breakdowns
        const incomeBreakdown = calculateBreakdown(financialData, 'income', totalIncome);
        const expenseBreakdown = calculateBreakdown(financialData, 'expense', totalExpenditure);

        // Display income breakdown
        console.log(`\n💰 INCOME BREAKDOWN:`);
        if (incomeBreakdown.items.length === 0) {
            console.log('   No income fields found');
        } else {
            incomeBreakdown.items.forEach(item => {
                console.log(`   • ${item.label}: ${formatCurrency(item.value)} (${item.percent.toFixed(1)}%)`);
            });
            console.log(`   ─────────────────────────────────────────────────────────`);
            console.log(`   TOTAL: ${formatCurrency(incomeBreakdown.total)} (${incomeBreakdown.coverage.toFixed(1)}%)`);

            if (Math.abs(incomeBreakdown.coverage - 100) > 0.5) {
                const diff = totalIncome - incomeBreakdown.total;
                console.log(`   ⚠️  Missing: ${formatCurrency(diff)}`);
            }
        }

        // Display expense breakdown
        console.log(`\n💸 EXPENDITURE BREAKDOWN:`);
        if (totalExpenditure === 0) {
            console.log('   No expenditure reported');
        } else if (expenseBreakdown.items.length === 0) {
            console.log('   ⚠️  No expense fields mapped');
            console.log(`   Missing: ${formatCurrency(totalExpenditure)} (100%)`);
        } else {
            expenseBreakdown.items.forEach(item => {
                console.log(`   • ${item.label}: ${formatCurrency(item.value)} (${item.percent.toFixed(1)}%)`);
            });
            console.log(`   ─────────────────────────────────────────────────────────`);
            console.log(`   TOTAL: ${formatCurrency(expenseBreakdown.total)} (${expenseBreakdown.coverage.toFixed(1)}%)`);

            if (Math.abs(expenseBreakdown.coverage - 100) > 0.5) {
                const diff = totalExpenditure - expenseBreakdown.total;
                console.log(`   ⚠️  Missing: ${formatCurrency(diff)}`);
            }
        }

        // Status
        const incomePass = Math.abs(incomeBreakdown.coverage - 100) < 0.5;
        const expensePass = totalExpenditure === 0 || Math.abs(expenseBreakdown.coverage - 100) < 0.5;
        const overallPass = incomePass && expensePass;

        console.log(`\n📄 PDF: ${pdfUrl}`);
        console.log(`\n${overallPass ? '✅ PASSED' : '⚠️  WARNING'} - Income: ${incomeBreakdown.coverage.toFixed(1)}% | Expenditure: ${expenseBreakdown.coverage.toFixed(1)}%`);

        return {
            charity,
            status: overallPass ? 'passed' : 'warning',
            coverage: {
                income: incomeBreakdown.coverage,
                expenditure: expenseBreakdown.coverage
            },
            totals: {
                income: totalIncome,
                expenditure: totalExpenditure
            },
            pdfUrl
        };

    } catch (error) {
        console.log(`\n❌ Error: ${error.message}`);
        return { charity, status: 'error', error: error.message };
    }
}

function calculateBreakdown(financialData, type, total) {
    const items = [];

    // Income field mapping
    const incomeFieldLabels = {
        // Tier 3/4 PBE - Exchange transactions
        'FeesSubscriptionsIncludingDonationsFromMembers': 'Fees, subscriptions (including donations) from members',
        'RevenueFromProvidingGoodsAndServices': 'Revenue from providing goods and services',
        'RevenueFromProvidingGoodsAndServicesFromOtherSources': 'Revenue from providing goods and services from other sources',
        'ServiceDeliveryContractRevenueFromLocalOrCentralGovernment': 'Service delivery contract revenue from government',
        'InterestDividendsAndOtherInvestmentRevenue': 'Interest, dividends and other investment revenue',
        'OtherRevenueFromExchangeTransactions': 'Other revenue from exchange transactions',

        // Tier 3/4 PBE - Non-exchange transactions
        'DonationsKohaBequestsAndSimilarRevenue': 'Donations, koha, bequests and similar revenue',
        'DonationsKohaGrantsFundraisingAndOtherSimilarRevenue': 'Donations, koha, grants, fundraising and other similar revenue',
        'GrantsRevenueFromLocalOrCentralGovernment': 'Grants revenue from government',
        'GrantsRevenueFromOtherSources': 'Grants revenue from other sources',
        'OtherRevenueFromNonExchangeTransactions': 'Other revenue from non-exchange transactions',

        // Tier 4 Simple Reporting
        'DonationsKoha': 'Donations and koha',
        'AllOtherIncome': 'All other income',

        // Tier 2 detailed
        'GeneralGrantsReceived': 'General grants',
        'CapitalGrantsAndDonations': 'Capital grants and donations',
        'GovtGrantsContracts': 'Government grants/contracts',
        'GovernmentServiceDeliveryGrantsContracts': 'Government service delivery grants/contracts',
        'NonGovernmentServiceDeliveryGrantsContracts': 'Non-government service delivery grants/contracts',
        'MembershipFees': 'Membership fees',
        'ServiceTradingIncome': 'Service/trading income',
        'RevenueFromCommercialActivities': 'Revenue from commercial activities',
        'InterestOfDividendsReceived': 'Interest and dividends received',
        'InterestOfDividendsReceivedFromInvestments': 'Interest and dividends received',
        'NewZealandDividends': 'New Zealand dividends',
        'OtherInvestmentIncome': 'Other investment income',

        // Tier 1 simplified
        'OtherRevenue': 'Other revenue'
    };

    // Expense field mapping
    const expenseFieldLabels = {
        // Tier 3/4 PBE Standards
        'WagesSalariesAndOtherEmployeeCosts': 'Wages, salaries and other employee costs',
        'OperatingAndAdministrativeExpenses': 'Operating and administrative expenses',
        'DepreciationAmortisationAndImpairmentExpenses': 'Depreciation, amortisation and impairment',
        'FinanceCosts': 'Finance costs',
        'GrantsAndDonationsMade': 'Grants and donations made',
        'OtherExpenses': 'Other expenses',

        // Tier 2 Detailed
        'EmployeeRemunerationAndOtherRelatedExpenses': 'Employee remuneration and related expenses',
        'SalariesAndWages': 'Salaries and wages',
        'VolunteerRelatedExpenses': 'Volunteer related expenses',
        'ExpensesRelatedToFundraising': 'Fundraising expenses',
        'FundRaisingExpenses': 'Fundraising expenses',
        'CostOfServiceProvision': 'Cost of service provision',
        'OtherExpensesRelatedToServiceDelivery': 'Other service delivery expenses',
        'OtherRelatedToDeliveryOfEntityObjectives': 'Expenses related to delivery of entity objectives',
        'ExpensesRelatedToCommercialActivities': 'Commercial activities expenses',
        'CostOfTradingOperations': 'Cost of trading operations',
        'GrantsPaidWithinNZ': 'Grants paid within NZ',
        'GrantsPaidOutsideNZ': 'Grants paid outside NZ',
        'Depreciation': 'Depreciation',
        'AllOtherExpenditure': 'All other expenditure',

        // Tier 4 Simple Reporting
        'GrantsorDonationsPaid': 'Grants and donations paid',
        'PurchaseOfResources': 'Purchase of resources',

        // Tier 1 Simplified
        'VolunteerAndEmployeeRelatedCosts': 'Volunteer and employee related costs',
        'CostsRelatedToProvidingGoodsAndServices': 'Costs related to providing goods and services'
    };

    const fieldMap = type === 'income' ? incomeFieldLabels : expenseFieldLabels;

    // Process each field from the mapping
    for (const [fieldName, label] of Object.entries(fieldMap)) {
        const value = financialData[fieldName];

        // Skip if field doesn't exist, is not a number, is zero, or is boolean
        if (value == null || typeof value === 'boolean' || typeof value !== 'number' || value === 0) {
            continue;
        }

        // For income, exclude fields with "Made" or "Paid" (those are expenses)
        if (type === 'income' && (fieldName.includes('Made') || fieldName.includes('Paid'))) {
            continue;
        }

        // For expenses, exclude capital/balance sheet accounts
        if (type === 'expense') {
            // Skip purchase/acquisition fields (these are capital, not operating)
            if (fieldName.includes('Purchase') || fieldName.includes('Receipt') ||
                fieldName.includes('Borrowing') || fieldName.includes('Asset')) {
                continue;
            }
        }

        const percent = total > 0 ? (value / total * 100) : 0;
        items.push({ label, value, percent });
    }

    // For expenses, also check for Tier 2 MaterialExpense fields (not in the standard mapping)
    if (type === 'expense') {
        for (let i = 1; i <= 4; i++) {
            const fieldName = `MaterialExpense${i}`;
            const value = financialData[fieldName];

            // Skip if field doesn't exist, is not a number, is zero
            if (value == null || typeof value !== 'number' || value === 0) {
                continue;
            }

            // Get the custom label if it exists
            const labelFieldName = fieldName + 'Label';
            const customLabel = financialData[labelFieldName];
            let displayLabel = (customLabel && typeof customLabel === 'string')
                ? customLabel
                : fieldName.replace(/([A-Z])/g, ' $1').trim();

            const percent = total > 0 ? (value / total * 100) : 0;
            items.push({ label: displayLabel, value, percent });
        }
    }

    // Sort by value descending
    items.sort((a, b) => b.value - a.value);

    // Remove duplicate values (e.g., NewZealandDividends and InterestOfDividendsReceived reporting same amount)
    const seenValues = new Set();
    const uniqueItems = [];
    for (const item of items) {
        if (!seenValues.has(item.value)) {
            seenValues.add(item.value);
            uniqueItems.push(item);
        }
    }

    const breakdownTotal = uniqueItems.reduce((sum, item) => sum + item.value, 0);
    const coverage = total > 0 ? (breakdownTotal / total * 100) : 100;

    return { items: uniqueItems, total: breakdownTotal, coverage };
}

async function runAudit() {
    console.log('🔍 LOCALHOST CHARITY AUDIT');
    console.log(`Testing ${TEST_CHARITIES.length} charities\n`);
    console.log('This audit compares the API data breakdown with official PDFs');
    console.log('Please manually verify the PDFs match the breakdowns shown below\n');

    const results = [];

    for (const charity of TEST_CHARITIES) {
        const result = await auditCharity(charity);
        results.push(result);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log(`\n\n${'='.repeat(100)}`);
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(100));

    const passed = results.filter(r => r.status === 'passed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`\n✅ Passed: ${passed}/${TEST_CHARITIES.length} (${(passed/TEST_CHARITIES.length*100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warnings}/${TEST_CHARITIES.length} (${(warnings/TEST_CHARITIES.length*100).toFixed(1)}%)`);
    console.log(`❌ Errors: ${errors}/${TEST_CHARITIES.length} (${(errors/TEST_CHARITIES.length*100).toFixed(1)}%)`);

    if (warnings > 0) {
        console.log(`\n⚠️  CHARITIES WITH INCOMPLETE COVERAGE:\n`);
        results.filter(r => r.status === 'warning').forEach((r, i) => {
            console.log(`${i + 1}. ${r.charity.name} (ID: ${r.charity.id}, Tier ${r.charity.tier})`);
            console.log(`   Income: ${r.coverage.income.toFixed(1)}% | Expenditure: ${r.coverage.expenditure.toFixed(1)}%`);
            console.log(`   PDF: ${r.pdfUrl}\n`);
        });
    }

    console.log('✅ Audit complete!\n');
    console.log('📋 Next step: Manually verify each PDF matches the breakdown shown above\n');
}

// Run the audit
runAudit().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
