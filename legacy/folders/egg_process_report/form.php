<?php
// Form variables
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$entry_date         = "";
$staff_name         = $_SESSION['sess_user_id'];
$supplier_name      = "";
$tot_qty            = "";
$chick_feed         = "";
$water              = "";
$tray_utilized      = "";
$batch_id           = "";
$checkedvalue       = "";
$checked            = "";
$screen_unique_id   = unique_id("scr");

// print_r($_SESSION);

if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "egg_process";
    $columns    = [
      "entry_date",
      "staff_name",
      "supplier_name",
      // "(SELECT supplier_name FROM supplier_creation WHERE supplier_creation.unique_id = $table.supplier_name) AS supplier_name",
      "tot_qty",
      "tray_utilized",
      "batch_id",
      "checkedvalue",
      "screen_unique_id",

    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    // print_r($result_values);
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $entry_date        = $result_values[0]["entry_date"];
      $staff_name        = $result_values[0]["staff_name"];
      $supplier_name     = $result_values[0]["supplier_name"];
      $tot_qty           = $result_values[0]["tot_qty"];
      $tray_utilized     = $result_values[0]["tray_utilized"];
      $batch_id          = $result_values[0]["batch_id"];
      $checkedvalue      = $result_values[0]["checkedvalue"];
      $screen_unique_id  = $result_values[0]["screen_unique_id"];
      $checked           = $tray_utilized;

      $btn_text           = "Update";
      $btn_form           = "Update";
      $btn_action         = "update";
    } else {
      $btn_text           = "Error";
      $btn_action         = "error";
      $is_btn_disable     = "disabled='disabled'";
    }
// update batch number display.above   $batch_id       = $result_values[0]["batch_id"];
$batch_no_options  = batch_no_egg1();
$batch_no_options  = select_option1($batch_no_options,'', $batch_id);
  }
}else{
  $batch_no_options  = batch_no_egg();
  $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id);
}




$staff_name_show   = disname(staff($staff_name)[0]['user_name']);

$item_name_options = item_name_select();
$item_name_options = select_option($item_name_options, "", $item_name);

$servername = "zigmaglobal.in"; // Typically 'localhost'
$username   = "zigmaglobal_new_user";
$password   = "Bq3[1PYLs6q2";
$dbname     = "zigmaglo_erp";

// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
  die("Connection failed: " . mysqli_connect_error());
}


$servername_pdo = "192.168.1.22"; // Typically 'localhost'
$username_pdo   = "my_root";
$password_pdo   = "my@123456";
$dbname_pdo     = "zigma_bsf";

// Create connection
$pdo_con = mysqli_connect($servername_pdo, $username_pdo, $password_pdo, $dbname_pdo);

// Check connection
if (!$pdo_con) {
  die("Connection failed: " . mysqli_connect_error());
}

$sql = "SELECT checkedvalue FROM egg_process WHERE screen_unique_id = '$screen_unique_id'";
$result = mysqli_query($pdo_con, $sql);
$selectedValues = array();
if ($result) {
  while ($row = mysqli_fetch_assoc($result)) {
    // Split the string by commas to get individual values
    $values = explode(',', $row['checkedvalue']);
    // Trim each value to remove any whitespace
    $values = array_map('trim', $values);
    // Merge into $selectedValues array
    $selectedValues = array_merge($selectedValues, $values);
  }
}
// Convert the PHP array to a JavaScript array
$selectedValuesJs = json_encode($selectedValues);

function select_option1($options = [],$description = "", $is_selected = [],$is_disabled = []) {
    
  // $option_str     = "<option value='' selected='selected'>No Options to Select</option>";

  $data_attribute = "";

  if ($options) {

      // $option_str     = "<option value=''>Select</option>";

      if ($description) {
          $option_str     = "<option value=''  selected>".$description."</option>";
      }
      foreach ($options as $key => $value) {

          $value      = array_values($value);
          $selected   = "";
          $disabled   = "";

          if (is_array($is_selected) AND in_array($value[0],$is_selected)) {            
              $selected = " selected='selected' ";
          } elseif ($is_selected == $value[0]) {
              
              $selected = " selected='selected' ";
          }
          
          if (is_array($is_disabled) AND in_array($value[0],$is_disabled)) {            
              $disabled = " disabled='disabled' ";
          } elseif ($is_disabled == $value[0]) {
              $disabled = " disabled='disabled' ";
          }

          if (strpos($value[1],"_")) {
              $value[1] = disname($value[1]);
          } else {
              $value[1] = ucfirst($value[1]);
          }

          if (isset($value[2])) {
              $data_attribute = "data-extra='".$value[2]."'";
          } 

          $option_str .= "<option value='".$value[0]."'".$data_attribute.$selected.$disabled.">".$value[1]."</option>";
      }
  }
  
  return $option_str;
}

function batch_no_egg($batch_no = "") {
    
  global $pdo;
  $table_name    = "material_received";
  $where         = "";
  $table_columns = [
      "unique_id",
      "batch_id"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  $where     = " is_delete = 0 AND is_active = 1 and item_name='6683a7c6460c777119' AND batch_status = 0";

  if ($unique_id) {
      $table_details      = $table_name;
      $where              = [];
      $where["unique_id"] = $unique_id;
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



function batch_no_egg1($batch_no = "") {
    
  global $pdo;
  $table_name    = "egg_process";
  $where         = "";
  $table_columns = [
      "batch_id",
      "(select batch_id from material_received where unique_id=egg_process.batch_id) as batch_id1"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  $where     = " is_delete = 0 ";

  if ($unique_id) {
      $table_details      = $table_name;
      $where              = [];
      $where["unique_id"] = $unique_id;
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






?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Egg Process Creation</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
             <input type="hidden" class="form-control" id='unique_id' name='unqiue_id' value="<?php echo $_GET['unique_id']; ?>" required>
             <input type="hidden" class="form-control" id='staff_name' name='staff_name' value="<?php echo $_SESSION['sess_user_id']; ?>" required>
             <input type="hidden" id="screen_unique_id" name="screen_unique_id" value="<?php echo $screen_unique_id; ?>">
             <input type="hidden" class="form-control" id='screen_unique_id' name='screen_unique_id' value="<?php echo $screen_unique_id; ?>" required>

          <div class="row">
            <div class="col-4 mb-3">
              <label for="entry_date"> Entry Date </label>
              <input type="date" class="form-control" id='entry_date' name='entry_date' value="<?php echo date('Y-m-d'); ?>" required>
            </div>
      
          <div class="col-4 mb-3">
              <label for="batch_id"> Batch Id </label>
              <select name="batch_id" id="batch_id" class="select2 form-control" onchange="get_task_details(this.value)" required>
                <?php echo $batch_no_options; ?>
              </select>
              <input type="hidden" id="batch_id_hidden" name="batch_id_hidden">
            </div>
            <div class="col-4 mb-3">
              <label for="supplier_name"> Supplier Name </label>
                <div class="col">
                <input type="text" name="supplier_name" id="supplier_name" class="form-control" value='<?php echo $supplier_name; ?>' readonly required>
                </div>
              </div>
              <div class="col-4 mb-3">
              <label for="tot_qty"> Total Quantity </label>
                <div class="col">
                <input type="text" name="tot_qty" id="tot_qty" class="form-control" value='<?php echo $tot_qty; ?>' readonly required>
                </div>
              </div>
    
          <div class="col-4 mb-3">
              <label for="tray_utilized"> Tray Utilized </label>
              <input type="text" class="form-control" id='tray_utilized' name='tray_utilized' value='<?php echo $tray_utilized; ?>' required>
            </div>
            <div class="col-4 mb-3">
              <button type="button" class="btn btn-success mt-4" data-bs-toggle="modal" data-bs-target=".bs-example-modal-lg"  <?php if ($_GET["unique_id"]) { ?> onclick="checkSpecificCheckboxes()" <?php } ?>>Add Tray</button>
              <button type="button" class="btn btn-primary mt-4" data-bs-toggle="modal" data-bs-target=".bs-modal-addonpop">Add On</button>
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

        <div class="row mt-3">
          <div class="col-md-12">
            <h6> Selected Trays </h6>
            <div id="selected-trays" class="border p-2"></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</div>



<!--  Large modal example -->
<div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="myLargeModalLabel">Heading</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
        </button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table align-middle table-nowrap mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">#</th>
                <?php
                // Define the SELECT query
                $sql = "SELECT * FROM tray_creation where is_delete = '0' and tray_status = '0' or batch_id = '$batch_id'";
                // Execute the query
                $result = mysqli_query($pdo_con, $sql);

                // Check if the query was successful
                if ($result) {
                  // Check if there are any rows returned
                  if (mysqli_num_rows($result) > 0) {
                    // Fetch and output data of each row
                    while ($row = mysqli_fetch_assoc($result)) { 
                ?>
                       <th scope="col">
                  <?php echo $row['bin_name'];?>
                </th>
                 <?php 
                 }
                  }
                } 
                ?>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tray</td>

                <?php
                // Define the SELECT query
                $sql = "SELECT * FROM tray_creation where is_delete = '0' and tray_status = '0' or batch_id = '$batch_id'";
                // Execute the query
                $result = mysqli_query($pdo_con, $sql);
                // Check if the query was successful
                if ($result) {
                  // Check if there are any rows returned
                  if (mysqli_num_rows($result) > 0) {
                    // Fetch and output data of each row
                    while ($row = mysqli_fetch_assoc($result)) { ?>
                     <td>
                    <div class="form-check mb-3">
                      <input class="form-check-input" type="checkbox" id="tray_unique_id" name="option[]" value="<?=$row['unique_id'];?>" data-tray-name="<?=$row['bin_name'];?>" onclick="countChecked()">
                      
                    </div>
                  </td>
                <?php }
                  }
                } ?>                                 
                <input type="text" id="checkedCount" name="checkedCount" value="<?= $checked; ?>">
                <input type="text" id="checkedvalue" name="checkedvalue" placeholder="Checked values" value="<?=$checkedvalue; ?>">
              </tr>
            </tbody>
          </table>
          <!-- end table -->
        </div>
        <div class="modal-footer">
          <a href="javascript:void(0);" class="btn btn-danger " data-bs-dismiss="modal"> Close</a>
          <button type="button" class="btn btn-primary status_sub_add_update_btn" onclick="get_tray_count(tray_utilized.value)">Save</button>
          
        </div>
      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->

</div>

                                
  
<!-- Add On modal -->
<div class="modal fade bs-modal-addonpop" tabindex="-1" role="dialog" aria-labelledby="myaddmodal" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="myaddmodal">Add On</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="col">
          <label for="item_name" class="form-label">Item Name</label>
          <select name="item_name" id="item_name" class="select2 form-control" multiple required onchange="handleItemSelected()">
            <?php echo $item_name_options; ?>
          </select>
        </div>
        <div id="dynamicInputs"></div>
        <div class="row mt-3">
          <div class="col">
            <button type="button" class="btn btn-primary" onclick="saveAddOn()">Save</button>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="javascript:void(0);" class="btn btn-danger" data-bs-dismiss="modal">Close</a>
      </div>
    </div>
  </div>
</div>

<script>
    // JavaScript array from PHP
    var selectedValues = <?php echo $selectedValuesJs; ?>;
    function checkSpecificCheckboxes() {
      // Select all checkboxes with name "option[]"
      var checkBoxes = document.querySelectorAll('input[name="option[]"]');
      // Loop through each checkbox
      for (var i = 0; i < checkBoxes.length; i++) {
        // Convert values to strings for comparison
        var checkboxValue = checkBoxes[i].value.toString();
        var isChecked = selectedValues.includes(checkboxValue);
        if (isChecked) {
          checkBoxes[i].checked = true;
        } else {
          checkBoxes[i].checked = false;
        }
      }
    }
 
 </script>