<?php
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
?>

<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">FRP Tray Status Update </h5>
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

          <div class="col-md-3 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="ticket_Filter()">Go</button>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="frp_status_update_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Entry Date</th>
                <th>Batch Id</th>
                <th>Day</th>
                <th>Processing started Day</th>
                <th>Hatching Status</th>
                <th>Upload</th>
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
