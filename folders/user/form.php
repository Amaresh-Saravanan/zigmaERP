<?php
// Form variables
$btn_text           = "Save";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$user_name          = "";
$password           = "";
$first_name         = "";
$last_name          = "";
$email              = "";
$user_type          = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "user";
    $columns    = [
      "emp_id",
      "user_name",
      "password",
      "first_name",
      "last_name",
      "email",
      "user_type_unique_id",
      "is_active",
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $emp_id            = $result_values[0]["emp_id"];
      $user_name         = $result_values[0]["user_name"];
      $password          = $result_values[0]["password"];
      $first_name        = $result_values[0]["first_name"];
      $last_name         = $result_values[0]["last_name"];
      $email             = $result_values[0]["email"];
      $user_type         = $result_values[0]["user_type_unique_id"];
      $is_active         = $result_values[0]["is_active"];
      $btn_text           = "Update";
      $btn_action         = "update";
    } else {
      $btn_text           = "Error";
      $btn_action         = "error";
      $is_btn_disable     = "disabled='disabled'";
    }
  }
}
$user_type_options  = user_type();
$user_type_options  = select_option($user_type_options, "Select User Type", $user_type);
$active_status_options = active_status($is_active);
?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">User Creation Create</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
            <div class="col-4 mb-3">
              <label for="emp_id">Emp Id</label>
              <input type="number" class="form-control" id='emp_id' name='emp_id' value='<?php echo $emp_id; ?>'  required>
            </div>
            <div class="col-4 mb-3">
              <label for="user_name">User Name </label>
              <input type="text" class="form-control" id='user_name' name='user_name' value='<?php echo $user_name; ?>' oninput="user_name_validateinput(this)" required>
            </div>
            <div class="col-4 mb-3">
              <label for="password">Password</label>
              <input type="text" id="password" name="password" class="form-control" min="1" max="15" value="<?php echo $password; ?>" oninput="password_validateinput(this)" required>
            </div>
     
            <div class="col-4 mb-3">
              <label for="first_name">First Name </label>
              <input type="text" class="form-control" id='first_name' name='first_name' value='<?php echo $first_name; ?>' required>
            </div>
            <div class="col-4 mb-3">
              <label for="last_name">Last Name </label>
              <input type="text" class="form-control" id='last_name' name='last_name' value='<?php echo $last_name; ?>' required>
            </div>

            <div class="col-4 mb-3">
              <label for="email">Email </label>
              <input type="text" class="form-control" id='email' name='email' value='<?php echo $email; ?>' required>
            </div>
            <div class="col-4 mb-3">
              <label for="user_type">User Type</label>
              <select name='user_type_unique_id' id='user_type_unique_id' class="form-control" required><?php echo $user_type_options; ?>
              </select>
            </div>
       

            <div class="col-4 mb-3">
              <label for="is_active"> Active Status </label>
              <select name="is_active" id="is_active" class="select2 form-control" required>
                <?php echo $active_status_options; ?>
              </select>
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