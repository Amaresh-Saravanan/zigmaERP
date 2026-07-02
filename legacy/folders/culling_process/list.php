<?php
if ($_GET['from_date'] == '') {
  $from_date = date("Y-m-d");
} else {
  $from_date = $_GET['from_date'];
}
if ($_GET['to_date'] == '') {
  $to_date = date("Y-m-d");
} else {
  $to_date = $_GET['to_date'];
}

$shift_options = [
  "1" => ["unique_id" => "1", "value" => "Day"],
  "2" => ["unique_id" => "2", "value" => "Night"],
  "3" => ["unique_id" => "3", "value" => "General"],
];
$shift_options = select_option($shift_options, "Select Shift", $shift_type);

$cylinder_options = [
  "1" => ["unique_id" => "1", "value" => "O2"],
  "2" => ["unique_id" => "2", "value" => "LPG"],
  "3" => ["unique_id" => "3", "value" => "Other"],
];
$cylinder_options = select_option($cylinder_options, "Select Cylinder Type", $cylinder_type);

$work_done_options = [
  "1" => ["unique_id" => "1", "value" => "Cutting"],
  "2" => ["unique_id" => "2", "value" => "Heating"],
  "3" => ["unique_id" => "3", "value" => "Others"],
];
$work_done_options = select_option($work_done_options, "Select Work Done", $work_done);
?>

<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Culling Process List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
        <div class="row mb-2 mt-3">
          <div class="col-md-2">
            <label for="from_date" class="form-label">From Date</label>
            <input type="date" class="form-control" id="from_date" name="from_date" value="<?php echo $from_date; ?>">
          </div>

          <div class="col-md-2">
            <label for="to_date" class="form-label">To Date</label>
            <input type="date" class="form-control" id="to_date" name="to_date" value="<?php echo $to_date; ?>">
          </div>

          <div class="col-md-2">
            <label for="shift_type">Shift Type</label>
            <select name="shift_type" id="shift_type" class="select2 form-control">
              <?php echo $shift_options; ?>
            </select>
          </div>

          <div class="col-md-2">
            <label for="cylinder_type">Cylinder Type</label>
            <select name="cylinder_type" id="cylinder_type" class="select2 form-control">
              <?php echo $cylinder_options; ?>
            </select>
          </div>

          <div class="col-md-2">
            <label for="work_done">Work Done</label>
            <select name="work_done" id="work_done" class="select2 form-control">
              <?php echo $work_done_options; ?>
            </select>
          </div>

          <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="culling_process_Filter()">Go</button>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="culling_process_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Work Date</th>
                <th>Shift Type</th>
                <th>Cylinder Type</th>
                <th>Cylinder No / ID</th>
                <th>Starting Weight (Kg)</th>
                <th>Final Weight (Kg)</th>
                <th>Fuel Consumption (Kg)</th>
                <th>Raw Material / Live Larvae (Kg)</th>
                <th>Final Larvae After Culling (Kg)</th>
                <th>Work Done</th>
                <th>Others Remarks</th>
                <th>Image</th>
                <th>Entry Person</th>
                <th>Action</th>
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
