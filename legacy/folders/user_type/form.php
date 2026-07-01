<!-- This file Only PHP Functions -->
<?php include 'function.php'; ?>
<?php
// Form variables
$btn_text                = "Save";
$btn_form                = "Create";
$btn_action              = "create";
$is_btn_disable          = "";
$unique_id               = "";
$user_type               = "";
$under_user_type         = "";
$exp_under_user_type     = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "user_type";
    $columns    = [
      "user_type",
      "is_active"
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    if ($result_values->status) {
      $result_values      = $result_values->data;
      $user_type          = $result_values[0]["user_type"];
      $is_active          = $result_values[0]["is_active"];
      $exp_under_user_type  = explode(",", $under_user_type);
      $btn_text           = "Update";
      $btn_form                = "Update";
      $btn_action         = "update";
    } else {
      $btn_text           = "Error";
      $btn_action         = "error";
      $is_btn_disable     = "disabled='disabled'";
    }
  }
}
$active_status_options   = active_status($is_active);
?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">User Type <?=$btn_form;?></h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
            <div class="col-4">
              <label for="screen_name">User Type </label>
              <input type="text" id="user_type" name="user_type" class="form-control" value="<?php echo $user_type; ?>" oninput="user_type_validateinput(this)" required>
            </div>
            <!-- onKeyup="get_under_user_type(this.value)" -->
            <div class="col-4">
              <label for="is_active">Active Status </label>
              <select name="active_status" id="active_status" class="select2 form-control" required>
                <?php echo $active_status_options; ?>
              </select>
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