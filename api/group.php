<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$groupId = isset($_GET['groupId']) ? intval($_GET['groupId']) : 0;

if ($groupId === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Group ID is required']);
    exit;
}

$apiUrl = "https://www.odata.charities.govt.nz/Organisations?\$filter=GroupId%20eq%20{$groupId}&\$select=OrganisationId,Name,CharityRegistrationNumber,GroupId,RegistrationStatus,DateRegistered&\$orderby=Name&\$format=json";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch group data: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API returned status code ' . $httpCode]);
    exit;
}

echo $response;
?>
