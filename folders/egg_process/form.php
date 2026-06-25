<?php
// Form variables
$table = "egg_process";
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
$screen_unique_id    = unique_id("scr");

// print_r($_SESSION);

if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
      // Existing record update scenario
      $unique_id  = $_GET["unique_id"];
      // Fetch data including entry_no
      $columns = [
        "ep.entry_date",
        "ep.staff_name",
        "ep.supplier_name",
        "ep.tot_qty",        
        "ep.tray_utilized",
        "ep.batch_id",
        "ep.checkedvalue",
        "ep.screen_unique_id",
        "ep.entry_no",
        "item_name",        
        "epa.item_qty"
      ];
      $table_details = [
        $table." as ep join egg_process_addon as epa on ep.screen_unique_id = epa.screen_unique_id",
        $columns
    ];
    $where = 'ep.unique_id = "' . $unique_id . '" and ep.is_delete = 0';
      $result_values = $pdo->select($table_details, $where);
      if ($result_values->status) {
          $result_values = $result_values->data;
          // Assign fetched entry_no
          $entry_no     = $result_values[0]["entry_no"];
          // Assign other values as before
          $entry_date     = $result_values[0]["entry_date"];
          $staff_name     = $result_values[0]["staff_name"];
          $supplier_name1  = $result_values[0]["supplier_name"];
          $supplier_name = disname(supplier_name($supplier_name1)[0]['supplier_name']);
          $tot_qty        = $result_values[0]["tot_qty"];
          $tray_utilized  = $result_values[0]["tray_utilized"];
          $batch_id       = $result_values[0]["batch_id"];
          $checkedvalue   = $result_values[0]["checkedvalue"];
          $screen_unique_id  = $result_values[0]["screen_unique_id"];
           // -------------------------------------------
          $item_details = [];
          foreach ($result_values as $value) {
              $item_name_data = item_name_select($value['item_name']);
              
              if (!empty($item_name_data)) {
                  $item_name = disname($item_name_data[0]['item_name']); 
                  $item_qty = $value["item_qty"];
                  
                 
                  $item_details[] = $item_name . "= " . $item_qty . " (kg)";
              } else {
                  $item_details[] = "Unknown=0 (kg)"; 
              }
          }
                    
          $item_display = implode("    , ", $item_details);        
                    if($checkedvalue){
                      $exp_site = explode(',',$checkedvalue);
                      $unique_bin_names = []; 
                      $site_display = '';        
                      foreach ($exp_site as $tray_no) {
                          $bin_name = tray($tray_no);            
                          if ($bin_name) {
                              $tray_id = $bin_name[0]['bin_name'];
                              
                              if (!in_array($tray_id, $unique_bin_names)) {
                                  $unique_bin_names[] = $tray_id;
                                  $tray_display .= $tray_id . ',';
                              }
                          }
                      }
                      
                    
                    }
          

// -------------------------------------------------------------------





          $checked  = $tray_utilized;
          // Update button text and action
          $btn_text       = "Update";
          $btn_form       = "Update";
          $btn_action     = "update";
      } else {
          // Handle error scenario
          $btn_text           = "Error";
          $btn_action         = "error";
          $is_btn_disable     = "disabled='disabled'";
      }

$batch_no_options  = batch_no_egg1($unique_id);
$batch_no_options  = select_option1($batch_no_options,'', $batch_id);
  }
}
else{
    
    $sql = "SELECT MAX(entry_no) as max_entry_no FROM $table where is_delete = 0";
    $result = $pdo->query($sql);
    if ($result->status) {
        $max_entry_no = $result->data[0]["max_entry_no"];
        
        preg_match('/EPC-(\d+)/', $max_entry_no, $matches);
        if (isset($matches[1])) {
            $numeric_part = (int)$matches[1];
            $numeric_part += 1;
            $entry_no = 'EPC-' . str_pad($numeric_part, 5, '0', STR_PAD_LEFT);
        } else {
            $entry_no = 'EPC-00001'; 
        }
    } else {
        $entry_no = 'EPC-00001';
    }
  $batch_no_options  = batch_no_egg();
  $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id);
}

$staff_name_show       = disname(staff($staff_name)[0]['user_name']);

$item_name_options = item_name_unit_select();
$item_name_options_html = "";
foreach ($item_name_options as $option) {
  $item_name_options_html .= "<option value='{$option['unique_id']}' data-unit='{$option['unit']}'>{$option['item_name']}</option>";
}

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

$servername_pdo = "192.168.1.200"; // Typically 'localhost'
$username_pdo = "my_root";
$password_pdo = "my@123456";
$dbname_pdo = "zigfly_erp";

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

function item_name_unit_select($unique_id = "") {
  global $pdo;

  $table_name    = "item_creation";
  $where         = [];
  $table_columns = [
      "unique_id",
      "item_name",
      "(Select unit_name from unit_creation where item_creation.unit=unit_creation.unique_id) as unit"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

 
  $where     = "unique_id in('66a3467a54eed94471','66a7954fcaf3b34759')";
  $item_name_select = $pdo->select($table_details, $where);

  if ($item_name_select->status) {
      return $item_name_select->data;
  } else {
      print_r($item_name_select);
      return 0;
  }
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

  $where     = " is_delete = 0 AND is_active = 1 and item_name in  ('6683a7c6460c777119','67611fb01124911773') AND batch_status = 0";

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

function btn_cancel1($list_link = "", $id = "btn-cancel-id") {
  $final_str = '<a href="' . $list_link . '"><button type="button" id="' . $id . '" class="btn btn-danger btn-rounded waves-effect waves-light float-right ml-2">Cancel</button></a>';
  return $final_str;
}

function batch_no_egg1($unique_id = "") {
    
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

  $where     = " is_delete = 0 and is_active=1";

  if ($unique_id) {
      $table_details      = $table_details;
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
$unit_options = unit_name();
$unit_options = select_option($unit_options, "Select Unit Name", $unit);


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
          <div class="col-3 mb-3">
            <label for="entry_no">Entry No</label>
            <input type="hidden" class="form-control" id="entry_no" name="entry_no" value="<?php print_r($entry_no ); ?>" readonly required>
            <br><h5><?php print_r($entry_no ); ?></h5>
      </div>


      <?php if(empty($unique_id)){ ?>
      <div class="col-3 mb-3">
        <label for="entry_date">Entry Date</label>
        <input type="date" class="form-control" id="entry_date" name="entry_date" value="<?php ?>" required>
      </div>
      <?php } else { ?>
      <div class="col-3 mb-3">
        <label for="entry_date">Entry Date</label>
        <br><span ><?php echo $entry_date; ?></span>
        <input type="hidden" class="form-control" id="entry_date" name="entry_date" value="<?php echo $entry_date; ?>" >
      </div>
      <?php } ?>


      
          <div class="col-3 mb-3">
              <label for="batch_id"> Batch Id </label>
              <select name="batch_id" id="batch_id" class="select2 form-control" onchange="get_task_details(this.value)" required>
                <?php echo $batch_no_options; ?>
              </select>
              <input type="hidden" id="batch_id_hidden" name="batch_id_hidden">
          </div>

          <div class="col-3 mb-3">          
              <label for="supplier_name"> Supplier Name </label>
                <div class="col">
                <input type="hidden" name="supplier_name1" id="supplier_name1" class="form-control" value='<?php echo $supplier_name1; ?>' readonly required>
                <input type="text" name="supplier_name" id="supplier_name" class="form-control" value='<?php echo $supplier_name; ?>' readonly required>
                </div>
            </div>
            


              <div class="col-3 mb-3">
              <label for="tot_qty"> Total Quantity(Grams) </label>
                <div class="col">
                <input type="text" name="tot_qty" id="tot_qty" class="form-control" value='<?php echo $tot_qty; ?>' readonly required>
                </div>
              </div>
    
          <div class="col-3 mb-3">
              <label for="tray_utilized"> Tray Utilized </label>
              <input type="text" class="form-control" id='tray_utilized' name='tray_utilized' onkeypress="return onlyNumberKey(event)" value='<?php echo $tray_utilized; ?>' required>
            </div>
            <div class="col-3 mb-3">
              <button type="button" class="btn btn-success mt-4" data-bs-toggle="modal" data-bs-target=".bs-example-modal-lg"  <?php if ($_GET["unique_id"]) { ?> onclick="checkSpecificCheckboxes()" <?php } ?>>Add Tray</button>
              <button type="button" class="btn btn-primary mt-4" data-bs-toggle="modal" data-bs-target=".bs-modal-addonpop">Add On</button>
            </div>
          </div>
        
          <div class="row mt-2">
          <div class="row mt-3">
          <div class="row mt-3">
          <div class="row mt-3">
  <div class="col-md-12">
    <!-- <h6>Selected Trays</h6> -->
    <h6 id="select_label"><strong>Selected Trays</strong></h6>  
    <div id="selected-trays" class="row"></div>
  </div>
  <div class="col-md-5">
    <!-- <h6><strong>Add On Detials</strong></h6>  -->
     <h6 id="addontag_display" ><strong>Add On Detials</strong></h6>                            
        <div id="item_name_display" class="row"></div>
  </div>


  <!-- ------------------------------------ -->
  <?php if(!empty($unique_id)){ ?>
 
    <div class="col-6 mb-4">
    <label for="tray_id_update" id="select_label1">Selected Trays </label>
    <textarea name="tray_id_update" id="tray_id_update" class="form-control" rows="8" cols="200" readonly><?php echo $tray_display; ?></textarea>
    <label for="addon_update" id="select_label2">Addon Details </label>
    <textarea name="addon_update" id="addon_update" class="form-control" rows="3" cols="50" readonly><?php echo $item_display; ?></textarea>
</div>

<?php }else{ ?>
 
  <?php } ?>


  <!-- ======================= -->


</div>



            <div class="col-md-12 text-end">
              <!-- Cancel,save and update Buttons -->
             
              <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
            
              <?php echo btn_cancel1($btn_cancel); ?>

            </div>
          </div>
        </form>

        <!-- <div class="row mt-3">
          <div class="col-md-12">
            <h6> Selected Trays </h6>
            <div id="selected-trays" class="border p-2"></div>
          </div>
        </div> -->

      </div>
    </div>
  </div>
</div>



<!--  Large modal example -->
<div class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-fullscreen">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="myLargeModalLabel">Add Tray</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
        </button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table align-middle table-nowrap mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">S.No</th>
                <?php
                // Define the SELECT query
                $sql = "SELECT * FROM tray_creation where is_active = '1' and tray_type='1' and is_delete = '0' and (tray_status = '0')";
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
                $sql = "SELECT * FROM tray_creation where  is_active = '1' and is_delete = '0' and tray_type='1' and (tray_status = '0')";
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
				<div class="col-md-2 mb-3 mt-3 ad_trafixed">				
					<input type="text" class="form-control" id="checkedCount" name="checkedCount" value="<?= $checked; ?>">
					<input type="hidden" id="checkedvalue" name="checkedvalue" placeholder="Checked values" value="<?=$checkedvalue; ?>">
				</div>
              </tr>
            </tbody>
          </table>
          <!-- end table -->
        </div>
        <div class="modal-footer mt-4">
          
          <button type="button" class="btn btn-primary status_sub_add_update_btn" onclick="get_tray_count(tray_utilized.value)">Save</button>
          <!-- <a href="javascript:void(0);" class="btn btn-danger " data-bs-dismiss="modal"> Close</a> -->
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
          <?php echo $item_name_options_html; ?>
          </select>
        </div>
        <div id="dynamicInputs"></div>
        
      </div>
      <div class="modal-footer mt-4">
      <button type="button" class="btn btn-primary" onclick="saveAddOn()">Save</button>
        <!-- <a href="javascript:void(0);" class="btn btn-danger" data-bs-dismiss="modal">Close</a> -->
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


<style>
.table-nowrap td, .table-nowrap th {
    text-align: center;
    border-right: 1px solid #ddd;
}
.form-check {
    text-align: center;
}
.ad_trafixed {
    position: fixed;
    top: 0;
    margin-left: 80px;
}
</style>
