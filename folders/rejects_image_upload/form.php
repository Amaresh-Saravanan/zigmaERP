<?php
// Form variables
$btn_text = "Save";
$btn_form = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";
$screen_type_id = "";
$entry_date = "";
$type = "";
$drying_method = "";
$quantity = "";
$qty_manure = "";
$icon_name = "";
$is_active = 1;
$description = "";
$docs = "";

if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {
        $unique_id = $_GET["unique_id"];
        $where = ["unique_id" => $unique_id];
        $table = "rejects_image_upload";
        $columns = [
            "date",
            "ticket_no",
            "vehicle_number",
            "net_weight",
            "weigh_date",
            // "qty_manure",
            "image"
        ];
        $table_details = [$table, $columns];
        $result_values = $pdo->select($table_details, $where);
        if ($result_values->status) {
            $result_values = $result_values->data;
            $entry_date = $result_values[0]["date"];
            $ticket = $result_values[0]['ticket_no'];
            $vehicle_number = $result_values[0]['vehicle_number']; 
            $net_weight = $result_values[0]["net_weight"];
            $net_weight_ton = $net_weight/1000;
            $weigh_date = $result_values[0]["weigh_date"];
            $docs = $result_values[0]["image"];
            $btn_text = "Update";
            $btn_form = "Update";
            $btn_action = "update";
        } else {
            $btn_text = "Error";
            $btn_action = "error";
            $is_btn_disable = "disabled='disabled'";
        }
    }
}
?>
<?php
// Database connection for rejects_image_upload
$host = "192.168.1.200";
$username = "my_root";
$password = "my@123456";
$databasename = "zigfly_erp";

// Create a connection for rejects_image_upload
$conn_rejects = new mysqli($host, $username, $password, $databasename);

// Check the connection
if ($conn_rejects->connect_error) {
    die("Connection failed (rejects_image_upload): " . $conn_rejects->connect_error);
}

// Initialize variables
$ticket = ""; // To store the ticket number for the given unique_id

// Fetch the stored ticket number for the provided unique_id
if (isset($_GET["unique_id"]) && !empty($_GET["unique_id"])) {
    $unique_id = $_GET["unique_id"];
    $sql_ticket = "SELECT ticket_no FROM rejects_image_upload WHERE unique_id = ?";
    $stmt = $conn_rejects->prepare($sql_ticket);
    $stmt->bind_param("s", $unique_id);
    $stmt->execute();
    $result_ticket = $stmt->get_result();

    if ($result_ticket->num_rows > 0) {
        $row = $result_ticket->fetch_assoc();
        $ticket = $row['ticket_no']; // Store the ticket number associated with the unique_id
    }
}

// Fetch TicketNumbers from rejects_image_upload to exclude them (except the current one being updated)
$used_ticket_numbers = [];
$sql_used = "SELECT ticket_no FROM rejects_image_upload WHERE ticket_no != ? and is_delete=0";
$stmt_used = $conn_rejects->prepare($sql_used);
$stmt_used->bind_param("s", $ticket); // Exclude the current ticket number
$stmt_used->execute();
$result_used = $stmt_used->get_result();

if ($result_used->num_rows > 0) {
    // Fetch all ticket numbers already used in rejects_image_upload (excluding the current one being updated)
    while ($row = $result_used->fetch_assoc()) {
        $used_ticket_numbers[] = $row['ticket_no'];
    }
}

// Close the rejects_image_upload connection
$conn_rejects->close();

// Database connection for bsf_reject_transaction
$servername = "zigmaglobal.in";
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

// Create a connection for bsf_reject_transaction
$conn_bsf = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn_bsf->connect_error) {
    die("Connection failed (bsf_reject_transaction): " . $conn_bsf->connect_error);
}

// Fetch TicketNumbers from the bsf_reject_transaction table
$ticket_numbers = [];
$sql_bsf = "SELECT TicketNumber FROM bsf_reject_transaction order by TicketNumber asc";
$result_bsf = $conn_bsf->query($sql_bsf);

if ($result_bsf->num_rows > 0) {
    // Fetch all TicketNumbers from bsf_reject_transaction
    while ($row = $result_bsf->fetch_assoc()) {
        $ticket_numbers[] = $row['TicketNumber'];
    }
}

// Close the bsf_reject_transaction connection
$conn_bsf->close();

// Filter out the ticket numbers that are already used in rejects_image_upload (excluding the current one being updated)
$available_ticket_numbers = array_diff($ticket_numbers, $used_ticket_numbers);
sort($available_ticket_numbers);

// Now add the available ticket number options in the form
?>

<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pb-0">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="mb-0 mt-2 d-flex align-items-center">Reject Image Upload <?= $btn_form; ?></h5>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off" enctype="multipart/form-data" method="post">
                    <div class="row">
                        <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                        
                        <div class="col">
                            <label for="entry_date">Date</label>
                            <input type="datetime-local" class="form-control" id="entry_date" name="entry_date" 
                            value="<?php echo $entry_date ? date('Y-m-d\TH:i', strtotime($entry_date)) : date('Y-m-d\TH:i'); ?>" required>
                        </div>
                        
                        <div class="col">
                            <label for="ticket_number">Ticket Number</label>
                            <select name="ticket_number" id="ticket_number" class="select2 form-control" required onchange="fetchTicketDetails(this.value)">
                                <option value="">Select Ticket Number</option>
                                <?php
                                foreach ($available_ticket_numbers as $ticket_number) {
                                    // Check if this ticket number matches the one stored in the database for this unique_id
                                    $selected = ($ticket == $ticket_number) ? "selected" : "";
                                    echo "<option value='$ticket_number' $selected>$ticket_number</option>";
                                }
                                ?>
                            </select>
                        </div>

                        <div class="col">
                                <label for="weigh_date">Weigh Date</label>
                                <input type="datetime-local" class="form-control" id="weigh_date" name="weigh_date" 
                                    value="<?php echo isset($weigh_date) && !empty($weigh_date) ? date('Y-m-d\TH:i:s', strtotime($weigh_date)) : ''; ?>">
                            </div>



                        <div class="col">
                            <label for="vehicle_number">Vehicle Number</label>
                            <input type="text" class="form-control" id="vehicle_number" name="vehicle_number" 
                                value="<?php echo isset($vehicle_number) ? $vehicle_number : ''; ?>" readonly>
                        </div>

                        <div class="col">
                            <label for="net_weight">Net Weight(MT)</label>
                            <input type="hidden" class="form-control" id="net_weight" name="net_weight" 
                                value="<?php echo isset($net_weight) ? $net_weight : ''; ?>" readonly>
                            <input type="text" class="form-control" id="net_weight_ton" name="net_weight_ton" 
                                value="<?php echo isset($net_weight_ton) ? $net_weight_ton : ''; ?>" readonly>
                        </div>
                        </div>
                        <div class="row">
                        <div class="col-3 mb-3">
                            <label>Image Upload</label>
                            <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify" value="<?php echo $docs; ?>">
                        </div>
                        </div>

                        <?php if (!empty($docs)) { ?>
                        <div class="row mb-3">
                            <label class="form-label">Uploaded Files:</label>
                            <?php
                            $doc_array = explode(",", $docs);
                            foreach ($doc_array as $doc) {
                                $file_path = "uploads/rejects_image_upload/" . $doc;
                                $file_ext = pathinfo($file_path, PATHINFO_EXTENSION);
                                $icon_path = "uploads/";

                                switch ($file_ext) {
                                    case 'pdf':
                                        $icon = $icon_path . 'pdf.png';
                                        break;
                                    case 'doc':
                                    case 'docx':
                                        $icon = $icon_path . 'word.png';
                                        break;
                                    case 'xls':
                                    case 'xlsx':
                                        $icon = $icon_path . 'excel.png';
                                        break;
                                    default:
                                        $icon = $file_path; // default to actual image if jpg, jpeg, or png
                                        break;
                                }

                                if (in_array($file_ext, ['jpg', 'jpeg', 'png'])) {
                                    echo "<div class='col-2'><img src='$icon' alt='$doc' style='width:50px; height:50px;' onclick='print_view(\"$doc\")'></div>";
                                } else {
                                    echo "<div class='col-2'><a href='$file_path' target='_blank'><img src='$icon' alt='$doc' style='width:50px; height:50px;'></a></div>";
                                }
                            }
                            ?>
                        </div>
                        <?php } ?>
                    <!-- </div> -->

                    <div class="row mt-2">
                        <div class="col-md-12 text-end">
                            <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
                            <?php echo btn_cancel($btn_cancel); ?>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function fetchTicketDetails(ticketNumber) {
    if (ticketNumber) {
        $.ajax({
            type: "POST",
            url: "folders/rejects_image_upload/get_ticket_details.php", // PHP script to fetch the data
            data: { ticket_number: ticketNumber },
            success: function(response) {
    var data = JSON.parse(response);
    if (data.status) {
        console.log("Weigh Date from Server:", data.weigh_date); // Log date for debugging

        // Populate other fields
        $("#vehicle_number").val(data.vehicle_number);
        $("#net_weight").val(data.net_weight);
        $("#net_weight_ton").val(data.net_weight_ton);
        // alert(data.weigh_date);
        // For Weigh Date, use slice(0, 16) to trim to "YYYY-MM-DDTHH:MM" format
        $("#weigh_date").val(data.weigh_date ? data.weigh_date.slice(0, 16) : '');
    } else {
        alert("No data found for this ticket number.");
    }
},
            error: function() {
                alert("Error fetching ticket details.");
            }
        });
    }
}

</script>

