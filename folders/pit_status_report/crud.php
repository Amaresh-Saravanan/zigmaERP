<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "pit_status";
$table1            = "pit_update";
$table2            = "egg_process_sublist"; 
$table4            = "tray_creation";
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
$entry_date              = "";
$pit_id                  = "";
$org_status              = "";
$notes                   = "";
$tray_no                 = "";   
$feed_qty                = "";
$method                  = "";
$dry_method              = "";
$larvae_qty              = "";
$qty_manure_1            = "";
$qty_manure_2            = "";
$qty_rejets              = "";
$harvest_comp            = "";
$batch_id                = "";
$unique_id               = "";
$prefix                  = "";
$data                    = "";
$screen_unique_id        = "";
$msg                     = "";
$error                   = "";
$status                  = "";
$test                    = ""; // For Developer Testing Purpose

switch ($action) {
  case 'createupdate':
    // $screen_type     = $_POST["screen_type"];
    $entry_date       = $_POST["entry_date"];
    $pit_id           = $_POST["pit_id"];
    $org_status       = $_POST["org_status"];
    $notes            = $_POST["notes"];
    $batch_id         = $_POST["batch_id"];
    $tray_no          = $_POST["tray_no"];
    $tray             = implode(',', $tray_no);
    // print_r($tray);
    // $tray="12";
    $larvae_qty       = $_POST["larvae_qty_in"];
    $feed_qty         = $_POST["feed_qty"];
    $method           = $_POST["method"];
    
    $dry_method       = $_POST["dry_method"];
    $larvae_qty_in    = $_POST["larvae_qty_in"];
    $larvae_qty       = $_POST["larvae_qty"];
    $qty_manure_1     = $_POST["qty_manure_1"];
    $qty_rejets       = $_POST["qty_rejets"];
    $harvest_comp     = $_POST["harvest_comp"];
    $unique_id       = $_POST["unique_id"];
    $screen_unique_id = $_POST["screen_unique_id"];
    $bill_no = batch_creation($table1,$update_where,$pit_id,$pdo,"PIT-");
  // print_r( $bill_no);
    $update_where       = "";

    $columns            = [
            "entry_date"      => $entry_date,
            "pit_id"          => $pit_id,            
            "batch_id"        => $batch_id , 
            "form_batch_id"   => $bill_no , 
            "org_status"      => $org_status,
            "notes"           => $notes,            
            "tray_no"         => $tray,
            "feed_qty"        => $feed_qty,
            "method"          => $method,
            "dry_method"      => $dry_method,
            "larvae_qty_in"   => $larvae_qty_in,
            "larvae_qty"      => $larvae_qty,
            "qty_manure_1"    => $qty_manure_1,
            "qty_rejets"      => $qty_rejets,
            "harvest_comp"    => $harvest_comp,
            "screen_unique_id"=> $screen_unique_id,
            "unique_id"       => unique_id($prefix)
            
    ];
    

    $columns1            = [
      "pit_id"          => $pit_id,
      "batch_id"        => $bill_no,
      "org_status"      => $org_status,
      "harvest_comp"    => $harvest_comp,
      "screen_unique_id"=> $screen_unique_id,
      "unique_id"       => unique_id($prefix)
    ];

    $column2            = [
      "tray_status"          => '1',
      
    ];
    $column3            = [
      "tray_status"          => '1',
      
    ];
   
    $column4            = [
      "tray_status"          => '0',
      
    ];

   
    // check already Exist Or not
    $table_details      = [ 
      $table,
       [
        'COUNT(unique_id) AS count'
      ]
    ];
    $select_where       =  'pit_id !="" and is_delete = 0 ';
    // When Update Check without current id
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
    if ($data[0]["count"]) {
      $msg        = "already";
    } else if ($data[0]["count"] == 0) {
      // Update Begins
      if ($unique_id) {
        unset($columns['unique_id']);
        $update_where   = [
          "unique_id"     => $unique_id
        ];


        $action_obj     = $pdo->update($table, $columns, $update_where); //--pit_status
      
        foreach ($tray_no as $tray1) {
          $update_where2 = [
              "batch_id" => $batch_id,
              "tray_unique_id" => $tray1
          ];
          $update_where3 = [
            "batch_id" => $batch_id
        ];
        $update_where5 = [
          "unique_id" => $tray1
      ];

          $action_obj     = $pdo->update($table2, $column4, $update_where3);    //edit  egg_sub 1
          $action_obj     = $pdo->update($table2, $column3, $update_where2);    //---egg_process_sublist 2
          // $action_obj     = $pdo->update($table4, $column3, $update_where5);  //---edit tray_creation 1
          $action_obj     = $pdo->update($table4, $column3, $update_where5); //---tray_creation 2
          
        }

        
      } else {
        // Insert Begins            
        $action_obj     = $pdo->insert($table, $columns); 
           
        $action_obj     = $pdo->insert($table1, $columns1);

        foreach ($tray_no as $tray1) {
          $update_where2 = [
              "batch_id" => $batch_id,
              "tray_unique_id" => $tray1
          ];
          $update_where4 = [            
            "unique_id" => $tray1
        ];
          $action_obj     = $pdo->update($table2, $column2, $update_where2); //---egg_process_sublist
          $action_obj     = $pdo->update($table4, $column4, $update_where4); //---tray_creation
      }
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
    $search = $_POST['search']['value'];
    $length = $_POST['length'];
    $start = $_POST['start'];
    $draw = $_POST['draw'];
    $limit = $length;
    $data = [];
    if ($length == '-1') {
        $limit = "";
    }
    // Query Variables
    $json_array = "";
//     $columns = [
//     "@a:=@a+1 s_no",
//     // "entry_date", 
//     "pit_id", 
//     "form_batch_id",
//     "min(entry_date) as start_date",
//     "(DATEDIFF(MAX(entry_date), MIN(entry_date))) AS tot_days",
//     "sum(feed_qty)as feed_qty",
   
//     // "round(max(larvae_qty_in),1)as org_status", 
//     "sum(larvae_qty_in) as org_status",    
       
//     "sum(larvae_qty)as larvae_qty",
//     "qty_manure_1",
//     // "qty_rejets",
//     "max(harvest_comp) as harvest_comp",
//     "unique_id",
//     "max(batch_id) as batch_id1",
//     "max(entry_date) as end_date",
//     "qty_rejets"
// ];

$columns = [
  "@a:=@a+1 s_no",
  // "entry_date",
  "pit_id",
  "form_batch_id",
  "min(entry_date) as start_date",
  // "( DATEDIFF(MAX(entry_date), MIN(entry_date))) AS tot_days",
  "sum(larvae_qty_in)as org_status",
  "sum(feed_qty)as feed_qty",
  "sum(tippi_qty)as tippi_qty",
  // "round(max(larvae_qty_in),1)as org_status",
  "sum(larvae_qty)as larvae_qty",
  "sum(qty_manure_1) as qty_manure_1 ",
  "max(harvest_comp)as harvest_comp",
  "unique_id",
  "max(batch_id) as batch_id1",
  "max(entry_date) as end_date",
  "sum(qty_rejets)as qty_rejets",
  "sum(qty_manure_2)as qty_manure_2",
  "sum(larvae_qty_in) as larvae_qty_in"
];

    $table_details = [
        $table . " , (SELECT @a:= " . $start . ") AS a ",
        $columns
    ];
    
 
    if(($_POST['from_date']!='') && ($_POST['to_date']!='')) {
      $where  .= "  entry_date>='".$_POST['from_date']."' and entry_date<='".$_POST['to_date']."'";
    }

    if($_POST['pit_id']){
      $where  .= " and pit_id = '".$_POST['pit_id']."'";
    }

    if($_POST['status_type']){
      $where  .= " and org_status = '".$_POST['status_type']."'";
    }

    // if($_POST['harvest_comp']){
    //   // $where  .= " and harvest_comp = '".$_POST['harvest_comp']."'";
    //   $where  .= "and form_batch_id in(select form_batch_id from pit_status where  harvest_comp='2')";
    // }

    if($_POST['harvest_comp']){
      // $where  .= " and harvest_comp = '".$_POST['harvest_comp']."'";
if($_POST['harvest_comp']=='2'){
      $where  .= " and form_batch_id in (select form_batch_id from pit_status where harvest_comp ='".$_POST['harvest_comp']."' and is_delete=0)";
}else if($_POST['harvest_comp']=='1'){
  $where  .= " and form_batch_id not in (select form_batch_id from pit_status where harvest_comp ='2' and is_delete=0)";
}
    }


    if ($_POST['search']['value']) {
      $where .= " AND (pit_id LIKE '".pit_id(($_POST['search']['value']))."' )";
    }
    $where .= " and is_delete = 0  group by form_batch_id";
    $order_by = " pit_id ASC";
    
    $sql_function = "SQL_CALC_FOUND_ROWS";
    $result = $pdo->select($table_details, $where, $limit, $start, $order_by,$sql_function);
// print_r($result);
    

    $total_records = total_records();
    if ($result->status) {
        $res_array = $result->data;
        $data = [];
        $s_no = $start + 1;
        foreach ($res_array as $key => $value) {
          $value['s_no'] = $s_no;
            $s_no++;
            // switch ($value['org_status']) {
            //     case 1:
            //         $org_status = "<span>Organic Waste Added in Pit</span>";
            //         break;
            //     case 2:
            //         $org_status = "<span>Baby Larvae Added</span>";
            //         break;
            //     case 3:
            //         $org_status = "<span>Aeration Process</span>";
            //         break;
            //     case 4:
            //       $org_status = "<span>Measurement</span>";
            //       break;
            //     case 5:
            //         $org_status = "<span>Harvesting</span>";
            //         break;
               
            //     default:
            //         $org_status = "<span>NULL</span>";
            // }
            
                switch ($value['harvest_comp']) {
                  case 1:
                    $hatching_status =  "<span style='color: red;'>Progressing</span>";
                    break;
                  case 2:
                    $hatching_status = "<span style='color: green;'>Completed</span>";
                    break;
                  default:
                    $hatching_status = "<span style='color: red;'>Progressing</span>";
                  }
            

                  $value['start_date'] = disdate($value['start_date']) . '/<br>' . '<strong>' . disdate($value['end_date']) . '</strong>';
                  $value['tot_days']          = $value['tot_days'] + '1';
                  $value['form_batch_id']     = $value['form_batch_id'] ?: '-';
                  $value['batch_id']          = $value['batch_id1'] ? disname(batch_name($value['batch_id1'])[0]['batch_id']) : '-';
      
                  if($value['larvae_qty_in']){
                    $value['larvae_qty_in'] = '<strong>' . ($value['larvae_qty_in']) . '</strong>/' . ($value['batch_id']);
                  } else {
                      $value['larvae_qty_in'] = '-';
                  }
                  
                  

                  $value['org_status'] = (!empty($value['batch_id']) && !empty($value['org_status'])) ? $value['batch_id'] . ' / '  .'<strong>'. $value['org_status'] .'kg</strong>' : '-';

                  // if($value['org_status']){
                    // $value['org_status'] = $value['batch_id'] . ' / ' . $value['larvae_qty_in'];
                  // } else {
                  //   $value['org_status'] = "-";
                  // }
      
                  $value['feed_qty']          = $value['feed_qty'] ?: '-';
                  $value['tippi_qty']          = $value['tippi_qty'] ?: '-';
                  $value['larvae_qty']        = $value['larvae_qty'] ?: '-';
      
      
                  if($value['qty_manure_1']){
                    $value['qty_manure_1'] = '(' . $value['qty_manure_1'] . '/<strong>' . $value['qty_manure_2'].'</strong>' . ')' . '/'.$value['qty_rejets'];
                  } else {
                      $value['qty_manure_1'] = '-';
                  }
      
                  $value['harvest_comp']      = $hatching_status;
                  $btn_update                 = btn_print1($folder_name, $value['form_batch_id'],"print.php");
                  $value['pit_id']            = $value['pit_id'] ? disname(pit_name($value['pit_id'])[0]['pit_name']) : '-';

            // $value['batch_id1'] = $value['batch_id1'] ?: '-';

           
            $value['unique_id'] = $btn_update . $btn_delete;
            
            if ($value['tray_no']) {
                $exp_site = explode(',', $value['tray_no']);
                $unique_bin_names = []; 
                $site_display = '';        
                foreach ($exp_site as $tray_no) {
                    $bin_name = tray($tray_no);            
                    if ($bin_name) {
                        $tray_id = $bin_name[0]['bin_name'];
                        if (!in_array($tray_id, $unique_bin_names)) {
                            $unique_bin_names[] = $tray_id;
                            $site_display .= $tray_id . ',';
                        }
                    }
                }
                $value['tray_no'] = rtrim($site_display, ',');
                $value['tray_no_count'] = $value['tray_no_count'] ?: '0';
            }

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
    $batch_id  = $_POST['batch_id'];
    // print_r($batch_id);
    $tray_no1   = $_POST['tray_no'];
    // print_r($tray_no1);
    $tray_no = explode(',', $tray_no1);  
    $columns1            = [
      "is_delete"   => '1'
    ];
    $columns2            = [
      "tray_status"   => '0'
    ];
    $column4            = [
      "tray_status"          => '1',
      
    ];
    $update_where1   = [
      "unique_id"     => $unique_id
    ];  
   
    $action_obj     = $pdo->update($table, $columns1, $update_where1);//--pit status
    foreach ($tray_no as $tray1) {
      $update_where2 = [
          "batch_id" => $batch_id,
          "tray_unique_id" => $tray1
      ];
      $update_where4 = [            
        "unique_id" => $tray1
    ];  
      
      $action_obj    = $pdo->update($table2, $columns2, $update_where2); //Egg_process_sublist
      $action_obj    = $pdo->update($table4, $column4, $update_where4); //---tray_creation
  
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

    
case 'select_tray_no':
  
  $batch_id = $_POST['batch_id'];
  $data= [];
  $columns = ["tray_unique_id",
"tray_unique_id as id"
  
];
  $table_details = 
  [
    
   "egg_process_sublist " 
  , $columns];
  $select_where = "batch_id = '$batch_id' AND is_active = 1 and is_delete= 0 and tray_status= 0";
   
  $result = $pdo->select($table_details, $select_where);
  // print_r($result);
  if ($result) {
      $status = $result->status;
      $data = $result->data;
      $error = "error";    
      $sql = $result->sql;      
      $tray_options  ="";
      foreach ($data as $row){
          $tray_data = tray($row['id']);
         $tray_name = $tray_data[0]['bin_name'];
          $batch_id = $row['tray_unique_id'];
          $tray_options .="<option value='$batch_id'>$tray_name</option>";
      }
      echo $tray_options;
  } else {
      $status = $result->status;
      $data = $result->data;
      $error = "error";
      $sql = $result->sql;
  }
  break;


    case "sub_add_update":
        
      $pit_id       = $_POST["pit_id"];
      $org_status       = $_POST["org_status"];
      $batch_id          = $_POST["batch_id"];
      $harvest_comp       = $_POST["harvest_comp"];
      
          foreach ($pit_id as $pit_id_exp) {
              $pit_id = $pit_id_exp[0];
              if ($pit_id) {
                  $stmt = mysql_query("INSERT INTO pit_update (pit_id, org_status, batch_id, harvest_comp) VALUES ('$pit_id', '$org_status', '$batch_id', '$harvest_comp')");
              }
          }
      break;
  default:
    break;
}







function btn_delete_pit($folder_name = "", $unique_id = "", $batch_id = "", $tray_no = "") {
  
  $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\', \''.$batch_id.'\', \''.$tray_no.'\')">
                <i class="mdi mdi-delete mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';
  return $final_str;
}



function batch_creation($table_name, $where, $pit_id, $pdo, $prefix = "") {
  $driver         = "mysql";
  $host           = "192.168.1.22";
  $username       = "my_root";
  $password       = "my@123456";
  $databasename   = "zigfly_erp";    

  try {
      $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
      return null; // Handle the error appropriately
  }

  // Fetch pit_id details
  $stmt = $conn->prepare("SELECT * FROM pit_update WHERE pit_id = :pit_id and is delete=0 ORDER BY id DESC LIMIT 1");
  $stmt->execute(['pit_id' => $pit_id]);

  // Fetch the results
  if ($pit_query = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $billno = $pit_query['batch_id'];
      $harvest_comp = $pit_query['harvest_comp'];
      if ($harvest_comp == 2) {
        // Create new batch ID without year, month, and date
        $billno = $prefix;

        // Generate a sequential ID or a random number
        $bill_order_no = generate_order_number($table_name, $conn);

        // Append the generated number to the prefix
        $billno .= sprintf("%05d", $bill_order_no);

        return $billno;
      }
      return $billno;
  } else {
      // Create new batch ID without year, month, and date
      $billno = $prefix;

      // Generate a sequential ID or a random number
      $bill_order_no = generate_order_number($table_name, $conn);

      // Append the generated number to the prefix
      $billno .= sprintf("%05d", $bill_order_no);

      return $billno;
  }
}

function generate_order_number($table_name, $conn) {
  // Implement the logic to generate a new order number
  // Query the database to find the highest existing number and increment it by one

  // Example implementation:
  $stmt = $conn->query("SELECT MAX(batch_id) AS max_id FROM $table_name where is_delete=0");
  $stmt->execute();
  $result = $stmt->fetch(PDO::FETCH_ASSOC);

  // Assuming the batch_id is numeric
  $max_id = isset($result['max_id']) ? intval(preg_replace('/[^0-9]/', '', $result['max_id'])) : 0;
  $new_order_number = $max_id + 1;

  return $new_order_number;
}
function btn_print1($folder_name = "",$pit_id = "", $file_name = "",$prefix = "",$suffix = "") {
  $final_str = '<button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1" onclick="new_external_window_print(event,\'folders/'.$folder_name.'/'.$file_name.'\',\''.$pit_id.'\');"><i class="mdi mdi-printer mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i></button></a>';
  return $final_str;
}


  ?>



