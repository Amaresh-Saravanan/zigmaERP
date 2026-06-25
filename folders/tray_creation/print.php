
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>Tray Creation - QR Generator</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
                <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
                <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
                <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
                <script>
                    function onScanSuccess(qrCodeMessage) {
                        alert('QR Code detected: ' + qrCodeMessage);
                    }

                    function onScanError(errorMessage) {
                        console.warn('QR Code scanning error: ' + errorMessage);
                    }
                    onScanSuccess,
                    onScanError
                </script>
                <style>
                    body { font-family: "Poppins", sans-serif !important; }
                    .pit_num { font-weight: 700; font-size: 34px; }
                    .qr_content { border: 1px solid #2caa4f; background-color: #fff; margin:10px 20px;}
                    .head_zigma { font-size: 0.37rem; font-weight: 700; color: #2caa4f; }
                </style>
            </head>
            <body>
			<div class="row">
<?php
include('../../assets/phpqrcode/qrlib.php');

$servername = "192.168.1.22"; 
$username   = "my_root";
$password   = "my@123456";
$dbname     = "zigfly_erp";

$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
$sql = "SELECT * FROM tray_creation WHERE is_delete= 0";
$result = mysqli_query($conn, $sql);
if ($result) {    
    if (mysqli_num_rows($result) > 0) {
        
        while($row = mysqli_fetch_assoc($result)) {
            $sts = $row['is_active'] == 1 ? "Active" : "Inactive";
            $pit_details =  "Bin-Name: " . $row["bin_name"] . "\nBin Status: " . $sts;
            $bin_name= $row["bin_name"];
            $bin_number = preg_replace('/\D/', '', $bin_name);

            // // Generate QR code
            // $text = $pit_details;
            // // $filePath = 'qr_code_' . $row['unique_id'] . '.png';
            // $filePath = 'image_qr/qr_code_' . $row['unique_id'] . '.png';
            // QRcode::png($text, $filePath);

            $unique_id = $row['unique_id'];

            $base_url = "http://zigfly.in/erp/folders/tray_creation/get_bin_details.php";
            $full_url = $base_url . "?unique_id=" . urlencode($unique_id);

            $filePath = 'image_qr/qr_code_' . $unique_id . '.png';
            QRcode::png($full_url, $filePath);

            ?>

                   
					<div class="col-md-4  mt-3 text-center">
						<div class="qr_content">
							<div class="row">
                                <div class="col-md-4 text-start">
                                    <img src="<?php echo $filePath; ?>" alt="QR Code" width="95%">
                                </div>
                                <div class="col-md-8 mt-2">
								 <div> <h5 class="head_zigma mt-1 mb-0">ZIGMA GLOBAL ENVIRON SOLUTIONS PVT. LTD. </h5></div>
								<div class="d-flex justify-content-around">
								  
								   
								   <div class="mt-1" style="margin-left:10px;"><h3><span class="pit_num"><?php echo $bin_number; ?></span> </div>
								   <div class="mt-2" style="margin-left:10px;"><img src="../zig-fly-logo.png" alt="Logo" width="70%"></h3> </div>
								</div>
								
                                    
                                </div>
                                
								</div>
                            </div>
					</div>
          
            <?php
        }
    } else {
        echo "0 results";
    }
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

mysqli_close($conn);
?>

</div>
  </body>
            </html>