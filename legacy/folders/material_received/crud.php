<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "material_received";
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
$qty                = "";
$supplier_name      = "";
$unit               = "";
$item_name          = "";
// $is_active       = "";
$unique_id          = "";
$prefix             = "";

$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose

$fileUploadPath = $fileUploadConfig->get("upload_folder");

// Create Folder in root->uploads->(this_folder_name) Before using this file upload
$fileUploadConfig->set("upload_folder", $fileUploadPath . $folder_name . DIRECTORY_SEPARATOR);

// File Upload Library Call
$fileUpload = new Alirdn\SecureUPload\SecureUPload($fileUploadConfig);

switch ($action) {
  case 'createupdate':
    $date            = $_POST["date"];
    $supplier_name   = $_POST["supplier_name"];
    $label           = $_POST["label"];
    $item_name       = $_POST["item_name"];
    $qty             = $_POST["qty"];
    $unit            = $_POST["unit1"];
    $invoice_no      = !empty($_POST['invoice_no']) ? $_POST['invoice_no'] : null;
    $invoice_date    = !empty($_POST['invoice_date']) ? $_POST['invoice_date'] : null;
    $unique_id       = $_POST["unique_id"];
    $update_where    = "";

    if (is_array($_FILES["test_file"]['name'])) {
        if ($_FILES["test_file"]['name'][0] != "") {
            // Multi file Upload 
            $allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'docx', 'doc'];
            $confirm_upload = $fileUpload->uploadFiles("test_file");
            if (is_array($confirm_upload)) {
                $_FILES["test_file"]['file_name'] = [];
                foreach ($confirm_upload as $c_key => $c_value) {
                    if ($c_value->status == 1) {
                        $c_file_name = $c_value->name ? $c_value->name . "." . $c_value->ext : "";
                        array_push($_FILES["test_file"]['file_name'], $c_file_name);
                    } else {
                        // if Any Error Occured in File Upload Stop the loop
                        $status = $confirm_upload->status;
                        $data = "file not uploaded";
                        $error = $confirm_upload->error;
                        $sql = "file upload error";
                        $msg = "file_error";
                        break;
                    }
                }
            }
        } else if (!empty($_FILES["test_file"]['name'])) { // Single File Upload
            $confirm_upload = $fileUpload->uploadFile("test_file");
            if ($confirm_upload->status == 1) {
                $c_file_name = $confirm_upload->name ? $confirm_upload->name . "." . $confirm_upload->ext : "";
                $_FILES["test_file"]['file_name'] = $c_file_name;
            } else {
                // if Any Error Occured in File Upload Stop the loop
                $status = $confirm_upload->status;
                $data = "file not uploaded";
                $error = $confirm_upload->error;
                $sql = "file upload error";
                $msg = "file_error";
            }
        }
    }

    if (is_array($_FILES["test_file"]['name'])) {
        if ($_FILES["test_file"]['name'][0] != "") {
            $file_names = implode(",", $_FILES["test_file"]['file_name']);
            $file_org_names = implode(",", $_FILES["test_file"]['name']);
        }
    } else if (!empty($_FILES["test_file"]['name'])) {
        $file_names = $_FILES["test_file"]['file_name'];
        $file_org_names = $_FILES["test_file"]['name'];
    }

    // Determine prefix based on the option
    $prefixs = "";
    switch ($item_name) {
        case "6683a7c6460c777119":
            $prefixs = "EGG-$label-";
            break;
        case "6683aa40a597887930":
            $prefixs = "LAR-$label-";
            break;
        default:
            $prefixs = "BAT-$label-"; // default prefix if no option matches
            break;
    }

    if($file_names){
      $columns = [
          "date" => $date,
          "supplier_name" => $supplier_name,
          "item_name" => $item_name,
          "qty" => $qty,
          
          "unit" => $unit,
          "invoice_no" => $invoice_no,
          "invoice_date" => $invoice_date,
          "doc_name" => $file_names,
          // "batch_id" => $bill_no,
          // "unit" => $X,
          "unique_id" => unique_id(),
      ];
    }else{
      $columns = [
        "date" => $date,
        "supplier_name" => $supplier_name,
        "item_name" => $item_name,
        "qty" => $qty,
        "invoice_no" => $invoice_no,
        "invoice_date" => $invoice_date,
        "unit" => $unit,
        // "batch_id" => $bill_no,
        // "unit" => $X,
        "unique_id" => unique_id(),
    ];
    }

    // Check already Exist Or not
    $table_details = [
        $table,
        [
            "COUNT(unique_id) AS count"
        ]
    ];
    $select_where = '(supplier_name = "' . $supplier_name . '" and item_name = "' . $item_name . '") is_delete = 0';
    if ($unique_id) {
        $select_where .= ' AND unique_id !="' . $unique_id . '"';
    } else {
        $bill_no = batch_creation($table, $item_name, $update_where, $prefixs);
        $columns['batch_id'] = $bill_no;
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
            // print_r($action_obj);
        } else {
            $action_obj = $pdo->insert($table, $columns);
            // print_r($action_obj);
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
          "batch_id", 
          "supplier_name",
          "item_name",      
          "qty",
          "unit",
          "invoice_date",
          "invoice_no",
          "doc_name",
          "unique_id",
          "date",   
      ];
      $table_details  = [
          $table . " , (SELECT @a:= " . $start . ") AS a ",
          $columns
      ];
      $where = "is_delete = 0";
  
      if (($_POST['from_date'] != '') && ($_POST['to_date'] != '')) {
          $where .= " and date >= '" . $_POST['from_date'] . "' and date <= '" . $_POST['to_date'] . "'";
      }
      if ($_POST['item_name']) {
          $where .= " and item_name = '" . $_POST['item_name'] . "'";
      }
      if ($_POST['supplier_name']) {
          $where .= " and supplier_name = '" . $_POST['supplier_name'] . "'";
      }
  
      if ($search) {
          $where .= " AND (screen_main_name LIKE '" . mysql_like($search) . "') ";
      }
  
      $order_by       = "batch_id desc";
      $sql_function   = "SQL_CALC_FOUND_ROWS";
      $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
  
      $total_records = total_records();
      if ($result->status) {
          $res_array = $result->data;
          foreach ($res_array as $key => $value) {
            $value['doc_name'] = image_view1("material_received", $value['unique_id'], $value['doc_name']);
            $value['supplier_name'] = disname(supplier_name($value['supplier_name'])[0]['supplier_name']);
            $value['item_name'] = disname(item_name_select($value['item_name'])[0]['item_name']);
            $value['qty'] = ($value['qty']);
            $value['unit'] = disname(unit_name($value['unit'])[0]['unit_name']);

            // Format date and handle null or invalid invoice_date
            $formatted_date = formatDateDMY($value['date']);
            $invoice_date = $value['invoice_date'] ? formatDateDMY($value['invoice_date']) : '-';
            $value['invoice_date'] = $invoice_date;
            $value['batch_id'] = "<b>" . $value['batch_id'] . " </b><br><span style=font-size:12px;>" . $formatted_date . '</span>';
            $current_date = date('d-m-Y');
            $entry_date =  $formatted_date; 

            $entryDate = new DateTime($entry_date);
            $currentDate = new DateTime($current_date);
            $endDate = clone $entryDate;
            $endDate->add(new DateInterval('P6D'));

            $btn_update = '';
            $btn_delete = '';
                      
            if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){
                if ($currentDate == $entryDate) {
                    $btn_update = btn_update($folder_name, $value['unique_id']);
                    $btn_delete = btn_delete($folder_name, $value['unique_id']);
                    
                } elseif ($currentDate >= $entryDate && $currentDate <= $endDate) {
                    $btn_update = btn_update($folder_name, $value['unique_id']);
                    $btn_delete = ''; 
                } else {
                    $btn_update = '';
                    $btn_delete = '';
                }
    
            }

            else {
                $btn_update = btn_update($folder_name, $value['unique_id']);
                $btn_delete = btn_delete($folder_name, $value['unique_id']);
                                                
            }

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

    case 'get_label_name':
 
      $supplier_name = $_POST["supplier_name"];
      // print_r($supplier_name);
      $data = [];
      $table = "supplier_creation";
      $columns = [        
        "label"
      ];
      
      
      $table_details = [
        $table,         
          $columns];
          
      $select_where = "unique_id = '$supplier_name' AND is_active = 1 and is_delete=0 ";
  
      $result = $pdo->select($table_details, $select_where);
      // print_r($result);die();
      if ($result->status) {
          $status = $result->status;
          $data = $result->data;
          $error = "";
          $sql = $result->sql;
          
          
          $label = $data[0]["label"];
          
  
      } else {
          $status = $result->status;
          $data = $result->data;
          $error = "error";
          $sql = $result->sql;
      }
      $json_array   = [
              "status"    => $status,
              "data"      => $data,
              "error"     => $error,
              "msg"       => $msg,
              "sql"       => $sql,
              "label" => $label,
              
          ];
      
        echo json_encode($json_array);
  
      break;
  

    case "unit":
 
      $item_name = $_POST["item_name"];
      $data = [];
      $table = "item_creation";
      $columns = [
          // "unit",
          "(select unit_name FROM unit_creation WHERE unit_creation.unique_id = item_creation.unit) AS unit",
          // $value['unit'] = disname(unit_name($value['unit'])[0]['unit_name']);
          "unit as unit1"
      ];
      
      
      $table_details = [
        $table,
          // "material_received", 
          $columns];
          
      $select_where = "unique_id = '$item_name' AND is_active = 1";
  
      $result = $pdo->select($table_details, $select_where);
  //  print_r($result);die();
      if ($result->status) {
          $status = $result->status;
          $data = $result->data;
          $error = "";
          $sql = $result->sql;
          
          
          $unit = $data[0]['unit'];
          $unit1 = $data[0]['unit1'];
  
      } else {
          $status = $result->status;
          $data = $result->data;
          $error = "error";
          $sql = $result->sql;
      }
      $json_array   = [
              "status"    => $status,
              "data"      => $data,
              "error"     => $error,
              "msg"       => $msg,
              "sql"       => $sql,
              
              "unit" => $unit,
              "unit1" => $unit1,
          ];
      
        echo json_encode($json_array);
  
      break;
  default:
    break;
}





function batch_creation($table_name, $where, $item_name, $prefixs) {
  $driver         = "mysql";
  $host           = "192.168.1.200";
  $username       = "my_root";
  $password       = "my@123456";
  $databasename   = "zigfly_erp";    

  try {
      $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
      return null; // Handle the error appropriately
  }

  // Fetch the last batch ID for the given item_name
  $stmt = $conn->prepare("SELECT * FROM material_received WHERE item_name = :item_name ORDER BY id DESC LIMIT 1");
  $stmt->execute([':item_name' => $item_name]);
  
  // Fetch the results
  if ($pit_query = $stmt->fetch(PDO::FETCH_ASSOC)) {
      // Create new batch ID with the prefix
      $billno = $prefixs;

      // Generate a sequential ID
      $bill_order_no = generate_order_number($table_name, $conn, $prefixs);

      // Append the generated number to the prefix
      $billno .= sprintf("%05d", $bill_order_no);
      return $billno;
  } else {
      // Create new batch ID with the prefix
      $billno = $prefixs;

      // Generate a sequential ID
      $bill_order_no = generate_order_number($table_name, $conn, $prefixs);

      // Append the generated number to the prefix
      $billno .= sprintf("%05d", $bill_order_no);

      return $billno;
  }
}

function generate_order_number($table_name, $conn, $prefix) {
  // Query the database to find the highest existing number for the given prefix and increment it by one
  $stmt = $conn->prepare("SELECT MAX(batch_id) AS max_id FROM $table_name WHERE batch_id LIKE :prefix and is_delete = 0");
  $stmt->execute([':prefix' => $prefix . '%']);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  // Extract the numeric part of the batch_id and increment it
  $max_id = isset($result['max_id']) ? intval(substr($result['max_id'], strlen($prefix))) : 0;
  $new_order_number = $max_id + 1;

  return $new_order_number;
}

function formatDateDMY($date) {
  return date('d-m-Y', strtotime($date));
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