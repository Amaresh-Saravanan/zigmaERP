<?php
// Form variables
$table              = "item_creation";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$item_code          = "";
$item_name          = "";
$unit               = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "item_creation";
    $columns    = [
      "item_code",
      "item_name",
      "unit ",
      "is_active",
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $item_code         = $result_values[0]["item_code"];
      $item_name         = $result_values[0]["item_name"];
      $unit              = $result_values[0]["unit"];
      $is_active         = $result_values[0]["is_active"];
      $btn_text          = "Update";
      $btn_form          = "Update";
      $btn_action        = "update";
    } else {
      $btn_text          = "Error";
      $btn_action        = "error";
      $is_btn_disable    = "disabled='disabled'";
    }
  }
}else{
// $item_code = item_code_gen('');
$sql = "SELECT MAX(item_code) as max_item_code FROM $table";
    $result = $pdo->query($sql);
    if ($result->status) {
        $max_item_code = $result->data[0]["max_item_code"];
        
        preg_match('/IT-(\d+)/', $max_item_code, $matches);
        if (isset($matches[1])) {
            $numeric_part = (int)$matches[1];
            $numeric_part += 1;
            $item_code = 'IT-' . str_pad($numeric_part, 3, '0', STR_PAD_LEFT);
        } else {
            $item_code = 'IT-001'; 
        }
    } else {
        $item_code = 'IT-001';
    }
}

$unit_options = unit_name();
$unit_options = select_option($unit_options, "Select Unit Name", $unit);

$active_status_options = active_status($is_active);
?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Item Creation <?=$btn_form;?></h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
          <div class="col">
              <label for="screen_name">Item Code </label>
              <input type="text" class="form-control" id='item_code' name='item_code' value='<?php print_r($item_code); ?>'readonly required>
            </div>

            <div class="col">
              <label for="screen_name">Item Name </label>
              <input type="text" class="form-control" id='item_name' name='item_name' value='<?php echo $item_name; ?>' required>
            </div>
            </div>

            <div class="row">
              <div class="col">
              <label for="unit" class="form-label">Unit </label>
              <select name="unit" id="unit" class="select2 form-control" required>
                <?php echo $unit_options; ?>
              </select>
            </div>
            <div class="col">
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
              <!-- <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?> -->
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>