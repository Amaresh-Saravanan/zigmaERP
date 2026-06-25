<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "user_screen_permission";
$table_log         = "user_screen_permission_log";
// Include DB file and Common Functions
include '../../config/dbconfig.php';
include 'function.php';
// Variables Declaration
$action             = $_POST['action'];
$action_obj         = (object) [
  "status"    => 0,
  "data"      => "",
  "error"     => "Action Not Performed"
];
$json_array         = "";
$sql                = "";
$main_screen        = "";
$section_name       = "";
$screen_name        = "";
$screen_folder_name = "";
$icon_name          = "";
$order_no           = "";
$user_actions       = "";
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
    $json_data          = json_decode($_POST['json_data']);
    $rows               = [];
    $columns_data       = [];
    if (isset($_POST["user_type"])) {
      $user_type          = $_POST["user_type"];
    } else {
      $user_type          = $_POST["unique_id"];
    }
    $main_screen        = $_POST["main_screen"];
    $unique_id          = $_POST["unique_id"];
    $update_where       = "";
    $columns            = [
      "unique_id",
      "user_type",
      "main_screen_unique_id",
      "section_unique_id",
      "screen_unique_id",
      "action_unique_id"
    ];
    foreach ($json_data as $data_key => $data_value) {
      $columns_data            = [
        "unique_id"             => unique_id($prefix),
        "user_type"             => $user_type,
        "main_screen_unique_id" => $main_screen,
        "section_unique_id"     => $data_value->section,
        "screen_unique_id"      => $data_value->screen,
        "action_unique_id"      => $data_value->action
      ];

      $rows[] = $columns_data;
    }
    // check already Exist Or not
    $table_details      = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where       = ' main_screen_unique_id = "' . $main_screen . '"  AND user_type = "' . $user_type . '" AND is_delete = 0 ';
    // When Update Check without current id
    if ($unique_id) {
      $select_where   .= ' AND user_type !="' . $unique_id . '" ';
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
    } else if (($data[0]["count"] == 0) && ($msg != "error")) {
      // Update Begins
      if ($unique_id) {
        // $columns['user_type'] = $unique_id ;
        $update_where   = [
          "user_type"             => $unique_id,
          "main_screen_unique_id" => $main_screen
        ];
        $action_obj     = $pdo->delete($table, $update_where);
        // Update Ends
      }
      // Insert Begins            
      $action_obj     = $pdo->insertMultiple($table, $columns, $rows);
      // Insert Ends
      if ($action_obj->status) {
        
        $pdo->insertMultiple($table_log, $columns, $rows);
        $status         = $action_obj->status;
        $data           = $action_obj->data;
        $error          = "";
        $sql            = $action_obj->sql;
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
    $search   = $_POST['search']['value'];
    $length   = $_POST['length'];
    $start     = $_POST['start'];
    $draw     = $_POST['draw'];
    $limit     = $length;
    $data      = [];
    if ($length == '-1') {
      $limit  = "";
    }
    // Query Variables
    $json_array     = "";
    $columns        = [
     "(SELECT user_type FROM user_type AS ut WHERE ut.unique_id = " . $table . ".user_type ) AS user_type",
      "user_type as unique_id"
    ];
    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $where = " is_delete = '0' ";
    if ($_POST['search']['value']) {
      $where .= " AND user_type IN (" . user_type_like($_POST['search']['value']) . ")";
    }
    $group_by       = "user_type";
    $order_by       = "";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function, $group_by);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      $s_no           = 1;
      foreach ($res_array as $key => $value) {
        array_unshift($value, $s_no++);
        $value['user_type']           = disname($value['user_type']);
        $btn_update                     = btn_update($folder_name, $value['unique_id']);
        $btn_delete                     = btn_delete($folder_name, $value['unique_id']);
        $value['unique_id']             = $btn_update . $btn_delete;
        $data[]                         = array_values($value);
      }
      $json_array = [
        "draw"        => intval($draw),
        "recordsTotal"     => intval($total_records),
        "recordsFiltered"   => intval($total_records),
        "data"         => $data,
        "testing"      => $result->sql
      ];
    } else {
      print_r($result);
    }
    echo json_encode($json_array);
    break;
  case 'delete':
    $unique_id  = $_POST['unique_id'];
    $delete_where   = [
      "user_type"     => $unique_id
    ];
    $action_obj     = $pdo->delete($table, $delete_where);
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
  case 'sections':
    $main_screen_id        = $_POST['main_screen_id'];
    $section_name_options  = section_name('', $main_screen_id);
    $section_name_options  = select_option($section_name_options, "Select the Screen Section");
    echo $section_name_options;
    break;

  case 'permission_ui':
    $main_screen_id         = $_POST['main_screen'];
    $user_type              = $_POST['user_type'];
    $perm_ui               = user_permission_ui($main_screen_id, $user_type);
    // $section_name_options  = section_name('',$main_screen_id);
    // $section_name_options  = select_option($section_name_options,"Select the Screen Section");
    echo $perm_ui;
    break;
  default:
    break;
}
