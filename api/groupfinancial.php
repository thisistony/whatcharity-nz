<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$groupId = isset($_GET['groupId']) ? intval($_GET['groupId']) : 0;

if (!$groupId) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing group ID']);
    exit;
}

// Fetch the latest annual return for the group
$apiUrl = "https://www.odata.charities.govt.nz/Groups({$groupId})/AnnualReturn?\$orderby=YearEnded%20desc&\$top=1&\$format=json";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Failed to fetch group financial data']);
    exit;
}

echo $response;
?>
