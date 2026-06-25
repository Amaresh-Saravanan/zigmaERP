<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "measurement";
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
  case 'createupdate':
    $entry_date       = $_POST["entry_date"];
    $location         = $_POST["location"];
    $temp             = $_POST["temp"];
    $humi             = $_POST["humi"];
    $remarks          = $_POST["remarks"];
    $unique_id        = $_POST["unique_id"];
    $update_where     = "";
    $columns          = [      
      "entry_date"            => $entry_date,
      "location"              => $location,
      "temp"                  => $temp,
      "humi"                  => $humi,
      "remarks"               => $remarks,      
      "unique_id"             => unique_id($prefix)
    ];
    // check already Exist Or not

    $table_details      = [
      $table,
      "temp"
    ];
    $select_where     = ' is_delete = 0  ';

    
    if ($unique_id) {
      $select_where   .= ' AND unique_id !="' . $unique_id . '" ';
    }
    $action_obj         = $pdo->select($table_details, $select_where);
    // print_r($action_obj);
    if ($action_obj->status) {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = "";
      $sql        = $action_obj->sql;
    } else {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = $action_obj->error;
      $sql        = $action_obj->sql;
      $msg        = "error";
    }
    if ($data[0]["count"]){
      $msg        = "already";
    } else if ($data[0]["count"] == 0) {
      // Update Begins
      if ($unique_id) {
        unset($columns['unique_id']);
        $update_where   = [
          "unique_id"     => $unique_id
        ];
        $action_obj     = $pdo->update($table, $columns, $update_where);
        // Update Ends
      } else {
        // Insert Begins            
        $action_obj     = $pdo->insert($table,$columns);
        // print_r($action_obj);
      }
      if ($action_obj->status) {
        $status     = $action_obj->status;
        $data       = $action_obj->data;
        $error      = "";
        $sql        = $action_obj->sql;
        if ($unique_id) {
          $msg        = "update";
        } else {
          $msg        = "create";
        }
      } else {
        $status     = $action_obj->status;
        $data       = $action_obj->data;
        $error      = $action_obj->error;
        $sql        = $action_obj->sql;
        $msg        = "error";
      }
    }
    $json_array   = [
      "status"    => $status,
      "data"      => $data,
      "error"     => $error,
      "msg"       => $msg,
      "sql"       => $sql,
      "test"      => $columns
    ];
    echo json_encode($json_array);
    break;


  case 'datatable':
    // DataTable Variables
    $search     = $_POST['search']['value'];
    $length     = $_POST['length'];
    // $length1     = $_POST['to_date'];
    // print_r($length1);
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
      // "entry_date",
      "updated",
      "location",
      "temp",
      "humi",
      "remarks",
      "sess_user_id", 
      "unique_id"
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
    $where ="is_delete = 0";

    if(($_POST['from_date']!='')  && ($_POST['to_date']!='')){
      $where  .= " and entry_date>='".$_POST['from_date']."' and entry_date<='".$_POST['to_date']."'";
    }

    if ($_POST['location']){
      $where .= " AND location = '" . $_POST['location'] . "'";
    }

    $search1 = $_POST['search']['value'];
    $search = strtolower($search1);

    if ($search == 's' || $search == 'so' || $search == 'sol' || $search == 'sola' || $search == 'solar') {        
        $where .= " AND location='2'";
    } else if(!empty($search)){
        $where .= " AND location='1'";
    }

    $order_by       = "entry_date asc";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    // print_r($result);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {
        // $value['updated']       = ($value['updated']);
        $value['updated'] = substr($value['updated'], 0, -3);

        $location = $location_options[$value['location']]['value'];
        $value['location'] = $location;

        $value['temp']             = $value['temp'];
        $value['humi']             = $value['humi'];
        $value['remarks']          = $value['remarks'];
        
        if($value['sess_user_id'] == '6700f08395b9e81382'){
          $value['sess_user_id'] = "Karthi";
        } else{
          $value['sess_user_id'] = disname(staff($value['sess_user_id'])[0]['user_name']); 
        }
        
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

  case 'delete':
    $unique_id  = $_POST['unique_id'];
    $columns            = [
      "is_delete"   => 1,
    ];
    $update_where   = [
      "unique_id"   => $unique_id
    ];
    $action_obj     = $pdo->update($table, $columns, $update_where);
    if ($action_obj->status) {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = "";
      $sql        = $action_obj->sql;
      $msg        = "success_delete";
    } else {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = $action_obj->error;
      $sql        = $action_obj->sql;
      $msg        = "error";
    }
    $json_array   = [
      "status"    => $status,
      "data"      => $data,
      "error"     => $error,
      "msg"       => $msg,
      "sql"       => $sql
    ];
    echo json_encode($json_array);
    break;
  default:
    break;
}


?>