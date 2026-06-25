<?php
// Get folder Name From Current Url
$folder_name = explode("/", $_SERVER['PHP_SELF']);
$folder_name = $folder_name[count($folder_name) - 2];

// Database Table Name
$table = "culling_process";

// Include DB file and Common Functions
include '../../config/dbconfig.php';

$action = $_POST['action'];
$action_obj = (object) [
  "status" => 0,
  "data" => "",
  "error" => "Action Not Performed"
];
$json_array = "";
$sql = "";
$entry_date = "";
$shift_type = "";
$cylinder_type = "";
$cylinder_no = "";
$starting_weight = "";
$ending_weight = "";
$fuel_consumption = "";
$raw_material_weight = "";
$final_larvae_weight = "";
$work_done = "";
$others_remarks = "";
$unique_id = "";
$prefix = "";
$data = "";
$msg = "";
$error = "";
$status = "";
$file_names = "";
$test = "";

$fileUploadPath = $fileUploadConfig->get("upload_folder");
$fileUploadConfig->set("upload_folder", $fileUploadPath . $folder_name . DIRECTORY_SEPARATOR);
$fileUpload = new Alirdn\SecureUPload\SecureUPload($fileUploadConfig);

switch ($action) {
  case 'createupdate':
    $entry_date = $_POST["entry_date"];
    $shift_type = $_POST["shift_type"];
    $cylinder_type = $_POST["cylinder_type"];
    $cylinder_no = $_POST["cylinder_no"];
    $starting_weight = $_POST["starting_weight"];
    $ending_weight = $_POST["ending_weight"];
    $fuel_consumption = $_POST["fuel_consumption"];
    $raw_material_weight = $_POST["raw_material_weight"];
    $final_larvae_weight = $_POST["final_larvae_weight"];
    $work_done = $_POST["work_done"];
    $others_remarks = isset($_POST["others_remarks"]) ? $_POST["others_remarks"] : "";
    $unique_id = $_POST["unique_id"];

    if ($work_done != "3") {
      $others_remarks = "";
    }

    if ($fuel_consumption === "" && $starting_weight !== "" && $ending_weight !== "") {
      $fuel_consumption = number_format(((float) $starting_weight - (float) $ending_weight), 2, '.', '');
    }

    if (isset($_FILES["test_file"]) && is_array($_FILES["test_file"]['name'])) {
      if ($_FILES["test_file"]['name'][0] != "") {
        $confirm_upload = $fileUpload->uploadFiles("test_file");
        if (is_array($confirm_upload)) {
          $_FILES["test_file"]['file_name'] = [];
          foreach ($confirm_upload as $c_value) {
            if ($c_value->status == 1) {
              $c_file_name = $c_value->name ? $c_value->name . "." . $c_value->ext : "";
              array_push($_FILES["test_file"]['file_name'], $c_file_name);
            } else {
              $status = $c_value->status;
              $data = "file not uploaded";
              $error = $c_value->error;
              $sql = "file upload error";
              $msg = "file_error";
              break;
            }
          }
        }
      }
    } else if (isset($_FILES["test_file"]) && !empty($_FILES["test_file"]['name'])) {
      $confirm_upload = $fileUpload->uploadFile("test_file");
      if ($confirm_upload->status == 1) {
        $file_names = $confirm_upload->name ? $confirm_upload->name . "." . $confirm_upload->ext : "";
      } else {
        $status = $confirm_upload->status;
        $data = "file not uploaded";
        $error = $confirm_upload->error;
        $sql = "file upload error";
        $msg = "file_error";
      }
    }

    if (isset($_FILES["test_file"]) && is_array($_FILES["test_file"]['name']) && $_FILES["test_file"]['name'][0] != "") {
      $file_names = implode(",", $_FILES["test_file"]['file_name']);
    }

    $columns = [
      "entry_date" => $entry_date,
      "shift_type" => $shift_type,
      "cylinder_type" => $cylinder_type,
      "cylinder_no" => $cylinder_no,
      "starting_weight" => $starting_weight,
      "ending_weight" => $ending_weight,
      "fuel_consumption" => $fuel_consumption,
      "raw_material_weight" => $raw_material_weight,
      "final_larvae_weight" => $final_larvae_weight,
      "work_done" => $work_done,
      "others_remarks" => $others_remarks,
      "unique_id" => unique_id($prefix)
    ];

    if ($file_names) {
      $columns["image_name"] = $file_names;
    }

    $table_details = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where = 'is_delete = 0';
    $select_where .= ' AND entry_date = "' . $entry_date . '"';
    $select_where .= ' AND shift_type = "' . $shift_type . '"';
    $select_where .= ' AND cylinder_no = "' . $cylinder_no . '"';
    if ($unique_id) {
      $select_where .= ' AND unique_id != "' . $unique_id . '"';
    }

    $action_obj = $pdo->select($table_details, $select_where);
    if ($action_obj->status) {
      $status = $action_obj->status;
      $data = $action_obj->data;
      $error = "";
      $sql = $action_obj->sql;
    } else {
      $status = $action_obj->status;
      $data = $action_obj->data;
      $error = $action_obj->error;
      $sql = $action_obj->sql;
      $msg = "error";
    }

    if ($data[0]["count"]) {
      $msg = "already";
    } else if ($data[0]["count"] == 0) {
      if ($unique_id) {
        unset($columns['unique_id']);
        $update_where = [
          "unique_id" => $unique_id
        ];
        $action_obj = $pdo->update($table, $columns, $update_where);
      } else {
        $action_obj = $pdo->insert($table, $columns);
      }

      if ($action_obj->status) {
        $status = $action_obj->status;
        $data = $action_obj->data;
        $error = "";
        $sql = $action_obj->sql;
        $msg = $unique_id ? "update" : "create";
      } else {
        $status = $action_obj->status;
        $data = $action_obj->data;
        $error = $action_obj->error;
        $sql = $action_obj->sql;
        $msg = "error";
      }
    }

    $json_array = [
      "status" => $status,
      "data" => $data,
      "error" => $error,
      "msg" => $msg,
      "sql" => $sql,
      "test" => $columns
    ];
    echo json_encode($json_array);
    break;

  case 'datatable':
    $search = $_POST['search']['value'];
    $length = $_POST['length'];
    $start = $_POST['start'];
    $draw = $_POST['draw'];
    $limit = $length;
    $data = [];
    if ($length == '-1') {
      $limit = "";
    }

    $columns = [
      "@a:=@a+1 s_no",
      "entry_date",
      "shift_type",
      "cylinder_type",
      "cylinder_no",
      "starting_weight",
      "ending_weight",
      "fuel_consumption",
      "raw_material_weight",
      "final_larvae_weight",
      "work_done",
      "others_remarks",
      "image_name",
      "sess_user_id",
      "unique_id"
    ];

    $shift_options = [
      "1" => ["value" => "Day"],
      "2" => ["value" => "Night"],
      "3" => ["value" => "General"],
    ];

    $cylinder_options = [
      "1" => ["value" => "O2"],
      "2" => ["value" => "LPG"],
      "3" => ["value" => "Other"],
    ];

    $work_done_options = [
      "1" => ["value" => "Cutting"],
      "2" => ["value" => "Heating"],
      "3" => ["value" => "Others"],
    ];

    $table_details = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $where = "is_delete = 0";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
      $where .= " AND DATE(entry_date) >= '" . $_POST['from_date'] . "' AND DATE(entry_date) <= '" . $_POST['to_date'] . "'";
    }
    if (!empty($_POST['shift_type'])) {
      $where .= " AND shift_type = '" . $_POST['shift_type'] . "'";
    }
    if (!empty($_POST['cylinder_type'])) {
      $where .= " AND cylinder_type = '" . $_POST['cylinder_type'] . "'";
    }
    if (!empty($_POST['work_done'])) {
      $where .= " AND work_done = '" . $_POST['work_done'] . "'";
    }

    if (!empty($search)) {
      $where .= " AND (entry_date LIKE '" . mysql_like($search) . "' ";
      $where .= " OR cylinder_no LIKE '" . mysql_like($search) . "' ";
      $where .= " OR starting_weight LIKE '" . mysql_like($search) . "' ";
      $where .= " OR ending_weight LIKE '" . mysql_like($search) . "' ";
      $where .= " OR fuel_consumption LIKE '" . mysql_like($search) . "' ";
      $where .= " OR raw_material_weight LIKE '" . mysql_like($search) . "' ";
      $where .= " OR final_larvae_weight LIKE '" . mysql_like($search) . "' )";
    }

    $order_by = "entry_date DESC";
    $sql_function = "SQL_CALC_FOUND_ROWS";
    $result = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    $total_records = total_records();

    if ($result->status) {
      $res_array = $result->data;
      foreach ($res_array as $value) {
        $value['shift_type'] = isset($shift_options[$value['shift_type']]) ? $shift_options[$value['shift_type']]['value'] : $value['shift_type'];
        $value['cylinder_type'] = isset($cylinder_options[$value['cylinder_type']]) ? $cylinder_options[$value['cylinder_type']]['value'] : $value['cylinder_type'];
        $value['work_done'] = isset($work_done_options[$value['work_done']]) ? $work_done_options[$value['work_done']]['value'] : $value['work_done'];
        $value['others_remarks'] = $value['others_remarks'];
        $value['image_name'] = image_view1($folder_name, $value['image_name']);

        if ($value['sess_user_id'] == '6700f08395b9e81382') {
          $value['sess_user_id'] = "Karthi";
        } else {
          $value['sess_user_id'] = disname(staff($value['sess_user_id'])[0]['user_name']);
        }

        $btn_update = btn_update($folder_name, $value['unique_id']);
        $btn_delete = btn_delete($folder_name, $value['unique_id']);
        $value['unique_id'] = $btn_update . $btn_delete;
        $data[] = array_values($value);
      }
      $json_array = [
        "draw" => intval($draw),
        "recordsTotal" => intval($total_records),
        "recordsFiltered" => intval($total_records),
        "data" => $data,
        "testing" => $result->sql
      ];
    } else {
      print_r($result);
    }
    echo json_encode($json_array);
    break;

  case 'delete':
    $unique_id = $_POST['unique_id'];
    $columns = [
      "is_delete" => 1,
    ];
    $update_where = [
      "unique_id" => $unique_id
    ];
    $action_obj = $pdo->update($table, $columns, $update_where);
    if ($action_obj->status) {
      $status = $action_obj->status;
      $data = $action_obj->data;
      $error = "";
      $sql = $action_obj->sql;
      $msg = "success_delete";
    } else {
      $status = $action_obj->status;
      $data = $action_obj->data;
      $error = $action_obj->error;
      $sql = $action_obj->sql;
      $msg = "error";
    }
    $json_array = [
      "status" => $status,
      "data" => $data,
      "error" => $error,
      "msg" => $msg,
      "sql" => $sql
    ];
    echo json_encode($json_array);
    break;

  default:
    break;
}

function image_view1($folder_name = "", $image_name = "")
{
  $file_names = explode(',', $image_name);
  $image_view = '';

  if ($image_name) {
    foreach ($file_names as $file_key => $image_name) {
      if ($file_key != 0) {
        if ($file_key % 4 != 0) {
          $image_view .= "&nbsp";
        } else {
          $image_view .= "<br><br>";
        }
      }

      $cfile_name = explode('.', $image_name);
      if ($image_name && isset($cfile_name[1])) {
        if (($cfile_name[1] == 'jpg') || ($cfile_name[1] == 'png') || ($cfile_name[1] == 'jpeg')) {
          $image_view .= '<a href="javascript:print_view(\'' . $image_name . '\')"><img src="uploads/' . $folder_name . '/' . $image_name . '" height="50px" width="50px"></a>';
        } else if ($cfile_name[1] == 'pdf') {
          $image_view .= '<a href="javascript:print_view(\'' . $image_name . '\')"><img src="uploads/pdf.png" height="50px" width="50px"></a>';
        } else if (($cfile_name[1] == 'xls') || ($cfile_name[1] == 'xlsx')) {
          $image_view .= '<a href="javascript:print_view(\'' . $image_name . '\')"><img src="uploads/excel.png" height="50px" width="50px"></a>';
        } else if (($cfile_name[1] == 'txt') || ($cfile_name[1] == 'docx') || ($cfile_name[1] == 'doc')) {
          $image_view .= '<a href="javascript:print_view(\'' . $image_name . '\')"><img src="uploads/word.png" height="50px" width="50px"></a>';
        }
      }
    }
  }

  return $image_view;
}
?>
