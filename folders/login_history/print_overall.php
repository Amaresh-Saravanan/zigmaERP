<?php

// Get `from_date` and `to_date` from the URL parameters
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : null;
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : null;

if (!$from_date || !$to_date) {
    die("Please provide both from_date and to_date.");
}

$table = "bsf_reject_transaction";
$servername = "zigmaglobal.in"; 
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

// Database connection for `print.php`
$conn_zigma = mysqli_connect($servername, $username, $password, $dbname);

if (!$conn_zigma) {
    die("Connection failed: " . mysqli_connect_error());
}

// Query to fetch all ticket numbers between from_date and to_date
$sql = "SELECT TicketNumber, serial_no, Date, EmptyWeightDate, EmptyWeightTime, LoadWeightDate, LoadWeightTime, VehicleNumber, LoadedWeight, EmptyWeight, NetWeight
        FROM $table 
        WHERE Date BETWEEN '$from_date' AND '$to_date'";

$result = mysqli_query($conn_zigma, $sql);

// Fetch all the records for the specified date range
$tickets = [];
while ($row = mysqli_fetch_assoc($result)) {
    $tickets[] = $row;
}

// Close the database connection for `print.php`
mysqli_close($conn_zigma);

// Database connection for `image_upload.php`
$host = "192.168.1.22";
$username = "my_root";
$password = "my@123456";
$databasename = "zigma_bsf";

// Create connection for image uploads
$conn = new mysqli($host, $username, $password, $databasename);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to get images for each ticket number
function get_images_for_ticket($conn, $ticket_no) {
    $images = [];
    $sql = "SELECT image FROM rejects_image_upload WHERE ticket_no = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $ticket_no); // Bind the ticket_number to the query
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        // Split the comma-separated image filenames into an array
        $images = array_merge($images, explode(",", $row['image']));
    }

    $stmt->close();
    return $images;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Print and Image Display</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    <style type="text/css">
        .top{ border-top: 1px solid #ccc;}
        .bottom{ border-bottom: 1px solid #ccc;}
        .top1{ border-top: 2px solid #ddd;}
        .title{font-family:calibri; font-size:24px; color:#333;}
        .address{font-family:calibri; font-size:18px; color:#333;}
        .main{font-family:calibri; font-size:16px; font-weight:600; color:#333;}
        .main2{font-family:calibri; font-size:16px; color:#333; font-weight:600;}
        .data{font-family:calibri; font-size:16px; color:#111;}
        .bold_bottom{ border-bottom: 1px solid #ccc;}
        .bold_top{ border-top: 2px solid #ddd;}
        .bold_left{ border-left: 2px solid #ddd;}
        .bold_right{ border-right: 2px solid #ddd;}
        .image-gallery {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .image-gallery img {
            max-width: 200px; 
            max-height: 200px; 
            object-fit: cover;
            margin: 10px;
        }
        .btn-cancel {
            background-color: #6c757d;
            color: white;
        }
        .print-section {
            margin-bottom: 30px; /* Add space after the print.php section */
            page-break-after: always;
        }
        .image-upload-section {
            margin-top: 30px; /* Add space before the image_upload.php section */
        }
    </style>
</head>
<body>

<!-- Loop through each ticket number and display details and images -->
<?php foreach ($tickets as $vmc): ?>
    <div class="card h-md-100 ecommerce-card-min-width mt-3 print-section">
        <div class="card-body d-flex flex-column justify-content-end">
            <div class="">
                <table width="850px" border="0" cellpadding="0" cellspacing="0" align="center">
                    <tr>
                        <td colspan="5" align="center"><font style="font-weight:bold;font-size:24px;text-decoration:underline;font-family:Arial, Helvetica, sans-serif">Kochi Black Soldier Fly Project</font></td>
                    </tr>
                    <tr>
                        <td width="114" rowspan="3"><img src="zigma_logo.png" height="90" width="90" /></td>
                        <td width="580" height="30" align="left" class="title" style="font-weight:900; font-size:24px">&nbsp;</td>
                        <td rowspan="3" align="left" class="address" valign="top">
                            <img src="../zig-fly-logo.png" height="" width="160" style="margin-top: 20px;"/>
                        </td>
                    </tr>
                    <tr>
                        <td width="89%" height="20" align="left" class="address">&nbsp;<br>&nbsp;<font style="font-weight:1000;font-size:24px;">Global Environ Solutions Private Limited</font></td>
                        <td>&nbsp;</td>
                    </tr>
                </table>
              
                <table width="850px" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:10px;">
                    <tr>
                        <td height="35" width="160" align="left" class="data bold_top">&nbsp;Ticket Number</td>
                        <td width="21" align="center" class="data bold_top">&nbsp;</td>
                        <td width="316" align="left" class="main bold_top">&nbsp;<?php echo $vmc['TicketNumber']; ?></td>
                        <td width="137" scope="col" class="data bold_top" align="left">&nbsp;Ticket Date</td>
                        <td width="216" align="left" class="main bold_top">&nbsp;<?php echo date('d-m-Y', strtotime($vmc['Date'])); ?></td>
                    </tr>
                    <tr>
                        <td height="35" align="left" class="data">&nbsp;Material</td>
                        <td align="center" class="data">&nbsp;</td>
                        <td class="main" align="left">&nbsp;Segregated Organic wet waste</td>
                        <td width="137" align="left" class="data" scope="col">&nbsp;Vehicle Number</td>
                        <td width="216" align="left" class="main">&nbsp;<?php echo $vmc['VehicleNumber']; ?></td>
                    </tr>
                </table>
                <table width="850px" border="0" cellpadding="0" cellspacing="0" align="center" style="">
                    <tr>
                        <td height="35" width="212" align="center" class="data bold_top bold_left">Material</td>
                        <td width="212" align="center" class="data bold_top bold_left">Gross (Tons)</td>
                        <td width="212" align="center" class="data bold_top bold_left">Tare Weight (Tons)</td>
                        <td width="212" scope="col" class="data bold_top bold_left bold_right" align="center">Net Weight (Tons)</td>
                    </tr>
                    <tr>
                        <td height="35" width="212" align="center" class="main bold_top bold_left">Segregated Organic wet waste</td>
                        <td width="212" align="center" class="main bold_top bold_left"><?php echo number_format($vmc['LoadedWeight'] / 1000, 3); ?></td>
                        <td width="212" align="center" class="main bold_top bold_left"><?php echo number_format($vmc['EmptyWeight'] / 1000, 3); ?></td>
                        <td width="212" scope="col" class="main bold_top bold_left bold_right" align="center"><?php echo number_format($vmc['NetWeight'] / 1000, 3); ?></td>
                    </tr>
                </table>
                                <!-- New image section for `cam1` and `cam2` -->
                                <table width="850px" border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:10px;">
                    <tr>
                        <td colspan="2" height="40" align="center" class="main bold_bottom bold_top">&nbsp;Empty <br/> Date: <?php echo date("d-m-Y", strtotime($vmc['EmptyWeightDate'])); ?> &nbsp; Time: <?php echo $vmc['EmptyWeightTime']; ?></td>
                        <td colspan="2" align="center" class="main bold_bottom bold_top">&nbsp;Loaded <br/> Date: <?php echo date("d-m-Y", strtotime($vmc['LoadWeightDate'])); ?> &nbsp; Time: <?php echo $vmc['LoadWeightTime']; ?></td>
                    </tr>
                    <tr>
                        <td height="35" width="225" align="center" class="main">
                            <!-- <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam1/<?php echo $vmc['serial_no'] . 'ST.jpg'; ?>" width="200" height="180" /> -->
                            <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam2/<?php echo $vmc['serial_no'] . 'FT.jpg'; ?>" width="200" height="180" />
                        </td>
                        <td width="225" align="center" class="data">
                            <!-- <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam1/<?php echo $vmc['serial_no'] . 'FT.jpg'; ?>" width="200" height="180" /> -->
                            <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam1/<?php echo $vmc['serial_no'] . 'FT.jpg'; ?>" width="200" height="180" />
                        </td>
                        <div class="space" >
                        <td height="35" width="225" align="center" class="main">
                            <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam2/<?php echo $vmc['serial_no'] . 'ST.jpg'; ?>" width="200" height="180" />
                        </td>
                        <td width="225" align="center">
                            <!-- <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam2/<?php echo $vmc['serial_no'] . 'FT.jpg'; ?>" width="200" height="180" /> -->
                            <img src="http://zigmaglobal.in/weighment_portal_image/bsf_rejects/cam1/<?php echo $vmc['serial_no'] . 'ST.jpg'; ?>" width="200" height="180" />
                        </td>
                    </tr>
                    
                </table>
                <!-- Image section -->
                <div class="container image-upload-section">
                    <div class="row">
                        <div class="col-md-12 custom-header">
                            <h3 class="text-center">Images for Ticket Number: <?= htmlspecialchars($vmc['TicketNumber']); ?></h3>

                            <?php
                            // Get images for the current ticket number
                            $images = get_images_for_ticket($conn, $vmc['TicketNumber']);
                            ?>

                            <?php if (!empty($images)): ?>
                                <div class="image-gallery">
                                    <?php foreach ($images as $image): ?>
                                        <a href="../../uploads/rejects_image_upload/<?= htmlspecialchars(trim($image)); ?>" target="_blank">
                                            <img src="../../uploads/rejects_image_upload/<?= htmlspecialchars(trim($image)); ?>" alt="Image" />
                                        </a>
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <p class="text-center">No images found for this ticket number.</p>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php endforeach; ?>

<!-- Close the database connection -->
<?php $conn->close(); ?>

</body>
</html>
