<?php  
// Include necessary files
include '../../config/dbconfig.php';
include 'function.php';

// Retrieve unique_id from URL
$unique_id = isset($_GET['unique_id']) ? $_GET['unique_id'] : '';
$entry_date = $_GET['entry_date'];
// $staff_name         =  staff_name($values["staff_name"])[0]['name'];
// $sess_user_type     =  user_name_type($values["sess_user_type"])[0]['user_type'];
$staff_name = isset($_GET['user_name']) ? $_GET['user_name'] : '';
$sess_user_type = isset($_GET['user_type']) ? $_GET['user_type'] : '';
?>

<head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    </head>
<style>
body{font-family:calibri;}
.compl_print h3{text-align:center;text-decoration:underline;    margin-top: 0px;}
.pen_head{text-align:center;text-decoration:underline;    margin-top: 0px;}
.compl_print{margin-top:20px;}
</style>
   
<div class="container" style="background-color:#fff;">
<div class="compl_print pt-2">
                <!-- <div class="d-flex justify-content-center">
                     <img src="../zig-fly-logo.png" width="100px" style="margin-right: 10px;" />
				     <div>
                            <p class="mb-0"><b>H.O :</b> 178, Indu Nagar, Palayapalayam, Perundurai Road,<br/> Erode - 638 012.</p>
                            <p class="mb-0">0424-222 5157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</p>
                            <p class="mb-2">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</p>
				     </div>
                </div> -->


        <center><div class="col-3 text-center mb-0 mt-2">
                        <img src="../zig-fly-logo.png" alt="" height="" width="100%">
                    </div>
                    <div class="col-9">
                        <div class="address">
                            <h4 class="mb-0"><b>H.O :</b> 178, Indu Nagar, Palayapalayam, Perundurai Road,<br/> Erode - 638 012.</h4>
                            <h6 class="mb-0">0424-222 5157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</h6>
                            <h6 class="mb-2">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</h6>
                        </div>
                    </div>
        </center>

        <hr/>
        
            <div class="row">
                <div class="col-md-12 text-center">
                    <h3><b>LOGIN HISTORY REPORT</b></h3>
                </div>
            </div>
            <form id="attendance_form">
                        <div class="row">
                            <div class="col-md-4">
                                <label><b>User Name:</b> <span id="user_id">
                                    <?php echo $staff_name;?>
                        
                                </span></label>
                            </div>
                            <div class="col-md-4">
                                <label><b>User Type:</b> <span id="user_type">
                                    <?php echo $sess_user_type;?>
                                </span></label>
                            </div>
                            <div class="col-md-4">
                                <label><b>Date:</b> <span id="entry_date">
                                    <?php echo $entry_date; ?>
                                </span></label>
                            </div>
                        </div>
                    </form>
          
</div>

<div class="zone_recom3">
<div class="box1">
<table class="table table-bordered" cellspacing="0" cellpadding="0" width="100%">
    <thead class="colspanHead">
        <tr>
            <th >S.No</th>
            <th >Entry Date</th>
            <th >Login Time</th>
            <th >Logout Time</th>
            <th >Total Worked Hours</th>
            <th >Logout Type</th>
            
        </tr>
    </thead>
    <tbody>
        
        <?php
$columns = [
    "entry_date",
    "entry_time",
    "log_type"
];

$table_details = [
    "user_login_details",
    $columns
];

// $where = "is_delete = 0 AND is_active = 1 AND user_id='$unique_id' and entry_date='$entry_date'";
// $order_by = "entry_date ASC, entry_time ASC";


$entry_date = date("Y-m-d", strtotime($_GET['entry_date']));
$where = "is_delete = 0 AND is_active = 1 AND user_id='$unique_id' AND entry_date='$entry_date'";
// Debugging
// echo "Generated Query: SELECT * FROM user_login_details WHERE $where ORDER BY entry_date ASC, entry_time ASC";

$result = $pdo->select($table_details, $where, "entry_date ASC, entry_time ASC");


// Fetching Data
$result = $pdo->select($table_details, $where, $order_by);

$total_work_seconds = 0;
$login_time = null;
$login_entry = null;
$sno = 1;

if ($result->status && !empty($result->data)) {
    $res_array = $result->data;

    $paired_logs = [];
    $total_work_seconds = 0;
    $sno = 1;
    $login_time = null;
    $login_entry = null;

    foreach ($res_array as $row) {
        $entry_time = strtotime($row['entry_time']); // Convert time to seconds

        if ($row['log_type'] == 1) {
            // Update login time to the latest login
            $login_time = $entry_time;
            $login_entry = date("H:i:s", strtotime($row['entry_time'])); // 24-hour format
        } elseif (($row['log_type'] == 2 || $row['log_type'] == 3 || $row['log_type'] == 4) && $login_time) {
            // Logout event found after a login event
            $logout_time = $entry_time;
            $logout_entry = date("H:i:s", strtotime($row['entry_time'])); // 24-hour format

            // Calculate worked time
            $worked_seconds = $logout_time - $login_time;
            $total_work_seconds += $worked_seconds;

            // Convert worked time to HH:MM:SS
            $worked_time = sprintf("%02d:%02d:%02d", floor($worked_seconds / 3600), floor(($worked_seconds % 3600) / 60), $worked_seconds % 60);

            // Store the valid pair
            $paired_logs[] = [
                "s_no" => $sno++,
                "entry_date" => date("Y-m-d", strtotime($row['entry_date'])), // Format date
                "login_time" => date("H:i:s", strtotime($login_entry)),  // 24-hour format
                "logout_time" => date("H:i:s", strtotime($logout_entry)), // 24-hour format
                "worked_time" => $worked_time, // Already formatted as HH:MM:SS
                "log_type" => $row['log_type']
            ];

            // Reset login time after pairing (ensures next logout gets next available login)
            $login_time = null;
            $login_entry = null;
        }
    }

    

    // Display grouped login/logout records
    foreach ($paired_logs as $log) {
        // Convert log_type to readable text
        $log_type_display = [
            1 => "Login",
            2 => "Logout",
            3 => "Session Logout",
            4 => "Tab/Window Closed"
        ][$log["log_type"]] ?? "Unknown";
        ?>
        <tr>
            <td><?= $log["s_no"]; ?></td>
            <td><?= htmlspecialchars($log["entry_date"]); ?></td>
            <td><?= htmlspecialchars($log["login_time"]); ?></td>
            <td><?= htmlspecialchars($log["logout_time"]); ?></td>
            <td><?= $log["worked_time"]; ?></td> <!-- Correct total worked hours per row -->
            <td><?= $log_type_display; ?></td> <!-- Correct log type display -->
        </tr>
    <?php }

    // Convert total worked seconds to HH:MM:SS format
    $total_hours = floor($total_work_seconds / 3600);
    $total_minutes = floor(($total_work_seconds % 3600) / 60);
    $total_seconds = $total_work_seconds % 60;
    $total_worked_time = sprintf("%02d:%02d:%02d", $total_hours, $total_minutes, $total_seconds);
    ?>

    <!-- Display Total Worked Hours -->
    <tr>
        <td colspan="4" style="text-align: right; font-weight: bold;">Total Worked Hours:</td>
        <td style="font-weight: bold;"><?= $total_worked_time; ?></td>
        <td></td>
    </tr>

<?php } else { ?>
    <tr>
        <td colspan="6" style="text-align: center;">No Records Found</td>
    </tr>
<?php }

function user_name_type ($sess_user_type = "") {
    
    global $pdo;

    $table_name    = "user_type";
    $where         = "";
    $table_columns = [
        // "unique_id",
        "user_type"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1 AND unique_id = '".$sess_user_type ."'";

  

    $user_name_list = $pdo->select($table_details, $where);

// print_r($user_name_list);

    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
}



?>
        
    </tbody>
</table>
</div>
</div>


