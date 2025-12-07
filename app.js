// Detect base path - works for both root and subdirectory (e.g., /dev)
// Extract base path from current URL (everything before the last / or ?)
let BASE_PATH = '';
let USE_PHP = false; // Toggle between PHP (production) and Python (local dev)

const pathname = window.location.pathname;
if (pathname.includes('/dev/') || pathname === '/dev' || pathname.startsWith('/dev?')) {
    BASE_PATH = '/dev';
}

// Check if we're on localhost (use Python server) or live server (use PHP)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    USE_PHP = false; // Local development - Python server
} else {
    USE_PHP = true; // Production - PHP endpoints
}

const API_BASE = `${BASE_PATH}/api`;

// Helper function to get API endpoint (adds .php extension for production)
function getApiEndpoint(endpoint) {
    return USE_PHP ? `${API_BASE}/${endpoint}.php` : `${API_BASE}/${endpoint}`;
}

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const charityDetails = document.getElementById('charityDetails');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const financialSection = document.getElementById('financialSection');
const noFinancialData = document.getElementById('noFinancialData');
const clearSearchBtn = document.getElementById('clearSearchBtn');

let searchTimeout;
let currentCharityId = null;
let currentCharityName = null;

// Dynamic typing effect for hero section
const words = ["NZ Charities", "Registered Charities", "Community Organisations", "Charitable Trusts"];
const dynamicText = document.getElementById("dynamic-text");

let wordIndex = 0;
let letterIndex = 0;
let isDeleting = false;
let typingSpeed = 120;
let deletingSpeed = 60;
let pauseBetweenWords = 1500;

function typeHeroText() {
    if (!dynamicText) return;

    const currentWord = words[wordIndex];

    if (!isDeleting) {
        dynamicText.textContent = currentWord.slice(0, letterIndex + 1);
        letterIndex++;

        if (letterIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeHeroText, pauseBetweenWords);
            return;
        }
    } else {
        dynamicText.textContent = currentWord.slice(0, letterIndex - 1);
        letterIndex--;

        if (letterIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
    }
    setTimeout(typeHeroText, isDeleting ? deletingSpeed : typingSpeed);
}

// Start the typing effect when page loads
if (dynamicText) {
    typeHeroText();
}

// Toggle clear button visibility based on input
function toggleClearButton() {
    if (searchInput.value.trim().length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
}

// Clear button click handler
clearSearchBtn.addEventListener('click', () => {
    // Trigger the clearing animation
    searchInput.classList.add('clearing');

    // Clear the input after animation starts
    searchInput.value = '';
    searchResults.classList.add('hidden');
    toggleClearButton();

    // Remove animation class after it completes
    setTimeout(() => {
        searchInput.classList.remove('clearing');
    }, 500);

    searchInput.focus();
});

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    toggleClearButton();

    if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }

    searchTimeout = setTimeout(() => searchCharities(query), 300);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            searchCharities(query);
        }
    }
});

async function searchCharities(query) {
    try {
        showLoading();
        hideError();

        // Send single query to backend - backend handles variations
        const encodedQuery = encodeURIComponent(query);
        const url = `${getApiEndpoint('search')}?q=${encodedQuery}`;
        const response = await fetch(url);

        if (!response.ok) {
            displaySearchResults([]);
            hideLoading();
            return;
        }

        const data = await response.json();
        const charities = data.d || data.value || [];

        displaySearchResults(charities);
        hideLoading();
    } catch (err) {
        hideLoading();
        showError('Error searching for charities: ' + err.message);
    }
}

function displaySearchResults(charities) {
    if (charities.length === 0) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">No charities found</div>';
        searchResults.classList.remove('hidden');
        return;
    }

    searchResults.innerHTML = charities.map(charity => `
        <div class="search-result-item" onclick='selectCharity(${charity.OrganisationId}, "${escapeHtml(charity.Name).replace(/"/g, '&quot;')}")'>
            <div class="result-name">${escapeHtml(charity.Name)}</div>
            <div class="result-info">
                Reg #: ${charity.CharityRegistrationNumber || 'N/A'} |
                Registered: ${formatDate(charity.DateRegistered)}
            </div>
        </div>
    `).join('');

    searchResults.classList.remove('hidden');
}

// Elegant typing effect for search input
async function typeText(element, text, speed = 40) {
    element.value = '';
    element.disabled = true;
    clearSearchBtn.classList.add('hidden'); // Hide clear button during typing

    for (let i = 0; i < text.length; i++) {
        element.value += text.charAt(i);
        // Variable speed - faster at the start, slower at the end for elegance
        const delay = speed + (i / text.length) * 20;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    element.disabled = false;
    toggleClearButton(); // Show clear button after typing completes
}

async function selectCharity(organisationId, charityName) {
    // Store current charity info for sharing
    currentCharityId = organisationId;
    currentCharityName = charityName;

    // Update URL with charity ID and name for sharing and browser history
    const charityDisplayName = charityName || '';
    const urlParams = new URLSearchParams();
    urlParams.set('id', organisationId);
    if (charityDisplayName) {
        urlParams.set('name', charityDisplayName);
    }
    window.history.pushState({ charityId: organisationId, charityName: charityDisplayName }, '', `${BASE_PATH}/?${urlParams.toString()}`);

    // Start elegant typing effect
    const originalValue = searchInput.value;
    if (charityName) {
        typeText(searchInput, charityName, 30);
    } else {
        searchInput.value = '';
        searchInput.disabled = true;
    }

    // Show search Pac-Man loader
    const searchLoading = document.getElementById('searchLoading');
    if (searchLoading) {
        searchLoading.classList.remove('hidden');
    }

    searchResults.classList.add('hidden');
    charityDetails.classList.add('hidden');
    financialSection.classList.add('hidden');
    noFinancialData.classList.add('hidden');

    // Reset all data before loading new charity
    resetCharityData();

    try {
        // Show full-screen loading overlay
        showLoadingOverlay();
        hideError();

        // Fetch all data in parallel and wait for everything to complete
        const orgUrl = `${getApiEndpoint('organisation')}?id=${organisationId}`;
        const orgResponse = await fetch(orgUrl);
        if (!orgResponse.ok) throw new Error('Failed to fetch charity details');

        const orgData = await orgResponse.json();
        const charity = orgData.d || orgData;

        // Load all data in parallel
        const [financialData] = await Promise.all([
            loadFinancialData(organisationId),
            loadHistoricalReturns(organisationId),
            loadOfficers(organisationId),
            loadDocuments(organisationId)
        ]);

        // Display charity info after all basic data is loaded
        displayCharityInfo(charity);

        // If charity is part of a group, load group members
        if (charity.GroupId && charity.GroupId > 0) {
            await loadGroupMembers(charity.GroupId, organisationId, !financialData);
        }

        // Hide overlay and show content only after everything is loaded
        hideLoadingOverlay();
        charityDetails.classList.remove('hidden');

        // Hide search Pac-Man loader
        if (searchLoading) {
            searchLoading.classList.add('hidden');
        }

        // Auto-scroll to charity name
        setTimeout(() => {
            const charityNameElement = document.getElementById('charityName');
            if (charityNameElement) {
                charityNameElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);

        // Setup scroll animations for the newly loaded content
        setTimeout(() => setupScrollAnimations(), 200);
    } catch (err) {
        hideLoadingOverlay();

        // Hide search Pac-Man loader
        if (searchLoading) {
            searchLoading.classList.add('hidden');
        }

        // Restore search input
        searchInput.value = charityName || originalValue;
        searchInput.disabled = false;
        toggleClearButton(); // Show clear button if there's a value

        showError('Error loading charity details: ' + err.message);
    }
}

function displayCharityInfo(charity) {
    document.getElementById('charityName').textContent = charity.Name;

    const statusBadge = document.getElementById('charityStatus');
    statusBadge.textContent = charity.RegistrationStatus || 'Unknown';
    statusBadge.className = 'status-badge ' +
        (charity.RegistrationStatus === 'Registered' ? 'active' : 'inactive');

    // Add link to official charity register page
    const officialLink = document.getElementById('viewOfficialLink');
    if (charity.AccountId) {
        officialLink.href = `http://www.register.charities.govt.nz/CharitiesRegister/ViewCharity?accountId=${charity.AccountId}`;
        officialLink.classList.remove('hidden');
    }

    // Show share container and generate link
    const shareUrl = `${window.location.origin}${BASE_PATH}/?id=${currentCharityId}`;
    document.getElementById('shareUrl').textContent = shareUrl;
    document.getElementById('shareContainer').classList.remove('hidden');

    document.getElementById('regNumber').textContent = charity.CharityRegistrationNumber || 'N/A';
    document.getElementById('dateRegistered').textContent = formatDate(charity.DateRegistered);
    document.getElementById('entityType').textContent = getEntityType(charity);
    document.getElementById('mainActivity').textContent = getActivityName(charity.MainActivityId);

    // Show group banner if charity is part of a group
    console.log('GroupId check:', charity.GroupId, 'Type:', typeof charity.GroupId, 'Greater than 0:', charity.GroupId > 0);
    if (charity.GroupId && charity.GroupId > 0) {
        console.log('Showing group banner');
        const groupBanner = document.getElementById('groupBanner');
        const viewGroupLink = document.getElementById('viewGroupLink');

        if (!groupBanner || !viewGroupLink) {
            console.error('Group banner elements not found!', { groupBanner, viewGroupLink });
            return;
        }

        groupBanner.classList.remove('hidden');

        // Store groupId and name for the click handler
        const groupId = charity.GroupId;
        const charityName = charity.Name;

        console.log('Setting up click handler for group link', { groupId, charityName });

        viewGroupLink.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Group link clicked, showing group:', groupId);
            showGroupDetails(groupId, charityName);
            return false;
        };

        console.log('Click handler attached successfully');
    } else {
        console.log('Hiding group banner');
        document.getElementById('groupBanner').classList.add('hidden');
    }

    if (charity.CharitablePurpose) {
        document.getElementById('purposeText').textContent = charity.CharitablePurpose;
        document.getElementById('charitablePurpose').classList.remove('hidden');
    }

    const emailEl = document.getElementById('email');
    const email = charity.CharityEmailAddress || charity.EMailAddress1;
    emailEl.innerHTML = email ? `<a href="mailto:${email}">${email}</a>` : 'N/A';

    const phoneEl = document.getElementById('phone');
    const phone = charity.Telephone1 || charity.Telephone2 || charity.TelephoneDay;
    phoneEl.textContent = phone || 'N/A';

    const websiteEl = document.getElementById('website');
    if (charity.WebSiteURL) {
        const url = charity.WebSiteURL.startsWith('http') ? charity.WebSiteURL : 'https://' + charity.WebSiteURL;
        websiteEl.innerHTML = `<a href="${url}" target="_blank">${charity.WebSiteURL}</a>`;
    } else {
        websiteEl.textContent = 'N/A';
    }

    const addressEl = document.getElementById('address');
    const address = formatAddress(charity);
    addressEl.textContent = address;

    const overseasValue = charity.PercentageSpentOverseas != null ? charity.PercentageSpentOverseas + '%' : 'N/A';
    document.getElementById('overseasSpending').textContent = overseasValue;
}

async function loadFinancialData(organisationId) {
    try {
        const financialUrl = `${getApiEndpoint('financial')}?id=${organisationId}`;

        const response = await fetch(financialUrl);
        if (!response.ok) throw new Error('Failed to fetch financial data');

        const data = await response.json();
        const results = data.d || data.value || [];

        if (results.length > 0) {
            const currentYear = results[0];
            const lastYear = results.length > 1 ? results[1] : null;

            // Add last year data to current year object for comparison
            if (lastYear) {
                currentYear.TotalGrossIncome_LastYear = lastYear.TotalGrossIncome || 0;
                currentYear.TotalExpenditure_LastYear = lastYear.TotalExpenditure || 0;
                currentYear.TotalAssets_LastYear = lastYear.TotalAssets || 0;
            }

            displayFinancialData(currentYear);
            financialSection.classList.remove('hidden');
            return currentYear; // Return the financial data
        } else {
            noFinancialData.classList.remove('hidden');
            return null;
        }
    } catch (err) {
        noFinancialData.classList.remove('hidden');
        console.error('Error loading financial data:', err);
        return null;
    }
}

async function loadHistoricalReturns(organisationId) {
    try {
        // Fetch all annual returns for this organization
        const returnsUrl = `${getApiEndpoint('historical')}?id=${organisationId}`;
        const response = await fetch(returnsUrl);

        if (!response.ok) return;

        const data = await response.json();
        const returns = data.d || data.value || [];

        if (returns.length > 0) {
            displayHistoricalReturns(returns);
            document.getElementById('historicalReturnsSection').classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error loading historical returns:', err);
    }
}

function displayHistoricalReturns(returns) {
    const tbody = document.getElementById('historicalReturnsBody');

    const html = returns.map(ret => {
        const yearEnded = formatDate(ret.YearEnded);
        const income = formatCurrency(ret.TotalGrossIncome || 0);
        const expenditure = formatCurrency(ret.TotalExpenditure || 0);
        const surplus = formatCurrency(ret.NetSurplusDeficitForTheYear || 0);
        const returnId = ret.NoticeofChangeAnnualReturnId;

        return `
            <tr>
                <td data-label="Year Ended"><strong>${yearEnded}</strong></td>
                <td data-label="Total Income">${income}</td>
                <td data-label="Total Expenditure">${expenditure}</td>
                <td data-label="Net Surplus/Deficit">${surplus}</td>
                <td>
                    ${returnId ? `<a href="https://register.charities.govt.nz/Document/DownloadPdf?pdfType=AnnualReturnSummary&relatedId=${returnId}&isPublic=true" target="_blank" class="download-pdf-btn">Download PDF</a>` : 'N/A'}
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

async function loadOfficers(organisationId) {
    try {
        const officersUrl = `${getApiEndpoint('officers')}?id=${organisationId}`;

        const response = await fetch(officersUrl);
        if (!response.ok) return;

        const data = await response.json();
        const officers = data.d || data.value || [];

        if (officers.length > 0) {
            displayOfficers(officers);
            document.getElementById('officersSection').classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error loading officers:', err);
    }
}

function displayOfficers(officers) {
    const officersList = document.getElementById('officersList');

    const html = officers.map(officer => {
        // Use correct field names from vOfficerOrganisations
        const name = officer.FullName || officer.BodyCorporateName || 'Unknown';
        const position = officer.PositioninOrganisation || 'Officer';
        const status = officer.OfficerStatus || 'Unknown';

        const statusClass = status === 'Qualified' ? 'qualified' : 'disqualified';
        const appointedDate = formatDate(officer.PositionAppointmentDate);
        const ceasedDate = officer.LastDateAsAnOfficer ? formatDate(officer.LastDateAsAnOfficer) : 'Present';
        const dates = `${appointedDate} - ${ceasedDate}`;

        // Determine if past or current based on LastDateAsAnOfficer
        const isPast = officer.LastDateAsAnOfficer ? 'past' : '';

        return `
            <div class="officer-card">
                <div class="officer-info">
                    <div class="officer-name">${escapeHtml(name)}</div>
                    <div class="officer-position">${escapeHtml(position)}</div>
                    <div class="officer-dates">${dates}</div>
                </div>
                <div class="officer-status ${statusClass} ${isPast}">${isPast ? 'PAST' : status.toUpperCase()}</div>
            </div>
        `;
    }).join('');

    officersList.innerHTML = html;
}

async function loadDocuments(organisationId) {
    try {
        const documentsUrl = `${getApiEndpoint('documents')}?id=${organisationId}`;

        const response = await fetch(documentsUrl);
        if (!response.ok) return;

        const data = await response.json();
        const documents = data.d || data.value || [];

        if (documents.length > 0) {
            displayDocuments(documents);
            document.getElementById('documentsSection').classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error loading documents:', err);
    }
}

function displayDocuments(documents) {
    const documentsList = document.getElementById('documentsList');

    const html = documents.map(doc => {
        const docName = doc.DocumentName || 'Unnamed Document';
        const docType = doc.DocumentType || 'Document';
        const uploadDate = formatDate(doc.UploadDate);
        const docId = doc.DocumentId;
        const downloadUrl = `https://register.charities.govt.nz/Document/DownloadPdf?pdfType=Document&relatedId=${docId}&isPublic=true`;

        return `
            <div class="document-card">
                <div class="document-icon">📄</div>
                <div class="document-info">
                    <div class="document-name">${escapeHtml(docName)}</div>
                    <div class="document-meta">
                        <span class="document-type">${escapeHtml(docType)}</span>
                        <span class="document-date">Uploaded: ${uploadDate}</span>
                    </div>
                </div>
                <a href="${downloadUrl}" target="_blank" class="document-download-btn">Download PDF</a>
            </div>
        `;
    }).join('');

    documentsList.innerHTML = html;
}

async function loadGroupMembers(groupId, currentOrgId, showInNoDataSection = false) {
    try {
        const groupUrl = `${API_BASE}/group?groupId=${groupId}`;
        const response = await fetch(groupUrl);

        if (!response.ok) {
            console.error('Failed to fetch group members');
            return;
        }

        const data = await response.json();
        const members = data.d || data.value || [];

        if (members.length > 1) { // Only show if there are other members
            displayGroupMembers(members, currentOrgId, showInNoDataSection);
        }
    } catch (err) {
        console.error('Error loading group members:', err);
    }
}

function displayGroupMembers(members, currentOrgId, showInNoDataSection = false) {
    // Filter out the current charity and sort by name
    const otherMembers = members
        .filter(m => m.OrganisationId !== currentOrgId && m.RegistrationStatus === 'Registered')
        .sort((a, b) => a.Name.localeCompare(b.Name));

    if (otherMembers.length === 0) return;

    // Check if there are more than 7 other entities in the group
    let groupMembersHtml;
    if (otherMembers.length > 7) {
        groupMembersHtml = `
            <div class="group-members-section">
                <h4>📋 Related Charities in This Group</h4>
                <p>This charity is part of a group structure with ${members.length} ${members.length === 1 ? 'member' : 'members'}.</p>
                <div style="text-align: center; padding: 40px 20px; background: var(--color-white); border-radius: 12px; border: 2px solid var(--color-beige); margin-top: 16px;">
                    <div style="font-size: 36px; margin-bottom: 16px;">📊</div>
                    <h4 style="color: var(--color-text-primary); margin-bottom: 12px; font-size: 18px;">Large Group Structure</h4>
                    <p style="color: var(--color-text-secondary); font-size: 15px; line-height: 1.6;">
                        This group contains ${otherMembers.length} other registered ${otherMembers.length === 1 ? 'charity' : 'charities'}, which is too many to display here.
                        Please visit the official Charities Register for the complete group information.
                    </p>
                </div>
            </div>
        `;
    } else {
        groupMembersHtml = `
            <div class="group-members-section">
                <h4>📋 Related Charities in This Group</h4>
                <p>This charity is part of a group structure with ${members.length} ${members.length === 1 ? 'member' : 'members'}. ${showInNoDataSection ? 'Other charities in this group may have financial data available:' : 'Click to view other charities in this group:'}</p>
                <div class="group-members-list">
                    ${otherMembers.map(member => `
                        <a href="?id=${member.OrganisationId}" target="_blank" rel="noopener noreferrer" class="group-member-card">
                            <div class="group-member-name">${escapeHtml(member.Name)}</div>
                            <div class="group-member-info">
                                ${member.CharityRegistrationNumber || 'N/A'} | Registered ${formatDate(member.DateRegistered)}
                            </div>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (showInNoDataSection) {
        // Insert into the no financial data div
        const noFinancialDataDiv = document.getElementById('noFinancialData');
        if (noFinancialDataDiv && !noFinancialDataDiv.classList.contains('hidden')) {
            // Remove any existing group members section first
            const existingGroupSection = noFinancialDataDiv.querySelector('.group-members-section');
            if (existingGroupSection) {
                existingGroupSection.remove();
            }
            noFinancialDataDiv.insertAdjacentHTML('beforeend', groupMembersHtml);
        }
    } else {
        // Insert as a standalone section after documents
        const documentsSection = document.getElementById('documentsSection');
        if (documentsSection) {
            // Remove any existing standalone group section first
            const existingSection = document.getElementById('groupMembersStandalone');
            if (existingSection) {
                existingSection.remove();
            }

            const standaloneHtml = `<div id="groupMembersStandalone" class="group-members-standalone">${groupMembersHtml}</div>`;
            documentsSection.insertAdjacentHTML('afterend', standaloneHtml);
        }
    }
}

function displayFinancialData(data) {
    const yearEnded = formatDate(data.YearEnded);
    document.getElementById('yearEnded').textContent = `Year ended: ${yearEnded}`;

    const totalIncome = data.TotalGrossIncome || 0;
    const totalExpenditure = data.TotalExpenditure || 0;
    // Calculate net surplus if not provided (Income - Expenditure)
    const netSurplus = data.NetSurplusDeficitForTheYear ?? (totalIncome - totalExpenditure);
    const totalAssets = data.TotalAssets || 0;

    setAnimatedNumber('totalIncome', totalIncome);
    setAnimatedNumber('totalExpenditure', totalExpenditure);

    const surplusEl = document.getElementById('netSurplus');
    setAnimatedNumber('netSurplus', netSurplus);
    surplusEl.style.color = netSurplus >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

    setAnimatedNumber('totalAssets', totalAssets);

    // Reset expenditure labels to defaults (will be updated based on tier)
    resetExpenditureLabels();

    // Expenditure breakdown - comprehensive handling for all tiers
    displayExpenditureBreakdown(data, totalExpenditure);

    // ========== INCOME BREAKDOWN - PROPER FIELD MAPPING ==========
    // Map all known income API fields to their official labels
    const incomeFieldLabels = {
        // Tier 3/4 PBE - Exchange transactions
        'FeesSubscriptionsIncludingDonationsFromMembers': 'Fees, subscriptions (including donations) from members',
        'RevenueFromProvidingGoodsAndServices': 'Revenue from providing goods and services',
        'RevenueFromProvidingGoodsAndServicesFromOtherSources': 'Revenue from providing goods and services from other sources',
        'ServiceDeliveryContractRevenueFromLocalOrCentralGovernment': 'Service delivery contract revenue from government',
        'InterestDividendsAndOtherInvestmentRevenue': 'Interest, dividends and other investment revenue',
        'OtherRevenueFromExchangeTransactions': 'Other revenue from exchange transactions',
        'OtherRevenueFromExchangeTransactionsIncludingFeesSubscriptionsAndDonationsFromMembers': 'Other revenue from exchange transactions',

        // Tier 3/4 PBE - Non-exchange transactions
        'DonationsKohaBequestsAndSimilarRevenue': 'Donations, koha, bequests and similar revenue',
        'DonationsKohaGrantsFundraisingAndOtherSimilarRevenue': 'Donations, koha, grants, fundraising and other similar revenue',
        'GrantsRevenueFromLocalOrCentralGovernment': 'Grants revenue from government',
        'GrantsRevenueFromOtherSources': 'Grants revenue from other sources',
        'OtherRevenueFromNonExchangeTransactions': 'Other revenue from non-exchange transactions',

        // Tier 4 Simple Reporting
        'DonationsKoha': 'Donations, koha and grants',
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
        'OtherRevenue': 'Other revenue',

        // Additional mappings for higher coverage - missing field variants
        'DonationsKohaBequestsAndSimilarRevenueFromNonExchangeTransactions': 'Donations, koha and bequests',
        'GrantsRevenueFromLocalOrCentralGovernmentForServiceDelivery': 'Government grants for service delivery',
        'GrantsRevenueFromLocalOrCentralGovernmentForOtherPurposes': 'Government grants',
        'GrantsRevenueFromOtherSourcesForServiceDelivery': 'Non-government service grants',
        'GrantsRevenueFromOtherSourcesForOtherPurposes': 'Non-government grants',
        'StudentFeesAndTuitionRevenue': 'Student fees and tuition',
        'TuitionFees': 'Tuition fees',
        'StudentFeesNotElsewhereDefined': 'Student fees',
        'SubsidiesAndGrantsFromLocalOrCentralGovernment': 'Government subsidies and grants',
        'SubsidiesAndGrantsFromOtherSources': 'Other subsidies and grants',
        'RevenueFromLeaseOfProperty': 'Property lease revenue',
        'RevenueFromLeaseOfEquipmentOrVehicles': 'Equipment/vehicle lease revenue',
        'RevenueFromProvidingEmergencyShelter': 'Emergency shelter revenue',
        'RevenueFromProvidingAccommodation': 'Accommodation revenue',
        'RevenueFromProvidingMeals': 'Meals revenue',
        'RevenueFromProvidingCounselling': 'Counselling revenue',
        'RevenueFromProvidingAgedCare': 'Aged care revenue',
        'RevenueFromProvidingChildcareServices': 'Childcare revenue',
        'RevenueFromProvidingHealthServices': 'Health services revenue',
        'RevenueFromProvidingEducationServices': 'Education services revenue',
        'CommunityEducationRevenue': 'Community education revenue',
        'VocationalEducationAndTrainingRevenue': 'Vocational training revenue',
        'KindergartensAndEarlyChildhoodCentresRevenue': 'Early childhood services revenue'
    };

    const incomeLineItems = [];
    const processedIncomeValues = new Map(); // Track value+field combos to avoid duplicates
    let totalAccountedIncome = 0;

    console.log('Processing income fields:');

    // Process each known income field
    Object.keys(data).forEach(fieldName => {
        const value = data[fieldName];

        // Skip if not an income field or invalid value
        if (!value || value <= 0) return;

        // Skip boolean fields
        if (value === true || value === false) return;

        // Check if this looks like an income field
        const isIncomeField = (
            incomeFieldLabels[fieldName] || // Known field
            (fieldName.includes('Income') && !fieldName.includes('Total') && !fieldName.includes('LastYear')) ||
            (fieldName.includes('Revenue') && !fieldName.includes('Total') && !fieldName.includes('Comprehensive')) ||
            (fieldName.includes('Grant') && !fieldName.includes('Paid') && !fieldName.includes('Made')) ||
            (fieldName.includes('Donation') && !fieldName.includes('Paid') && !fieldName.includes('Made')) ||
            (fieldName.includes('Koha')) ||
            (fieldName.includes('Subscription')) ||
            (fieldName.includes('Fees') && !fieldName.includes('Membership') === false) ||
            (fieldName.includes('Trading') && !fieldName.includes('Cost')) ||
            (fieldName.includes('Dividend')) ||
            (fieldName.includes('Interest') && !fieldName.includes('Paid'))
        );

        if (!isIncomeField) return;

        // Skip totals, accumulated, comprehensive, etc.
        if (fieldName.includes('Total') || fieldName.includes('Accumulated') ||
            fieldName.includes('Comprehensive') || fieldName.includes('LastYear') ||
            fieldName.includes('Expense') || fieldName.includes('Surplus') || fieldName.includes('Deficit')) {
            return;
        }

        // Check for duplicate values (same amount from different field names)
        const isDuplicate = Array.from(processedIncomeValues.values()).some(entry =>
            entry.value === value && entry.field !== fieldName
        );

        if (isDuplicate) {
            const original = Array.from(processedIncomeValues.values()).find(e => e.value === value);
            console.log(`  ${fieldName}: ${value} (DUPLICATE of ${original.field} - SKIPPED)`);
            return;
        }

        // Get label - use mapped label or convert camelCase
        const label = incomeFieldLabels[fieldName] || fieldName.replace(/([A-Z])/g, ' $1').trim();

        console.log(`  ${fieldName}: ${value} ✓`);
        incomeLineItems.push({ fieldName, label, amount: value });
        totalAccountedIncome += value;
        processedIncomeValues.set(fieldName, { field: fieldName, value });
    });

    console.log('\nIncome breakdown:');
    incomeLineItems.forEach(item => console.log(`  ${item.label}: ${item.amount}`));
    console.log('Total accounted:', totalAccountedIncome);
    console.log('Total from API:', totalIncome);

    const unaccountedIncome = totalIncome - totalAccountedIncome;
    if (Math.abs(unaccountedIncome) > 100) {
        console.warn('⚠️  WARNING: Unaccounted income:', unaccountedIncome);
        console.warn('     This may indicate missing field mappings!');
    }

    // Get the reporting tier from the API
    const reportingTier = data.ReportingTierId || 0;
    console.log('Reporting Tier:', reportingTier);

    // Update tier badge
    const tierBadge = document.getElementById('charityTier');
    if (reportingTier && tierBadge) {
        tierBadge.textContent = `TIER ${reportingTier}`;
        tierBadge.classList.remove('hidden');
    }

    console.log('\n📊 INCOME SOURCES (NO GROUPING):');
    incomeLineItems.forEach((item, index) => {
        const percentage = ((item.amount / totalIncome) * 100).toFixed(1);
        console.log(`${index + 1}. ${item.fieldName}: $${item.amount.toLocaleString()} (${percentage}%)`);
    });

    // Map to the available HTML category slots (we have 9 slots available)
    const availableSlots = ['donations', 'generalGrants', 'capitalGrants', 'govGrants', 'nonGovGrants', 'membershipFees', 'commercialRevenue', 'investment', 'otherIncome'];

    // Reset all slots first
    availableSlots.forEach(id => {
        displayBreakdownBar(id, 0, totalIncome, true);
        // Reset label
        const barEl = document.getElementById(id + 'Bar');
        const itemEl = barEl ? barEl.closest('.breakdown-item') : null;
        const labelEl = itemEl ? itemEl.querySelector('.breakdown-label') : null;
        if (itemEl) itemEl.classList.add('hidden');
    });

    // Display each income line item using available slots
    incomeLineItems.forEach((item, index) => {
        if (index < availableSlots.length) {
            const slotId = availableSlots[index];
            const barEl = document.getElementById(slotId + 'Bar');
            const itemEl = barEl ? barEl.closest('.breakdown-item') : null;
            const labelEl = itemEl ? itemEl.querySelector('.breakdown-label') : null;

            if (labelEl) {
                // Use the mapped label from incomeFieldLabels
                labelEl.textContent = item.label;
            }
            if (itemEl) {
                itemEl.classList.remove('hidden');
            }

            displayBreakdownBar(slotId, item.amount, totalIncome, true);
        }
    });

    // Hide unaccounted income item
    const unaccountedIncomeItem = document.getElementById('unaccountedIncomeItem');
    if (unaccountedIncomeItem) unaccountedIncomeItem.classList.add('hidden');

    // Display income total
    const incomeTotalEl = document.getElementById('incomeTotalAmount');
    if (incomeTotalEl) {
        incomeTotalEl.textContent = formatCurrency(totalIncome);
    }

    displayInsights(data, totalExpenditure, totalIncome);

    // Asset breakdown - handle different field names across tiers
    const cashAssets = (data.CashAndBankBalances || 0) + (data.CashAndShortTermDeposits || 0);
    const investments = data.Investments || 0;
    // PropertyPlantAndEquipmment is a typo in the API (3 m's instead of 2)
    const propertyPlantEquipment = (data.PropertyPlantAndEquipment || 0) + (data.PropertyPlantAndEquipmment || 0);
    const land = (data.Land || 0) + (data.Buildings || 0) + (data.LandAndBuildings || 0) + propertyPlantEquipment;
    const otherAssets = totalAssets - cashAssets - investments - land;
    const totalLiabilities = data.TotalLiabilities || 0;
    const totalEquity = data.TotalEquity || 0;

    document.getElementById('cashAssets').textContent = formatCurrency(cashAssets);
    document.getElementById('investments').textContent = formatCurrency(investments);
    document.getElementById('landBuildings').textContent = formatCurrency(land);
    document.getElementById('otherAssets').textContent = formatCurrency(otherAssets);
    document.getElementById('totalLiabilities').textContent = formatCurrency(totalLiabilities);
    document.getElementById('totalEquity').textContent = formatCurrency(totalEquity);

    displayYearOverYear(data, totalIncome, totalExpenditure, totalAssets);
    displayPeopleOperations(data);
}

function displayYearOverYear(data, income, expenditure, assets) {
    const incomeLast = data.TotalGrossIncome_LastYear || 0;
    const expenditureLast = data.TotalExpenditure_LastYear || 0;
    const assetsLast = data.TotalAssets_LastYear || 0;

    setAnimatedNumber('yoyIncome', income);
    setAnimatedNumber('yoyIncomeLast', incomeLast);
    displayChange('yoyIncomeChange', income, incomeLast);

    setAnimatedNumber('yoyExpenditure', expenditure);
    setAnimatedNumber('yoyExpenditureLast', expenditureLast);
    displayChange('yoyExpenditureChange', expenditure, expenditureLast);

    setAnimatedNumber('yoyAssets', assets);
    setAnimatedNumber('yoyAssetsLast', assetsLast);
    displayChange('yoyAssetsChange', assets, assetsLast);
}

function displayChange(elementId, current, previous) {
    const el = document.getElementById(elementId);
    if (previous === 0 || !previous) {
        el.textContent = 'N/A';
        el.className = 'yoy-change neutral';
        return;
    }

    const change = ((current - previous) / previous) * 100;
    const absChange = Math.abs(change);
    const sign = change > 0 ? '+' : '';

    const finalText = `${sign}${change.toFixed(1)}%`;
    el.textContent = finalText;
    el.className = 'yoy-change ' + (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral');

    // Add animation data
    el.setAttribute('data-animate-number', 'true');
    el.setAttribute('data-final-value', finalText);
    el.setAttribute('data-number-value', change.toString());
}

function displayPeopleOperations(data) {
    const volunteers = data.AvgNoVolunteersPerWeek || 0;
    const volunteerHours = data.AvgAllVolunteerHoursPerWeek || 0;
    const ftEmployees = data.NumberOfFulltimeEmployees || 0;
    const ptEmployees = data.NumberOfParttimeEmployees || 0;
    const paidHours = data.AvgAllPaidHoursPerWeek || 0;

    // Display volunteers - if count is 0 but hours exist, show hours with note
    if (volunteers > 0) {
        document.getElementById('volunteersCount').textContent = volunteers.toLocaleString();
        document.getElementById('volunteerHours').textContent = volunteerHours > 0 ? `${volunteerHours.toLocaleString()} average hours per week` : '';
    } else if (volunteerHours > 0) {
        document.getElementById('volunteersCount').textContent = 'Not specified';
        document.getElementById('volunteerHours').textContent = `${volunteerHours.toLocaleString()} average hours per week`;
    } else {
        document.getElementById('volunteersCount').textContent = 'None reported';
        document.getElementById('volunteerHours').textContent = '';
    }

    const totalEmployees = ftEmployees + ptEmployees;
    document.getElementById('employeesCount').textContent = totalEmployees > 0 ? `${ftEmployees} FT, ${ptEmployees} PT` : 'None reported';
    document.getElementById('employeeHours').textContent = paidHours > 0 ? `${paidHours.toLocaleString()} average hours per week` : '';
}

function displayBreakdownBar(id, amount, total, isIncome = false) {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    const barEl = document.getElementById(id + 'Bar');
    const amountEl = document.getElementById(id + 'Amount');
    const itemEl = barEl ? barEl.closest('.breakdown-item') : null;

    if (barEl) {
        barEl.style.width = percentage + '%';
    }

    if (amountEl) {
        amountEl.textContent = `${formatCurrency(amount)} (${percentage.toFixed(1)}%)`;
    }

    // Hide breakdown items with $0 value to reduce clutter
    if (itemEl && !itemEl.id.includes('unaccounted')) {
        if (amount === 0 || percentage < 0.01) {
            itemEl.style.display = 'none';
        } else {
            itemEl.style.display = '';
        }
    }
}

function displayInsights(data, totalExpenditure, totalIncome) {
    // Program efficiency = all expenses except salaries/wages (which are considered overhead)
    // Use the same calculation as the main breakdown for consistency
    const salaries = (data.SalariesAndWages || 0) + (data.EmployeeRemunerationAndOtherRelatedExpenses || 0);
    const fundraising = (data.ExpensesRelatedToFundraising || 0) + (data.FundRaisingExpenses || 0);
    const serviceProvision = (data.CostOfServiceProvision || 0) + (data.OtherExpensesRelatedToServiceDelivery || 0) + (data.OtherRelatedToDeliveryOfEntityObjectives || 0);
    const grants = (data.GrantsPaidWithinNZ || 0) + (data.GrantsAndDonationsMade || 0);
    const trading = (data.CostOfTradingOperations || 0) + (data.ExpensesRelatedToCommercialActivities || 0);
    const volunteerExp = data.VolunteerRelatedExpenses || 0;
    const otherExp = (data.AllOtherExpenditure || 0) + (data.Depreciation || 0);

    // Calculate accounted expenditure
    const accountedExpenditure = salaries + fundraising + serviceProvision + grants + trading + volunteerExp + otherExp;
    const unaccountedExp = totalExpenditure - accountedExpenditure;

    // Program spending = everything except salaries (fundraising, service, grants, etc.)
    let programSpending = fundraising + serviceProvision + grants + trading + volunteerExp + otherExp;

    // If there's significant unaccounted expenditure, include it in program spending
    if (unaccountedExp > 0) {
        programSpending += unaccountedExp;
    }

    const programEfficiency = totalExpenditure > 0 ? (programSpending / totalExpenditure) * 100 : 0;
    const staffRatio = totalExpenditure > 0 ? (salaries / totalExpenditure) * 100 : 0;

    setAnimatedPercentage('programEfficiency', programEfficiency);
    setAnimatedPercentage('staffRatio', staffRatio);
}

function getActivityName(activityId) {
    const activities = {
        1: 'Advancing Education',
        2: 'Advancing Religion',
        3: 'Relieving Poverty',
        4: 'Other Charitable Purpose',
        5: 'Advancing Culture',
        6: 'Promoting Health',
        7: 'Advancing Civic or Community Purpose',
        8: 'Protecting Environment'
    };
    return activities[activityId] || 'Not specified';
}

function getEntityType(charity) {
    if (charity.IsIncorporated) return 'Incorporated Society';
    if (charity.TrusteesTrust) return 'Trust';
    if (charity.CompaniesOfficeNumber) return 'Company';
    return charity.OrganisationalType || 'Not specified';
}

function formatAddress(charity) {
    const parts = [];
    if (charity.StreetAddressLine1) parts.push(charity.StreetAddressLine1);
    if (charity.StreetAddressLine2) parts.push(charity.StreetAddressLine2);
    if (charity.StreetAddressSuburb) parts.push(charity.StreetAddressSuburb);
    if (charity.StreetAddressCity) parts.push(charity.StreetAddressCity);
    if (charity.StreetAddressPostCode) parts.push(charity.StreetAddressPostCode);

    if (parts.length === 0) {
        if (charity.PostalAddressLine1) parts.push(charity.PostalAddressLine1);
        if (charity.PostalAddressLine2) parts.push(charity.PostalAddressLine2);
        if (charity.PostalAddressCity) parts.push(charity.PostalAddressCity);
        if (charity.PostalAddressPostCode) parts.push(charity.PostalAddressPostCode);
    }

    return parts.length > 0 ? parts.join(', ') : 'N/A';
}

function formatCurrency(value) {
    if (value == null || isNaN(value)) return 'N/A';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        return sign + '$' + (absValue / 1000000).toFixed(2) + 'M';
    } else if (absValue >= 1000) {
        return sign + '$' + (absValue / 1000).toFixed(1) + 'K';
    }
    return sign + '$' + absValue.toFixed(2);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showLoading(shouldScroll = false) {
    loading.classList.remove('hidden');
    if (shouldScroll) {
        loading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    const charityDetails = document.getElementById('charityDetails');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
    if (charityDetails) {
        charityDetails.classList.add('loading');
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    const charityDetails = document.getElementById('charityDetails');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    if (charityDetails) {
        charityDetails.classList.remove('loading');
    }
}

function showGroupLoadingOverlay() {
    const overlay = document.getElementById('groupLoadingOverlay');
    const groupDetails = document.getElementById('groupDetails');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
    if (groupDetails) {
        groupDetails.classList.add('loading');
    }
}

function hideGroupLoadingOverlay() {
    const overlay = document.getElementById('groupLoadingOverlay');
    const groupDetails = document.getElementById('groupDetails');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    if (groupDetails) {
        groupDetails.classList.remove('loading');
    }
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.add('hidden');
    }
});

// Check if URL has a charity ID parameter on page load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const charityId = urlParams.get('id');
    const charityName = urlParams.get('name');

    if (charityId) {
        selectCharity(parseInt(charityId), charityName);
    }
});

function toggleOfficers() {
    const officersList = document.getElementById('officersList');
    const toggleIcon = document.getElementById('officersToggle');

    officersList.classList.toggle('collapsed');
    toggleIcon.classList.toggle('collapsed');
}

function resetCharityData() {
    // Reset basic info
    document.getElementById('charityName').textContent = '';
    document.getElementById('charityStatus').textContent = '';
    document.getElementById('charityTier').classList.add('hidden');
    document.getElementById('regNumber').textContent = '';
    document.getElementById('dateRegistered').textContent = '';
    document.getElementById('entityType').textContent = '';
    document.getElementById('mainActivity').textContent = '';

    // Reset official link and share
    document.getElementById('viewOfficialLink').classList.add('hidden');
    document.getElementById('shareContainer').classList.add('hidden');

    // Reset purpose section
    document.getElementById('purposeText').textContent = '';
    document.getElementById('charitablePurpose').classList.add('hidden');

    // Reset contact info
    document.getElementById('email').textContent = 'N/A';
    document.getElementById('phone').textContent = 'N/A';
    document.getElementById('website').textContent = 'N/A';
    document.getElementById('address').textContent = 'N/A';

    // Reset financial section
    document.getElementById('yearEnded').textContent = '';
    document.getElementById('totalIncome').textContent = 'N/A';
    document.getElementById('totalExpenditure').textContent = 'N/A';
    document.getElementById('netSurplus').textContent = 'N/A';
    document.getElementById('totalAssets').textContent = 'N/A';

    // Reset expenditure breakdown
    resetBreakdownBar('salaries');
    resetBreakdownBar('service');
    resetBreakdownBar('grants');
    resetBreakdownBar('trading');
    resetBreakdownBar('otherExp');
    resetBreakdownBar('fundraising');
    resetBreakdownBar('volunteer');

    // Reset expenditure labels to defaults
    resetExpenditureLabels();

    // Reset income breakdown
    resetBreakdownBar('donations');
    resetBreakdownBar('govGrants');
    resetBreakdownBar('serviceIncome');
    resetBreakdownBar('investment');
    resetBreakdownBar('otherIncome');

    // Reset insights
    document.getElementById('programEfficiency').textContent = '0%';
    document.getElementById('staffRatio').textContent = '0%';
    document.getElementById('overseasSpending').textContent = 'N/A';

    // Reset assets
    document.getElementById('cashAssets').textContent = 'N/A';
    document.getElementById('investments').textContent = 'N/A';
    document.getElementById('landBuildings').textContent = 'N/A';
    document.getElementById('otherAssets').textContent = 'N/A';
    document.getElementById('totalLiabilities').textContent = 'N/A';
    document.getElementById('totalEquity').textContent = 'N/A';

    // Reset YoY
    document.getElementById('yoyIncome').textContent = 'N/A';
    document.getElementById('yoyIncomeLast').textContent = 'N/A';
    document.getElementById('yoyIncomeChange').textContent = 'N/A';
    document.getElementById('yoyExpenditure').textContent = 'N/A';
    document.getElementById('yoyExpenditureLast').textContent = 'N/A';
    document.getElementById('yoyExpenditureChange').textContent = 'N/A';
    document.getElementById('yoyAssets').textContent = 'N/A';
    document.getElementById('yoyAssetsLast').textContent = 'N/A';
    document.getElementById('yoyAssetsChange').textContent = 'N/A';

    // Reset operations
    document.getElementById('volunteersCount').textContent = 'None reported';
    document.getElementById('volunteerHours').textContent = '';
    document.getElementById('employeesCount').textContent = 'None reported';
    document.getElementById('employeeHours').textContent = '';

    // Reset historical returns section
    document.getElementById('historicalReturnsBody').innerHTML = '';
    document.getElementById('historicalReturnsSection').classList.add('hidden');

    // Reset officers section
    document.getElementById('officersList').innerHTML = '';
    document.getElementById('officersSection').classList.add('hidden');

    // Reset documents section
    document.getElementById('documentsList').innerHTML = '';
    document.getElementById('documentsSection').classList.add('hidden');

    // Hide group details if visible
    document.getElementById('groupDetails').classList.add('hidden');
    document.getElementById('charityDetails').classList.remove('hidden');
    const searchSection = document.querySelector('.search-section');
    if (searchSection) searchSection.style.display = '';

    // Remove animation attributes from previous load
    document.querySelectorAll('[data-animate-number]').forEach(el => {
        el.removeAttribute('data-animate-number');
        el.removeAttribute('data-final-value');
        el.removeAttribute('data-number-value');
        el.classList.remove('animated');
    });

    // Reset card animations
    document.querySelectorAll('.financial-card, .insight-card, .operations-card, .yoy-item').forEach(card => {
        card.classList.remove('animated');
    });
}

function resetBreakdownBar(id) {
    const barEl = document.getElementById(id + 'Bar');
    const amountEl = document.getElementById(id + 'Amount');

    if (barEl) {
        barEl.style.width = '0%';
    }

    if (amountEl) {
        amountEl.textContent = '$0 (0.0%)';
    }
}

function resetExpenditureLabels() {
    // Reset all expenditure breakdown labels to their default values
    const defaultLabels = {
        'salaries': 'Volunteer and employee related costs',
        'fundraising': 'Fundraising Expenses',
        'service': 'Costs related to providing goods and services',
        'grants': 'Grants and Donations made',
        'trading': 'Trading Operations',
        'volunteer': 'Volunteer Expenses',
        'otherExp': 'Other expenses'
    };

    Object.entries(defaultLabels).forEach(([id, label]) => {
        const barEl = document.getElementById(id + 'Bar');
        const itemEl = barEl ? barEl.closest('.breakdown-item') : null;
        const labelEl = itemEl ? itemEl.querySelector('.breakdown-label') : null;

        if (labelEl) {
            labelEl.textContent = label;
        }
    });
}

function displayExpenditureBreakdown(data, totalExpenditure) {
    console.log('\n=== EXPENDITURE BREAKDOWN ===');
    console.log('Total expenditure from API:', totalExpenditure);

    // ========== EXPENSE BREAKDOWN - PROPER FIELD MAPPING ==========
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
        'CostsRelatedToProvidingGoodsAndServices': 'Costs related to providing goods and services',

        // Educational Institution Expense Fields
        'TeachingStaffCosts': 'Teaching staff costs',
        'SupportStaffCosts': 'Support staff costs',
        'EducationalMaterialsAndSupplies': 'Educational materials and supplies',
        'FacilitiesAndMaintenanceCosts': 'Facilities and maintenance',
        'StudentSupportServices': 'Student support services',
        'CurriculumDevelopmentCosts': 'Curriculum development',
        'AdmissionsAndEnrolmentCosts': 'Admissions and enrolment',
        'CostsOfProvidingEducation': 'Costs of providing education',
        'CommunityEducationCosts': 'Community education costs',
        'VocationalEducationAndTrainingCosts': 'Vocational training costs',
        'KindergartensAndEarlyChildhoodCentresCosts': 'Early childhood services costs'
    };

    const expenseLineItems = [];
    const processedExpenseValues = new Map();
    let totalAccountedExpense = 0;

    console.log('Processing expense fields:');

    // Process each field
    Object.keys(data).forEach(fieldName => {
        const value = data[fieldName];

        // Skip label fields (e.g., MaterialExpense1Label)
        if (fieldName.match(/Label$/)) {
            return;
        }

        // Skip MaterialExpense fields - they are handled in the dedicated loop below
        if (fieldName.match(/^MaterialExpense\d+$/)) {
            return;
        }

        // Skip invalid values
        if (!value || value <= 0) return;

        // Skip boolean fields
        if (value === true || value === false) return;

        // Check if this is an expense field
        const isExpenseField = (
            expenseFieldLabels[fieldName] || // Known field
            (fieldName.includes('Expense') && !fieldName.includes('Revenue') && !fieldName.includes('Income')) ||
            (fieldName.includes('Expenditure') && !fieldName.includes('Total')) ||
            (fieldName.includes('Cost') && !fieldName.includes('Revenue')) ||
            (fieldName.includes('Salaries')) ||
            (fieldName.includes('Wages')) ||
            (fieldName.includes('Depreciation')) ||
            (fieldName.includes('Remuneration')) ||
            (fieldName.includes('Related') && (fieldName.includes('Delivery') || fieldName.includes('Objectives')))
        );

        if (!isExpenseField) return;

        // Skip totals, non-financial metrics, etc.
        if (fieldName.includes('Total') || fieldName.includes('Accumulated') ||
            fieldName.includes('Comprehensive') || fieldName.includes('LastYear') ||
            fieldName.includes('Revenue') || fieldName.includes('Income') ||
            fieldName.includes('Hours') || fieldName.includes('Week') ||
            fieldName.includes('Number') || fieldName.includes('Avg') ||
            (fieldName.includes('Paid') && (fieldName.includes('GST') || fieldName.includes('Tax')))) {
            return;
        }

        // Check for duplicates
        const isDuplicate = Array.from(processedExpenseValues.values()).some(entry =>
            entry.value === value && entry.field !== fieldName
        );

        if (isDuplicate) {
            const original = Array.from(processedExpenseValues.values()).find(e => e.value === value);
            console.log(`  ${fieldName}: ${value} (DUPLICATE of ${original.field} - SKIPPED)`);
            return;
        }

        // Get label
        let label = expenseFieldLabels[fieldName];

        // For Tier 2 MaterialExpense fields, use the corresponding label field if it exists
        if (fieldName.match(/^MaterialExpense\d+$/)) {
            const labelFieldName = fieldName + 'Label';
            const customLabel = data[labelFieldName];
            if (customLabel && typeof customLabel === 'string') {
                label = customLabel;
            } else {
                // Default fallback if no custom label
                label = fieldName.replace(/([A-Z])/g, ' $1').trim();
            }
        } else if (!label) {
            // For other unmapped fields, use camelCase conversion
            label = fieldName.replace(/([A-Z])/g, ' $1').trim();
        }

        console.log(`  ${fieldName}: ${value} ✓`);
        expenseLineItems.push({ fieldName, label, amount: value });
        totalAccountedExpense += value;
        processedExpenseValues.set(fieldName, { field: fieldName, value });
    });

    // Also check for Tier 2 MaterialExpense fields (not in the standard mapping)
    for (let i = 1; i <= 4; i++) {
        const fieldName = `MaterialExpense${i}`;
        const value = data[fieldName];

        // Skip if field doesn't exist, is not a number, is zero
        if (!value || typeof value !== 'number' || value <= 0) {
            continue;
        }

        // Check if this value was already processed to avoid duplicates
        const isDuplicate = Array.from(processedExpenseValues.values()).some(entry =>
            entry.value === value && entry.field !== fieldName
        );

        if (isDuplicate) {
            const original = Array.from(processedExpenseValues.values()).find(e => e.value === value);
            console.log(`  ${fieldName}: ${value} (DUPLICATE of ${original.field} - SKIPPED)`);
            continue;
        }

        // Get the custom label if it exists
        const labelFieldName = fieldName + 'Label';
        const customLabel = data[labelFieldName];
        let label = (customLabel && typeof customLabel === 'string')
            ? customLabel
            : fieldName.replace(/([A-Z])/g, ' $1').trim();

        console.log(`  ${fieldName}: ${value} ✓`);
        expenseLineItems.push({ fieldName, label, amount: value });
        totalAccountedExpense += value;
        processedExpenseValues.set(fieldName, { field: fieldName, value });
    }

    console.log('\nExpenditure breakdown:');
    expenseLineItems.forEach(item => console.log(`  ${item.label}: ${item.amount}`));
    console.log('Total accounted:', totalAccountedExpense);
    console.log('Total from API:', totalExpenditure);

    const unaccountedExpense = totalExpenditure - totalAccountedExpense;
    if (Math.abs(unaccountedExpense) > 100) {
        console.warn('⚠️  WARNING: Unaccounted expenditure:', unaccountedExpense);
        console.warn('     This may indicate missing field mappings!');
    }

    console.log('\n📊 EXPENDITURE (NO GROUPING):');
    expenseLineItems.forEach((item, index) => {
        const percentage = ((item.amount / totalExpenditure) * 100).toFixed(1);
        console.log(`${index + 1}. ${item.label}: $${item.amount.toLocaleString()} (${percentage}%)`);
    });

    // Display using available slots
    const allIds = ['salaries', 'fundraising', 'service', 'grants', 'trading', 'volunteer', 'otherExp'];

    // Reset all slots
    allIds.forEach(id => {
        displayBreakdownBar(id, 0, totalExpenditure);
        const barEl = document.getElementById(id + 'Bar');
        const itemEl = barEl ? barEl.closest('.breakdown-item') : null;
        if (itemEl) itemEl.classList.add('hidden');
    });

    // Display each expense line item
    expenseLineItems.forEach((item, index) => {
        if (index < allIds.length) {
            const slotId = allIds[index];
            const barEl = document.getElementById(slotId + 'Bar');
            const itemEl = barEl ? barEl.closest('.breakdown-item') : null;
            const labelEl = itemEl ? itemEl.querySelector('.breakdown-label') : null;

            if (labelEl) {
                labelEl.textContent = item.label;
            }
            if (itemEl) {
                itemEl.classList.remove('hidden');
            }

            displayBreakdownBar(slotId, item.amount, totalExpenditure);
        }
    });

    // Hide unaccounted expenditure item (already handled in console logging above)
    const unaccountedItem = document.getElementById('unaccountedItem');
    if (unaccountedItem) unaccountedItem.classList.add('hidden');

    // Display expenditure total
    const expenditureTotalEl = document.getElementById('expenditureTotalAmount');
    if (expenditureTotalEl) {
        expenditureTotalEl.textContent = formatCurrency(totalExpenditure);
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');

            // If it's a number element, animate it
            if (entry.target.hasAttribute('data-animate-number')) {
                animateNumber(entry.target);
            }
        }
    });
}, observerOptions);

function animateNumber(element) {
    const finalText = element.getAttribute('data-final-value');
    const finalNumber = parseFloat(element.getAttribute('data-number-value'));

    if (isNaN(finalNumber)) {
        element.textContent = finalText;
        return;
    }

    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const isPercentage = finalText.includes('%');
    const isCurrency = finalText.includes('$');
    const isNegative = finalNumber < 0;

    const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Ease out cubic for smooth deceleration
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = finalNumber * easedProgress;

        if (isPercentage) {
            const sign = isNegative && currentValue !== 0 ? '' : (finalText.startsWith('+') ? '+' : '');
            element.textContent = sign + currentValue.toFixed(1) + '%';
        } else if (isCurrency) {
            element.textContent = formatCurrencyAnimated(currentValue);
        } else {
            element.textContent = Math.round(currentValue).toLocaleString();
        }

        if (currentStep >= steps) {
            clearInterval(timer);
            element.textContent = finalText;
        }
    }, stepDuration);
}

function formatCurrencyAnimated(value) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 1000000) {
        return sign + '$' + (absValue / 1000000).toFixed(2) + 'M';
    } else if (absValue >= 1000) {
        return sign + '$' + (absValue / 1000).toFixed(1) + 'K';
    }
    return sign + '$' + absValue.toFixed(2);
}

function setupScrollAnimations() {
    // Observe all financial cards
    document.querySelectorAll('.financial-card, .insight-card, .operations-card, .yoy-item').forEach(card => {
        animateOnScroll.observe(card);
    });

    // Observe all number elements
    document.querySelectorAll('[data-animate-number]').forEach(element => {
        animateOnScroll.observe(element);
    });
}

function setAnimatedNumber(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const formattedValue = formatCurrency(value);
    el.textContent = formattedValue;
    el.setAttribute('data-animate-number', 'true');
    el.setAttribute('data-final-value', formattedValue);
    el.setAttribute('data-number-value', value.toString());
}

function setAnimatedPercentage(elementId, value) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const formattedValue = value.toFixed(1) + '%';
    el.textContent = formattedValue;
    el.setAttribute('data-animate-number', 'true');
    el.setAttribute('data-final-value', formattedValue);
    el.setAttribute('data-number-value', value.toString());
}

// Share functionality - copy link with confetti
function copyShareLink() {
    const shareUrl = document.getElementById('shareUrl').textContent;
    const btn = document.getElementById('shareBtn');

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showCopySuccess(btn);
        }).catch(() => {
            fallbackCopyToClipboard(shareUrl, btn);
        });
    } else {
        fallbackCopyToClipboard(shareUrl, btn);
    }
}

function fallbackCopyToClipboard(text, btn) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showCopySuccess(btn);
    } catch (err) {
        alert('Failed to copy link');
    }
    document.body.removeChild(textArea);
}

function showCopySuccess(btn) {
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.backgroundColor = 'var(--color-green)';
    btn.style.color = 'white';
    btn.style.borderColor = 'var(--color-green)';

    // Trigger confetti
    createConfetti(btn);

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.backgroundColor = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 2000);
}

function createConfetti(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Create 30 confetti pieces
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = centerX + 'px';
        confetti.style.top = centerY + 'px';

        // Random colors
        const colors = ['#5B9A7F', '#fed75a', '#F5F1E8', '#4A7D66', '#FFD700'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random direction
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity - 50;

        confetti.style.setProperty('--vx', vx + 'px');
        confetti.style.setProperty('--vy', vy + 'px');

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 1000);
    }
}

// Group Details Page Functions
async function showGroupDetails(groupId, charityName) {
    try {
        // Hide charity details and search, show group details
        document.getElementById('charityDetails').classList.add('hidden');
        const searchSection = document.querySelector('.search-section');
        if (searchSection) searchSection.style.display = 'none';
        document.getElementById('groupDetails').classList.remove('hidden');

        // Show group loading overlay
        showGroupLoadingOverlay();

        // Fetch group information
        const infoUrl = `${getApiEndpoint('groupinfo')}?groupId=${groupId}`;
        const infoResponse = await fetch(infoUrl);
        let groupInfo = null;
        if (infoResponse.ok) {
            const infoData = await infoResponse.json();
            groupInfo = infoData.d || infoData;
        }

        // Fetch group members list
        const groupUrl = `${getApiEndpoint('group')}?groupId=${groupId}`;
        const groupResponse = await fetch(groupUrl);
        if (!groupResponse.ok) throw new Error('Failed to fetch group data');
        const groupData = await groupResponse.json();
        const members = groupData.d || groupData.value || [];

        // Fetch consolidated financial data for the group
        const financialUrl = `${getApiEndpoint('groupfinancial')}?groupId=${groupId}`;
        const financialResponse = await fetch(financialUrl);
        let groupFinancialData = null;
        if (financialResponse.ok) {
            const financialData = await financialResponse.json();
            const returns = financialData.d || financialData.value || [];
            groupFinancialData = returns.length > 0 ? returns[0] : null;
        }

        // Set title and description
        const groupName = groupInfo ? groupInfo.name : 'Charity Group';
        document.getElementById('groupTitle').textContent = `${groupName} (${members.length} ${members.length === 1 ? 'Member' : 'Members'})`;
        document.getElementById('groupDescription').textContent = `Viewing consolidated information for the group including "${charityName}"`;

        // Display group information
        displayGroupInfo(groupInfo);

        // Display consolidated financial data
        displayGroupConsolidatedFinancials(groupFinancialData);

        // Check if group is too large before fetching detailed member data
        const registeredMembers = members.filter(m => m.RegistrationStatus === 'Registered');

        if (registeredMembers.length > 7) {
            // Group is too large - skip fetching detailed member data and officers
            // Just display the "too many entities" message
            document.getElementById('groupOfficersList').innerHTML = '<p class="no-data-text">Officer information not shown for large groups.</p>';
            displayGroupDetailsMembers(members);
        } else {
            // Fetch and display officers from all members (only for small groups)
            const detailedMembers = await fetchGroupMembersDetails(registeredMembers);
            displayGroupOfficers(detailedMembers);

            // Display members
            displayGroupDetailsMembers(members);
        }

        // Hide group loading overlay
        hideGroupLoadingOverlay();

        // Scroll to group details
        document.getElementById('groupDetails').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        hideGroupLoadingOverlay();
        showError('Error loading group details: ' + err.message);
    }
}

function displayGroupInfo(data) {
    if (!data) {
        document.getElementById('groupInfoSection').classList.add('hidden');
        return;
    }

    document.getElementById('groupInfoSection').classList.remove('hidden');

    // Registration details
    document.getElementById('groupRegNumber').textContent = data.RegistrationNumber || 'N/A';
    document.getElementById('groupDateRegistered').textContent = data.DateRegistered ? formatDate(data.DateRegistered) : 'N/A';
    document.getElementById('groupRegistrationStatus').textContent = data.RegistrationStatus || 'N/A';

    const balanceDate = `${getMonthName(data.EndOfYearMonth)} ${data.EndOfYearDayOfMonth}`;
    document.getElementById('groupBalanceDate').textContent = balanceDate || 'N/A';

    // Charitable purpose
    if (data.CharitablePurpose) {
        document.getElementById('groupCharitablePurpose').classList.remove('hidden');
        document.getElementById('groupPurposeText').textContent = data.CharitablePurpose;
    } else {
        document.getElementById('groupCharitablePurpose').classList.add('hidden');
    }

    // Contact information
    document.getElementById('groupEmail').textContent = data.CharityEmailAddress || 'Not provided';
    document.getElementById('groupPhone').textContent = data.Telephone || 'Not provided';

    if (data.Website) {
        document.getElementById('groupWebsite').innerHTML = `<a href="${escapeHtml(data.Website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.Website)}</a>`;
    } else {
        document.getElementById('groupWebsite').textContent = 'Not provided';
    }

    // Postal address
    const postalParts = [
        data.PostalAddressLine1,
        data.PostalAddressLine2,
        data.PostalAddressSuburb,
        data.PostalAddressTownCity,
        data.PostalAddressPostcode
    ].filter(p => p && p.trim());
    document.getElementById('groupPostalAddress').textContent = postalParts.length > 0 ? postalParts.join(', ') : 'Not provided';

    // Street address
    const streetParts = [
        data.StreetAddressLine1,
        data.StreetAddressLine2,
        data.StreetAddressSuburb,
        data.StreetAddressTownCity,
        data.StreetAddressPostcode
    ].filter(p => p && p.trim());
    document.getElementById('groupStreetAddress').textContent = streetParts.length > 0 ? streetParts.join(', ') : 'Not provided';
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
}

async function fetchGroupMembersDetails(members) {
    const detailedMembers = [];

    for (const member of members) {
        try {
            // Fetch officers for this charity
            const officersUrl = `${getApiEndpoint('officers')}?id=${member.OrganisationId}`;
            const officersResponse = await fetch(officersUrl);

            let officers = [];
            if (officersResponse.ok) {
                const officersData = await officersResponse.json();
                officers = officersData.d || officersData.value || [];
            }

            detailedMembers.push({
                ...member,
                officers: officers
            });
        } catch (err) {
            console.error(`Failed to fetch officers for ${member.Name}:`, err);
            detailedMembers.push({
                ...member,
                officers: []
            });
        }
    }

    return detailedMembers;
}

function displayGroupConsolidatedFinancials(data) {
    // Use official totals from the API
    const totalIncome = data ? (data.TotalGrossIncome || 0) : 0;
    const totalExpenditure = data ? (data.TotalExpenditure || 0) : 0;
    const totalAssets = data ? (data.TotalAssets || 0) : 0;
    const netSurplus = data ? (data.SurplusDeficit || (totalIncome - totalExpenditure)) : 0;

    // Hide section if no data or all values are zero
    if (!data || (totalIncome === 0 && totalExpenditure === 0 && totalAssets === 0)) {
        document.getElementById('groupFinancialSection').classList.add('hidden');
        return;
    }

    document.getElementById('groupFinancialSection').classList.remove('hidden');

    // Display year
    const yearEnded = data.YearEnded ? new Date(data.YearEnded) : null;
    document.getElementById('groupYearRange').textContent = yearEnded
        ? `Financial Year Ended: ${yearEnded.toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}`
        : 'Latest Financial Information';

    // Display main financial figures
    document.getElementById('groupTotalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('groupTotalExpenditure').textContent = formatCurrency(totalExpenditure);
    document.getElementById('groupNetSurplus').textContent = formatCurrency(netSurplus);
    document.getElementById('groupNetSurplus').className = 'financial-amount ' + (netSurplus >= 0 ? 'positive' : 'negative');
    document.getElementById('groupTotalAssets').textContent = formatCurrency(totalAssets);

    // Expenditure breakdown - use proper expense fields
    const employeeExp = (data.EmployeeRemunerationAndOtherRelatedExpenses || 0) + (data.SalariesAndWages || 0);
    const fundraisingExp = (data.FundRaisingExpenses || 0) + (data.ExpensesRelatedToFundraising || 0);
    const serviceExp = (data.CostOfServiceProvision || 0) + (data.OtherExpensesRelatedToServiceDelivery || 0) + (data.OtherRelatedToDeliveryOfEntityObjectives || 0);
    const grantsExp = (data.GrantsPaidWithinNZ || 0) + (data.GrantsAndDonationsMade || 0) + (data.GrantsorDonationsPaid || 0);
    const tradingExp = (data.CostOfTradingOperations || 0) + (data.ExpensesRelatedToCommercialActivities || 0);
    const volunteerExp = data.VolunteerRelatedExpenses || 0;
    const depreciation = data.Depreciation || 0;
    const otherExp = data.AllOtherExpenditure || 0;

    // Use MaterialExpense fields if available (Tier 2), otherwise use the detailed fields above
    const useMaterialExpenses = (data.MaterialExpense1 || 0) + (data.MaterialExpense2 || 0) + (data.MaterialExpense3 || 0) + (data.MaterialExpense4 || 0) > 0;

    if (useMaterialExpenses) {
        const exp1 = data.MaterialExpense1 || 0;
        const exp2 = data.MaterialExpense2 || 0;
        const exp3 = data.MaterialExpense3 || 0;
        const exp4 = data.MaterialExpense4 || 0;

        displayBreakdownBar('groupSalaries', exp1, totalExpenditure);
        displayBreakdownBar('groupFundraising', exp2, totalExpenditure);
        displayBreakdownBar('groupService', exp3, totalExpenditure);
        displayBreakdownBar('groupGrants', exp4, totalExpenditure);
        displayBreakdownBar('groupTrading', 0, totalExpenditure);
        displayBreakdownBar('groupVolunteer', 0, totalExpenditure);
        displayBreakdownBar('groupOtherExp', otherExp, totalExpenditure);
    } else {
        displayBreakdownBar('groupSalaries', employeeExp, totalExpenditure);
        displayBreakdownBar('groupFundraising', fundraisingExp, totalExpenditure);
        displayBreakdownBar('groupService', serviceExp, totalExpenditure);
        displayBreakdownBar('groupGrants', grantsExp, totalExpenditure);
        displayBreakdownBar('groupTrading', tradingExp, totalExpenditure);
        displayBreakdownBar('groupVolunteer', volunteerExp, totalExpenditure);
        displayBreakdownBar('groupOtherExp', otherExp + depreciation, totalExpenditure);
    }

    // Income breakdown - match official register categories exactly
    const donations = data.DonationsKoha || 0;
    const generalGrants = data.GeneralGrantsReceived || 0;
    const capitalGrants = data.CapitalGrantsAndDonations || 0;
    const govGrants = (data.GovtGrantsContracts || 0) + (data.GovernmentServiceDeliveryGrantsContracts || 0);
    const nonGovGrants = data.NonGovernmentServiceDeliveryGrantsContracts || 0;
    const membershipFees = data.MembershipFees || 0;
    const commercialRevenue = (data.ServiceTradingIncome || 0) + (data.RevenueFromCommercialActivities || 0);
    // Use InterestOfDividendsReceived (which includes NZ dividends) to avoid double-counting
    const investmentIncome = (data.InterestOfDividendsReceived || 0) + (data.OtherInvestmentIncome || 0);
    const otherIncome = data.AllOtherIncome || 0;

    displayBreakdownBar('groupDonations', donations, totalIncome, true);
    displayBreakdownBar('groupGeneralGrants', generalGrants, totalIncome, true);
    displayBreakdownBar('groupCapitalGrants', capitalGrants, totalIncome, true);
    displayBreakdownBar('groupGovGrants', govGrants, totalIncome, true);
    displayBreakdownBar('groupNonGovGrants', nonGovGrants, totalIncome, true);
    displayBreakdownBar('groupMembershipFees', membershipFees, totalIncome, true);
    displayBreakdownBar('groupCommercialRevenue', commercialRevenue, totalIncome, true);
    displayBreakdownBar('groupInvestmentIncome', investmentIncome, totalIncome, true);
    displayBreakdownBar('groupOtherIncome', otherIncome, totalIncome, true);

    // Display people statistics
    if (data.NumberOfFulltimeEmployees || data.NumberOfParttimeEmployees || data.AvgNoVolunteersPerWeek) {
        document.getElementById('groupPeopleSection').classList.remove('hidden');

        document.getElementById('groupFullTimeEmployees').textContent = data.NumberOfFulltimeEmployees || '0';
        document.getElementById('groupPartTimeEmployees').textContent = data.NumberOfParttimeEmployees || '0';
        document.getElementById('groupPaidHours').textContent = data.AvgAllPaidHoursPerWeek ? data.AvgAllPaidHoursPerWeek.toLocaleString() : '0';
        document.getElementById('groupTotalVolunteers').textContent = data.AvgNoVolunteersPerWeek ? data.AvgNoVolunteersPerWeek.toLocaleString() : '0';
        document.getElementById('groupVolunteerHours').textContent = data.AvgAllVolunteerHoursPerWeek ? data.AvgAllVolunteerHoursPerWeek.toLocaleString() : '0';
    } else {
        document.getElementById('groupPeopleSection').classList.add('hidden');
    }
}

function displayGroupOfficers(detailedMembers) {
    const allOfficers = [];

    for (const member of detailedMembers) {
        if (!member.officers || member.officers.length === 0) continue;

        member.officers.forEach(officer => {
            allOfficers.push({
                ...officer,
                charityName: member.Name
            });
        });
    }

    if (allOfficers.length === 0) {
        document.getElementById('groupOfficersList').innerHTML = '<p class="no-data-text">No officer information available for this group.</p>';
        return;
    }

    const uniqueOfficers = [];
    const seen = new Set();

    for (const officer of allOfficers) {
        const key = `${officer.FullName}-${officer.Position}`.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            uniqueOfficers.push(officer);
        }
    }

    const sortedOfficers = uniqueOfficers.sort((a, b) => a.FullName.localeCompare(b.FullName));

    const html = sortedOfficers.map(officer => `
        <div class="officer-card">
            <div class="officer-info">
                <div class="officer-name">${escapeHtml(officer.FullName)}</div>
                <div class="officer-position">${escapeHtml(officer.Position || 'Officer')}</div>
                <div class="officer-charity">${escapeHtml(officer.charityName)}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('groupOfficersList').innerHTML = html;
}

function displayGroupDetailsMembers(members) {
    const sortedMembers = members
        .filter(m => m.RegistrationStatus === 'Registered')
        .sort((a, b) => a.Name.localeCompare(b.Name));

    // Check if there are more than 7 entities
    if (sortedMembers.length > 7) {
        const html = `
            <div style="text-align: center; padding: 60px 20px; background: var(--color-cream); border-radius: 16px;">
                <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                <h3 style="color: var(--color-text-primary); margin-bottom: 16px;">Large Group Structure</h3>
                <p style="color: var(--color-text-secondary); font-size: 16px; line-height: 1.6; max-width: 500px; margin: 0 auto;">
                    This group contains ${sortedMembers.length} registered charities, which is too many to display on this page.
                    Please visit the official Charities Register for the complete group information.
                </p>
            </div>
        `;
        document.getElementById('groupMembersList').innerHTML = html;
        return;
    }

    const html = sortedMembers.map(member => `
        <div class="group-detail-card">
            <div class="group-detail-header">
                <h3 class="group-detail-name">${escapeHtml(member.Name)}</h3>
                <span class="status-badge active">Registered</span>
            </div>
            <div class="group-detail-info">
                <div class="group-detail-item">
                    <span class="group-detail-label">Registration Number:</span>
                    <span class="group-detail-value">${member.CharityRegistrationNumber || 'N/A'}</span>
                </div>
                <div class="group-detail-item">
                    <span class="group-detail-label">Registered:</span>
                    <span class="group-detail-value">${formatDate(member.DateRegistered)}</span>
                </div>
            </div>
            <div class="group-detail-actions">
                <button onclick="selectCharity(${member.OrganisationId}, '${escapeHtml(member.Name).replace(/'/g, "\\'")}'); closeGroupDetails();" class="view-charity-btn">View Details</button>
                <a href="?id=${member.OrganisationId}" target="_blank" rel="noopener noreferrer" class="view-charity-btn-outline">Open in New Tab</a>
            </div>
        </div>
    `).join('');

    document.getElementById('groupMembersList').innerHTML = html;
}

function closeGroupDetails() {
    document.getElementById('groupDetails').classList.add('hidden');
    document.getElementById('charityDetails').classList.remove('hidden');
    const searchSection = document.querySelector('.search-section');
    if (searchSection) searchSection.style.display = '';

    // Scroll to charity name
    setTimeout(() => {
        const charityNameElement = document.getElementById('charityName');
        if (charityNameElement) {
            charityNameElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// ==================== SCROLL EFFECTS ====================

// Create and add progress bar
function initScrollEffects() {
    // Add progress bar to body
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.id = 'scrollProgressBar';
    document.body.prepend(progressBar);

    // Update progress bar on scroll
    window.addEventListener('scroll', updateScrollProgress);

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animatedElements = document.querySelectorAll(
        '.financial-card, .insight-card, .operations-card, .yoy-item, ' +
        '.info-grid, .charitable-purpose, .contact-section, .section-title, ' +
        '.breakdown-item, .assets-grid, .officer-card, .document-card'
    );

    animatedElements.forEach(el => observer.observe(el));

    // Parallax effect on hero
    window.addEventListener('scroll', handleHeroParallax);
}

function updateScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;

    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
}

function handleHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const scrolled = window.scrollY;
    const heroHeight = hero.offsetHeight;

    // Only apply parallax when hero is visible
    if (scrolled < heroHeight) {
        const parallaxSpeed = 0.5;
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        hero.style.opacity = 1 - (scrolled / heroHeight) * 0.5;
    }
}

// Initialize scroll effects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollEffects);
} else {
    initScrollEffects();
}

// Re-observe elements when charity details are loaded
const originalDisplayCharityData = window.displayCharityData;
if (originalDisplayCharityData) {
    window.displayCharityData = function(...args) {
        const result = originalDisplayCharityData.apply(this, args);

        // Re-initialize observer for new elements after a short delay
        setTimeout(() => {
            const observerOptions = {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animated');
                    }
                });
            }, observerOptions);

            const animatedElements = document.querySelectorAll(
                '.financial-card, .insight-card, .operations-card, .yoy-item, ' +
                '.info-grid, .charitable-purpose, .contact-section, .section-title, ' +
                '.breakdown-item, .assets-grid, .officer-card, .document-card'
            );

            animatedElements.forEach(el => {
                if (!el.classList.contains('animated')) {
                    observer.observe(el);
                }
            });
        }, 100);

        return result;
    };
}
