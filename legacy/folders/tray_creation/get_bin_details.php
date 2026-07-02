<?php
header('Content-Type: text/html');

$unique_id = $_GET['unique_id'];
$servername = "192.168.1.22"; 
$username = "my_root";
$password = "my@123456";
$dbname = "zigfly_erp";

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {                
    die("Connection failed: " . mysqli_connect_error());
}

// Fetch tray creation details
$sql = "SELECT * FROM tray_creation WHERE unique_id ='$unique_id'";
$result = mysqli_query($conn, $sql);
if ($result) {
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        if ($row['is_active'] == 1) {
            $sts = "Active";
        } else {
            $sts = "Inactive";
        }
        
        $bin_name = $row["bin_name"];
        $status = $sts;
        $batch_id = $row["batch_id"]; // Assuming batch_id is a column in tray_creation
    } else {
        $bin_name = 'No results found';
        $status = '';
        $batch_id = null;
    }
} else {
    $bin_name = 'Query error: ' . mysqli_error($conn);
    $status = '';
    $batch_id = null;
}

// Fetch current batch ID (batch_id) from egg_process table
if ($batch_id) {
    $sql_batch = "SELECT batch_id FROM material_received WHERE material_received.unique_id ='$batch_id'";
    $result_batch = mysqli_query($conn, $sql_batch);
    if ($result_batch) {
        if (mysqli_num_rows($result_batch) > 0) {
            $batch_row = mysqli_fetch_assoc($result_batch);
            $current_batch_id = $batch_row["batch_id"];
        } else {
            $current_batch_id = 'No batch found';
        }
    } else {
        $current_batch_id = 'Query error: ' . mysqli_error($conn);
    }
} else {
    $current_batch_id = 'Tray is not Utilized';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Bin Details</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    <style>
        body { font-family: "Poppins", sans-serif !important; }
        .pit_num { font-weight: 700; font-size: 20px; }
        .qr_content { border: 2px solid #2caa4f; background-color: #fff; }
        .head_zigma { font-size: 0.75rem; font-weight: 700; color: #2caa4f; }
    </style>
</head>
<body>
<div class="container">
    <div class="row">
        <div class="col-md-12 mt-5">
            <div class="qr_content text-center">
                <h5 class="head_zigma mt-2 mb-0">ZIGMA GLOBAL ENVIRON SOLUTIONS PVT. LTD.</h5>
                <div class="row mt-3">
                    <div class="col-md-6 text-start">
                        <h3><span class="pit_num">Bin Name: <?php echo htmlspecialchars($bin_name); ?></span></h3>
                    </div>
                    <div class="col-md-6 text-start">
                        <h3><span class="pit_num">Status: <?php echo htmlspecialchars($status); ?></span></h3>
                    </div>
                </div>
                <div class="col-md-6 text-start">
                        <h3><span class="pit_num">Current Batch ID: <?php echo htmlspecialchars($current_batch_id); ?></span></h3>
                    </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
