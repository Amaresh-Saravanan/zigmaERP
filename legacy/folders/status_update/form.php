<?php
// Form variables
$btn_text         = "Save";
$btn_form         = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";
$entry_date = "";
$staff_name = $_SESSION['sess_user_id'];
$batch_id = "";
$day = "";
$inward_date = "";
$starting_day = "";
$entry_no = "";
$hatching_status = "";
$remarks = "";

if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id = $_GET["unique_id"];
    $where = [
      "unique_id" => $unique_id
    ];
    $table = "status_update";
    $table1 = "egg_process";

    $columns = [
      "entry_date",
      "starting_day",
      "entry_no",
      "batch_id",
      "day",
      "staff_name",
      "doc_name",
      "hatching_status",
      "remarks",
    ];
    $table_details = [
      $table,
      $columns
    ];
    $result_values = $pdo->select($table_details, $where);
    // print_r($result_values);
    if ($result_values->status) {
      $result_values = $result_values->data;
      $entry_date = $result_values[0]["entry_date"];
      $starting_day = $result_values[0]["starting_day"];
      $entry_no = $result_values[0]["entry_no"];
      $batch_id = $result_values[0]["batch_id"];
      $day = $result_values[0]["day"];
      $staff_name = $result_values[0]["staff_name"];
      $doc_name = $result_values[0]["doc_name"];
      $hatching_status = $result_values[0]["hatching_status"];
      $remarks = $result_values[0]["remarks"];
      $btn_text = "Update";
      $btn_form = "Update";
      $btn_action = "update";
    } else {
      $btn_text = "Error";
      $btn_action = "error";
      $is_btn_disable = "disabled='disabled'";
    }
    $columns1=["batch_status" => 0];
    $update_where1 = [
      "batch_id" => $batch_id
    ];
    if($hatching_status=='1'){
      $action_obj = $pdo->update($table1, $columns1, $update_where1);
      // print_r($action_obj);
    }
    if($hatching_status=='2'){
      $batch_no_optionse_egg_id = egg_batch_no_update($unique_id);
      $batch_no_optionse_egg_id = select_option($batch_no_optionse_egg_id, "Select Batch Id", $batch_id);
    }else{
      $batch_no_optionse_egg_id = egg_batch_no();
      $batch_no_optionse_egg_id = select_option($batch_no_optionse_egg_id, "Select Batch Id", $batch_id);
    }
    
    
  }
}else{

  $batch_no_optionse_egg_id = egg_batch_no();
  $batch_no_optionse_egg_id = select_option($batch_no_optionse_egg_id, "Select Batch Id", $batch_id);
}



// $doc_options = [
//   "1" => [
//     "unique_id" => "1",
//     "value" => "Image",
//   ],
//   "2" => [
//     "unique_id" => "2",
//     "value" => "Document",
//   ],
//   "3" => [
//     "unique_id" => "3",
//     "value" => "Audio",
//   ],

// ];
// $doc_options = select_option($doc_options, "Select", $doc_opt);

$status_options = [
  "1" => [
    "unique_id" => "1",
    "value" => "Progressing",
  ],
  "2" => [
    "unique_id" => "2",
    "value" => "Completed",
  ],

];
$status_options = select_option($status_options, "Select The Status", $hatching_status);

$entry_no_options = entry_no_select();
$entry_no_options = select_option($entry_no_options, "Select Entry Number", $entry_no);


$active_status_options = active_status($is_active);

$servername = "zigmaglobal.in"; // Typically 'localhost'
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
  die("Connection failed: " . mysqli_connect_error());
}

function egg_batch_no_update($unique_id = "") {
  global $pdo;

  $table_name    = " status_update su join egg_process ep on su.batch_id=ep.batch_id";
  $where         = "";
  $table_columns = [
      "ep.batch_id",
      "(select batch_id from material_received where unique_id=su.batch_id) as batch_id_1"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  // $where     = "su.is_delete = 0 AND su.is_active = 1  and su.hatching_status=1 and ep.is_delete=0";
  $where = "su.unique_id = '$unique_id'";
  


  $user_name_list = $pdo->select($table_details, $where);
  // print_r($user_name_list);

  if ($user_name_list->status) {
      return $user_name_list->data;
  } else {
      print_r($user_name_list);
      return 0;
  }
}

function egg_batch_no($unique_id = "") {
  global $pdo;

  $table_name    = "egg_process ep ";
  $where         = "";
  $table_columns = [
      "ep.batch_id",
      "(select batch_id from material_received where unique_id=ep.batch_id) as batch_id_1"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  $where     = "ep.is_delete = 0 AND ep.is_active = 1 and ep.batch_status= 0";
  // $where     = "ep.is_delete = 0 AND ep.is_active = 1";

  if ($unique_id) {
  
      $table_details      = $table_name;
      $where              = [];
      $where["ep.unique_id"] = $unique_id;
  }
  $user_name_list = $pdo->select($table_details, $where);
  // print_r($user_name_list);

  if ($user_name_list->status) {
      return $user_name_list->data;
  } else {
      print_r($user_name_list);
      return 0;
  }
}

// $document_options        = [
//     "1" => [
//         "unique_id" => "1",
//         "value"     => "Image",
//     ],
//     "2" => [
//         "unique_id" => "2",
//         "value"     => "Document",
//     ],
//     "3" => [
//         "unique_id" => "3",
//         "value"     => "Audio",
//     ],

// ];
// $document_options        = select_option_create($document_options, "Select", $stage);



?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Status <?= $btn_form; ?> </h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
            <!-- <div class="col-4 mb-3">
              <label for="entry_date"> Entry Date </label>
              <input type="hidden" class="form-control" id='staff_name' name='staff_name'
                value="<?php echo $_SESSION['sess_user_id']; ?>" required>
              <input type="hidden" class="form-control" id='unique_id' name='unique_id'
                value='<?php echo $_GET["unique_id"]; ?>'>
              <input type="date" class="form-control" id='entry_date' name='entry_date'
                value="<?php echo $entry_date ?>" required>
            </div> -->
            <!-- <div class="col-4 mb-3">
              <label for="staff_name"> Staff Name </label>
              <select name="staff_name" id="staff_name" class="select2 form-control" required>
                <option value="">Select</option>
                <?php
                // Define the SELECT query  
                $sql = "SELECT * FROM staff_creation where delete_status = '0'";
                // Execute the query
                $result = mysqli_query($conn, $sql);

                // Check if the query was successful
                if ($result) {
                  // Check if there are any rows returned
                  if (mysqli_num_rows($result) > 0) {
                    // Fetch and output data of each row
                    while ($row = mysqli_fetch_assoc($result)) { ?>
                          <option value="<?php echo $row['id']; ?>" <?php if ($row['id'] == $staff_name) {
                              echo "Selected";
                            } ?>>
                          <?php echo $row['staff_name']; ?></option>
                <?php }
                  }
                } ?>
              </select>
            </div> -->

            <?php if(empty($unique_id)){ ?>
              <div class="col-4 mb-3">
                <label for="entry_date">Entry Date</label>
                <input type="hidden" class="form-control" id="staff_name" name="staff_name" 
                      value="<?php echo $_SESSION['sess_user_id']; ?>" required>
                <input type="hidden" class="form-control" id="unique_id" name="unique_id" 
                      value="<?php echo $_GET['unique_id']; ?>">
                <input type="date" class="form-control" id="entry_date" name="entry_date" 
                      value="<?php ?>" required>
              </div>
              <?php } else { 
                $formatted_date = date('d-m-Y', strtotime($entry_date));
                ?>
              <div class="col-4 mb-3">
                <label for="entry_date">Entry Date</label>
                <input type="hidden" class="form-control" id="staff_name" name="staff_name" 
                      value="<?php echo $_SESSION['sess_user_id']; ?>" required readonly>
                <input type="hidden" class="form-control" id="unique_id" name="unique_id" 
                      value="<?php echo $_GET['unique_id']; ?>">
                <br><span><?php echo $formatted_date; ?></span>
                <input type="hidden" class="form-control" id="entry_date" name="entry_date" 
                      value="<?php echo $entry_date; ?>" readonly>
              </div>
            <?php } ?>

            <div class="col-4 mb-3">
              <label for="batch_id">Batch Id</label>
              <select name="batch_id" id="batch_id" class="select2 form-control" onchange="toggleEntryDateReadOnly()">
                <?php echo $batch_no_optionse_egg_id; ?>
              </select>
            </div>

            <div class="col-4 mb-3">
              <label for="entry_no"> Entry No </label>
              <input type="text" class="form-control" id='entry_no' name='entry_no' value='<?php echo $entry_no; ?>' readonly>
            </div>

            
            <div class="col-4 mb-3">
              <label for="starting_day">Processing started Day</label>
              <input type="date" class="form-control" id='starting_day' name='starting_day' value='<?php echo $starting_day; ?>' readonly>
            </div>
          
            <div class="col-4 mb-3">
              <label for="day"> Day </label>
              <input type="text" class="form-control" id='day' name='day' value='<?php echo $day; ?>' readonly>
            </div>

            <input type="hidden" class="form-control" id='inward_date' name='inward_date' value='<?php echo $inward_date; ?>'>



            <div class="col-4 mb-3">
              <label for="hatching_status">Hatching Status </label>
              <select name="hatching_status" id="hatching_status" class="select2 form-control" required>
                <?php echo $status_options; ?>
              </select>
            </div>


            <div class="col-4 mb-3">
              <label>Egg process Image</label>
              <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify" value="<?php echo $docs;?>">
            </div>

            <div class="col-4 mb-3">
              <label for="remarks"> Remarks </label>
              <input type="text" class="form-control" id='remarks' name='remarks' value='<?php echo $remarks; ?>'>
            </div>       


          </div>
          <div class="row mt-2">
            <div class="col-md-12 text-end">
              <!-- Cancel,save and update Buttons -->

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
//   function showPreview(event) {

// if (event.target.files.length > 0) {
//     var src = URL.createObjectURL(event.target.files[0]);
//     var preview = document.getElementById("output_image");
//     preview.src = src;
//     //  document.getElementById('profile_image').value = preview.src;
// }
// }



</script>

<script>
function toggleEntryDateReadOnly() {
    var batchid = document.getElementById('batch_id').value;
    var entryDate = document.getElementById('entry_date');

    if(batchid !== '') {
        entryDate.readOnly = true; // Set readonly attribute
    } else {
        entryDate.readOnly = false; // Remove readonly attribute
    }
}
</script>