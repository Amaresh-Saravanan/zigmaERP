<?php
include '../../config/dbconfig.php';
function active_status_filter($is_active_val = '') {
  $option_str    = "";
  $is_active     = "";
  $is_inactive   = "";
  $is_default    = "";
  $is_null       = "";

  if ($is_active_val === '1') {
      $is_active     = " selected='selected' ";
  } elseif ($is_active_val === '0') {
      $is_inactive   = " selected='selected' ";
  } elseif ($is_active_val === '') {
      $is_null       = " selected='selected' ";
  } else {
      $is_default    = " selected='selected' ";
  }

  $option_str     =  "<option value=''" . $is_null . ">Select Status Type</option>";
  $option_str    .=  "<option value='all'" . $is_default . ">All</option>";
  $option_str    .=  "<option value='1'" . $is_active . " selected>Active</option>";
  $option_str    .=  "<option value='0'" . $is_inactive . ">In Active</option>";

  return $option_str;
}


$active_status_options = active_status_filter('');



if ($_GET['from_date'] == ''){
    $from_date = date("Y-m-d");
} else {
    $from_date = $_GET['from_date'];
}
if ($_GET['to_date'] == ''){
    $to_date = date("Y-m-d");
} else {
    $to_date = $_GET['to_date'];
}

$location_options = [
  "1" => [
    "unique_id" => "1",
    "value" => "Weigh Bridge Side"
    
  ],
  "2" => [
    "unique_id" => "2",
    "value" => "Solar Side",
  ]
];

$location_options = select_option($location_options, "Select The Location", $location);

$pit_options         = pit_name();
$pit_options         = select_option($pit_options, "Select Pit Number", $pit_id);

?>


<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Measurement Report List</h5>
          </div>
          <!-- <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div> -->
        </div>
      </div>

      <div class="card-body d-flex flex-column justify-content-end">
      <div class="row mb-2">
          <div class="col-md-2">
            <label for="from_date" class="form-label">From Date</label>
            <input type="date" class="form-control" id='from_date' name='from_date' value='<?php echo $from_date; ?>'>
          </div>

          <div class="col-md-2">
            <label for="to_date" class="form-label">To Date</label>
            <input type="date" class="form-control" id='to_date' name='to_date' value='<?php echo $to_date; ?>'>
          </div>

          <div class="col-md-2">
          <label for="location">Location</label>
          <select name="location" id="locatio" class="select2 form-control" required>
            <?php echo $location_options; ?>
          </select>
        </div>

        <div class="col-md-2">
          <div class="form-group">
              <label>Pit Number</label>
              <select name='pit_id' id='pit_id' class='select2 form-control '>
                  <?php echo $pit_options; ?>
              </select>
          </div>
        </div>

          <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="measurable_Filters()">Go</button>
          </div>
          </div>



      <div class="card-body d-flex flex-column justify-content-end">
       
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="measurement_creation_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Entry Date</th>
                <th>Pit id</th>
                <th>Temperature <br> Start-Mid-End</th>
                <th>Humidity <br> Start-Mid-End</th>
                <th>Location</th>
                <th>Temperature <br>(outside)</th>
                <th>Humidity<br>(outside)</th>
                <!-- <th>Location</th> -->
                <!-- <th>Temperatrure</th>
                <th>Humidity</th> -->
                <th>Remarks</th>
                <!-- <th>Action</th> -->
              </tr>
            </thead>
            <tbody class="list">
            </tbody>
          </table>
          
        </div>
      </div>
    </div>
  </div>
</div>