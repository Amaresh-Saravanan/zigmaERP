<?php include 'function.php';?>
<?php 
// Form variables
$btn_text           = "Save";
$btn_action         = "create";
$is_btn_disable     = "";

$unique_id          = "";

$screen_type_id     = "";
$screen_name        = "";
$screen_folder_name = "";
$order_no           = "";
$icon_name          = "";
$is_active          = 1;
$description        = "";

if(isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {

        $unique_id  = $_GET["unique_id"];
        $where      = [
            "unique_id" => $unique_id
        ];

        $table      =  "user_screen";

        $columns    = [
            "screen_type_unique_id",
            "screen_name",
            "screen_main_name",
            "icon_name",
            "folder_name",
            "order_no",
            "is_active",
            "description",
            "actions"
        ];

        $table_details   = [
            $table,
            $columns
        ]; 

        $result_values  = $pdo->select($table_details,$where);
        // print_r($result_values);die();
        if ($result_values->status) {

            $result_values     = $result_values->data;

            $screen_type_id    = $result_values[0]["screen_type_unique_id"];
            $screen_main_name   = $result_values[0]["screen_main_name"];
            $screen_name   = $result_values[0]["screen_name"];
            $icon_name         = $result_values[0]["icon_name"];
            $screen_folder_name= $result_values[0]["folder_name"];
            $order_no          = $result_values[0]["order_no"];
            $is_active         = $result_values[0]["is_active"];
            $description       = $result_values[0]["description"];
            $user_action_selected   = $result_values[0]["actions"];

            $btn_text           = "Update";
            $btn_action         = "update";
        } else {
            $btn_text           = "Error";
            $btn_action         = "error";
            $is_btn_disable     = "disabled='disabled'";
        }
    }
}

$screen_type_options  = main_screen();

// print_r($screen_type_options);

$screen_type_options  = select_option($screen_type_options,"Select the Main Screen",$screen_main_name);

$active_status_options= active_status($is_active);

$user_action_options    = user_actions();

$user_action_options    = user_action_list($user_action_options, $user_action_selected);
?>
<div class="row g-3 mb-3">
            <div class="col-md-12 col-xxl-12">
              <div class="card h-md-100 ecommerce-card-min-width">
                <div class="card-header pt-3 pb-2">
				<div class="row flex-between-end">
				<div class="col-auto align-self-center">
                  <h5 class="d-flex align-items-center">User Screen Create</h5>
				  </div>
				  
				 </div>
                </div>
                <div class="card-body d-flex flex-column justify-content-end">
				<form class="was-validated"  autocomplete="off" >
                <div class="row">
				  <div class="col-4 mb-3">
				  <label for="inputEmail4" class="form-label">Main Screen</label>
				  <select name="screen_main_name" id="screen_main_name" class="select2 form-control" required>
                                        <?php echo $screen_type_options;?>
                                    </select>
				  </div>
				  <div class="col-4 mb-3">
				  <label  for="screen_main_name">Screen Name </label>
                                        <input type="text" class="form-control" id='screen_name' name='screen_name' value='<?php echo $screen_name; ?>' required>
				  </div>
				
			
				  <div class="col-4 mb-3">
				  <label  for="screen_folder_name">Folder Name</label>
                                         <input type="text" id="folder_name" name="folder_name" class="form-control" min="1" value="<?php echo $screen_folder_name; ?>"  oninput="folder_name_validateinput(this)"  required>
				  </div>
				  <div class="col-4 mb-3">
                    <label  for="order_no">Order No</label>
                        <input type="number" id="order_no" name="order_no" class="form-control" value="<?php echo $order_no; ?>" required>
                    </div>
				  
			
            
		
				    <div class="col-4 mb-3">
				  <label  for="is_active">Active Status </label>
                                        <select name="active_status" id="active_status" class="select2 form-control" required>
                                        <?php echo $active_status_options;?>
                                        </select>
				  </div>
				  <div class="col-4 mb-3">
				  <label  for="icon_name">Icon</label>
                                        <input type="text" class="form-control" id='icon_name' name='icon_name' value='<?php echo $icon_name; ?>' required>
				  </div>
		
				  <div class="col-4 mb-3">
				  <label  for="description">Description</label>
                                        <textarea name="description" id="description"  rows="2" class="form-control"><?php echo $description; ?></textarea>
				  </div>
				  <div class="col-6 mb-3">
				      <label  for="description">Actions</label>
				       <ul class="ks-cboxtags">
                                        <?php echo $user_action_options; ?>
                                    </ul>
                                    
				  </div>
				</div>
				<br>
			
				
				<div class="row mt-2">
                    <div class="col-md-12 text-end">
                        <!-- Cancel,save and update Buttons -->
                      
                        <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text);
                        ?>
						  <?php echo btn_cancel($btn_cancel);?>
                    </div>
				</div>
</form>

				</div>
              </div>
            </div>
         </div>



