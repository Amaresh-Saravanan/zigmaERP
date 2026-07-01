<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table              = "rejects_image_upload";
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
$date               = "";
$type               = "";
$drying_method      = "";
$quantity           = "";
$qty_manure         = "";
$is_active          = "";
$unique_id          = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose
$fileUploadPath = $fileUploadConfig->get("upload_folder");
$fileUploadConfig->set("upload_folder", $fileUploadPath . $folder_name . DIRECTORY_SEPARATOR);
$fileUpload = new Alirdn\SecureUPload\SecureUPload($fileUploadConfig);

switch ($action) {
  case 'createupdate':
    $date               = $_POST["entry_date"];
    $ticket_number              = $_POST["ticket_number"];
    // $type = isset($_POST['type']) ? $_POST['type'] : null;
    $vehicle_number      = $_POST["vehicle_number"];
    $net_weight           = $_POST["net_weight"];
    $weigh_date         = $_POST["weigh_date"];
    $unique_id          = $_POST["unique_id"];
    $existing_image = "";
if ($unique_id) {
    $table_details = ["rejects_image_upload", ["image"]];
    $where = ["unique_id" => $unique_id];
    $result = $pdo->select($table_details, $where);

    if ($result->status && !empty($result->data)) {
        $existing_image = $result->data[0]['image']; // Get the current image names from the database
    }
}

// Handle the file upload or use the existing image
if (is_array($_FILES["test_file"]['name']) && $_FILES["test_file"]['name'][0] != "") {
    // Handle multi-file upload
    $allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'docx', 'doc'];
    $confirm_upload = $fileUpload->uploadFiles("test_file");

    if (is_array($confirm_upload)) {
        $_FILES["test_file"]['file_name'] = [];
        foreach ($confirm_upload as $c_key => $c_value) {
            if ($c_value->status == 1) {
                $c_file_name = $c_value->name ? $c_value->name . "." . $c_value->ext : "";
                array_push($_FILES["test_file"]['file_name'], $c_file_name);
            } else {
                $error = $confirm_upload->error;
                $msg = "file_error";
                break;
            }
        }
    }
    $file_names = implode(",", $_FILES["test_file"]['file_name']); // Use uploaded file names
} else {
    $file_names = $existing_image; // Use existing image if no new file uploaded
}


if (!$unique_id && $file_names) {
  // No unique_id and file name is present, insert new record
  $columns = [
      "date" => $date,
      "ticket_no" => $ticket_number,
      "image" => $file_names,
      "net_weight" => $net_weight,
      "vehicle_number" => $vehicle_number,
      "weigh_date" => $weigh_date,
      "unique_id" => unique_id() // Generate a new unique ID weigh_date
  ];
} elseif ($unique_id && $file_names) {
  // unique_id and file name are both present, update record with unique_id
  $columns = [
      "date" => $date,
      "ticket_no" => $ticket_number,
      "net_weight" => $net_weight,
      "vehicle_number" => $vehicle_number,
      "weigh_date" => $weigh_date,
      "image" => $file_names,
      "unique_id" => $unique_id // Use provided unique ID
  ];
} elseif ($unique_id && !$file_names) {
  // unique_id is present but no file name, use existing image
  $columns = [
      "date" => $date,
      "ticket_no" => $ticket_number,
      "net_weight" => $net_weight,
      "vehicle_number" => $vehicle_number,
      "weigh_date" => $weigh_date,
      "image" => $existing_image, // Use the existing image
      "unique_id" => $unique_id // Use provided unique ID
  ];
}
    // Check if the entry already exists
    $table_details = [
        $table,
        // ["COUNT(unique_id) AS count"]
    ];
    $select_where = 'is_delete = 0';
    if ($unique_id) {
        $select_where .= ' AND unique_id != "' . $unique_id . '"';
    }

    // Including quantity in the check to avoid duplications based on it
    // $select_where .= ' AND quantity = "' . $quantity . '"';

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
        // Update Begins
        if ($unique_id) {
            unset($columns['unique_id']);
            $update_where = [
                "unique_id" => $unique_id
            ];
            $action_obj = $pdo->update($table, $columns, $update_where);
        } else {
            // Insert Begins            
            $action_obj = $pdo->insert($table, $columns);
        }
        // print_r($action_obj);
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
      "date",
      "ticket_no",
      "weigh_date",
      "vehicle_number",
      "net_weight",
      // "weigh_date",
      // "vehicle_number",
      "image",
      "unique_id"
    ];
    // $type_options        = [
    //     "1" => [
    //         "unique_id" => "1",
    //         "value"     => "In",
    //     ],
    //     "2" => [
    //         "unique_id" => "2",
    //         "value"     => "Out",
    //     ],
    // ];

    // $method_options        = [
    //   "1" => [
    //         "unique_id" => "1",
    //         "value"     => "Solar",
    //   ],
    //   "2" => [
    //        "unique_id" => "2",
    //        "value"     => "Electric",
    //   ],
    // ];


    $table_details  = [
        $table . " , (SELECT @a:= " . $start . ") AS a ",
        $columns
    ];
    $where          = "is_delete = 0";

    if (!empty($search)) {
      $where .= " AND (ticket_no LIKE '" . mysql_like($search) . "' ) ";
  }
    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        // $where .= " and date>='" . $_POST['from_date'] . "' and date<='" . $_POST['to_date'] . "'";
        $where .= " and DATE(date) >= '" . $_POST['from_date'] . "' and DATE(date) <= '" . $_POST['to_date'] . "'";

    }
    // if (!empty($_POST['type'])) {
    //     $where .= " and type='" . $_POST['type'] . "'";
    // }
    // if (!empty($_POST['drying_method'])) {
    //   $where .= " and drying_method ='" . $_POST['drying_method'] . "'";
    // }
    $order_by       = "";

    $search1 = $_POST['search']['value'];
    $search = strtolower($search1);

    // if ($search == 's' || $search == 'so' || $search == 'sol' || $search == 'sola' || $search == 'solar') {        
    //     $where .= " AND drying_method ='1'";
    // } else if(!empty($search)){
    //     $where .= " AND drying_method ='2'";
    // }

    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    // print_r($result);
    $total_records  = total_records();
    if ($result->status) {
        $res_array      = $result->data;
        foreach ($res_array as $key => $value) {
            // $value['date'] = disdate($value['date']);
            $value['date'] = $value['date'];
            if (isset($value['net_weight'])) {
              $value['net_weight'] = $value['net_weight'] / 1000; // Divide the net weight by 1000
          }

            // $type_value = $type_options[$value['type']]['value'];
            // $value['type'] = $type_value;

            // $drying_method = $method_options[$value['drying_method']]['value'];
            // $value['drying_method'] = $drying_method;

            $value['image'] = image_view1("rejects_image_upload", $value['unique_id'], $value['image']);

            
            $btn_update = btn_update($folder_name, $value['unique_id']);
            $btn_delete = btn_delete($folder_name, $value['unique_id']);
            $value['unique_id'] = $btn_update . $btn_delete;
            $data[] = array_values($value);
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
function image_view1($folder_name = "", $unique_id = "", $image_name = ""){
  // print_r($image_name);
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
      // print_r($cfile_name);
      if ($image_name) {
        if (($cfile_name[1] == 'jpg') || ($cfile_name[1] == 'png') || ($cfile_name[1] == 'jpeg')) {
          $image_view .= '<a href="javascript:print_view(\'/' . $image_name . '\')"><img src="uploads/' . $folder_name . '/' . $image_name . '"  height="50px" width="50px" ></a>';
          // $image_view .= '<img src="uploads/'.$folder_name.'/'.$image_name.'"  height="50px" width="50px" >';
        } else if ($cfile_name[1] == 'pdf') {
          $image_view .= '<a href="javascript:print(\'/' . $image_name . '\')"><img src="uploads/pdf.png"  height="50px" width="50px" ></a>';
        } else if (($cfile_name[1] == 'pdf') || ($cfile_name[1] == 'xls') || ($cfile_name[1] == 'xlsx')) {
          $image_view .= '<a href="javascript:print(\'/' . $image_name . '\')"><img src="uploads/excel.png"  height="50px" width="50px" ></a>';
        } else if (($cfile_name[1] == 'txt') || ($cfile_name[1] == 'docx') || ($cfile_name[1] == 'doc')) {
          $image_view .= '<a href="javascript:print(\'/' . $image_name . '\')"><img src="uploads/word.png"  height="50px" width="50px" ></a>';
        }
      }

    }
  }
  // print_r($image_view);    
  return $image_view;
}