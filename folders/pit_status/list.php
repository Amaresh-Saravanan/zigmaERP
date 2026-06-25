 

<?php
include 'function.php';
include '../../config/dbconfig.php';
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];

$batch_options       = pit_batch_no();
$batch_options       = select_option($batch_options, "Select Pit Batch Id", $batch_id);
$pit_options         = pit_name();
$pit_options         = select_option($pit_options, "Select Pit Number", $pit_id);


$status_options          =[
  "1" => [
       "unique_id" => "1",
       "value"     => "Organic Waste Added in Pit",
       ],
  "2" => [
      "unique_id" => "2",
      "value"     => "Baby Larvae Added",
      ],
  "3" => [  
      "unique_id" => "3",
      "value"     => "Aeration Process",
      ],
  "4" => [  
      "unique_id" => "4",
      "value"     => "Measurement",
      ],
  "5" => [
      "unique_id" => "5",
      "value"     => "Harvesting",
      ],
  "7" => [
    "unique_id" => "7",
    "value"     => "Tippi",
    ],
 
];
$status_options        = select_option($status_options, "Select The Status", $org_status);


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
$harvest_status_options        = select_option($harvest_status_options, "Select The Status", $harvest_comp);



function pit_batch_no($unique_id = "") {
  global $pdo;

  $table_name    = "pit_status";
  $where         = "";
  $table_columns = [
      "form_batch_id as id",
      "form_batch_id"
  ];

  $table_details = [
      $table_name,
      $table_columns
  ];

  $where     = "is_delete = 0 AND is_active = 1 group by form_batch_id";

  if ($unique_id) {
  
      $table_details      = $table_name;
      $where              = [];
      $where["unique_id"] = $unique_id;
  }
  $user_name_list = $pdo->select($table_details, $where);
  // print_r($user_name_list);

  if ($user_name_list->status) {
      return $user_name_list->data;
  } else {
      print_r($user_name_list);
      return 0;
  }
}



if ($_GET['from_date'] == ''){
  $from_date = date("Y-m-d");;
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
            <h5 class="d-flex align-items-center">Pit Status List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">

      <div class="row list-pad">
                        <div class="col-md-2">
                            <div class="form-group">
                                <label>From Date</label>
       <input type="date" class="form-control" id='from_date' name='from_date' value='<?php echo $from_date; ?>'>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="form-group">
                                <label>To Date</label>
      <input type="date" class="form-control" id='to_date' name='to_date' value='<?php echo $to_date; ?>'>
                            </div>
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
                                <label>Pit Batch Id</label>
                                <select name='batch_id' id='batch_id' class='select2 form-control '>
                                    <?php echo $batch_options; ?>
                                </select>
                            </div>
                        </div> -->

                        
                        <div class="col-md-2">
                            <div class="form-group">
                                <label>Status</label>
                                <select name="status" id="status" class="select2 form-control" required>
                                    <?php echo $status_options; ?>                                   
                                </select>
                            </div>
                        </div>

                        
                        <!-- <div class="col-md-3 mb-3">
                            <label for="harvest_comp" class="form-label">Harvest Status</label>
                            <select id="harvest_comp" name="harvest_comp" class="select2 form-control">
                            <?php echo $harvest_status_options; ?>
                            </select>
                        </div> -->

<div class="col-md-1 align-self-center mt-4">                     
 <button type="button" class="btn btn-primary  btn-rounded mr-2" onclick="pit_status_Filter();">Go</button>
 </div>
    
        <!-- <div id="tableExample2" data-list='{"valueNames":["name","email","age"],"page":5,"pagination":true}'> -->
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="pit_status_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>Entry Date</th>
                <th>Pit Number</th>
                <th>Pit Batch Id</th>
                <th>Status</th>
                <th>Egg Batch Id</th>
                <th>Organic Qty(Ton)</th>
                <th>Tippi Qty(Kg)</th>
                <th>Live Larvae(Kg)</th>
                <th>Harvesting status</th>
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