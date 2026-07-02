<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "supplier_creation";
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
$supplier_name      = "";
$label              = "";
$address            = "";
$contact_no         = "";
$email              = "";
$gst_no             = "";
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
    $supplier_name   = $_POST["supplier_name"];
    $label           = $_POST["label"];
    $address         = $_POST["address"];
    $contact_no      = $_POST["contact_no"];
    $email           = $_POST["email"];
    $gst_no          = $_POST["gst_no"];
    $is_active       = $_POST["active_status"];
    $unique_id       = $_POST["unique_id"];
    $update_where       = "";
    $columns            = [
      "supplier_name"             => $supplier_name,
      "label"                     => $label,
      "address"                   => $address,
      "contact_no"                => $contact_no,
      "email"                     => $email,
      "gst_no"                    => $gst_no,
      "is_active"                 => $is_active,
      "unique_id"                 => unique_id($prefix)
    ];
    // check already Exist Or not
    $table_details      = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where       = '(supplier_name = "' . $supplier_name . '") AND is_delete = 0  ';
    // When Update Check without current id
    if ($unique_id) {
      $select_where   .= ' AND unique_id !="' . $unique_id . '" ';
    }
    $action_obj         = $pdo->select($table_details, $select_where);
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
    if ($data[0]["count"]) {
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
        $action_obj     = $pdo->insert($table, $columns);
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
    // Query Variables
    $json_array     = "";
    $columns        = [
      "@a:=@a+1 s_no",
      "supplier_name",
      "label",
      "contact_no",
      "gst_no",
      "address",
      "is_active",
      "unique_id"
    ];
    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $where          = "is_delete = 0";
    if ($_POST['search']['value']) {
      $where .= " AND (supplier_name LIKE '" . mysql_like($_POST['search']['value']) . "' ) ";
    }
    $order_by       = "";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {
        $value['supplier_name']     = disname($value['supplier_name']);
        $value['label']             = ($value['label']);
        $value['contact_no']        = ($value['contact_no']);
        $value['gst_no']            = ($value['gst_no']);
        $value['address']           = disname($value['address']);
        $value['is_active']         = is_active_show($value['is_active']);
        $btn_update                 = btn_update($folder_name, $value['unique_id']);
        $btn_delete                 = btn_delete($folder_name, $value['unique_id']);
        $value['unique_id']         = $btn_update . $btn_delete;
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
      "unique_id"     => $unique_id
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
