<?php
// Include the phpqrcode library
include('../../assets/phpqrcode/qrlib.php');

$unique_id = $_GET['unique_id'];

$servername = "192.168.1.200"; // Typically 'localhost'
$username = "my_root";
$password = "my@123456";
$dbname = "zigfly_erp";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Define the SELECT query
$sql = "SELECT * FROM pit_creation WHERE unique_id = '$unique_id'";

// Execute the query
$result = mysqli_query($conn, $sql);

if ($result) {
    if (mysqli_num_rows($result) > 0) {
        while($row = mysqli_fetch_assoc($result)) {
            $sts = $row['is_active'] == 1 ? "Active" : "Inactive";
            $pit_name = $row["pit_name"];
            $pit_capacity = $row["volume"]; 
            $pit_location = $row["location"];
            $pit_description = $row["description"];
            $pit_details = "Pit Name: " . $row["pit_name"] . "\n"."Pit Capacity:" . $row["volume"] . "\n"."Pit Location:" . $row['location'] . "\n"."Pit Status:" . $sts;
        }
    } else {
        echo "0 results";
    }
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}

// Fetch the required data for the new section
$ow_sql = "SELECT form_batch_id, SUM(feed_qty) as total_feed_qty, MIN(entry_date) as min_entry_date, MAX(entry_date) as max_entry_date FROM pit_status WHERE pit_id = '$unique_id' GROUP BY form_batch_id ORDER BY form_batch_id DESC LIMIT 1";
$ow_result = mysqli_query($conn, $ow_sql);
if ($ow_result && mysqli_num_rows($ow_result) > 0) {
    $ow_row = mysqli_fetch_assoc($ow_result);
    $max_batch_id = $ow_row['form_batch_id'];
    $total_ow = $ow_row['total_feed_qty'];
    $first_entry = new DateTime($ow_row['min_entry_date']);
    $last_entry = new DateTime();
    $interval = $first_entry->diff($last_entry);
    $days_diff = $interval->days + 1;
} else {
    $max_batch_id = 'N/A';
    $total_ow = 0;
    $days_diff = 0;
}

// Generate the QR codes for both URLs
$base_url_detail = "http://zigfly.in/erp/folders/pit_creation/get_pit_details.php";
$full_url_detail = $base_url_detail . "?unique_id=" . $unique_id;
$filePathDetail = 'qr_code_detail.png';
QRcode::png($full_url_detail, $filePathDetail);

// $base_url_report = "http://zigfly.in/erp/folders/pit_creation/get_pit_report.php";
$base_url_report = "http://zigfly.in/erp/folders/pit_status_report/print.php";
$full_url_report = $base_url_report . "?unique_id=" . $unique_id;
$filePathReport = 'qr_code_report.png';
QRcode::png($full_url_report, $filePathReport);
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PIT Creation - QR Generator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    body {
      font-family: "Poppins", sans-serif !important;
      background: #f5f5f5;
      margin: 0;
      height: 100vh; /* Full viewport height */
      display: flex;
      justify-content: center; /* Horizontal center */
      align-items: center;  
    }
    .card {
      margin: 40px auto;
      width: 400px;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border: 4px solid #666666;
    }
    .bggreen {
      background-color: rgb(102 102 102) !important;
    }
    .head_zigma {
      color: #fff;
      font-weight: 700;
      font-size: 0.8rem;
      text-align: center;
      padding: 10px 0;
      margin-top:0px;
       margin-bottom:0px;
    }
    .qr_content {
      border-radius: 20px 20px 0px 0px; 
      background-color: #fff;
      padding: 8px;
    }
    .pit_name {
      font-size: 1.8rem;
      padding: 6px 0px;
      font-weight: bold;
      color: #2caa4f;
      background-color: #eeeeee;
      text-align: center;
          margin: 6px;

    }
    .entry_name {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    margin: 0px 0;
    }
    .logo {
      text-align: center;
      margin-bottom: 10px;
    }
    .logo img {
      width: 45%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      vertical-align: top;
      text-align: center;
      padding: 5px;
    }
      @media print {
      body {
        height: 100vh;
         font-family: Calibri, sans-serif !important;
        display: flex;
        justify-content: center;
        align-items: center;
        background: none !important;
      }
      .card {
        box-shadow: none;
        border: none;
        margin: auto;
         border: 4px solid #666666;
        page-break-inside: avoid; /* prevent breaking inside */
      }
    }
  </style>
</head>
<body>

  <div class="card">
    <div class="bggreen">
      <h3 class="head_zigma">ZIGMA GLOBAL ENVIRON SOLUTIONS PVT. LTD.</h3>
    </div>
    <div class="qr_content">
      <div class="logo">
        <img src="../zig-fly-logo.png" alt="Logo">
      </div>

      <h2 class="pit_name"><?php echo $pit_name; ?></h2>

      <table>
        <tr>
          <td>
            <img src="<?php echo $filePathDetail; ?>" alt="QR Code Entry" width="100%">
            <h4 class="entry_name">For Entry</h4>
          </td>
          <td>
            <img src="<?php echo $filePathReport; ?>" alt="QR Code Report" width="100%">
            <h4 class="entry_name">For Report</h4>
          </td>
        </tr>
      </table>
    </div>
  </div>


</body>
</html>


    <!-- <br/><br/><br/>
	<br/><br/><br/><br/><br/><br/><br/><br/><br/> -->
    <!-- <div class="card h-md-100 ecommerce-card-min-width mt-3">
        <div class="card-body d-flex flex-column justify-content-end">
            <div class="container">
                <div class="row">
                    <div class="col-md-2"> </div>
                    <div class="col-md-2 text-center mb-2">
                        <img src="../zig-fly-logo.png" alt="" height="64">
                    </div>
                    <div class="col-md-7">
                        <div class="address">
                            <p class="mb-1"><b>H.O : </b> 178, Indhu Nagar, Palaypalayam, Perundurai Road, Erode - 638 011.</p>
                            <p class="mb-1">0424 2225157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</p>
                            <p class="mb-3">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</p>
                        </div>
                    </div>
                    <hr/>
                    <div class="col-md-1"> </div>
                </div>
                <div class="row">
                    <div class="col-md-2"> </div>
                    <div class="col-md-8">
                        <div class="row">
                            <div class="col-md-4 col-4"><div class="pit_ow">OW : <?php echo $total_ow; ?> Tons</div></div>
                            <div class="col-md-4 col-4 text-center h4 mt-1"><b><?php echo $days_diff; ?> Days</b></div>
                            <div class="col-md-4 col-4 pit_count text-end h5 mt-1"><?php echo $max_batch_id; ?></div>
                        </div>
                        <div class="pit_tablelist mt-4">
                            <div class="table-responsive">
                                <table class="table caption-top table-nowrap mb-0 flytable" width="100%">
                                    <thead class="table-light">
                                        <tr>
                                            <th scope="col">S.NO</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Tons</th>
                                            <th scope="col">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="fw-medium">01</td>
                                            <td>20-04-2023</td>
                                            <td>Consectetur adipiscing elit</td>
                                            <td>0.5</td>
                                            <td>Consectetur adipiscing elit</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="text-center"><button class="btn btn-danger noPrint" onclick="window.print();">Print</button></div>

    <br/><br/><br/>
</div> -->

<script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
<script>
    function onScanSuccess(qrCodeMessage) {
        alert('QR Code detected: ' + qrCodeMessage);
    }

    function onScanError(errorMessage) {
        console.warn('QR Code scanning error: ' + errorMessage);
    }
</script>
</body>
</html>








<!-- -----------------------------------------this is report only display=------------------------ -->
<!-- <style>
.pit_ow {
    text-align: center;
    background-color: #2caa4f;
    color: #fff;
    padding: 10px;
    border-radius: 10px;
    font-weight: 700;
}
.address p {
    font-size: 13px;
    font-weight: 500;
}
body{ font-family: "Poppins", sans-serif !important;}
.qr_content {
	border-radius: 20px 20px 0px 0px; 
    background-color: #fff;
}
.head_zigma{color:#fff;font-weight:700;font-size:0.7rem;font-size:26px}
.pit_name {
    font-size: 1.2rem;
    padding: 6px 0px;
    font-weight: 700;
    color: #2caa4f;
    background-color: #eeeeee;
}
.entry_name {font-size:12px; font-weight:500;}
.bggreen {
    background-color:rgb(102 102 102) !important;
}body{background-color:#fff!important;}
</style> -->
<!-- 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>PIT Creation - QR Generator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div class="container-fluid">
    <div class="row">
    
        <div class="col-md-12 mt-3">
            <div class="card">
                <div class="card-body bggreen p-1">
                    <div class="col-md-12 text-center">
                        <h5 class="head_zigma mt-2 mb-2">ZIGMA GLOBAL ENVIRON SOLUTIONS PVT. LTD.</h5>
                    </div>
                    <div class="qr_content p-2">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="text-center">
                                    <img src="../zig-fly-logo.png" style="width:45%;">
                                </div>
                            </div>
                            <div class="col-md-12 mt-3 text-center">
                                <div class="row">
                                <div class="col-12">
  <h2 class="pit_name" style="font-size: 50px;"><?php echo $pit_name; ?></h2>
</div>

                                </div>
                            </div>
                        </div>
                      
                        <div class="qr_code text-center mt-2">
                            <div class="row">
                              
                               
                                <div class="col-md-12 text-center">
                                    <img src="<?php echo $filePathReport; ?>" alt="QR Code" width="75%">
                                    <h6 class="entry_name mt-1 mb-4"  style="font-size: 22px;">Please scan here 
                                     for the pit status </h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </div>
    </div>

    <br/><br/><br/>
	<br/><br/><br/><br/><br/><br/><br/><br/><br/>
    
<script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
<script>
    function onScanSuccess(qrCodeMessage) {
        alert('QR Code detected: ' + qrCodeMessage);
    }

    function onScanError(errorMessage) {
        console.warn('QR Code scanning error: ' + errorMessage);
    }
</script>
</body>
</html> -->
<!-- ------------------------------------------------------------------end----------------------------- -->