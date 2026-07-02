<?php
// Database connection for bsf_reject_transaction
$servername = "zigmaglobal.in";
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

// Create a connection
$conn_bsf = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn_bsf->connect_error) {
    die("Connection failed: " . $conn_bsf->connect_error);
}

// Get ticket number from AJAX request
$ticket_number = $_POST['ticket_number'];

// Prepare the SQL query and combine Date and Time into a single WeighDate
$sql = "SELECT 
    VehicleNumber, 
    NetWeight, 
    DATE_FORMAT(STR_TO_DATE(CONCAT(Date, ' ', Time), '%Y-%m-%d %r'), '%Y-%m-%dT%H:%i:%s') AS WeighDate
FROM 
    bsf_reject_transaction 
WHERE 
    TicketNumber = ?
";
$stmt = $conn_bsf->prepare($sql);
$stmt->bind_param("s", $ticket_number);
$stmt->execute();
$result = $stmt->get_result();
$response = [];


// Check if weigh_date is set and debug its value
// if (isset($weigh_date)) {
//     echo "Raw Weigh Date: " . $weigh_date; // Add this line to debug
//     echo "Formatted Date: " . date('Y-m-d\TH:i', strtotime($weigh_date)); // Add this line to debug formatted date
// }
// die();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $response['status'] = true;
    $response['vehicle_number'] = $row['VehicleNumber'];
    $response['net_weight'] = $row['NetWeight'];
    $response['weigh_date'] = $row['WeighDate'];  // Date in ISO 8601 format
    $response['net_weight_ton'] = $row['NetWeight'] / 1000;
} else {
    $response['status'] = false;
}

echo json_encode($response);
$conn_bsf->close();

?>

