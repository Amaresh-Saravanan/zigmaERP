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
<style>
  .nowrap {
    white-space: nowrap;
  }

  #rejects_creation_datatable th.nowrap, 
  #rejects_creation_datatable td.nowrap {
    min-width: 120px; /* Adjust the width as necessary */
    white-space: nowrap;
  }
    /* Center-align the specified weight columns */
    #rejects_creation_datatable th:nth-child(7),
  #rejects_creation_datatable td:nth-child(7),
  #rejects_creation_datatable th:nth-child(8),
  #rejects_creation_datatable td:nth-child(8),
  #rejects_creation_datatable th:nth-child(9),
  #rejects_creation_datatable td:nth-child(9) {
    text-align: center;
  }

</style>


<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Rejects Report List</h5>
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

         

          <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="rejects_Filters()">Go</button>
          </div>

          <div class="col-md-2 align-self-end ms-auto text-end">
        <!-- Modified button with new design -->
        <button type="button" class="btn btn-asgreen btn-xs btn-rounded waves-effect waves-light mr-1" id="print_overall_btn">
            <i class="mdi mdi-printer mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i> Overall Print
        </button>
          </div>



      <div class="card-body d-flex flex-column justify-content-end">
       
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="rejects_creation_datatable">
            <thead class="bg-200">
              <tr>
                <th>S/No</th>
                <th>Ticket No</th>
                <th>Vehicle No</th>
                <th>Vendor </th>
                <th class="nowrap">Date</th>
                <th class="nowrap">Time</th>
                <th>Empty Weight(Tons)</th>
                <th>Loaded weight(Tons)</th>
                <th>Net Weight(Tons)</th>
                 <th>Print</th>
                <th>Uploaded Image</th> 
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
<script>
  document.getElementById('print_overall_btn').addEventListener('click', function(event) {
    var from_date = document.getElementById('from_date').value;
    var to_date = document.getElementById('to_date').value;

    if (from_date && to_date) {
      // Construct the URL with from_date and to_date using the format example provided
      var url = 'http://zigfly.in/erp/folders/rejects_Report/print_overall.php?from_date=' + from_date + '&to_date=' + to_date;

      // Open the URL in a new window with specific parameters
      window.open(
        url,
        "_blank", // Open in a new window or tab
        "height=550,width=950,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no"
      );
    } else {
      alert("Please select both From Date and To Date");
    }

    event.preventDefault();
  });
</script>