<?php
// Form variables
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$supplier_name      = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "supplier_creation";
    $columns    = [
      "supplier_name",
      "label",
      "address",
      "contact_no",
      "email",
      "gst_no",
      "is_active",
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $supplier_name     = $result_values[0]["supplier_name"];
      $label             = $result_values[0]["label"];
      $address           = $result_values[0]["address"];
      $contact_no        = $result_values[0]["contact_no"];
      $email             = $result_values[0]["email"];
      $gst_no            = $result_values[0]["gst_no"];
      $is_active         = $result_values[0]["is_active"];
      $btn_text           = "Update";
      $btn_form           = "Update";
      $btn_action         = "update";
    } else {
      $btn_text           = "Error";
      $btn_action         = "error";
      $is_btn_disable     = "disabled='disabled'";
    }
  }
}
$active_status_options = active_status($is_active);
?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Supplier Creation <?=$btn_form;?></h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
            <div class="col-4 mb-3">
              <label for="supplier_name"> Supplier Name </label>
              <input type="text" class="form-control" id='supplier_name' name='supplier_name' value='<?php echo $supplier_name; ?>' required>
            </div>

            <div class="col-4 mb-3">
              <label for="supplier_name"> Label </label>
              <input type="text" class="form-control" id='label' name='label' maxlength="3" value='<?php echo $label; ?>' required  oninput="validateInput(this)">
            </div>

            <div class="col-4 mb-3">
              <label for="address"> Address </label>
              <input type="textarea" class="form-control" rows="2" id='address' name='address' value='<?php echo $address; ?>' required>
            </div>
      
            <div class="col-4 mb-3">
              <label for="contact_no"> Contact Number </label>
              <input type="text" class="form-control" id='contact_no' name='contact_no' onkeypress="return onlyNumberKey(event)" minlength="1" maxlength="10" value='<?php echo $contact_no; ?>' required>
            </div>

            <div class="col">
              <label for="email"> Email </label>
              <input type="email" class="form-control" id='email' name='email' value='<?php echo $email; ?>'>
            </div>
         
            <div class="col-4 mb-3">
  <label for="gst_no">GST No</label>
  <input type="text" class="form-control" id="gst_no" name="gst_no" maxlength="15" value="<?php echo $gst_no; ?>" pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" required>
  <div class="invalid-feedback">Please enter a valid GST No in the format: 22ABCDE1234F1Z2</div>
</div>
            
            <div class="col-4 mb-3">
              <label for="is_active">Active Status </label>
              <select name="active_status" id="active_status" class="select2 form-control" required>
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