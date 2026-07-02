<?php
// Get folder Name From Current Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "egg_process";
$table1            = "egg_process_sublist";
$table2            = "material_received";
$table3            = "tray_creation";

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
$staff_name         = "";
$tot_qty            = "";
$chick_feed         = "";
$water              = "";
$item_name          = "";
$tray_utilized      = "";
$pit_id             = "";
$batch_id           = "";
$form_unique_id     = "";
$unique_id          = "";
$screen_unique_id   = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose

switch ($action) {
  
    
    case 'datatable': 
    
      $table4 =  "egg_process ep 
      LEFT JOIN status_update su ON ep.batch_id = su.batch_id AND su.is_delete = 0
      left JOIN pit_status ps ON ep.batch_id = ps.batch_id and ps.is_delete=0";
      
  
      // DataTable Variables
      $search     = $_POST['search']['value'];
      $length     = $_POST['length'];
      $start      = $_POST['start'];
      $draw       = $_POST['draw'];
      $limit      = $length;
      $data       = [];
      if ($length == '-1') {
        $limit = "";
      }
  
      // Query Variables
      $json_array = "";
      $columns = [
        "@a:=@a+1 s_no",
        "ep.entry_date",
        // "ep.supplier_name",
        "(select batch_id from material_received where material_received.unique_id=ep.batch_id) as batch_id",
        
        "ep.tot_qty",
        "ep.tray_utilized",
        "(SELECT 
       GROUP_CONCAT(
          CONCAT(
              ic.item_name,' ',             
              epa.item_qty, 
              CASE 
                  WHEN ic.unique_id = '66a7954fcaf3b34759' THEN ' (ltr'
                  ELSE ' (kg'
              END, 
              ') '
          ) 
          SEPARATOR '  , '
      )
    FROM 
        egg_process_addon epa
    JOIN 
        item_creation ic 
    ON 
        epa.item_name = ic.unique_id
    WHERE 
        epa.screen_unique_id = ep.screen_unique_id
    ) AS item_details",    
        "su.day as egg_cycle",
        "ps.pit_id",
        "ps.larvae_qty_in",
        "(SELECT doc_name from material_received mr where mr.unique_id = ep.batch_id) as doc_name",
        // "su.hatching_status",
        "(SELECT max(su.hatching_status)as  hatching_status
          FROM status_update su 
          WHERE su.batch_id = ep.batch_id and is_delete=0
          ORDER BY su.entry_date DESC 
          LIMIT 1
        ) AS hatching_status",
         "(select entry_date from status_update where status_update.batch_id = ep.batch_id limit 1) as end_date",
        "ep.unique_id",
      ];
      $table_details = [
        $table4 . " , (SELECT @a:= " . $start . ") AS a ",
        $columns
      ];
      if (($_POST['from_date'] != '') && ($_POST['to_date'] != '')) {
        $where .= " ep.entry_date >= '" . $_POST['from_date'] . "' AND ep.entry_date <= '" . $_POST['to_date'] . "'";
    }
    if ($_POST['batch_id']) {
        $where .= " AND ep.batch_id = '" . $_POST['batch_id'] . "'";
    }
    if ($_POST['supplier_name']) {
        $where .= " AND ep.supplier_name = '" . $_POST['supplier_name'] . "'";
    }

    $order_by = "batch_id desc";

    if ($_POST['search']['value']) {         
        $where .= " AND (ps.pit_id LIKE '".pit_id(($_POST['search']['value']))."' )";
        $where .= " OR ep.batch_id LIKE '%" . batch_search(($_POST['search']['value']) ). "%'";
        $where .= " OR ep.supplier_name LIKE '%" .supplier_id(($_POST['search']['value'] )). "%'";
    }              

    $where .= " and ep.is_delete = 0  GROUP BY ep.batch_id";

    $sql_function = "SQL_CALC_FOUND_ROWS";
    $result = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);

    // print_r($result );
    $s_no = 1;
    $total_records = total_records();

    if ($result->status) {
      $res_array = $result->data;
      $s_no = $start + 1;
      foreach ($res_array as $key => $value) {
        $value['s_no'] = $s_no;
            $s_no++;
            switch ($value['hatching_status']) {
              case 1:
                $hatching_status = "<span style='color: red;'>Progressing</span>";
                break;
              case 2:
                $hatching_status = "<span style='color: green;'>Completed</span>";
                break;
              default:
                $hatching_status = "<span style='color: red;'>Progressing</span>";
            }

        // $value['entry_date']         = disdate($value['entry_date']);
        if($value['hatching_status']=='2'){
          $value['entry_date']         = disdate($value['entry_date']) . '/<br>' . '<strong>' . disdate($value['end_date']). '</strong>';
          }
          else{
            $value['entry_date']         = disdate($value['entry_date']);
          }
        $value['supplier_name']      = disname(supplier_name($value['supplier_name'])[0]['supplier_name']);
        $value['hatching_status']    = $hatching_status;
        
        if(empty($value['egg_cycle'])){
          $value['egg_cycle'] = (new DateTime())->diff(new DateTime($value['entry_date']))->days;
        }
        else{
          $value['egg_cycle']          = $value['egg_cycle'];
        }

        if($value['larvae_qty_in']){
          $value['larvae_qty_in'] = round($value['larvae_qty_in'],1);
        } else{
          $value['larvae_qty_in'] = '-';
        }

        $value['doc_name'] = image_view1("material_received", $value['unique_id'], $value['doc_name']);

        if(!empty($value['pit_id']))
        {
        $value['pit_id']             = pit_name($value['pit_id'])[0]['pit_name'];
        }
        else{
          $value['pit_id']="-";
        }


        $value['unique_id']          = $btn_update . $btn_delete;
        $data[]                      = array_values($value);
      }

      $json_array = [
        "draw"             => intval($draw),
        "recordsTotal"     => intval($total_records),
        "recordsFiltered"  => intval($total_records),
        "data"             => $data,
        "testing"          => $result->sql
      ];
    
    } else {
      print_r($result);
    
    }
    
    echo json_encode($json_array);
    break;

  case "problem":

    $ticket_no = $_POST["ticket_no"];
    $data      = [];
    $table     = "material_received";
    $columns   = [
      "qty",
      "(SELECT supplier_name FROM supplier_creation WHERE supplier_creation.unique_id = $table.supplier_name) AS supplier_name",
    
    ];
  
  
    $table_details = [
      $table, 
      $columns
    ];
      
  $select_where = "unique_id = '$ticket_no' AND is_active = 1";

  $result = $pdo->select($table_details, $select_where);
  //print_r( $result);die();
  if ($result->status) {
      $status        = $result->status;
      $data          = $result->data;
      $error         = "";
      $sql           = $result->sql;
      
      $qty           = $data[0]['qty'];
      $supplier_name = $data[0]['supplier_name'];

  } else {
      $status     = $result->status;
      $data       = $result->data;
      $error      = "error";
      $sql        = $result->sql;
  }
  $json_array   = [
    
    "status"    => $status,
    "data"      => $data,
    "error"     => $error,
    "msg"       => $msg,
    "sql"       => $sql,
    "tot_qty"   => $qty,
    "supplier_name" => $supplier_name,
  ];
  
  echo json_encode($json_array);
  break;
      
  case "supplier":

    $ticket_no = $_POST["ticket_no"];
    $data      = [];
    $columns   = [
        "unique_id",
        "supplier_name"
    ];
    
    
    $table_details = [
        "supplier_creation", 
        $columns
      ];
        
    $select_where = "unique_id = '$ticket_no' AND is_active = 1";

    $result = $pdo->select($table_details, $select_where);
    //print_r($result);die();
    if ($result->status) {
        $status     = $result->status;
        $data       = $result->data;
        $error      = "";
        $sql        = $result->sql;
        
        $supplier_name = $data[0]['supplier_name'];

    } else {
        $status     = $result->status;
        $data       = $result->data;
        $error      = "error";
        $sql        = $result->sql;
    }
    $json_array   = [
      "status"        => $status,
      "data"          => $data,
      "error"         => $error,
      "msg"           => $msg,
      "sql"           => $sql,
      "supplier_name" => $supplier_name,
    ];
    
    echo json_encode($json_array);
    break;
        
        
  case 'delete':
    $unique_id        = $_POST['unique_id'];
    $batch_id         = $_POST['batch_id'];
    $checkedvalue     = $_POST['checkedvalue'];
    // print_r($unique_id);
    $tray_no          = explode(',', $checkedvalue);
    // print_r($tray_no);

    $columns = [
      "is_delete" => 1,
    ];
    $column2 = [
      "batch_status" => '0',
    ];
    $column3 = [
      "batch_id" => '',
      "tray_status" => '0',
    ];

    $update_where   = [
      "unique_id" => $unique_id
    ];
    $update_where2   = [
      "unique_id" => $batch_id
    ];
    
    $action_obj  = $pdo->update($table, $columns, $update_where); 
    $action_obj  = $pdo->update($table2, $column2, $update_where2); // material_received table

    foreach ($tray_no as $tray1) {
    $update_where3 = [            
      "unique_id" => $tray1
    ];  
    
    $action_obj  = $pdo->update($table3, $column3, $update_where3); //---tray_creation
    // print_r( $action_obj);
    
    }
    
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
    
    case "sub_add_update":
    $host     = '192.168.1.22'; 
    $dbname   = 'zigma_bsf'; 
    $username = 'my_root'; 
    $password = 'my@123456'; 

    try {
      $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
      // Set the PDO error mode to exception
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      // echo "Connected successfully";
    } catch (PDOException $e) {
      // echo "Connection failed: " . $e->getMessage();
    }

    $entry_date       = $_POST["entry_date"];
    $staff_name       = $_POST["staff_name"];
    $tot_qty          = $_POST["tot_qty"];
    $tray_utilized    = $_POST["tray_utilized"];
    $batch_id         = $_POST["batch_id"];
    $checkedvalue     = $_POST["checkedvalue"];
    $unique_id        = $_POST["unique_id"];
    $screen_unique_id = $_POST["screen_unique_id"];

    // Check if records with the given screen_unique_id already exist
    $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM egg_process_sublist WHERE screen_unique_id = :screen_unique_id");
    $stmt_check -> bindParam(':screen_unique_id', $screen_unique_id);
    $stmt_check -> execute();
    $count = $stmt_check -> fetchColumn();

    if ($count > 0) {
        // Delete existing records with the given screen_unique_id
        $stmt_delete = $pdo->prepare("DELETE FROM egg_process_sublist WHERE screen_unique_id = :screen_unique_id");
        $stmt_delete -> bindParam(':screen_unique_id', $screen_unique_id);
        $stmt_delete -> execute();
    }

    // Update tray_creation where batch_id is present
    $stmt_update_existing_trays = $pdo->prepare("UPDATE tray_creation SET batch_id = '', tray_status = '0' WHERE batch_id = :batch_id");
    $stmt_update_existing_trays -> bindParam(':batch_id', $batch_id);
    $stmt_update_existing_trays -> execute();

    $tray_no = explode(",", $checkedvalue);
    foreach ($tray_no as $tray_exp) {
      if ($tray_exp) {
        // Generate a new unique_id for each tray
        $unique_id = unique_id($prefix);

        // Prepare and execute the insert statement
        $stmt_insert = $pdo->prepare("INSERT INTO egg_process_sublist (entry_date, staff_name, tot_qty, tray_utilized, batch_id, tray_unique_id, unique_id, screen_unique_id) VALUES (:entry_date, :staff_name, :tot_qty, :tray_utilized, :batch_id, :tray_exp, :unique_id, :screen_unique_id)");
        $stmt_insert -> bindParam(':entry_date', $entry_date);
        $stmt_insert -> bindParam(':staff_name', $staff_name);
        $stmt_insert -> bindParam(':tot_qty', $tot_qty);
        $stmt_insert -> bindParam(':tray_utilized', $tray_utilized);
        $stmt_insert -> bindParam(':batch_id', $batch_id);
        $stmt_insert -> bindParam(':tray_exp', $tray_exp);
        $stmt_insert -> bindParam(':unique_id', $unique_id);
        $stmt_insert -> bindParam(':screen_unique_id', $screen_unique_id);

        if ($stmt_insert->execute()) {
            // Update tray_creation table
          $stmt_update_tray = $pdo->prepare("UPDATE tray_creation SET tray_status = 1, batch_id = :batch_id WHERE unique_id = :unique_id");
          $stmt_update_tray -> bindParam(':batch_id', $batch_id);
          $stmt_update_tray -> bindParam(':unique_id', $tray_exp);
          $stmt_update_tray -> execute();
          $msg = 'insert';
      } else {
          $msg = "error";
      }
    }
  }

  $json_array = ["msg" => $msg];
  echo json_encode($json_array);
  break;
  
  default:
  break;

  case 'delete':
  $unique_id  = $_POST['unique_id'];
  $columns = [
    "is_delete" => 1,
  ];
  $update_where = [
    "unique_id" => $unique_id
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
          
  case "sub_add_on":

  $host     = '192.168.1.22'; 
  $dbname   = 'zigma_bsf'; 
  $username = 'my_root'; 
  $password = 'my@123456';

  try {
      $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
      // Set the PDO error mode to exception
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      // echo "Connected successfully";
  } catch (PDOException $e) {
      // echo "Connection failed: " . $e->getMessage();
  }

  $entry_date       = $_POST["entry_date"];
  $staff_name       = $_POST["staff_name"];
  $tot_qty          = $_POST["tot_qty"];
  $batch_id         = $_POST["batch_id"];
  $screen_unique_id = $_POST["screen_unique_id"];
  $item_names       = $_POST["item_names"];
  $checkedvalues    = $_POST["checkedvalues"];
  $msg              = 'error'; // default message in case of failure

  // Loop through each pair of item_name and checkedvalue
  foreach ($item_names as $index => $single_item_name) {
    $tray_exp = $checkedvalues[$index];

    if ($tray_exp) {
      $unique_id = unique_id($prefix);

      $stmt = $pdo->prepare("INSERT INTO egg_process_addon(entry_date, staff_name, tot_qty, item_name, batch_id, item_qty, unique_id, screen_unique_id) VALUES (:entry_date, :staff_name, :tot_qty, :item_name, :batch_id, :tray_exp, :unique_id, :screen_unique_id)");
      $stmt->bindParam(':entry_date', $entry_date);
      $stmt->bindParam(':staff_name', $staff_name);
      $stmt->bindParam(':tot_qty', $tot_qty);
      $stmt->bindParam(':item_name', $single_item_name);
      $stmt->bindParam(':batch_id', $batch_id);
      $stmt->bindParam(':tray_exp', $tray_exp);
      $stmt->bindParam(':unique_id', $unique_id);
      $stmt->bindParam(':screen_unique_id', $screen_unique_id);
  
        if ($stmt->execute()) {
          $msg = 'insert';
        }
    }
  }

    $json_array = [
    "msg" => $msg
    ];
    echo json_encode($json_array);

    break;
  }
  function btn_delete_egg($folder_name = "", $unique_id = "", $batch_id = "", $tray_no = "") {

  $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\', \''.$batch_id.'\', \''.$tray_no.'\')">
        <i class="mdi mdi-delete mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';
  return $final_str;
  }



  function batch_creation($table_name, $where, $prefixs) {
    $driver         = "mysql";
    $host           = "192.168.1.22";
    $username       = "my_root";
    $password       = "my@123456";
    $databasename   = "zigma_bsf";    

    try {
      $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
      return null; // Handle the error appropriately
    }

    // Fetch the last batch ID for the given item_name
    $stmt = $conn->prepare("SELECT * FROM egg_process");
    $stmt->execute();

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
  $stmt = $conn->prepare("SELECT MAX(entry_no) AS max_id FROM $table_name WHERE entry_no LIKE :prefix");
  $stmt->execute([':prefix' => $prefix . '%']);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  // Extract the numeric part of the entry_no and increment it
  $max_id = isset($result['max_id']) ? intval(substr($result['max_id'], strlen($prefix))) : 0;
  $new_order_number = $max_id + 1;

  return $new_order_number;
}
  
function get_egg_cycle($batch_id) {
  global $pdo;

  $table_name    = "status_update";
  $where         = [];
  $table_columns = [
    // "unique_id",
      "day"
  ];

  $table_details = [
  $table_name,
  $table_columns
  ];

  $where = "is_delete = 0 and batch_id = '" . $batch_id . "'";

  $egg_cycle_list = $pdo->select($table_details, $where);
  // print_r($egg_cycle_list);
  if ($egg_cycle_list->status && count($egg_cycle_list->data) > 0) {
      return $egg_cycle_list->data[0]['day'];
  } else {
      return "";
  }
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