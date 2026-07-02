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

?>

<div class="row">
	<div class="col-2 mb-3">
	  <label for="is_active">Active Status </label>
	  <select name="active_status" id="active_status" class="select2 form-control" onchange="status_Filter();" required>
		<?php echo $active_status_options; ?>
	  </select>
	</div>

	<!-- <div class="col-2 mt-2 pt-1 align-self-center">
		<button type="button" class="btn btn-primary  btn-rounded mr-2" onclick="status_Filter();">Go</button>
	</div> -->

</div>


<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Item creation List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
      </div>


      <div class="card-body d-flex flex-column justify-content-end">
       
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="item_creation_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Status</th>
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