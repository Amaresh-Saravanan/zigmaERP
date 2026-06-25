<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "user";
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
$user_id            = "";
$user_name          = "";
$password           = "";
$first_name         = "";
$last_name          = "";
$email              = "";
$user_type          = "";
$is_active          = "";
$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose
switch ($action) {
  case 'createupdate':
    $emp_id        = $_POST["emp_id"];
    $user_name      = $_POST["user_name"];
    $password       = $_POST["password"];
    $first_name     = $_POST["first_name"];
    $last_name      = $_POST["last_name"];
    $email          = $_POST["email"];
    $user_type      = $_POST["user_type_unique_id"];
    $is_active      = $_POST["is_active"];
    $unique_id      = $_POST["unique_id"];
    $update_where       = "";
    $columns            = [
      "emp_id"                    => $emp_id,
      "user_name"                 => $user_name,
      "password"                  => $password,
      "first_name"                => $first_name,
      "last_name"                 => $last_name,
      "email"                     => $email,
      "user_type_unique_id"       => $user_type,
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
    $select_where       = '(user_name = "' . $user_name . '") AND is_delete = 0  ';
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
      "user_type_unique_id",
      "user_name",
      "password",
      "emp_id",
      "last_name",
      "is_active",
      "unique_id"
    ];
    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $where          = "is_delete = 0";
    if ($_POST['search']['value']) {
      $where .= " AND (screen_main_name LIKE '" . mysql_like($_POST['search']['value']) . "' ) ";
    }
    $order_by       = "";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {
        $value['user_type_unique_id']   = disname(user_type($value['user_type_unique_id'])[0]['user_type']);
        // $value['user_name']         = disname($value['user_name']);
        $value['user_name']         = $value['user_name'];
        $value['password']          = $value['password'];
        $value['first_name']        = disname($value['first_name']);
        $value['last_name']         = disname($value['last_name']);
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
