
<?php


$supplier_name_options = supplier_name_list();
$supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);

if ($_GET['from_date'] == ''){
  $from_date = date("Y-m-01");
} else {
  $from_date = $_GET['from_date'];
}
if ($_GET['to_date'] == ''){
  $to_date = date("Y-m-d");
} else {
  $to_date = $_GET['to_date'];
}
// if ($_GET['supplier_name'] == '') {
//   $supplier_name_options = supplier_name();
//   $supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);
// } else {
//   $supplier_name_options = supplier_name();
//   $supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);
// }

function supplier_name_list($unique_id = "") {
  global $pdo;

  $table_name    = "supplier_creation";
  $where         = [];
  $table_columns = [
      "unique_id",
      "supplier_name"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  // $where     = [
  //     "is_active" => 1,
  //     "is_delete" => 0,
  //     "unique_id" != '66ac703a66f9093870';
  // ];
  $where = "is_delete = 0 and is_active = 1 and unique_id != '66ac703a66f9093870'";
  if ($unique_id) {

      $where              = [];
      $where["unique_id"] = $unique_id;
  }

  $supplier_name = $pdo->select($table_details, $where);

  if ($supplier_name->status) {
      return $supplier_name->data;
  } else {
      print_r($supplier_name);
      return 0;
  }
}

?>

<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Egg Process List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
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

  <div class="col-md-3">
    <div class="form-group">
      <label>Supplier Name</label>
      <select name="supplier_name" id="supplier_name" class="select2 form-control" required>
        <?php echo $supplier_name_options; ?>                                   
      </select>
    </div>
  </div>

  <div class="col-md-3 align-self-end">
    <button id="filter_btn" class="btn btn-primary" onclick="egg_Filters()">Go</button>
  </div>
</div>
      <div class="card-body d-flex flex-column justify-content-end">
        <!-- <div id="tableExample2" data-list='{"valueNames":["name","email","age"],"page":5,"pagination":true}'> -->
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="egg_process_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Entry Date</th>
                <th>Batch Id</th>
                <th>Supplier Name</th>
                <th>Egg Total Qty(g)</th>
                <th>Tray Utilized</th>
                <th>Add on Details</th>
                <th>Status</th>
                <th>Entry Person</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody class="list">
            </tbody>
          </table>
          <!-- </div> -->
        </div>
      </div>
    </div>
  </div>
</div>