<!-- This file Only PHP Functions -->
<?php include 'function.php'; ?>
<?php
// Form variables
$btn_text                = "Save";
$btn_form                = "Create";
$btn_action              = "create";
$is_btn_disable          = "";
$unique_id               = "";
$entry_date              = "";
$pit_id                  = "";
$org_status              = "";
$notes                   = "";
$tray_no                 = "";  
$batch_id                = ""; 
$feed_qty                = "";
$tippi_qty               = "";
$method                  = "";
$measure_time            = "";
$dry_method              = "";
$larvae_qty              = "";
$qty_manure_1            = "";
$qty_manure_2            = "";
$qty_manure_3            = "";
$qty_rejets              = "";
$screen_unique_id        = unique_id("scr");
$harvest_comp            = empty($org_status) ? 1 : $org_status;


if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {
        $unique_id  = $_GET["unique_id"];
        $where      = [
            "unique_id" => $unique_id
        ];
        $table      =  "pit_status";
        $columns    = [
            "entry_date",
            "pit_id",
            "org_status",
            "notes",
            "batch_id",
            "tray_no",
            "feed_qty",
            // "feed_count",
            "tippi_qty",
            "method",
            "measure_time",
            "temp_start",
            "temp_mid",
            "temp_end",
            "humidity_start",
            "humidity_mid",
            "humidity_end",
            "larvae_qty_in",
            "larvae_qty",
            "qty_manure_1",
            "qty_manure_2",
            "qty_manure_3",
            "qty_rejets",
            "harvest_comp",
             "screen_unique_id"

        ];
        $table_details   = [
            $table,
            $columns
        ];
        $result_values  = $pdo->select($table_details, $where);
        // print_r($result_values );
        if ($result_values->status) {
            $result_values           = $result_values->data;
            $entry_date              = $result_values[0]["entry_date"];
            $pit_id                  = $result_values[0]["pit_id"];
            $org_status              = $result_values[0]["org_status"];
            $notes                   = $result_values[0]["notes"];
            $batch_id                = $result_values[0]["batch_id"];  
            $tray                    = $result_values[0]["tray_no"];         
            $tray_no_hide            = $result_values[0]["tray_no"];
            $tray_no                 = explode(',',$tray);
            // print_r($tray);
            $feed_qty                = $result_values[0]["feed_qty"];
            $tippi_qty               = $result_values[0]["tippi_qty"];
            $method                  = $result_values[0]["method"];
            $measure_time            = $result_values[0]["measure_time"];
            $temp_start              = $result_values[0]["temp_start"];
            $temp_mid                = $result_values[0]["temp_mid"];
            $temp_end                = $result_values[0]["temp_end"];
            $humi_start              = $result_values[0]["humidity_start"];
            $humi_mid                = $result_values[0]["humidity_mid"];
            $humi_end                = $result_values[0]["humidity_end"];
            $larvae_qty              = $result_values[0]["larvae_qty"];
            $larvae_qty_in           = $result_values[0]["larvae_qty_in"];
            $qty_manure_1            = $result_values[0]["qty_manure_1"];
            $qty_manure_2            = $result_values[0]["qty_manure_2"];
            $qty_manure_3            = $result_values[0]["qty_manure_3"];
            $qty_rejets              = $result_values[0]["qty_rejets"];
            $harvest_comp            = $result_values[0]["harvest_comp"];
            $screen_unique_id_up     = $result_values[0]["screen_unique_id"];
            $btn_text                = "Update";
            $btn_form                = "Update";
            $btn_action              = "update";
        } else {
            $btn_text               = "Error";
            $btn_action             = "error";
            $is_btn_disable         = "disabled='disabled'";
        }
        $batch_no_options  = batch_no_update($batch_id);       
        $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id); 
        $tray_options      = tray_update($batch_id,$tray);
        $tray_options      = select_option($tray_options,' ',$tray_no);


        switch ($org_status) {
            case "1":
                $status_options .= "<option value='1'>Organic Waste Added in Pit</option>";
                break;
           
            case "2":
                $status_options .= "<option value='2'>Baby Larvae Added</option>";
                break;
            case "3":
                $status_options .= "<option value='3'>Aeration Process</option>";
                break;
            case "4":
                $status_options .= "<option value='4'>Measurement</option>";
                break;
            case "5":
                $status_options .= "<option value='5'>Harvesting</option>";
                break;
            case "7":
                $status_options .= "<option value='7'>Tippi</option>";
                break;
            default:
                $status_options .= "<option value=''>Unknown Status</option>";
                break;
        }
        $pit_name_options        = pit_name_update($pit_id);
        $pit_name_options        = select_option($pit_name_options, "Select Pit Number ", $pit_id); 
        
        $harvest_status_options       =[
           
            "2" => [
                 "unique_id" => "2",
                 "value"     => "Completed",
                 ],
            ];
            $harvest_status_options    = select_option($harvest_status_options ,"Select The Status", $harvest_comp);
        
    }
    
}else{
    $harvest_comp = "";
    $harvest_status_options      =[
   
    "2" => [
         "unique_id" => "2",
         "value"     => "Completed",
         ],
    ];

    $batch_no_options  = batch_no_pit_status();
    $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id);
    //  $tray_options      =tray();
     $tray_options     = select_option($tray_options,'select tray',$tray_no);
     $pit_name_options        = pit_name();
     $pit_name_options        = select_option($pit_name_options, "Select Pit Number ", $pit_id);
     $entry_date= date('Y-m-d');
}


$harvest_status_options          =[
   
    
    "2" => [
         "unique_id" => "2",
         "value"     => "Completed",
         ],
    ];
$harvest_status_options        = select_option($harvest_status_options, "Select The Status", $harvest_comp);

$method_options          =[
    "1" => [
         "unique_id" => "1",
         "value"     => "Machine",
         ],
    "2" => [
         "unique_id" => "2",
         "value"     => "Manual",
         ],
    ];
$method_options         = select_option($method_options , "Select The Status", $method);

$measure_time_options          =[
    "1" => [
            "unique_id" => "1",
            "value"     => "Morning",
            ],
    "2" => [
            "unique_id" => "2",
            "value"     => "Evening",
            ],
    ];
$measure_time_options         = select_option($measure_time_options , "Select The Time", $measure_time);



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



function batch_no_pit_status($batch_no = "") {
    // alert('bat');
    global $pdo;
    

    $table_name    = "frp_process as fp";
    $where         = "";
    $table_columns = [
        // "unique_id",
        "fps.egg_batch_id",
        "(select batch_id from material_received where  unique_id = fps.egg_batch_id )as batch_name"
       
    ];
  
    $table_details = [
        "
    frp_process_sublist AS fps 
JOIN 
    frp_status_update AS fsu 
    ON fsu.batch_id = fps.egg_batch_id",
        $table_columns
    ];
  
    $where = "  
    fps.is_delete = 0 
    AND fsu.is_delete = 0 
   
    AND fps.tray_status = 0
    AND fsu.hatching_status = 2 
GROUP BY 
    fps.egg_batch_id";

    

    $user_name_list = $pdo->select($table_details, $where,'','');
    // print_r($user_name_list);
    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
  }
  function tray_update($batch_id = "",$tray_no="" ) {    //backup
    global $pdo;
    $tray_no = ltrim($tray_no, ',');
    $tray_array = explode(',', $tray_no);

    $tray_no = "'" . implode("','", $tray_array) . "'";
    $table_name    = "frp_process_sublist";
   
    $where         = [];

    $table_columns = [
        "frp_tray_no",
        "(select bin_name from tray_creation where id=frp_process_sublist.frp_tray_no)as tray_unique_id1"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];
    
    // $where = "tray_unique_id in ($tray_no) and batch_id = '$batch_id'  or tray_status = 0 "  ;
    // $where = "batch_id = '$batch_id'";
    $where = " egg_batch_id = '$batch_id' and is_delete= 0";
   
    
    $bin_name = $pdo->select($table_details,$where);
    // print_r($pdo);
    if ($bin_name->status) {
        return $bin_name->data;
    } else {
    
        return 0;
    }
}
function pit_name_update($unique_id = "") {
    global $pdo;

    $table_name    = "pit_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "pit_name"
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

    $pit_name = $pdo->select($table_details, $where);
// print_r($pit_name);
    if ($pit_name->status) {
        return $pit_name->data;
    } else {
        print_r($pit_name);
        return 0;
    }
}

  
  function batch_no_update($unique_id) {
    global $pdo;

    $table_name    = "material_received";
    $where         = "";
    $table_columns = [        
       
        "unique_id" ,
        "batch_id"
    ];
  
    $table_details = [
        $table_name,
        $table_columns
    ];
  
    $where = "unique_id = '$unique_id'";

    $user_name_list = $pdo->select($table_details, $where);
    // print_r($user_name_list);
   
    if ($user_name_list->status) {
        return $user_name_list->data;
        // return "hai";
    } else {
        print_r($user_name_list);
        return 0;
    }
  }




?>
<div class="row g-0 mb-0">
    <div class="col-md-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pt-3 pb-2">
                <div class="row">
                    <div class="col-auto align-self-center">
                        <h5 class="d-flex align-items-center">Pit Status <?=$btn_form;?></h5>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form class="was-validated" autocomplete="off">
                    <div class="row mb-3">
                    <input type="hidden" id="screen_unique_id" name="screen_unique_id" value="<?php echo $screen_unique_id; ?>">
                     <input type="hidden" class="form-control" id='batch_id' name='batch_id' value="<?php echo $batch_id; ?>" required>
                     <input type="hidden" id="screen_unique_id_up" name="screen_unique_id_up" value="<?php echo $screen_unique_id_up; ?>">
                     <input type="hidden" id="unique" name="unique" value="<?php echo $_GET["unique_id"]; ?>">
                        <div class="col-md-3 mb-3">
                            <label for="entry_date" class="form-label">Entry Date</label>
                            <input type="date" id="entry_date" name="entry_date" class="form-control" value="<?php echo $entry_date; ?>" required>
                            <!-- <br><h5><?php echo (date('d-m-Y')); ?></h5> -->
                        </div>
                       
                    
                        <div class="col-md-3 mb-3">
    <label for="pit_id" class="form-label">Pit Number</label>
    
    <select id="pit_id" name="pit_id" class="select2 form-control" onchange="get_pit_name(this.value)" required >
       
    <?php echo $pit_name_options; ?>
    </select>
</div>

<input type="hidden" class="form-control" id="pit_count" name="pit_count">

<div class="col-md-3 mb-3">
    <label for="org_status" class="form-label">Status</label>
    <select id="org_status" name="org_status" class="select2 form-control" onchange="pit_read_only(this.value)" required>
        <?php echo $status_options; ?>
    </select>
</div>

                    

                        <div class="col-md-3 mb-3">
                            <label for="notes" class="form-label">Remarks </label>
                            <input type="text" id="notes" name="notes" class="form-control" value="<?php echo  $notes; ?>">
                       </div>
                          <input type="hidden" id="tray_no_hide" name="tray_no_hide" class="form-control" value="<?php echo  $tray_no_hide; ?>">

                        <div class="col-md-3 mb-3">
                        
                        <input type="hidden" id="pit_name" name="pit_name" class="form-control" value="<?php  ?>">                           
                        </div>
                   

                <div id="batch_div" class="row mb-3">
                    <div class="col-md-3 batch">
                        <label for="batch_id" class="form-label">Batch Id</label>
                        <select id="batch_id" name="batch_id" class="select2 form-control " onchange="get_select_tray_no(this.value)">
                            <?php echo $batch_no_options; ?>
                        </select>
                    </div>
                   
                    <div class="col-md-3 larvae mb-3">
                        <label for="larvae_qty_in" class="form-label">Qty of Baby Larvae(kg)</label>
                        <input type="number" step="0.01" id="larvae_qty_in" name="larvae_qty_in" class="form-control " value="<?php echo $larvae_qty_in; ?>">
                    </div>

                    <div class="col-md-6 larvae mb-3">
                        <label for="tray_no" class="form-label">Tray No</label>
                        <select id="tray_no" name="tray_no[]" class="select2 form-control" multiple="multiple">
                            <?php echo $tray_options; ?>
                        </select>
                    </div>
                </div>                
                    
                <div class="row mb-3">
                <div class="col-md-3 org_waste mb-3">
                                <label for="feed_count" class="form-label">Feeding Count</label>
                                <input type="hidden"  id="feed_count" name="feed_count" class="form-control" value="<?php ?>" readonly>
                                <input type="text"  id="feed_count_name" name="feed_count_name" class="form-control"  readonly>
                            </div>

						<div class="col-md-3 org_waste mb-3">
							<label for="feed_qty" class="form-label">Feeding Qty(Tons)</label>
							<input type="number" step="0.01" id="feed_qty" name="feed_qty" class="form-control" value="<?php echo $feed_qty; ?>" >
						</div>

                        <div class="col-md-3 aera_process mb-3">
                            <label for="method" class="form-label">Method</label>
                            <select id="method" name="method" class="select2 form-control"  >
                                <?php echo $method_options; ?>
                            </select>
                        </div>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-3 tippi mb-3">
							<label for="tippi_qty" class="form-label">Qty(Kg)</label>
							<input type="number" step="0.01" id="tippi_qty" name="tippi_qty" class="form-control" value="<?php echo $tippi_qty; ?>" >
						</div>
                    </div>
                    

                    <div class="row mb-3">
                        <div class="col-md-3 measure mb-3">
                            <label for="measure_time" class="form-label">Measurement Time</label>
                            <select id="measure_time" name="measure_time" class="select2 form-control"  >
                                <?php echo $measure_time_options; ?>
                            </select>
                        </div>
                    </div>
             
                    <div class="row mb-3">
                        <div class="col-md-3 measure mb-3">
                            <label for="tempstart" class="form-label">Temperature(°c)/start</label>
                            <input type="number" step="0.01" id="tempstart" name="tempstart" class="form-control" value="<?php echo $temp_start; ?>">
                            <label for="tempmid" class="form-label">Temperature(°c)/Mid</label>
                            <input type="number" step="0.01" id="tempmid" name="tempmid" class="form-control" value="<?php echo  $temp_mid; ?>">
                            <label for="tempend" class="form-label">Temperature(°c)/End</label>
                            <input type="number" step="0.01" id="tempend" name="tempend" class="form-control" value="<?php echo  $temp_end; ?>">
                        </div>
                        <div class="col-md-3 measure mb-3">
                            <label for="humistart" class="form-label">Humidity(%)/Start</label>
                            <input type="number" step="0.01" id="humistart" name="humistart" class="form-control" value="<?php echo $humi_start; ?>">
                            <label for="humimid"  class="form-label">Humidity(%)/Mid</label>
                            <input type="number" step="0.01" id="humimid" name="humimid" class="form-control" value="<?php echo $humi_mid; ?>">
                            <label for="humiend" class="form-label">Humidity(%)/End</label>
                            <input type="number" step="0.01" id="humiend" name="humiend" class="form-control" value="<?php echo $humi_end; ?>">
                        </div>                       
                    </div>

                    <div class="col-md-3 harvest mb-3">
                        <label for="larvae_qty" class="form-label">Qty of Live Larvae(kg)</label>
                        <input type="number" step="0.01" id="larvae_qty" name="larvae_qty" class="form-control " value="<?php echo $larvae_qty; ?>">
                    </div>

           
                    <div class="col-md-3 harvest mb-3">
                        <label for="harvest_comp" class="form-label">Harvest Status</label>
                        <select id="harvest_comp" name="harvest_comp" class="select2 form-control" >
                            <?php echo $harvest_status_options; ?>
                        </select>
                    </div>
                </div>

                    <div class="row">
                        <div class="col-md-12 text-end">
                            <!-- Cancel, save and update Buttons -->
                            <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
							 <?php echo btn_cancel($btn_cancel); ?>
                        </div>
                    </div>
                    
                </form>
            </div>
        </div>
    </div>
</div>

<?php

?>




