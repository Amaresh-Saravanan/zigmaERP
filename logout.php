<!-- <script>
    alert("Your Session was timed Out! Please Login Again");
</script>  -->

<?php
    // session_start();
    
    // session_destroy(); 

    // header("Location: ../../erp");
?>


<script>
    alert("Your Session was timed Out! Please Login Again");
</script> 



<?php
session_start();

// Retrieve session variables before destroying the session
$user_id = $_SESSION['user_id'];
$acc_year = $_SESSION['acc_year'];
$sess_user_type = $_SESSION['sess_user_type'];
$sess_user_id = $_SESSION['sess_user_id'];
$sess_company_id = $_SESSION['sess_company_id'];
$sess_branch_id = $_SESSION['sess_branch_id'];



// Include the database connection
include 'config/dbconfig.php';

// Log activity function
function log_activity($conn, $user_id, $entry_date, $entry_time, $log_type, $unique_id, $session_id, $acc_year, $sess_user_type, $sess_user_id, $sess_company_id, $sess_branch_id) {
    $stmt = $conn->prepare("INSERT INTO user_login_details (user_id, entry_date, entry_time, log_type, unique_id, session_id, acc_year, sess_user_type, sess_user_id, sess_company_id, sess_branch_id) VALUES (:user_id, :entry_date, :entry_time, :log_type, :unique_id, :session_id, :acc_year, :sess_user_type, :sess_user_id, :sess_company_id, :sess_branch_id)");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':entry_date', $entry_date);
    $stmt->bindParam(':entry_time', $entry_time);
    $stmt->bindParam(':log_type', $log_type);
    $stmt->bindParam(':unique_id', $unique_id);
    $stmt->bindParam(':session_id', $session_id);
    $stmt->bindParam(':acc_year', $acc_year);
    $stmt->bindParam(':sess_user_type', $sess_user_type);
    $stmt->bindParam(':sess_user_id', $sess_user_id);
    $stmt->bindParam(':sess_company_id', $sess_company_id);
    $stmt->bindParam(':sess_branch_id', $sess_branch_id);
    $stmt->execute();
}

// Current date and time
$entry_date = date('Y-m-d');
$entry_time = date('H:i:s'); // 24-hour format
$log_type = 2;


// Determine log type
if (isset($_GET['log_type'])) {
    $log_type = 3; // Timeout Logout
} elseif (isset($_POST['logout']) && $_POST['logout'] === 'true') {
    $log_type = 4; // Manual Logout
}

$unique_id = unique_id($prefix); // Assuming you have a unique_id function
$session_id = session_id();

log_activity($conn, $user_id, $entry_date, $entry_time, $log_type, $unique_id, $session_id, $acc_year, $sess_user_type, $sess_user_id, $sess_company_id, $sess_branch_id);
// Destroy the session
session_destroy();

header("Location: ../../erp");
exit();
?>