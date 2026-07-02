<?php
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];

$table             = "pit_status";
$table1            = "pit_update";
$table2            = "egg_process_sublist"; 
$table4            = "tray_creation";
$table_mes         = "measurement"; 
$table_met         = "material_received"; 
// Include DB file and Common Functions
include '../../config/dbconfig.php';
// Variables Declaration
$action             = $_POST['action'];
$action_obj         = (object) [
  "status"    => 0,
  "data"      => "",
  "error"     => "Action Not Performed"
];

$current_date=date('Y-m-d');
$from_date=$_GET['from_date'];
// print_r($from_date);
$to_date=$_GET['to_date'];
// print_r($to_date);
$pit_id=$_GET['pit_id'];
// print_r($pit_id);
$status=$_GET['status'];
// print_r($status);
$harvest_status=$_GET['harvest_comp'];		
// print_r($harvest_status);
$length = $_POST['length'];
    $start = $_POST['start'];
    $draw = $_POST['draw'];
    $limit = $length;
    $data = [];
    if ($length == '-1') {
        $limit = "";
    }
    // Query Variables
    $json_array = "";
    $columns = [
      "@a:=@a+1 s_no",    
      "pit_id", 
      "form_batch_id",
      "min(entry_date) as start_date",
      "max(entry_date)as end_date",
      "max(batch_id) as batch_id",
      "sum(larvae_qty_in)as larvae_qty_in",
      "sum(feed_qty)as feed_qty",
      "sum(feed_qty)as total_qty",
      "max(harvest_comp)as harvest_comp",
      "( DATEDIFF(MAX(entry_date), MIN(entry_date))) AS tot_days",
      "sum(larvae_qty)as larvae_qty",
      "sum(qty_manure_1)as manure_1",
      "sum(qty_manure_2)as manure_2",
      "sum(qty_rejets)as qty_rejets",
      "avg (temp_start + temp_mid + temp_end) / 3 as temperature",
      "avg (humidity_start + humidity_mid + humidity_end) / 3 as humidity",
      "sum(qty_manure_3)as manure_3",
      ];

    $table_details = [
        $table ,
        $columns
    ];
    
   
    if(($from_date!='') && ($to_date!='')) {
      $where  .= "  entry_date>='$from_date' and entry_date<='$to_date'";
    }

    if($pit_id){
      $where  .= " and pit_id = '$pit_id'";
    }

    if($status){
      $where  .= " and org_status = '$status'";
    }
   
    if($_GET['harvest_comp']){
      if($_GET['harvest_comp']=='2'){
        $where  .= " and form_batch_id in (select form_batch_id from pit_status where harvest_comp ='".$_GET['harvest_comp']."' and is_delete=0)";
      } else if($_GET['harvest_comp']=='1'){
        $where  .= " and form_batch_id not in (select form_batch_id from pit_status where harvest_comp ='2' and is_delete=0)";
      }
    }

    $where .= " and  is_delete = 0  group by form_batch_id";
    $order_by = "pit_id asc";
    $group =" form_batch_id";
    $sql_function = "SQL_CALC_FOUND_ROWS";

    $result = $pdo->select($table_details, $where, $limit, $start ,$order_by, $sql_function);
    // print_r($result);

    $blog=array('','','','','','LOG SHEET','','','','');

    foreach($blog as $icon) {
      $output		.= '"'.$icon.'",';
    }

    $output .="\n";
    $output .="\n";

    $output .='"From Date"'.",".$from_date."," . " " . ","."To Date".",".$to_date."\n";

    $output .="\n";
    $output .="\n";

    $output .= 'S.No, Pit Number, Pit Batch Id, Start Date, End Date, Processing Day, Egg added (g), 5 DOL Weight (Kg),Organic Waste(Tons), Live Larvae(Kg), -4mm(Kg), +4mm(Kg), Rejects(Kg), Avg inside Temp, Avg outside Temp, Avg inside Humidity, Avg outside Humidity'."\n";

    $table_values=array('SNo','s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12','s13','s14','s15','s16') ;

    $sno=0;

  $res_array = $result->data;
  $data = [];

  foreach ($res_array as $key => $record) {
	  $sno              = $sno+1;
    $pit_id           = $record['pit_id'] ? disname(pit_name($record['pit_id'])[0]['pit_name']) : '-';
    $form_batch_id    = $record['form_batch_id'];
    $start_date       = $record['start_date'];
    $end_date         = $record['end_date'];
    $batch_id         = $record['batch_id'];

  
    $columns = [
      "avg(temp) as out_temp",
      "avg(humi) as out_humi",

      ];
  
      $table_details = [
          $table_mes ,
          $columns
      ];
      $where = "entry_date >= '$start_date' AND entry_date <= '$end_date' and is_delete=0";
      $result = $pdo->select($table_details, $where);
      // print_r($result);
      $res_array = $result->data;

      $columns1 = [
        "sum(qty) as egg_add"
      ];
    
      $table_details1 = [
        $table_met ,
        $columns1
      ];

      $where1 = "unique_id = '$batch_id' and is_delete=0";
      $result1 = $pdo->select($table_details1, $where1);
      // print_r($result1);
      $res_array1 = $result1->data;

      $tot_days         = $record['tot_days'] +'1';
      $egg_add          = round($result1->data[0]['egg_add'], 1);
      $larvae_qty_in    = $record['larvae_qty_in'];
      $feed_qty         = $record['feed_qty'];
      $total_qty        = $record['total_qty'];
      $larvae_qty       = $record['larvae_qty'];
      $harvest_comp     = $record['harvest_comp'];
      $temperature      = round($record['temperature'], 1);
      $out_temp         = round($result->data[0]['out_temp'], 1);
      $humidity         = round($record['humidity'], 1);
      $out_humi         = round($result->data[0]['out_humi'], 1);
      $manure_1         = $record['manure_1'];
      $manure_2         = $record['manure_2'];
      $qty_rejets       = $record['qty_rejets']; 

  foreach ($table_values as $val) {
    if($val=='SNo'){$output.='"'.$sno.'",';}
    if($val=='s1'){$output.='"'.$pit_id.'",';}
    if($val=='s2'){$output.='"'.$form_batch_id.'",';}
    if($val=='s3'){$output.='"'.$start_date.'",';}
    if($val=='s4'){$output.='"'.$end_date.'",';}
    if($val=='s5'){$output.='"'.$tot_days.'",';}
    if($val=='s6'){$output.='"'.$egg_add.'",';}
    if($val=='s7'){$output.='"'.$larvae_qty_in.'",';}
    if($val=='s8'){$output.='"'.$feed_qty.'",';}
    if($val=='s9'){$output.='"'.$larvae_qty.'",';}
    if($val=='s10'){$output.='"'.$manure_1.'",';}
    if($val=='s11'){$output.='"'.$manure_2.'",';}
    if($val=='s12'){$output.='"'.$qty_rejets.'",';}
    if($val=='s13'){$output.='"'.$temperature.'",';}
    if($val=='s14'){$output.='"'.$out_temp.'",';}
    if($val=='s15'){$output.='"'.$humidity.'",';}
    if($val=='s16'){$output.='"'.$out_humi.'",';}

    if(($val!='SNo')&&($val!='s1')&&($val!='s2')&&($val!='s3')&&($val!='s4')&&($val!='s5')&&($val!='s6')&&($val!='s7')&&($val!='s8')&&($val!='s9')&&($val!='s10')&&($val!='s11')&&($val!='s12')&&($val!='s13')&&($val!='s14')&&($val!='s15')&&($val!='s16')){$output .='"'.$val.'",';
    }
  }

  $output .="\n";
}

$date=date('d-m-Y H:i:s');

$filename ="Log Sheet".$date.".csv";
header('Content-type: application/xls');
header('Content-Disposition: attachment; filename='.$filename);
echo $output;
exit;
?>