<?php

$pit_options = pit_name();
$pit_options = select_option($pit_options, "Select Pit name", $pit_id);

$status_options = [
  "1" => [
    "unique_id" => "1",
    "value" => "Organic Waste Added in Pit",
  ],
  "2" => [
    "unique_id" => "2",
    "value" => "Baby Larvae Added",
  ],
  "3" => [
    "unique_id" => "3",
    "value" => "Aeration Process",
  ],
  "4" => [
    "unique_id" => "4",
    "value" => "Measurement",
  ],
  "5" => [
    "unique_id" => "5",
    "value" => "Harvesting",
  ],
  
];
$status_options = select_option($status_options, "Select The Status", $org_status);

if ($_GET['from_date'] == '') {
  $from_date = date("Y-m-01");
} else {
  $from_date = $_GET['from_date'];
}
if ($_GET['to_date'] == '') {
  $to_date = date("Y-m-d");
} else {
  $to_date = $_GET['to_date'];
}
if ($_GET['pit_name'] == '') {
  $pit_options = pit_name();
  $pit_options = select_option($pit_options, "Select Pit name", $pit_id);
} else {
  $pit_name_option = pit_name();
  $pit_name_option = select_option($pit_name_option, "Select Pit Name", $pit_id);
}

$harvest_status_options          =[
  "1" => [
       "unique_id" => "1",
       "value"     => "Progressing",
       ],
  "2" => [
       "unique_id" => "2",
       "value"     => "Completed",
       ],
  ];
$harvest_status_options        = select_option($harvest_status_options, "Select Harvest Status", $harvest_comp);


?>

<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Pit Status Report List</h5>
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
            <div class="form-group">
              <label>Pit Number</label>
              <select name='pit_id' id='pit_id' class='select2 form-control '>
                <?php echo $pit_options; ?>
              </select>
            </div>
          </div>

          <!-- <div class="col-md-2">
            <div class="form-group">
              <label>Status</label>
              <select name="status" id="status" class="select2 form-control" required>
                <?php echo $status_options; ?>
              </select>
            </div>
          </div>-->

          <div class="col-md-2">
            <div class="form-group">
              <label>Harvest Status</label>
              <select name="harvest_comp" id="harvest_comp" class="select2 form-control" required>
                <?php echo $harvest_status_options; ?>
              </select>
            </div>
          </div> 


          <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="ticket_Filter()">Go</button>
          </div>
        </div>

        <div>
        <img align="right" src="./assets/images/excel-icon.png" onclick ="excel_overall(from_date.value, to_date.value, pit_id.value,harvest_comp.value)" width="35" height="35" title="Log Sheet Export"/>
                  
        </div>

        <!-- <div id="tableExample2" data-list='{"valueNames":["name","email","age"],"page":5,"pagination":true}'> -->
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="pit_status_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Pit Number</th>
                <th>Batch Id</th>
                <th>Process Start / <br> End Date</th>
                <!-- <th>Processing Days</th> -->
                <th>Baby Larvae added</th>
                <th>Feeding Qty(Tons)</th>
                <th>Tippi Qty(Kg)</th>
                <!-- <th>Remarks</th> -->
                <!-- <th>Tray No</th> -->
                
                <!-- <th>Method</th> -->
                <th>Qty of Live Larvae(kg)</th>
                <th>Manure(-4mm/+4mm)/ <br>Rejects(Kg)</th>
                <!-- <th>Qty of Manure (-4 to 20mm)(kg)</th> -->
                <!-- <th>Qty of Manure (20mm)(kg)</th> -->
                <!-- <th>Qty of Rejets (kg)</th> -->
                <th>Harvest Status</th>
                <th>View</th>
                <!-- <th>Action</th> -->
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
</div>

<script>
function excel_overall(from_date, to_date, pit_id,harvest_comp){

  window.location.href = "./folders/pit_status_report/overall_excel.php?from_date=" + from_date + "&to_date=" + to_date + "&pit_id=" + pit_id + "&harvest_comp=" + harvest_comp;
}
</script>