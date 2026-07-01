<?php
// Form variables
$table             = "frp_process";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";



if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
      $unique_id  = $_GET["unique_id"];
      
      $columns = [
        "entry_date",   
        "egg_batch_id",            
        "frp_tray_count",
        "frp_tray_name",
        "unique_id"

        
      ];
      $table_details = [
        $table,
        $columns
    ];
    $where = 'unique_id = "' . $unique_id . '" and is_delete = 0';
      $result_values = $pdo->select($table_details, $where);
      // print_r($result_values);
      if ($result_values->status) {
          $result_values  = $result_values->data;
          $entry_date     = $result_values[0]["entry_date"];  
          $egg_batch_id   = $result_values[0]["egg_batch_id"];              
          $frp_tray_count = $result_values[0]["frp_tray_count"];
          $frp_tray_name  = $result_values[0]["frp_tray_name"];
          $unique_id      = $result_values[0]["unique_id"];
               
          
      } 
      $btn_text           = "Update";
  }
  // update
  $batch_no_options       = egg_batch_completion_update($unique_id);
  $batch_no_options       = select_option($batch_no_options, "Select Egg Batch Id",$egg_batch_id);
  $frp_tray_name_options  = frp_tray_name_update();
  $frp_tray_name_options  = select_option($frp_tray_name_options, "Select Tray Name", $frp_tray_name);  
}else{
// form creation
  $batch_no_options       = egg_batch_completion();
  $batch_no_options       = select_option($batch_no_options, "Select Egg Batch Id", $egg_batch_id);
  $frp_tray_name_options  = frp_tray_name();
  $frp_tray_name_options  = select_option($frp_tray_name_options, "Select Tray Name", $frp_tray_name);
}

function frp_tray_name_update($unique_id = "") {
    global $pdo;

    $table_name    = "tray_creation";
    $where         = [];
    $table_columns = [
        "id",
        "bin_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [        
        "is_active"   => 1,
        "is_delete"   => 0,
        "tray_type"   => 2
    ];

    if ($unique_id) {
        $where              = [];
        $where["id"] = $unique_id;
    }

    $bin_name = $pdo->select($table_details, $where);
    // print_r($bin_name);

    if ($bin_name->status) {
        return $bin_name->data;
    } else {
        // print_r($bin_name);
        return 0;
    }
}
function egg_batch_completion($batch_no = "") {
    
    global $pdo;
  
    $table_name    = "egg_process as ep";
    $where         = "";
    $table_columns = [
        // "unique_id",
        "ep.batch_id",
        "(select batch_id from material_received where  unique_id = ep.batch_id) as batch_id1"
       
    ];
  
    $table_details = [
        $table_name." join status_update sp on sp.batch_id=ep.batch_id",
        $table_columns
    ];
  
    $where = "ep.is_delete = 0  
    and sp.hatching_status=2 and sp.is_delete=0 AND ep.batch_status = 1 order by ep.batch_id desc";

 

    $user_name_list = $pdo->select($table_details, $where,'','');
    // print_r($user_name_list);
    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
  }


  function egg_batch_completion_update($batch_no = "") {
    
    global $pdo;
  
    $table_name    = "frp_process as ep";
    $where         = "";
    $table_columns = [
        // "unique_id",
        "ep.egg_batch_id",
        "(select batch_id from material_received where  unique_id = ep.egg_batch_id) as batch_id1"       
    ];
  
    $table_details = [
        $table_name,
        $table_columns
    ];
  
    $where = "ep.unique_id= '$batch_no'";

    $user_name_list = $pdo->select($table_details, $where,'','');
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
            <h5 class="d-flex align-items-center">FRP Tray  Process Creation</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <!-- <input type="hidden" class="form-control" id='unique_id' name='unqiue_id' value="<?php echo $_GET['unique_id']; ?>" required>          -->
          <div class="row">
        

      <div class="col-3 mb-3">
        <label for="entry_date">Entry Date</label>
        <input type="date" class="form-control" id="entry_date" name="entry_date" 
       value="<?php echo date('Y-m-d'); ?>" required>

      </div>

      
          <div class="col-3 mb-3">
              <label for="egg_batch_id">Egg Batch Id </label>
              <select name="egg_batch_id" id="egg_batch_id" class="select2 form-control"  required>
                <?php echo $batch_no_options; ?>
              </select>              
          </div>

        
    
          <div class="col-3 mb-3">
              <label for="frp_tray_count">FRP Tray Count </label>
              <input type="text" class="form-control" id='frp_tray_count' name='frp_tray_count' onkeypress="return onlyNumberKey(event)" value='<?php echo $frp_tray_count; ?>' required>
            </div>


             <div class="col-3 mb-3">
              <label for="frp_tray_name">FRP Tray Name</label>
               <select name="frp_tray_name[]" id="frp_tray_name" class="select2 form-control" required multiple>
                <?php echo $frp_tray_name_options; ?>
              </select>
            </div>


          </div>        
          <div class="row mt-2">
          <div class="row mt-3">
          <div class="row mt-3">
          <div class="row mt-3">
</div>



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
