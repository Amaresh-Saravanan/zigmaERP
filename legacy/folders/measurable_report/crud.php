<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
// $table             = "measurement";
$table             = "pit_status ps  left join measurement m  on ps.entry_date=m.entry_date and ps.is_delete='0' and m.is_delete='0'";
// Include DB file and Common Functions
include '../../config/dbconfig.php';
// Variables Declaration
$action             = $_POST['action'];
$action_obj         = (object) [
  "status"    => 0,
  "data"      => "",
  "error"     => "Action Not Performed"
];
$json_array         = "";
$sql                = "";
$entry_date         = "";
$location           = "";
$temp               = "";
$humi               = "";
$is_active          = "";
$description        = "";
$unique_id          = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$remarks            = "";
$test               = ""; // For Developer Testing Purpose
switch ($action) {
  case 'datatable':
    // DataTable Variables
    $search     = $_POST['search']['value'];
    $length     = $_POST['length'];
    $start      = $_POST['start'];
    $draw       = $_POST['draw'];
    $limit      = $length;
    $data       = [];
    if ($length == '-1') {
      $limit  = "";
    }


    $json_array     = "";
    $columns        = [
      "@a:=@a+1 s_no",
      "ps.entry_date",
      "ps.pit_id",
     "'' as temp_p",
     "'' as humi_p",
      "m.location",
      "m.temp",
      "m.humi",
      "m.remarks",
      "ps.temp_start",
      "ps.temp_mid",
      "ps.temp_end",
      "ps.humidity_start", 
      "ps.humidity_mid",
      "ps.humidity_end",
      "m.unique_id"
    ];

    
$location_options = [
  "1" => [
    "unique_id" => "1",
    "value" => "Weigh Bridge Side",
  ],
  "2" => [
    "unique_id" => "2",
    "value" => "Solar Side",
  ]
  
];

    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];


    $where .="  ps.org_status='4' ";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        $where .= "  and m.entry_date >= '" . $_POST['from_date'] . "' and m.entry_date <= '" . $_POST['to_date'] . "'";
    }

    if ($_POST['location']){
        $where .= " AND location = '" . $_POST['location'] . "'";
    }

    if($_POST['pit_id']){
      $where  .= " and ps.pit_id = '".$_POST['pit_id']."'";
    }
    

    $search1 = $_POST['search']['value'];
    $search = strtolower($search1);

    if ($search == 's' || $search == 'so' || $search == 'sol' || $search == 'sola' || $search == 'solar') {
      $where .= " AND location='2'";
    } else if($search == 'w' || $search == 'we' || $search == 'wei' || $search == 'weig' || $search == 'weigh'){
      $where .= " AND location='1'";
    }else if(!empty($search)){
      $pit_id_search = pit_id($search);
      $where .= " AND ps.pit_id LIKE '%" . $pit_id_search . "%'";    
    }
    
    $order_by       = "ps.entry_date,ps.pit_id asc";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, '', $start, $order_by, $sql_function);
    // print_r($result);
    $s_no = 1;
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      $s_no = $start + 1;
      foreach ($res_array as $key => $value) {
        $value['s_no'] = $s_no;
            $s_no++;
        $value['entry_date']       = disdate($value['entry_date']);

        $location = $location_options[$value['location']]['value'];
        $value['location'] = $location;
        $value['pit_id']            = disname(pit_name($value['pit_id'])[0]['pit_name']);

        $value['temp_p']             = $value['temp_start']." - ".$value['temp_mid']." - ".$value['temp_end'];
        $value['humi_p']             = $value['humidity_start']." - ".$value['humidity_mid']." - ".$value['humidity_end'];

        $value['temp']             = $value['temp'];
        $value['humi']             = $value['humi'];
        $value['remarks']          = $value['remarks'];
        $btn_update                = btn_update($folder_name, $value['unique_id']);        
        $btn_delete                = btn_delete($folder_name, $value['unique_id']);               
        $value['unique_id']        = $btn_update . $btn_delete;       
        $data[]                    = array_values($value);
      }
      $json_array = [
        "draw"              => intval($draw),
        "recordsTotal"      => intval($total_records),
        "recordsFiltered"   => intval($total_records),
        "data"              => $data,
        "testing"           => $result->sql
      ];
    } else {
      print_r($result);
    }
    echo json_encode($json_array);
    break;

//   case 'datatable':
//     // DataTable Variables
//     $search     = $_POST['search']['value'];
//     $length     = $_POST['length'];
//     $start      = $_POST['start'];
//     $draw       = $_POST['draw'];
//     $limit      = $length;
//     $data       = [];
//     if ($length == '-1') {
//       $limit  = "";
//     }


//     $json_array     = "";
//     $columns        = [
//       "@a:=@a+1 s_no",
//       "updated",
//       // "entry_date",
//       "location",
//       "temp",
//       "humi",
//       "remarks",
//       "unique_id"
//     ];

    
// $location_options = [
//   "1" => [
//     "unique_id" => "1",
//     "value" => "Weigh Bridge Side",
//   ],
//   "2" => [
//     "unique_id" => "2",
//     "value" => "Solar Side",
//   ],
//   "3" => [
//     "unique_id" => "3",
//     "value" => "Test",
//   ]
// ];


//       $table_details  = [
//       $table . " , (SELECT @a:= " . $start . ") AS a ",
//       $columns
//     ];
//     $where ="is_delete = 0";

//     if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
//         $where .= " and entry_date >= '" . $_POST['from_date'] . "' and entry_date <= '" . $_POST['to_date'] . "'";
//     }

//     if ($_POST['location']){
//       $where .= " AND location = '" . $_POST['location'] . "'";
//     }

//     $search1 = $_POST['search']['value'];
//     $search = strtolower($search1);

//     if ($search == 's' || $search == 'so' || $search == 'sol' || $search == 'sola' || $search == 'solar') {        
//         $where .= " AND location='2'";
//     } else if(!empty($search)){
//         $where .= " AND location='1'";
//     }

//     $order_by       = "entry_date asc";
//     $sql_function   = "SQL_CALC_FOUND_ROWS";
//     $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
//     // print_r($result);
//     $total_records  = total_records();
//     if ($result->status) {
//       $res_array      = $result->data;
//       foreach ($res_array as $key => $value) {
//         $value['entry_date']       = disdate($value['entry_date']);

//         $location = $location_options[$value['location']]['value'];
//         $value['location'] = $location;

//         $value['temp']             = $value['temp'];
//         $value['humi']             = $value['humi'];
//         $value['remarks']          = $value['remarks'];
//         $btn_update                = btn_update($folder_name, $value['unique_id']);        
//         $btn_delete                = btn_delete($folder_name, $value['unique_id']);               
//         $value['unique_id']        = $btn_update . $btn_delete;       
//         $data[]                    = array_values($value);
//       }
//       $json_array = [
//         "draw"              => intval($draw),
//         "recordsTotal"      => intval($total_records),
//         "recordsFiltered"   => intval($total_records),
//         "data"              => $data,
//         "testing"           => $result->sql
//       ];
//     } else {
//       print_r($result);
//     }
//     echo json_encode($json_array);
//     break;


  default:
    break;
}


?>