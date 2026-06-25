<?php
// Get folder Name From Currnent Url
$folder_name        = explode('/', $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = 'pit_creation';
// Include DB file and Common Functions
include '../../config/dbconfig.php';
// Variables Declaration
$action             = $_POST['action'];
$action_obj         = (object) [
  'status'    => 0,
  'data'      => '',
  'error'     => 'Action Not Performed'
];
$json_array         = '';
$sql                = '';
$pit_name           = '';
$location           = '';
$is_active          = '';
$description        = '';
$length             = "";
$width              = "";
$height             = "";
$volume             = "";
$unique_id          = '';
$prefix             = '';
$data               = '';
$msg                = '';
$error              = '';
$status             = '';
$test               = '';
// For Developer Testing Purpose
switch ($action) {
  case 'createupdate':
    $pit_name       = $_POST['pit_name'];
    $location       = $_POST['location'];
    $description    = $_POST['description'];
    $length         = $_POST['length'];
    $width          = $_POST['width'];
    $height         = $_POST['height'];
    $volume         = $_POST['volume'];
    $is_active      = $_POST['active_status'];
    $unique_id      = $_POST['unique_id'];
    $update_where       = '';
    $columns            = [
      'pit_name'     => $pit_name,
      'location'     => $location,
      'length'       => $length,
      'width'        => $width,
      'height'       => $height,
      'volume'       => $volume,
      'is_active'    => $is_active,
      'description'  => $description,
      'unique_id'    => unique_id($prefix)
    ];
    // check already Exist Or not
    $table_details      = [
      $table,
      [
        'COUNT(unique_id) AS count'
      ]
    ];
    $select_where       = '(pit_name = "' . $pit_name . '") AND is_delete = 0  ';
    // When Update Check without current id
    if ($unique_id) {
      $select_where   .= ' AND unique_id !="' . $unique_id . '" ';
    }
    $action_obj         = $pdo->select($table_details, $select_where);
    if ($action_obj->status) {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = '';
      $sql        = $action_obj->sql;
    } else {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = $action_obj->error;
      $sql        = $action_obj->sql;
      $msg        = 'error';
    }
    if ($data[0]['count']) {
      $msg        = 'already';
    } else if ($data[0]['count'] == 0) {
      // Update Begins
      if ($unique_id) {
        unset($columns['unique_id']);
        $update_where   = [
          'unique_id'     => $unique_id
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
        $error      = '';
        $sql        = $action_obj->sql;
        if ($unique_id) {
          $msg        = 'update';
        } else {
          $msg        = 'create';
        }
      } else {
        $status     = $action_obj->status;
        $data       = $action_obj->data;
        $error      = $action_obj->error;
        $sql        = $action_obj->sql;
        $msg        = 'error';
      }
    }
    $json_array   = [
      'status'    => $status,
      'data'      => $data,
      'error'     => $error,
      'msg'       => $msg,
      'sql'       => $sql,
      'test'      => $columns
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
      $limit  = '';
    }
    // Query Variables
    $json_array     = '';
    $columns        = [
      '@a:=@a+1 s_no',
      'pit_name',
      // '(SELECT type_name FROM user_screen_type AS ust WHERE ust.unique_id = '.$table.'.screen_type_unique_id ) AS screen_type',
      'location',
      "volume",
      'description',
      'is_active',
      'unique_id as qr_code',
      'unique_id'
    ];
    $table_details  = [
      $table . ' , (SELECT @a:= ' . $start . ') AS a ',
      $columns
    ];
    $where          = 'is_delete = 0';
    if ($_POST['search']['value']) {
      $where .= " AND (pit_name LIKE '" . mysql_like($_POST['search']['value']) . "' ) ";
    }
    $order_by       = '';
    $sql_function   = 'SQL_CALC_FOUND_ROWS';
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {
        $value['pit_name']  = disname($value['pit_name']);
        $value[ 'location' ]       = disname( $value[ 'location' ] );
        $value[ 'description' ]       = ($value[ 'description']);
        $value['is_active']         = is_active_show($value['is_active']);
        $btn_qr = btn_qr_print($folder_name, $value['unique_id'], "qr_generator.php");
       // $value['qr_code']    = '<span class="mdi mdi-qrcode-scan mdi-24px"></span>';
        $value['qr_code']    = $btn_qr;
         $btn_update                 = btn_update($folder_name, $value['unique_id']);
        $btn_delete                 = btn_delete($folder_name, $value['unique_id']);
        $value['unique_id']         = $btn_update . $btn_delete;
        $data[]                     = array_values($value);
      }
      $json_array = [
        'draw'              => intval($draw),
        'recordsTotal'      => intval($total_records),
        'recordsFiltered'   => intval($total_records),
        'data'              => $data,
        'testing'           => $result->sql
      ];
    } else {
      print_r($result);
    }
    echo json_encode($json_array);
    break;
  case 'delete':
    $unique_id  = $_POST['unique_id'];
    $columns            = [
      'is_delete'   => 1,
    ];
    $update_where   = [
      'unique_id'     => $unique_id
    ];
    $action_obj     = $pdo->update($table, $columns, $update_where);
    if ($action_obj->status) {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = '';
      $sql        = $action_obj->sql;
      $msg        = 'success_delete';
    } else {
      $status     = $action_obj->status;
      $data       = $action_obj->data;
      $error      = $action_obj->error;
      $sql        = $action_obj->sql;
      $msg        = 'error';
    }
    $json_array   = [
      'status'    => $status,
      'data'      => $data,
      'error'     => $error,
      'msg'       => $msg,
      'sql'       => $sql
    ];
    echo json_encode($json_array);
    break;
  default:
    break;
}
