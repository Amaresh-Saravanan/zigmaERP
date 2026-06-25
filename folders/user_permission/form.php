
<!-- This file Only PHP Functions -->
<?php include 'function.php'; ?>
<?php
// Form variables
$btn_text           = "Save";
$btn_action         = "create";
$is_btn_disable     = "";
$form_type          = "Create";
$unique_id          = "";
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    if ($unique_id) {
      $result_val = get_permissions($unique_id);
      $form_type          = "Update";
      $btn_text           = "Update";
      $btn_action         = "update";
      $is_btn_disable     = " disabled ";
    } else {
      $btn_text           = "Error";
      $btn_action         = "error";
      $is_btn_disable     = " disabled ";
    }
  }
}
$user_type_options   = user_type();
$user_type_options   = select_option($user_type_options, "Select User Type", $unique_id);
$main_screen_options = main_screen();
$main_screen_options = select_option($main_screen_options, "Select Main Screen", "");
?>
<!-- start page title -->


<!-- end page title -->
<input type="hidden" name="update_user_type" id="update_user_type" value="<?php echo $unique_id; ?>">

	  

<div class="row">
  <div class="col-12">
    <div class="card">
	<div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">User Permission </h5>
          </div>
        </div>
      </div>
      <div class="card-body">
        <form class="was-validated" autocomplete="off">
          <div class="row">
            <div class="col-12">
              <!-- <h4 class="header-title">Delivery / Invoice Details </h4> -->
              <div class="row mb-3">
                <div class="col-4">
                    <label for="inputEmail3" class="col-form-label"> User Type</label>
                      <select <?php echo $is_btn_disable; ?> name="user_type" onchange="perm_ui_val()" id="user_type" class="select2 form-control" required>
                        <?php echo $user_type_options; ?>
                      </select>
                </div>

                <div class="col-4">
                    <label for="inputEmail3" class="col-form-label">Main Screen</label>
          
                      <select name="main_screen" onchange="perm_ui_val()" id="main_screen" class="select2 form-control" required>
                        <?php echo $main_screen_options; ?>
                      </select>
             
                 
                </div>
              </div>

              <div class="col-12" id="perm_ui">
                <!-- <div class="card-box"> -->
                <input type="hidden" id="perm_ui" value="">
                <!-- </div> -->
              </div>
              <br>
              <div class="col-12">
                <div class="form-group row ">
                  <div class="col-md-12" align="right">
                    <!-- Cancel,save and update Buttons -->
                    
                    <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
					<?php echo btn_cancel($btn_cancel); ?>
                  </div>
                </div>
              </div>
            </div>
        </form>
      </div> <!-- end card-body -->
    </div> <!-- end card -->
  </div><!-- end col -->
</div>