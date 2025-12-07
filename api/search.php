<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($query) < 2) {
    http_response_code(400);
    echo json_encode(['error' => 'Query too short']);
    exit();
}

$lowerQuery = strtolower($query);

// OData requires single quotes to be escaped as two single quotes
$odataEscaped = str_replace("'", "''", $lowerQuery);
// URL encode the query to handle spaces and special characters
$encodedQuery = urlencode($odataEscaped);

// Check if query looks like a charity registration number (starts with CC followed by numbers)
$isCharityNumber = preg_match('/^cc\d+$/i', $query);

if ($isCharityNumber) {
    // Search by CharityRegistrationNumber
    $upperQuery = strtoupper($query);
    $upperOdataEscaped = str_replace("'", "''", $upperQuery);
    $upperEncoded = urlencode($upperOdataEscaped);
    $url = "https://www.odata.charities.govt.nz/Organisations?\$filter=substringof('{$upperEncoded}',CharityRegistrationNumber)%20and%20RegistrationStatus%20eq%20'Registered'&\$top=10&\$format=json&\$select=OrganisationId,Name,CharityRegistrationNumber,DateRegistered,MainActivityId";
} else {
    // Search by Name
    $url = "https://www.odata.charities.govt.nz/Organisations?\$filter=substringof('{$encodedQuery}',tolower(Name))%20and%20RegistrationStatus%20eq%20'Registered'&\$top=10&\$format=json&\$select=OrganisationId,Name,CharityRegistrationNumber,DateRegistered,MainActivityId";
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => "API error: {$httpCode}"]);
    exit();
}

echo $response;
?>
