<?php
include('../../assets/phpqrcode/qrlib.php');

$unique_id = $_GET['unique_id'];
$servername = "192.168.1.22"; 
$username = "my_root";
$password = "my@123456";
$dbname = "zigfly_erp";

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
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
        $bin_number = preg_replace('/\D/', '', $bin_name);

        session_start();
        $_SESSION['bin_name'] = $bin_name;
        $_SESSION['status'] = $sts;
    } else {
        echo "0 results";
    }
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

// Full URL for the QR code
$base_url = "http://zigfly.in/erp/folders/tray_creation/get_bin_details.php";
$full_url = $base_url . "?unique_id=" . $unique_id;

$filePath = 'qr_code.png';
QRcode::png($full_url, $filePath);
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Tray Creation - QR Generator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
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
        <div class="col-md-4"></div>
        <div class="col-md-3 mt-5">
            <div class="qr_content text-center">
                <div class="row">
                    <div class="col-md-12">
                        <h5 class="head_zigma mt-2 mb-0">ZIGMA GLOBAL ENVIRON SOLUTIONS PVT. LTD.</h5>
                    </div>
                    <div class="col-md-4 text-start">
                        <img src="qr_code.png" alt="QR Code" width="85%">
                    </div>
                    <div class="col-md-4 mt-4">
                        <h3><span class="pit_num"><?php echo $bin_number; ?></span></h3>
                    </div>
                    <div class="col-md-4 text-start mt-3">
                        <img src="../zig-fly-logo.png" alt="QR Code" width="85%">
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-5"></div>
    </div>
</div>

</body>
</html> 



