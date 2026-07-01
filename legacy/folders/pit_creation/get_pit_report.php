<?php
header('Content-Type: text/html');

// Get the unique_id from the query parameter
$unique_id = $_GET['unique_id'];

// Database connection details
$servername = "192.168.1.22"; 
$username = "my_root";
$password = "my@123456";
$dbname = "zigfly_erp";

// Establish the connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {                
    die("Connection failed: " . mysqli_connect_error());
}

// Fetch details from pit_creation using the unique_id
$sql_pit = "SELECT * FROM pit_creation WHERE unique_id ='$unique_id'";
$result_pit = mysqli_query($conn, $sql_pit);
if (!$result_pit) {
    die("Error fetching pit_creation data: " . mysqli_error($conn));
}
if (mysqli_num_rows($result_pit) > 0) {
    $pit_data = mysqli_fetch_assoc($result_pit);
    $pit_name = htmlspecialchars($pit_data['pit_name']);
    $pit_capacity = htmlspecialchars($pit_data['volume']);
    $pit_location = htmlspecialchars($pit_data['location']);
    $sts = $pit_data['is_active'] == 1 ? "Active" : "Inactive";
} else {
    die("No data found in pit_creation for unique_id: $unique_id");
}

// Fetch related data from pit_status using unique_id as pit_id
$sql_status = "
    SELECT 
        MIN(entry_date) AS entry_date,
        MAX(CASE WHEN harvest_comp = 2 THEN entry_date ELSE NULL END) AS end_date,
        pit_id,


        max(batch_id)as batch_id,

        form_batch_id,   
        SUM(larvae_qty_in) AS larvae_qty_in,
        MAX(harvest_comp) AS harvest_comp,
        SUM(feed_qty) AS total_feed,
        SUM(larvae_qty) AS total_live_larvae,
        SUM(qty_rejets) AS total_rejects,
        SUM(qty_manure_1) AS total_manure
    FROM 
        pit_status 
    WHERE 
        pit_id = '$unique_id' 
        AND is_delete = 0
    GROUP BY 
        form_batch_id
";
$result_status = mysqli_query($conn, $sql_status);
// print_r($result_status);
if (!$result_status) {
    die("Error fetching pit_status data: " . mysqli_error($conn));
}
if (mysqli_num_rows($result_status) > 0) {
    $status_data = mysqli_fetch_assoc($result_status);
    $entry_date = (new DateTime($status_data['entry_date']))->format('d-m-Y'); // Adjust format as needed
    $end_date = !empty($status_data['end_date']) ? (new DateTime($status_data['end_date']))->format('d-m-Y') : "Inprogress";
    $age_days = !empty($status_data['end_date']) ? (new DateTime($status_data['end_date']))->diff(new DateTime($status_data['entry_date']))->days : (new DateTime())->diff(new DateTime($status_data['entry_date']))->days;
    // $batch_id = $status_data['batch_id'];

    // print_r($batch_id);

    if(!empty($status_data['batch_id'])){
        // $batch_id      =$status_data['batch_id'];
        $batch_id      =($status_data['batch_id']);
        }else{
            $batch_id="-";
        }
    $larvae_qty_in = htmlspecialchars($status_data['larvae_qty_in']);
    $pit_batch_id = htmlspecialchars($status_data['form_batch_id']);
    $harvest_comp = $status_data['harvest_comp'] == 1 ? "Progressing" : "Completed";
} else {
    $entry_date = $end_date = $age_days = $batch_id = $larvae_qty_in = $pit_batch_id = $harvest_comp = "N/A";
}


// Fetch the detailed status information for display in the table
$sql_table_data = "
    SELECT 
        @a:=@a+1 AS s_no, 
        entry_date,
        CASE org_status 
            WHEN 1 THEN 'Organic Waste Added in Pit'
            WHEN 2 THEN 'Baby Larvae Added'
            WHEN 3 THEN 'Aeration Process'
            WHEN 4 THEN 'Measurement'
            WHEN 5 THEN 'Harvest'
            ELSE 'Unknown'
        END AS org_status,        
        COALESCE(feed_qty, '-') AS feed_qty,
        COALESCE(larvae_qty, '-') AS larvae_qty,
        COALESCE(qty_manure_1, '-') AS qty_manure_1,
        COALESCE(qty_rejets, '-') AS qty_rejets,
        CONCAT(COALESCE(temp_start, '-'),  COALESCE(temp_mid, '-'), ' - ', COALESCE(temp_end, '-')) AS temp,
        CONCAT(COALESCE(humidity_start, '-'),  COALESCE(humidity_mid, '-'), ' - ', COALESCE(humidity_end, '-')) AS humidity,
        CASE method 
            WHEN 1 THEN 'Machine'
            WHEN 2 THEN 'Manual'
            ELSE '-'
        END AS method,
        COALESCE(notes, '-') AS notes
    FROM 
        pit_status, (SELECT @a:= 0) AS a 
    WHERE 
        pit_id = '$unique_id' 
        AND is_delete = 0
    ORDER BY 
        entry_date ASC
";
$result_table_data = mysqli_query($conn, $sql_table_data);
if (!$result_table_data) {
    die("Error fetching detailed pit_status data: " . mysqli_error($conn));
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>PIT Status Report</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    <style>
        body { font-family: "Poppins", sans-serif !important; }
        .pit_num { font-weight: 700; font-size: 20px; }
        .qr_content { border: 2px solid #2caa4f; background-color: #fff; }
        .head_zigma { font-size: 0.75rem; font-weight: 700; color: #2caa4f; }
        .compl_print h1 { font-weight: 700; font-size: 14px; margin-bottom: 4px; text-decoration: underline; }
        .compl_print { font-size: 14px; }
        .compl_print span { font-weight: 600; }
        .address p { font-size: 8px;}
        .zone_boxbor {font-size: 12px;}
        label{ margin-bottom: 0px !important;  margin-top: 10px;}
    </style>
</head>
<body>

<div class="container">
    <div class="card h-md-100 ecommerce-card-min-width">
        <div class="card-body d-flex flex-column justify-content-end">
            <div class="container">
                <div class="row">
                    <div class="col-md-2"></div>
                    <div class="col-md-2 col-2 text-center mb-2">
                        <img src="../zig-fly-logo.png" alt="" width="100%">
                    </div>
                    <div class="col-md-7 col-10">
                        <div class="address">
                            <p class="mb-1"><b>H.O :</b> 178, Indu Nagar, Palayapalayam, Perundurai Road, Erode - 638 011.</p>
                            <p class="mb-1">0424 2225157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</p>
                            <p class="mb-2">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</p>
                        </div>
                    </div>
                    <hr/>
                    <div class="col-md-1"></div>
                </div>
                <div class="row">
                    <div class="container" style="background-color:#fff;">
                        <div class="compl_print">
                            <div class="zone_boxbor">
                                <div class="row">
                                    <div class="col-md-12 text-center">
                                        <h1><strong>PIT STATUS REPORT</strong></h1>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 col-6 re_print">
                                        <div class="">
                                            <label class="col-12"><b>Batch Start Date  </b></label>
                                            <span class="col-12"><?php echo $entry_date; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Batch End Date  </b></label>
                                        <span class="col-12"><?php echo $end_date; ?></span>
                                        </div>
                                    </div>

                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Number  </b></label>
                                         <span class="col-12"><?php echo $pit_name; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Ageing Days  </b></label>
                                        <span class="col-12"><?php echo $age_days +1 . " days"; ?></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                            <label class="col-12"><b>Egg Batch ID </b></label>
                                            <span class="col-12"><?php echo $batch_id; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Baby Larvae Qty  </b></label>
                                        <span class="col-12"><?php echo $larvae_qty_in . " (Grams)"; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Batch ID  </b></label>
                                        <span class="col-12"><?php echo $pit_batch_id; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-md-6 col-6">
                                        <div class="">
                                        <label class="col-12"><b>Current Status  </b></label>
                                        <span class="col-12"><?php echo $harvest_comp; ?></span>
                                        </div>
                                    </div>
                                </div>                                
                                    
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div class="box mt-2">
                    <div class="table-responsive">
                    <table class="table table-bordered table-striped print_table">
                        <thead class="bg-light" style="font-weight: 600;">
                            <tr>
                                <th width="">S.No</th>
                                <th width="">Entry Date</th>                                                
                                <th width="">Status</th>                        
                                <th width="">Feeding Qty (Tons)</th>
                                <th width="">Qty of Live Larvae (g)</th>
                                <th width="">Qty of Manure (kg)</th>
                                <th width="">Qty of Rejects (kg)</th>
                                <th width="">Temperature (°C) <br>start / mid / end </th>
                                <th width="">Humidity (%)<br>start / mid / end </th>
                                <th width="">Aeration Method</th>
                                <th width="">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            if (mysqli_num_rows($result_table_data) > 0) {
                                while ($row = mysqli_fetch_assoc($result_table_data)) {
                                    echo "<tr>";
                                    echo "<td>{$row['s_no']}</td>";
                                    echo "<td>{$row['entry_date']}</td>";
                                    echo "<td>{$row['org_status']}</td>";
                                    echo "<td>{$row['feed_qty']}</td>";
                                    echo "<td>{$row['larvae_qty']}</td>";
                                    echo "<td>{$row['qty_manure_1']}</td>";
                                    echo "<td>{$row['qty_rejets']}</td>";
                                    echo "<td>{$row['temp']}</td>";
                                    echo "<td>{$row['humidity']}</td>";
                                    echo "<td>{$row['method']}</td>";
                                    echo "<td>{$row['notes']}</td>";
                                    echo "</tr>";
                                }
                                echo "<tr style='font-weight: bold;'>";
                                echo "<td colspan='3' style='text-align:right;'>Total</td>";
                                echo "<td>{$status_data['total_feed']}</td>";
                                echo "<td>{$status_data['total_live_larvae']}</td>";
                                echo "<td>{$status_data['total_manure']}</td>";
                                echo "<td>{$status_data['total_rejects']}</td>";
                                echo "<td colspan='4'></td>";
                                echo "</tr>";
                            } else {
                                echo "<tr><td colspan='11' style='text-align:center'>NO DATA FOUND</td></tr>";
                            }
                            ?>
                        </tbody>
                    </table>
                        </div>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>

<?php
// Close the database connection
mysqli_close($conn);
?>
