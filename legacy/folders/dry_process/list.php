<?php
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

$type_options        = [
  "1" => [
      "unique_id" => "1",
      "value"     => "Input",
  ],
  "2" => [
      "unique_id" => "2",
      "value"     => "Output",
  ],
];
$type_options = select_option($type_options, "Select the type", $type); 


$method_options        = [
  "1" => [
      "unique_id" => "1",
      "value"     => "Solar",
  ],
  "2" => [
      "unique_id" => "2",
      "value"     => "Electric",
  ],
];
$method_options = select_option($method_options, "Select the type", $drying_method);  


?>

<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Dry Process List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
        <div class="row mb-2 mt-3">
          <div class="col-md-2">
            <label for="from_date" class="form-label">From Date</label>
            <input type="date" class="form-control" id='from_date' name='from_date' value='<?php echo $from_date; ?>'>
          </div>

          <div class="col-md-2">
            <label for="to_date" class="form-label">To Date</label>
            <input type="date" class="form-control" id='to_date' name='to_date' value='<?php echo $to_date; ?>'>
          </div>
          
          <div class="col-md-2">
            <label>Type</label>
            <select name="type" id="type" class='select2 form-control'>
              <?php echo $type_options; ?>
            </select>
          </div>

          <div class="col-md-2">
            <label>Drying Method</label>
            <select name="drying_method" id="drying_method" class='select2 form-control'>
              <?php echo $method_options; ?>
            </select>
          </div>

          <div class="col-md-3 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="dry_Filter()">Go</button>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="dry_process_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Drying Method</th>
                <th>Quantity</th>
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
