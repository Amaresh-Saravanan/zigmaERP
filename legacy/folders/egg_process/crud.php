<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "egg_process";
$table1            = "egg_process_sublist";
$table2            = "material_received";
$table3            = "tray_creation";
$table4            = "egg_process_addon";
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
$tray_qty           = "";  
$batch_id           = "";
$entry_no           = "";

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
  case 'createupdate':
    $entry_date       = $_POST["entry_date"];
    $staff_name       = $_POST["staff_name"];
    $supplier_name    = $_POST["supplier_name1"];
    $tot_qty          = $_POST["tot_qty"];
    $tray_utilized    = $_POST["tray_utilized"];
    $batch_id         = $_POST["batch_id_hidden"];
    $screen_unique_id = $_POST["screen_unique_id"];
    $checkedvalue     = $_POST["checkedvalue"];
    $entry_no         = $_POST["entry_no"]; 
    $unique_id        = $_POST["unique_id"];
    $update_where     = "";
    $prefix           = 'EPC-';

    if (!$unique_id) {
      $entry_no = batch_creation($table, $update_where, $prefix);
  } else {
      $entry_no = $_POST["entry_no"];
  }
    $columns = [
      "entry_date"         => $entry_date,
      "staff_name"         => $staff_name,
      "supplier_name"      => $supplier_name,
      "tot_qty"            => $tot_qty,
      "tray_utilized"      => $tray_utilized,
      "batch_id"           => $batch_id,
      "checkedvalue"       => $checkedvalue,
      "screen_unique_id"   => $screen_unique_id, 
      "entry_no"           => $entry_no, // Include entry_no in columns
      "unique_id"          => unique_id()
  ];
    $column2            = [
      "batch_status"          => '1',
      
    ];
    // check already Exist Or not
    $table_details      = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where       = '(batch_id = "' . $batch_id . '" and staff_name = "' . $staff_name . '" entry_no = "' . $entry_no . '") AND is_delete = 0  ';
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
        $action_obj     = $pdo->update($table, $columns, $update_where); //egg
        // Update Ends
      } else {
        // Insert Begins
        $update_where2   = [
          "unique_id"     => $batch_id
        ];
        $action_obj      = $pdo->insert($table, $columns);//egg
        // print_r($action_obj);die();
        $action_obj     = $pdo->update($table2, $column2, $update_where2);  //material

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
    $x=$_POST['supplier_name'];
    $data       = [];
    if ($length == '-1') {
        $limit = "";
    }

    // Query Variables
    $json_array     = "";
    $columns        = [
      "@a:=@a+1 s_no",
      "ep.entry_date",
      // "ep.entry_no",
      "(select batch_id from material_received where unique_id=ep.batch_id) as batch_id",
      "ep.supplier_name",
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
        "(SELECT max(su.hatching_status)as  hatching_status
                FROM status_update su 
                WHERE su.batch_id = ep.batch_id  and su.is_delete=0
                ORDER BY su.entry_date DESC 
                LIMIT 1
              ) AS hatching_status",

      "ep.staff_name",
      "ep.unique_id",
      "ep.batch_id as batch_id1",
      "ep.checkedvalue",
      
    ];

    $table_details = [
      $table." as ep,(SELECT @a := " . $start . ") AS a",$columns
    ];
  
    $where          = "ep.is_delete = 0 ";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        $where .= " and ep.entry_date >= '" . $_POST['from_date'] . "' and ep.entry_date <= '" . $_POST['to_date'] . "'";
    }

    if (!empty($_POST['supplier_name'])) {
        $where .= " and ep.supplier_name = '" . $_POST['supplier_name'] . "'";
    } 

    $order_by       = "batch_id desc";

    if ($_POST['search']['value']) {
      $where .= " AND (ep.supplier_name LIKE '".supplier_id(($_POST['search']['value']))."' )";
      $where .= " OR (ep.batch_id LIKE '". batch_search(($_POST['search']['value']) )."')";
    }
    
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
    // PRINT_r($result);
    $total_records  = total_records();
    if ($result->status) {
        $res_array = $result->data;
        foreach ($res_array as $key => $value) {
            $value['entry_date'] = disdate($value['entry_date']);
            
            if ($value['staff_name'] == '6700f08395b9e81382') {
              $value['staff_name'] = "Karthi";
            } else {
                $value['staff_name'] = disname(staff($value['staff_name'])[0]['user_name']);
            }

            $value['supplier_name'] = disname(supplier_name($value['supplier_name'])[0]['supplier_name']);
            $current_date = date('d-m-Y');
            $entry_date = $value['entry_date'];
            $hatching_status_delete=$value['hatching_status'];
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
  
          $value['hatching_status'] = $hatching_status;
            $btn_update = '';
            $btn_delete = '';
              if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){

                if($entry_date != $current_date  || (!empty($hatching_status_delete))){
                $btn_update = '';
                $btn_delete = '';  
                }else{
                  
                  $btn_update = btn_update($folder_name, $value['unique_id']);
                  $btn_delete = btn_delete_egg($folder_name, $value['unique_id'], $value['batch_id1'], $value['checkedvalue']);
                }
              }else{
                $btn_update = btn_update($folder_name, $value['unique_id']);
                $btn_delete = btn_delete_egg($folder_name, $value['unique_id'], $value['batch_id1'], $value['checkedvalue']);
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

    case "problem":
      $ticket_no = $_POST["ticket_no"];
      $data = [];
      $table = "material_received";
      $columns = [
        "qty",
        "(SELECT supplier_name FROM supplier_creation WHERE supplier_creation.unique_id = $table.supplier_name) AS supplier_name",
        "supplier_name as supplier_name1"
      ];     
      $table_details = [
        $table,
          // "material_received", 
          $columns];     
      $select_where = "unique_id = '$ticket_no' AND is_active = 1";
  
      $result = $pdo->select($table_details, $select_where);
  //  print_r( $result);die();
      if ($result->status) {
        $status = $result->status;
        $data = $result->data;
        $error = "";
        $sql = $result->sql;
        
        $qty = $data[0]['qty'];
        $supplier_name = $data[0]['supplier_name'];
        $supplier_name1 = $data[0]['supplier_name1']; 
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
        "tot_qty"   => $qty,
        "supplier_name" => $supplier_name,
        "supplier_name1" => $supplier_name1,
      ];
      echo json_encode($json_array);  
      break;

      case "supplier":
 
        $ticket_no = $_POST["ticket_no"];
        $data = [];
        $columns = [ 
            // "qty",
            "unique_id",
            "batch_id"
        ];
               
        $table_details = [
            "material_received", 
            $columns];
            
        $select_where = "supplier_name = '$ticket_no' AND is_active = 1";
    
        $result = $pdo->select($table_details, $select_where);
    //  print_r( $result);die();
        if ($result->status) {
            $status = $result->status;
            $data = $result->data;
            $error = "";
            $sql = $result->sql;
            
            // $qty = $data[0]['qty'];
            $batch_id = $data[0]['unique_id'];
            $batch_name = $data[0]['batch_id'];
    
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
                "batch_id"   => $batch_id,
                "batch_name" => $batch_name,
            ];
        
          echo json_encode($json_array);
    
        break;

  case 'delete':
    $unique_id  = $_POST['unique_id'];
    $batch_id = $_POST['batch_id'];
    $checkedvalue = $_POST['checkedvalue'];
    // print_r($unique_id);
    $tray_no = explode(',', $checkedvalue);
    // print_r($tray_no);
    $columns            = [
      "is_delete"   => 1,
    ];
    $column2            = [
      "batch_status"          => '0',
    ];
    $column3           = [
      "batch_id"             => '',
      "tray_status"          => '0',
    ];

    $update_where   = [
      "unique_id"     => $unique_id
    ];
    $update_where2   = [
      "unique_id"     => $batch_id
    ];
    $update_where3   = [
      "batch_id"     => $batch_id
    ];
    $action_obj     = $pdo->update($table, $columns, $update_where); //egg
    $action_obj     = $pdo->update($table2, $column2, $update_where2); // material_received table  
    $action_obj     = $pdo->update($table4, $columns, $update_where3); // addon
    $action_obj     = $pdo->update($table1, $columns, $update_where3); // sublist  
    foreach ($tray_no as $tray1) {
      $update_where3 = [            
        "unique_id" => $tray1,
        "tray_type" => '1'
    ];  
      $action_obj    = $pdo->update($table3, $column3, $update_where3); //---tray_creation
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
      $host     = '192.168.1.200'; // or localhost
      $dbname   = 'zigfly_erp'; // replace with your database name
      $username = 'my_root'; // replace with your database username
      $password = 'my@123456'; // replace with your database password
  
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
      $tray_qty         = $tot_qty / $tray_utilized;
      $batch_id         = $_POST["batch_id"];
      $checkedvalue     = $_POST["checkedvalue"];
      $unique_id        = $_POST["unique_id"];
      $screen_unique_id = $_POST["screen_unique_id"];
      $acc_year		      = $_SESSION['acc_year'];
      $session_id 	   	= session_id();
      $sess_user_type 	= $_SESSION['sess_user_type'];
      $sess_user_id	    = $_SESSION['sess_user_id'];
      $sess_company_id 	= $_SESSION['sess_company_id'];
      $sess_branch_id 	= $_SESSION['sess_branch_id'];
  
      // Check if records with the given screen_unique_id already exist
      $stmt_check = $pdo->prepare("SELECT COUNT(*) FROM egg_process_sublist WHERE screen_unique_id = :screen_unique_id");
      $stmt_check->bindParam(':screen_unique_id', $screen_unique_id);
      $stmt_check->execute();
      $count = $stmt_check->fetchColumn();
  
      if ($count > 0) {
          // Delete existing records with the given screen_unique_id
          $stmt_delete = $pdo->prepare("DELETE FROM egg_process_sublist WHERE screen_unique_id = :screen_unique_id");
          $stmt_delete->bindParam(':screen_unique_id', $screen_unique_id);
          $stmt_delete->execute();
      }
  
      // Update tray_creation where batch_id is present
      $stmt_update_existing_trays = $pdo->prepare("UPDATE tray_creation SET batch_id = '', tray_status = '0' WHERE batch_id = :batch_id and tray_type ='1'");
      $stmt_update_existing_trays->bindParam(':batch_id', $batch_id);
      $stmt_update_existing_trays->execute();
  
      $tray_no = explode(",", $checkedvalue);
      foreach ($tray_no as $tray_exp) {
          if ($tray_exp) {
              // Generate a new unique_id for each tray
              $unique_id = unique_id($prefix);
  
              // Prepare and execute the insert statement
              // $stmt_insert = $pdo->prepare("INSERT INTO egg_process_sublist (entry_date, staff_name, tot_qty, tray_utilized, tray_qty, batch_id, tray_unique_id, unique_id, screen_unique_id) VALUES (:entry_date, :staff_name, :tot_qty, :tray_utilized, :tray_qty, :batch_id, :tray_exp, :unique_id, :screen_unique_id)");

              $stmt_insert = $pdo->prepare("INSERT INTO egg_process_sublist (entry_date, staff_name, tot_qty, tray_utilized,
              tray_qty, batch_id, tray_unique_id, unique_id, screen_unique_id,acc_year,session_id,sess_user_type,sess_user_id,sess_company_id,
               sess_branch_id) VALUES (:entry_date, :staff_name, :tot_qty,
               :tray_utilized, :tray_qty, :batch_id, :tray_exp, :unique_id, :screen_unique_id,
               :acc_year, :session_id, :sess_user_type, :sess_user_id, :sess_company_id, :sess_branch_id)");

              $stmt_insert->bindParam(':entry_date', $entry_date);
              $stmt_insert->bindParam(':staff_name', $staff_name);
              $stmt_insert->bindParam(':tot_qty', $tot_qty);
              $stmt_insert->bindParam(':tray_utilized', $tray_utilized);
              $stmt_insert->bindParam(':tray_qty', $tray_qty);
              $stmt_insert->bindParam(':batch_id', $batch_id);
              $stmt_insert->bindParam(':tray_exp', $tray_exp);
              $stmt_insert->bindParam(':unique_id', $unique_id);
              $stmt_insert->bindParam(':screen_unique_id', $screen_unique_id);
              $stmt_insert->bindParam(':acc_year', $acc_year);
              $stmt_insert->bindParam(':session_id', $session_id);
              $stmt_insert->bindParam(':sess_user_type', $sess_user_type);
              $stmt_insert->bindParam(':sess_user_id', $sess_user_id);
              $stmt_insert->bindParam(':sess_company_id', $sess_company_id);
              $stmt_insert->bindParam(':sess_branch_id', $sess_branch_id);
  
              if ($stmt_insert->execute()) {
                  // Update tray_creation table
                  $stmt_update_tray = $pdo->prepare("UPDATE tray_creation SET tray_status = 1, batch_id = :batch_id WHERE unique_id = :unique_id and tray_type='1'");
                  $stmt_update_tray->bindParam(':batch_id', $batch_id);
                  $stmt_update_tray->bindParam(':unique_id', $tray_exp);
                  $stmt_update_tray->execute();
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
      case "sub_add_on":

        $host     = '192.168.1.200'; 
        $dbname   = 'zigfly_erp'; 
        $username = 'my_root'; 
        $password = 'my@123456';
    
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Could not connect to the database: " . $e->getMessage());
        }
    
        $entry_date       = $_POST["entry_date"];
        $staff_name       = $_POST["staff_name"];
        $tot_qty          = $_POST["tot_qty"];
        $batch_id         = $_POST["batch_id"];
        $screen_unique_id = $_POST["screen_unique_id"];
        $item_names       = $_POST["item_names"];       
        $checkedvalues    = $_POST["checkedvalues"];        
        $unique_id        = $_POST["unique_id"];
        $acc_year         = $_SESSION['acc_year'];
        $session_id       = session_id();
        $sess_user_type   = $_SESSION['sess_user_type'];
        $sess_user_id     = $_SESSION['sess_user_id'];
        $sess_company_id  = $_SESSION['sess_company_id'];
        $sess_branch_id   = $_SESSION['sess_branch_id'];        
    
        $msg = 'error'; 

        $stmt_delete = $pdo->prepare("DELETE FROM egg_process_addon WHERE screen_unique_id = :screen_unique_id");
        $stmt_delete->bindParam(':screen_unique_id', $screen_unique_id);
        $stmt_delete->execute();
       
          foreach ($item_names as $index => $single_item_name) {
              $tray_exp = isset($checkedvalues[$index]) ? $checkedvalues[$index] : null;
      
              if ($tray_exp) {
                  $unique_id = unique_id($prefix);
      
                  $stmt = $pdo->prepare("INSERT INTO egg_process_addon
                      (entry_date, staff_name, tot_qty, item_name, batch_id, item_qty, unique_id, screen_unique_id, acc_year, session_id, sess_user_type, sess_user_id, sess_company_id, sess_branch_id)
                      VALUES (:entry_date, :staff_name, :tot_qty, :item_name, :batch_id, :tray_exp, :unique_id, :screen_unique_id, :acc_year, :session_id, :sess_user_type, :sess_user_id, :sess_company_id, :sess_branch_id)");
      
                  $stmt->bindParam(':entry_date', $entry_date);
                  $stmt->bindParam(':staff_name', $staff_name);
                  $stmt->bindParam(':tot_qty', $tot_qty);
                  $stmt->bindParam(':item_name', $single_item_name);
                  $stmt->bindParam(':batch_id', $batch_id);
                  $stmt->bindParam(':tray_exp', $tray_exp);
                  $stmt->bindParam(':unique_id', $unique_id);
                  $stmt->bindParam(':screen_unique_id', $screen_unique_id);
                  $stmt->bindParam(':acc_year', $acc_year);
                  $stmt->bindParam(':session_id', $session_id);
                  $stmt->bindParam(':sess_user_type', $sess_user_type);
                  $stmt->bindParam(':sess_user_id', $sess_user_id);
                  $stmt->bindParam(':sess_company_id', $sess_company_id);
                  $stmt->bindParam(':sess_branch_id', $sess_branch_id);
      
                  if ($stmt->execute()) {
                      $msg = 'insert';
                  } else {
                     
                      $msg = 'insert_failed';
                  }
              }
          }
    
        $json_array = [
            "msg" => $msg
        ];
        echo json_encode($json_array);
        break;

      case "sub_add_on1":

        $host     = '192.168.1.200'; 
        $dbname   = 'zigfly_erp'; 
        $username = 'my_root'; 
        $password = 'my@123456'; 
    
        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Could not connect to the database: " . $e->getMessage());
        }
    
        $entry_date       = $_POST["entry_date"];
        $staff_name       = $_POST["staff_name"];
        $tot_qty          = $_POST["tot_qty"];
        $batch_id         = $_POST["batch_id"];
        $screen_unique_id = $_POST["screen_unique_id"];
        $item_names       = $_POST["item_names"];
        $checkedvalues    = $_POST["checkedvalues"];
        $unique_id        = $_POST["unique_id"];
        $acc_year         = $_SESSION['acc_year'];
        $session_id       = session_id();
        $sess_user_type   = $_SESSION['sess_user_type'];
        $sess_user_id     = $_SESSION['sess_user_id'];
        $sess_company_id  = $_SESSION['sess_company_id'];
        $sess_branch_id   = $_SESSION['sess_branch_id'];        
    
        $msg = 'error'; 
    
        foreach ($item_names as $index => $single_item_name) {
            $tray_exp = $checkedvalues[$index];
    
            if(empty($unique_id)){
              // print_r("insert");
                if ($tray_exp) {
                    $unique_id = unique_id($prefix);
    
                    $stmt = $pdo->prepare("INSERT INTO egg_process_addon(entry_date, staff_name, tot_qty, item_name, batch_id, item_qty, unique_id, screen_unique_id, acc_year, session_id, sess_user_type, sess_user_id, sess_company_id, sess_branch_id) 
                    VALUES (:entry_date, :staff_name, :tot_qty, :item_name, :batch_id, :tray_exp, :unique_id, :screen_unique_id, :acc_year, :session_id, :sess_user_type, :sess_user_id, :sess_company_id, :sess_branch_id)");
    
                    $stmt->bindParam(':entry_date', $entry_date);
                    $stmt->bindParam(':staff_name', $staff_name);
                    $stmt->bindParam(':tot_qty', $tot_qty);
                    $stmt->bindParam(':item_name', $single_item_name);
                    $stmt->bindParam(':batch_id', $batch_id);
                    $stmt->bindParam(':tray_exp', $tray_exp);
                    $stmt->bindParam(':unique_id', $unique_id);
                    $stmt->bindParam(':screen_unique_id', $screen_unique_id);                
                    $stmt->bindParam(':acc_year', $acc_year);
                    $stmt->bindParam(':session_id', $session_id);
                    $stmt->bindParam(':sess_user_type', $sess_user_type);
                    $stmt->bindParam(':sess_user_id', $sess_user_id);
                    $stmt->bindParam(':sess_company_id', $sess_company_id);
                    $stmt->bindParam(':sess_branch_id', $sess_branch_id);
    
                    if ($stmt->execute()) {
                        $msg = 'insert';
                    }
                }
            } else {
              // print_r("update");
                $stmt = $pdo->prepare("UPDATE egg_process_addon SET entry_date = :entry_date, staff_name = :staff_name, tot_qty = :tot_qty, item_name = :item_name, batch_id = :batch_id, item_qty = :tray_exp, unique_id = :unique_id, acc_year = :acc_year, session_id = :session_id, sess_user_type = :sess_user_type, sess_user_id = :sess_user_id, sess_company_id = :sess_company_id, sess_branch_id = :sess_branch_id WHERE screen_unique_id = :screen_unique_id");
    
                $stmt->bindParam(':entry_date', $entry_date);
                $stmt->bindParam(':staff_name', $staff_name);
                $stmt->bindParam(':tot_qty', $tot_qty);
                $stmt->bindParam(':item_name', $single_item_name);
                $stmt->bindParam(':batch_id', $batch_id);
                $stmt->bindParam(':tray_exp', $tray_exp);
                $stmt->bindParam(':unique_id', $unique_id);
                $stmt->bindParam(':screen_unique_id', $screen_unique_id);                
                $stmt->bindParam(':acc_year', $acc_year);
                $stmt->bindParam(':session_id', $session_id);
                $stmt->bindParam(':sess_user_type', $sess_user_type);
                $stmt->bindParam(':sess_user_id', $sess_user_id);
                $stmt->bindParam(':sess_company_id', $sess_company_id);
                $stmt->bindParam(':sess_branch_id', $sess_branch_id);
    
                if ($stmt->execute()) {
                    $msg = 'update';
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
  $driver = "mysql";
  $host = "192.168.1.200";
  $username = "my_root";
  $password = "my@123456";
  $databasename = "zigfly_erp";    

  try {
    $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
    return null; // Handle the error appropriately
  }

  // Fetch the last batch ID for the given item_name
  $stmt = $conn->prepare("SELECT * FROM egg_process ");
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
  $stmt = $conn->prepare("SELECT MAX(entry_no) AS max_id FROM $table_name WHERE entry_no LIKE :prefix and is_delete = 0");
  $stmt->execute([':prefix' => $prefix . '%']);
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  // Extract the numeric part of the batch_id and increment it
  $max_id = isset($result['max_id']) ? intval(substr($result['max_id'], strlen($prefix))) : 0;
  $new_order_number = $max_id + 1;

  return $new_order_number;
}
?>