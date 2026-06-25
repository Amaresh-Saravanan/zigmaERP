<?php
include '../../config/dbconfig.php';


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


$user_name_options   = get_users_login();
$user_name_options   = select_option($user_name_options, "Select User Name", $unique_id);

?>
<style>
  .nowrap {
    white-space: nowrap;
  }

  #rejects_creation_datatable th.nowrap, 
  #rejects_creation_datatable td.nowrap {
    min-width: 120px;
    white-space: nowrap;
  }

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
            <h5 class="d-flex align-items-center">Login History Report List</h5>
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

          <div class="col-2">
              <div class="mb-3">
                  <label class="form-label">User Name</label>
                  <select name="staff_name" id="staff_name" class="select2 form-control" required><?php echo $user_name_options; ?> </select>
              </div>
          </div>

          <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="login_history_filter()">Go</button>
          </div>

          <div class="col-md-2 align-self-end ms-auto text-end">
        <!-- Modified button with new design -->
        <!-- <button type="button" class="btn btn-asgreen btn-xs btn-rounded waves-effect waves-light mr-1" id="print_overall_btn">
            <i class="mdi mdi-printer mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i> Print Overall
        </button> -->
    </div>


        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="login_history_datatable">
            <thead class="bg-200">
                  <tr>
                     <th>S.No</th>
                     <th>User Name</th>
                     <th>Entry Date</th>
                     <th>Login Time</th>
                     <th>Logout Time</th>
                     <th>User Type</th>
                     <th>Total Worked Hours</th>
                     <th>View</th>
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
      var url = 'http://zigfly.in/zigfly/folders/rejects_Report/print_overall.php?from_date=' + from_date + '&to_date=' + to_date;

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
<?php

  function get_users_login($unique_id = "") {
    global $pdo;

    $table_name    = "user";
    $where         = [];
    $table_columns = [
        "unique_id",
        "user_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($unique_id) {

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $user_types = $pdo->select($table_details, $where);

    if ($user_types->status) {
        return $user_types->data;
    } else {
        print_r($user_types);
        return 0;
    }
}

?>
