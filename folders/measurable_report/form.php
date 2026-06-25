<?php
// Form variables
$table              = "measurement";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$entry_date         = "";
$temp               = "";
$humi               = "";
$location           = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "measurement";
    $columns    = [
      "entry_date",
      "location",
      "temp",
      "humi ",
      "remarks",
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    // print_r($result_values );
    if ($result_values->status) {
      $result_values      = $result_values->data;
      $entry_date        = $result_values[0]["entry_date"];
      $location          = $result_values[0]["location"];
      $temp              = $result_values[0]["temp"];
      $humi              = $result_values[0]["humi"];
      $remarks           = $result_values[0]["remarks"];
      $btn_text          = "Update";
      $btn_form          = "Update";
      $btn_action        = "update";
    } else {
      $btn_text          = "Error";
      $btn_action        = "error";
      $is_btn_disable    = "disabled='disabled'";
    }
  }
}


if (empty($date)) {
  $date = date('Y-m-d');
}


$location_options = [
  "1" => [
    "unique_id" => "1",
    "value" => "Weigh Bridge Side",
  ],
  "2" => [
    "unique_id" => "2",
    "value" => "Solar Side",
  ],
  "3" => [
    "unique_id" => "3",
    "value" => "Test",
  ]
  
];
$location_options = select_option($location_options, "Select The Status", $location);

?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Measurement Taken</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <div class="row">
          <div class="col">
              <label for="screen_name">Entry Date </label>
              <input type="date" class="form-control" id='entry_date' name='entry_date' value='<?php print_r($date); ?>'required>
            </div>

             <div class="col">
                <label for="location">Location</label>
                    <select name="location" id="location" class="select2 form-control" required>
                        <?php echo $location_options; ?>
                    </select>
            </div>

            <div class="col">
              <label for="screen_name">Temperature (°C) </label>
              <input type="text" class="form-control" id='temp' name='temp' value='<?php echo $temp; ?>' required>
            </div>
            </div>

            <div class="row">
              <div class="col">
              <label for="humi" class="form-label">Humidity (%) </label>
              <input name="humi" id="humi" class="select2 form-control" value='<?php echo $humi; ?>' required>               
            </div>


            <div class="col">
              <label for="is_active">Remarks  </label>
              <input name="remarks" id="remarks" class="select2 form-control"  value='<?php echo $remarks; ?>' >
               
            </div>

            
          </div>
          <div class="row mt-2">
            <div class="col-md-12 text-end">
              
              <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
              <?php echo btn_cancel($btn_cancel); ?>
             
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>