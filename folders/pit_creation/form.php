
 <script src="https://unpkg.com/html5-qrcode/minified/html5-qrcode.min.js"></script>
<?php
include('../assets/phpqrcode/qrlib.php');
// Form variables
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$pit_name           = "";
$location           = "";
$length             = "";
$width              = "";
$height             = "";
$volume             = "";
$is_active          = 1;
$description        = "";
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "pit_creation";
    $columns    = [
      "unique_id",
      "pit_name",
      "location",
      "length",
      "width",
      "height",
      "volume",
      "is_active",
      "description"
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $pit_name          = $result_values[0]["pit_name"];
      $location          = $result_values[0]["location"];
      $length            = $result_values[0]["length"];
      $width             = $result_values[0]["width"];
      $height            = $result_values[0]["height"];
      $volume            = $result_values[0]["volume"];
      $is_active         = $result_values[0]["is_active"];
      $description       = $result_values[0]["description"];
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
            <h5 class="d-flex align-items-center">Pit Creation <?=$btn_form;?></h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">


            <div class="col-4 mb-3">
              <label for="pit_name">Pit Name </label>
              <input type="text" class="form-control" id='pit_name' placeholder="PIT-01" name='pit_name' value='<?php echo $pit_name; ?>' oninput="pit_name_validateinput(this)" required>
            </div>


            <div class="col-4 mb-3">
              <label for="location">Location</label>
              <input type="text" class="form-control" id='location' name='location' value='<?php echo $location; ?>' required>
            </div>
    
            <div class="col-4 mb-3">
              <label for="length"> Length (Meter) </label>
              <input type="number" step="0.01" class="form-control" id='length' name='length' value='<?php echo $length; ?>' required>
            </div>
            <div class="col-4 mb-3">
              <label for="width"> Width(Meter) </label>
              <input type="number" step="0.01" class="form-control" id='width' name='width' value='<?php echo $width; ?>' required>
            </div>
         
            <div class="col-4 mb-3">
              <label for="height"> Height(Meter) </label>
              <input type="number" step="0.01" class="form-control" id='height' name='height' value='<?php echo $height; ?>' required>
            </div>
            <div class="col-4 mb-3">
              <label for="volume"> Capacity (Volume-m³) </label>
              <input type="number"step="0.01" class="form-control" id='volume' name='volume' value='<?php echo $volume; ?>' readonly>
            </div>
   
            <div class="col-4 mb-3">
              <label for="order_no">Description</label>
              <textarea name="description" id="description" rows="2" class="form-control"><?php echo $description; ?></textarea>
            </div>
            <div class="col-4 mb-3">
              <label for="is_active">Active Status</label>
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