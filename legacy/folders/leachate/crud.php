<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "leachate";
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
$qty_leachate       = "";
$is_active          = "";
$description        = "";
$unique_id          = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$remarks            = "";
$test               = ""; // For Developer Testing Purpose

$fileUploadPath = $fileUploadConfig->get("upload_folder");

// Create Folder in root->uploads->(this_folder_name) Before using this file upload
$fileUploadConfig->set("upload_folder", $fileUploadPath . $folder_name . DIRECTORY_SEPARATOR);

// File Upload Library Call
$fileUpload = new Alirdn\SecureUPload\SecureUPload($fileUploadConfig);


switch ($action) {
  case 'createupdate':
    $entry_date       = $_POST["entry_date"];
    $qty_leachate     = $_POST["qty_leachate"];
    $remarks          = $_POST["remarks"];
    $unique_id        = $_POST["unique_id"];
    $update_where     = "";

    if (is_array($_FILES["test_file"]['name'])) {
        if ($_FILES["test_file"]['name'][0] != "") {
        
            $allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'docx', 'doc'];
            $confirm_upload = $fileUpload->uploadFiles("test_file");
    
            $_FILES["test_file"]['file_name'] = [];
    
            if (is_array($confirm_upload)) {
                foreach ($confirm_upload as $c_key => $c_value) {
                    if ($c_value->status == 1) {
                        $c_file_name = $c_value->name ? $c_value->name . "." . $c_value->ext : "";
                        if (!in_array($c_file_name, $_FILES["test_file"]['file_name'])) {
                            array_push($_FILES["test_file"]['file_name'], $c_file_name);
                        }
                    } else {
                        $status = $confirm_upload->status;
                        $data = "file not uploaded";
                        $error = $confirm_upload->error;
                        $sql = "file upload error";
                        $msg = "file_error";
                        break;
                    }
                }
            }
        }
    } else if (!empty($_FILES["test_file"]['name'])) {
        $confirm_upload = $fileUpload->uploadFile("test_file");
        if ($confirm_upload->status == 1) {
            $c_file_name = $confirm_upload->name ? $confirm_upload->name . "." . $confirm_upload->ext : "";
            if (empty($_FILES["test_file"]['file_name'])) {
                $_FILES["test_file"]['file_name'] = $c_file_name;
            }
        } else {
            $status = $confirm_upload->status;
            $data = "file not uploaded";
            $error = $confirm_upload->error;
            $sql = "file upload error";
            $msg = "file_error";
        }
    }
    
    if (is_array($_FILES["test_file"]['file_name'])) {
        $file_names = implode(",", $_FILES["test_file"]['file_name']);
    } else {
        $file_names = $_FILES["test_file"]['file_name'];
    }
    
    if ($file_names) {
        $columns = [
            "entry_date"   => $entry_date,
            "qty_leachate" => $qty_leachate,
            "doc_name"     => $file_names,
            "remarks"      => $remarks,
            "unique_id"    => unique_id($prefix)
        ];
    } else {
        $columns = [
            "entry_date"   => $entry_date,
            "qty_leachate" => $qty_leachate,
            "remarks"      => $remarks,
            "unique_id"    => unique_id()
        ];
    }
    

    // check already Exist Or not

    $table_details      = [
      $table,
      
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
      "entry_date",
      "qty_leachate",
      "doc_name",
      "remarks",
      "unique_id"
    ];

      $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $where ="is_delete = 0";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        $where .= " and entry_date >= '" . $_POST['from_date'] . "' and entry_date <= '" . $_POST['to_date'] . "'";
    }

    $order_by       = "entry_date asc";
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    // print_r($result);
    $total_records  = total_records();
    if ($result->status) {
      $res_array      = $result->data;
      foreach ($res_array as $key => $value) {

        $value['entry_date']       = disdate($value['entry_date']);
        $value['qty_leachate']     = $value['qty_leachate'];
        $value['remarks']          = $value['remarks'];
        $value['doc_name']         = image_view1("leachate", $value['unique_id'], $value['doc_name']);
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

function image_view1($folder_name = "", $unique_id = "", $doc_name = "") {
    $file_names = explode(',', $doc_name);
    $image_view = '';
  
    if ($doc_name) {
        foreach ($file_names as $file_key => $doc_name) {
            if ($file_key != 0) {
                if ($file_key % 4 != 0) {
                    $image_view .= "&nbsp";
                } else {
                    $image_view .= "<br><br>";
                }
            }
  
            $cfile_name = explode('.', $doc_name);
  
            if ($doc_name) {
                $file_extension = strtolower(end($cfile_name));
  
                if (in_array($file_extension, ['jpg', 'png', 'jpeg'])) {
                    $image_view .= '<a href="javascript:print_view(\'uploads/' . $folder_name . '/' . $doc_name . '\')"><img src="uploads/' . $folder_name . '/' . $doc_name . '" height="50px" width="50px"></a>';
                } else if ($file_extension == 'pdf') {
                    $image_view .= '<a href="uploads/' . $folder_name . '/' . $doc_name . '" download><img src="uploads/pdf.png" height="50px" width="50px"></a>';
                } else if (in_array($file_extension, ['xls', 'xlsx'])) {
                    $image_view .= '<a href="uploads/' . $folder_name . '/' . $doc_name . '" download><img src="uploads/excel.png" height="50px" width="50px"></a>';
                } else if (in_array($file_extension, ['txt', 'doc', 'docx'])) {
                    $image_view .= '<a href="uploads/' . $folder_name . '/' . $doc_name . '" download><img src="uploads/word.png" height="50px" width="50px"></a>';
                }
            }
        }
    }
    return $image_view;
  }

?>