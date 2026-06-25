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
$method                  = "";
$dry_method              = "";
$larvae_qty              = "";
$qty_manure_1            = "";
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
            "method",
            "dry_method",
            "larvae_qty",
            "qty_manure_1",
            "qty_rejets",
            "harvest_comp",

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
            $tray_no                 = explode(',',$tray);
            // print_r($tray);
            $feed_qty                = $result_values[0]["feed_qty"];
            $method                  = $result_values[0]["method"];
            $dry_method              = $result_values[0]["dry_method"];
            $larvae_qty              = $result_values[0]["larvae_qty"];
            $qty_manure_1            = $result_values[0]["qty_manure_1"];
            $qty_rejets              = $result_values[0]["qty_rejets"];
            $harvest_comp            = $result_values[0]["harvest_comp"];
            $btn_text               = "Update";
            $btn_form                = "Update";
            $btn_action             = "update";
        } else {
            $btn_text               = "Error";
            $btn_action             = "error";
            $is_btn_disable         = "disabled='disabled'";
        }
        $batch_no_options  = batch_no_update($batch_id);       
        $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id); 
        $tray_options      = tray_update($batch_id);
        $tray_options     = select_option($tray_options,'select tray',$tray_no);

    }
}else{
    $batch_no_options  = batch_no_pit_status();
    $batch_no_options  = select_option($batch_no_options, "Select Batch Id", $batch_id);
     $tray_options      =tray();
     $tray_options     = select_option($tray_options,'select tray',$tray_no);
}
$pit_name_options        = pit_name();
$pit_name_options        = select_option($pit_name_options, "Select Pit Name ", $pit_id);



$status_options          =[
       "1" => [
            "unique_id" => "1",
            "value"     => "Organic Waste Added in Pit",
            ],
        "2" => [
            "unique_id" => "2",
            "value"     => "Larvae Added",
            ],
        "3" => [  
            "unique_id" => "3",
            "value"     => "Aeration Process",
            ],
        "4" => [
            "unique_id" => "4",
            "value"     => "Dry Process",
            ],
        "5" => [
            "unique_id" => "5",
            "value"     => "Harvesting",
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

function batch_no_pit_status($batch_no = "") {
    // alert('bat');
    global $pdo;
    
$cur_date = date('Y-m-d'); 

$date = new DateTime($cur_date); 
$date->modify('-5 days');        

$new_date = $date->format('Y-m-d'); 

    $table_name    = "egg_process as ep";
    $where         = "";
    $table_columns = [
        // "unique_id",
        "ep.batch_id",
        "mr.batch_id as batch_name"
       
    ];
  
    $table_details = [
        $table_name." join material_received as mr on mr.unique_id = ep.batch_id join egg_process_sublist eps 
         on eps.screen_unique_id=ep.screen_unique_id join status_update sp on sp.batch_id=ep.batch_id",
        $table_columns
    ];
  
    $where = "ep.is_delete = 0 AND ep.is_active = 1 and eps.tray_status= 0 
    and sp.hatching_status=2 and sp.is_delete=0 group by eps.screen_unique_id";

    $group ="eps.screen_unique_id";

    $user_name_list = $pdo->select($table_details, $where,'','');
    // print_r($user_name_list);
    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
  }
 
  function tray_update($unique_id = "" ) {    //backup
    global $pdo;

    $table_name    = "egg_process_sublist";
    
    $where         = [];

    $table_columns = [
        "tray_unique_id",
        "(select bin_name from tray_creation where unique_id=egg_process_sublist.tray_unique_id)as tray_unique_id1"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    
    $where = "batch_id = '$unique_id' "  ;
    $bin_name = $pdo->select($table_details, $where);
    

    if ($bin_name->status) {
        return $bin_name->data;
    } else {
    
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
                        <div class="col-md-3 mb-3">
                            <label for="entry_date" class="form-label">Entry Date</label>
                            <input type="date" id="entry_date" name="entry_date" class="form-control" value="<?php echo date('Y-m-d'); ?>" required>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="pit_id" class="form-label">Pit Id</label>
                            <select id="pit_id" name="pit_id" class="select2 form-control" required>
                                <?php echo $pit_name_options; ?>
                            </select>
                        </div>
                    
                        <div class="col-md-3 mb-3">
                            <label for="org_status" class="form-label">Status</label>
                            <select id="org_status" name="org_status" class="select2 form-control"  required>
                                <?php echo $status_options; ?>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label for="notes" class="form-label">Remarks </label>
                            <input type="text" id="notes" name="notes" class="form-control" value="<?php echo  $notes; ?>">
                            
                        </div>
                   

                <div id="batch_div" class="row mb-3">
                    <div class="col-md-3 batch">
                        <label for="batch_id" class="form-label">Batch Id</label>
                        <select id="batch_id" name="batch_id" class="select2 form-control " onchange="get_select_tray_no(this.value)" >
                            <?php echo $batch_no_options; ?>
                        </select>
                    </div>
                    <div class="col-md-3 larvae mb-3">
                        <label for="tray_no" class="form-label">Tray No</label>
                        <select id="tray_no" name="tray_no[]" class="select2 form-control" multiple="multiple">
                        <?php echo $tray_options; ?>
                        </select>
                    </div>
                    <!-- <div class="row mb-3"> -->
                        <div class="col-md-3 larvae mb-3">
                            <label for="larvae_qty_in" class="form-label">Quantity of Larvae(grams)</label>
                            <input type="number" id="larvae_qty_in" name="larvae_qty_in" class="form-control " value="<?php echo $larvae_qty; ?>">
                        </div>
                </div>    
                    
					<div class="row mb-3">
						<div class="col-md-3 org_waste mb-3">
							<label for="feed_qty" class="form-label">Feeding Quantity(Tons)</label>
							<input type="number" id="feed_qty" name="feed_qty" class="form-control" value="<?php echo $feed_qty; ?>">
						</div>

                        <div class="col-md-3 aera_process mb-3">
                            <label for="method" class="form-label">Method</label>
                            <input type="text" id="method" name="method" class="form-control " value="<?php echo $method; ?>">
                        </div>
       
                        <div class="col-md-3 dry_process mb-3">
                            <label for="dry_method" class="form-label">Method</label>
                            <input type="text" id="dry_method" name="dry_method" class="form-control" value="<?php echo $dry_method; ?>">
                        </div>
                    </div>

                
                        <div class="col-md-3 harvest mb-3">
                            <label for="larvae_qty" class="form-label">Quantity of Larvae(grams)</label>
                            <input type="number" id="larvae_qty" name="larvae_qty" class="form-control " value="<?php echo $larvae_qty; ?>">
                        </div>
                        <div class="col-md-3 harvest mb-3">
                            <label for="qty_manure_1" class="form-label">Quantity of Manure(kg)</label>
                            <input type="number" id="qty_manure_1" name="qty_manure_1" class="form-control" value="<?php echo $qty_manure_1; ?>">
                        </div>

                        <div class="col-md-3 harvest mb-3">
                            <label for="qty_rejets" class="form-label">Quantity of Rejets(kg)</label>
                            <input type="number" id="qty_rejets" name="qty_rejets" class="form-control " value="<?php echo $qty_rejets; ?>">
                        </div>
                        <div class="col-md-3 harvest mb-3">
                            <label for="harvest_comp" class="form-label">Harvest Status</label>
                            <select id="harvest_comp" name="harvest_comp" class="select2 form-control">
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






<script>

$(document).ready(function () {
    var batch_id = $("#batch_id").val();
    get_select_tray_no(batch_id);
});
    function get_select_tray_no(batch_id) {
        
        // alert();
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var data = {
           
            "batch_id": batch_id,
            "action": "select_tray_no"
        };

        $.ajax({
            type: "POST",
            url: ajax_url,
            data: data,
            
            success: function (response) {
                
                if (response) {
                    $("#tray_no").html(response); 
                }
            }
        });
    }

    
</script>

