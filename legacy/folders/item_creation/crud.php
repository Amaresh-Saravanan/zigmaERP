<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "item_creation";
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
$item_code          = "";
$item_name          = "";
$unit               = "";
$is_active          = "";
$description        = "";
$unique_id          = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose
switch ($action) {
  case 'createupdate':
    // $item_code       = $_POST["item_code"];
    $item_name       = $_POST["item_name"];
    $unit            = $_POST["unit"];
    $is_active       = $_POST["active_status"];
    $unique_id       = $_POST["unique_id"];
    $update_where    = "";

    $columns            = [
      
      // "item_code"             => $item_code,
      "item_name"             => $item_name,
      "unit"                  => $unit,
      "is_active"             => $is_active,
      "unique_id"             => unique_id($prefix)
    ];
    // check already Exist Or not

    $table_details      = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where     .= '(item_name = "' . $item_name . '") AND is_delete = 0  ';

    // When Update Check without current id
    if ($unique_id) {
      $select_where   .= ' AND unique_id !="' . $unique_id . '" ';
    }else{
      $item_code = batch_creation($table, $update_where, 'IT-');
      $columns['item_code']=$item_code;
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
        // Insert Ends
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
    $start      = $_POST['start'];
    $draw       = $_POST['draw'];
    $limit      = $length;
    $data       = [];
    if ($length == '-1') {
      $limit  = "";
    }

if ($_POST['active_status'] =='0' ||$_POST['active_status'] =='1' ) {
      $where .= "is_delete = 0 AND is_active = '".$_POST['active_status']."'";
  }elseif($_POST['active_status'] =='all'){
    $where    .= "is_delete = 0 ";
  } else{
    $where    .= "is_delete = 0 AND is_active = 1";
  }

    $json_array     = "";
    $columns        = [
      "@a:=@a+1 s_no",
      "item_code",
      "item_name",
      "unit",
      "is_active",
      "unique_id"
    ];
    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    
    if ($_POST['search']['value']) {
      $where .= " AND (item_name LIKE '" . mysql_like($_POST['search']['value']) . "' ) ";
    }
    $order_by       = "item_code asc";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    // print_r($result);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {
        $value['item_code']        = $value['item_code'];
        $value['item_name']        = $value['item_name'];
        $value['unit']             = disname(unit_name($value['unit'])[0]['unit_name']);
        $value['is_active']        = is_active_show($value['is_active']);


        $btn_update                = btn_update($folder_name, $value['unique_id']);        
        $btn_delete                = btn_delete($folder_name, $value['unique_id']);
        
        if($value['is_active'] ==='1'){
          $value['unique_id']         = $btn_update . $btn_delete;
        }else{
          $value['unique_id']         = $btn_update;
        }
        // $value['unique_id']         = $btn_update . $btn_delete;
        $data[]                     = array_values($value);
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

function batch_creation($table_name, $where, $prefixs) {
  $driver        = "mysql";
  $host          = "192.168.1.22";
  $username      = "my_root";
  $password      = "my@123456";
  $databasename  = "zigma_bsf";    

  try {
    $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
    return null; // Handle the error appropriately
  }

  // Fetch the last batch ID for the given item_name
  $stmt = $conn->prepare("SELECT * FROM item_creation");
  $stmt->execute();
  
  // Fetch the results
  if ($pit_query = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Create new batch ID with the prefix
    $billno = $prefixs;

    // Generate a sequential ID
    $bill_order_no = generate_order_number($table_name, $conn, $prefixs);

    // Append the generated number to the prefix
    $billno .= sprintf("%03d", $bill_order_no);
    return $billno;
  } else {
    // Create new batch ID with the prefix
    $billno = $prefixs;

    // Generate a sequential ID
    $bill_order_no = generate_order_number($table_name, $conn, $prefixs);

    // Append the generated number to the prefix
    $billno .= sprintf("%03d", $bill_order_no);

    return $billno;
  }
}

function generate_order_number($table_name, $conn, $prefix) {
  // Query the database to find the highest existing number for the given prefix and increment it by one
  $stmt = $conn->prepare("SELECT MAX(item_code) AS max_id FROM $table_name WHERE item_code LIKE :prefix");
  $stmt->execute([':prefix' => $prefix . '%']);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  // Extract the numeric part of the batch_id and increment it
  $max_id = isset($result['max_id']) ? intval(substr($result['max_id'], strlen($prefix))) : 0;
  $new_order_number = $max_id + 1;

  return $new_order_number;
}
?>