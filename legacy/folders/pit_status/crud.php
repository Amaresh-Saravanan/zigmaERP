<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "pit_status";
$table1            = "pit_update";
$table_frp         = "frp_process"; 
$table_frp_sub     = "frp_process_sublist"; 
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
$json_array              = "";
$sql                     = "";
$entry_date              = "";
$pit_id                  = "";
$org_status              = "";
$notes                   = "";
$tray_no                 = "";   
$feed_qty                = "";
$feed_count              = "";
$tippi_qty               = "";
$method                  = "";
$measure_time            = "";
$dry_method              = "";
$larvae_qty              = "";
$qty_manure_1            = "";
$qty_manure_2            = "";
$qty_manure_3            = "";
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
       
        $entry_date          = $_POST["entry_date"];
        $pit_id              = $_POST["pit_id"];
        $pit_nam1            = $_POST["pit_name"];
        $pit_name            = substr($pit_nam1, -2);
        $notes               = $_POST["notes"];
        $org_status          = $_POST["org_status"];         
        $unique_id           = $_POST["unique_id"];
        $screen_unique_id    = $_POST["screen_unique_id"];
        $screen_unique_id_up = $_POST["screen_unique_id_up"];        
        $prefixs             = "";
        $bill_no             = batch_creation($table,$update_where,$pit_id,$pdo,"PIT-$pit_name-");  
        $update_where        = "";

        if ($org_status == '1') {
          $feed_qty         = $_POST["feed_qty"] ?? null;
          $feed_count       = $_POST["feed_count"] ?? null;
        } else {
          $feed_qty         = null;
          $feed_count       = null;
        }

        if($org_status == '2'){
          $batch_id         = $_POST["batch_id"] ?? null;
          $tray_no          = $_POST["tray_no"] ?? null;
          $tray             = implode(',', $tray_no) ?? null;
          $tray_no_hide     = $_POST["tray_no_hide"];
          $tray_hide        = explode(',', $tray_no_hide); 
          $tray_frp          = $_POST["tray_no"] ?? null;
          $tray_frp          = implode(',', $tray_frp) ?? null;
          
          

          $larvae_qty_in    = $_POST["larvae_qty_in"] ?? null;
        } else {
          $batch_id         = null;
          $tray_no          = null;
          $tray             = null;
          $larvae_qty_in    = null;
        }

        if($org_status == '3'){
        $method           = $_POST["method"] ?? null;    
        } else {
          $method           = null; 
        }

        if($org_status == '4'){
          $measure_time = $_POST["measure_time"] ?? null;
          $temp_start   = $_POST["tempstart"] ?? null;
          $temp_mid     = $_POST["tempmid"] ?? null;
          $temp_end     = $_POST["tempend"] ?? null;
          $humi_start   = $_POST["humistart"] ?? null;
          $humi_mid     = $_POST["humimid"] ?? null;
          $humi_end     = $_POST["humiend"] ?? null;
        } else {
          $measure_time = null;
          $temp_start   = null;
          $temp_mid     = null;
          $temp_end     = null;
          $humi_start   = null;
          $humi_mid     = null;
          $humi_end     = null;
        }
        
        if($org_status == '5'){
          $larvae_qty       = $_POST["larvae_qty"] ?? null;
          $qty_manure_1     = $_POST["qty_manure_1"] ?? null;
          $qty_manure_2     = $_POST["qty_manure_2"] ?? null;
          $qty_manure_3     = $_POST["qty_manure_3"] ?? null;
          $qty_rejets       = $_POST["qty_rejets"] ?? null;
          $harvest_comp     = $_POST["harvest_comp"] ;
        }
        else{
          $larvae_qty       = null;
          $qty_manure_1     = null;
          $qty_manure_2     = null;
          $qty_manure_3     = null;
          $qty_rejets       = null;
          // $harvest_comp     = null;
        }

        if($org_status == '7'){
          $tippi_qty           = $_POST["tippi_qty"] ?? null;    
        } else {
          $tippi_qty           = null; 
        }

    $columns            = [
            "entry_date"      => $entry_date,
            "pit_id"          => $pit_id,            
            "batch_id"        => $batch_id , 
            "form_batch_id"   => $bill_no , 
            "org_status"      => $org_status,
            "notes"           => $notes,            
            "tray_no"         => $tray,
            "feed_qty"        => $feed_qty,
            "feed_count"      => $feed_count,
            "tippi_qty"       => $tippi_qty,
            "method"          => $method,
            "measure_time"    => $measure_time,            
            "temp_start"      => $temp_start,
            "temp_mid"        => $temp_mid,   
            "temp_end"        => $temp_end,    
            "humidity_start"  => $humi_start ,     
            "humidity_mid"    => $humi_mid,      
            "humidity_end"    => $humi_end ,      
            "larvae_qty_in"   => $larvae_qty_in,
            "larvae_qty"      => $larvae_qty,
            "qty_manure_1"    => $qty_manure_1,
            "qty_manure_2"    => $qty_manure_2,
            "qty_manure_3"    => $qty_manure_3,
            "qty_rejets"      => $qty_rejets,
            "harvest_comp"    => $harvest_comp,
            "screen_unique_id"=> $screen_unique_id,
            "unique_id"       => unique_id($prefix)
            
    ];
    

    $columns1            = [
      "entry_date"      => $entry_date,
      "pit_id"          => $pit_id,
      "form_batch_id"   => $bill_no, 
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
   
    $column_frp            = [
      "batch_status"          => '2',
      
    ];
  
    // a.$column6            = [
    //   "batch_id"          => $batch_id,
    //   "tray_status"          => '1',
      
    // ];
     $column7            = [
      "batch_id"          => null,
      "tray_status"          => '0',
      
    ];
    $column8            = [
     "batch_id"          => '',
      "tray_status"          => '0',
      
    ];
    $update_where_frp = [
          "egg_batch_id" => $batch_id,
           "is_delete" => '0',
                    
      ];
       

      
    $table_details      = [ 
      $table,
      
    ];
    $select_where       =  'is_delete = 0 ';
   
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
        $update_where_pitu   = [
          "screen_unique_id"     => $screen_unique_id_up
        ];

        $action_obj     = $pdo->update($table, $columns, $update_where); //--pit_status
        $action_obj     = $pdo->update($table1, $columns1, $update_where_pitu);  //pit_update
        foreach ($tray_hide as $tray_h) {
        //  a. $update_whereh = [
        //     "unique_id" => $tray_h
        // ];
        
        $action_obj     = $pdo->update($table_frp, $column_frp, $update_where_frp); //edit  frp closed 
        
        // a.$action_obj     = $pdo->update($table4, $column6, $update_whereh) ; //---edit tray_creation 1(1)
        
        }
      
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
           
          //a $action_obj     = $pdo->update($table2, $column3, $update_where2);    //---egg_process_sublist 2(1)
          //a $action_obj     = $pdo->update($table4, $column8, $update_where5); //---tray_creation 2(0) 
        }
      
        // updated ends
      } else {
        // Insert Begins            
        $action_obj     = $pdo->insert($table, $columns);          
        $action_obj     = $pdo->insert($table1, $columns1);
        $action_obj     = $pdo->update($table_frp, $column_frp, $update_where_frp); //---frp_process
        
        foreach ($tray_no as $tray1) {
          $update_where2 = [
              "egg_batch_id" => $batch_id,
              "frp_tray_no" => $tray1
          ];
        $update_where_tray = [
          "batch_id" => $batch_id,
          "tray_type" => '2',
           "is_delete" => '0',
           "id" => $tray1
                    
      ];
          $action_obj     = $pdo->update($table_frp_sub, $column2, $update_where2); //---frp_process_sublist
          $action_obj     = $pdo->update($table4, $column7, $update_where_tray); //---tray_creation          
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
        "entry_date",
        "pit_id", 
        "form_batch_id", 
        "org_status", 
        "''as batch_id2",
        "feed_qty", 
        "tippi_qty",
        "larvae_qty",
        "harvest_comp",
        "sess_user_id",              
        "unique_id",
        // "harvest_comp",
        // "(SELECT batch_id FROM material_received WHERE material_received.unique_id = " . $table . " .batch_id) AS batch_id2",
        "COALESCE((SELECT batch_id FROM material_received WHERE material_received.unique_id = " . $table . ".batch_id), '-') AS batch_id2", 
        "batch_id as batch_id1",
        "screen_unique_id",
        "tray_no",
        "measure_time"
        
      ];
      $table_details  = [
        $table . " , (SELECT @a:= " . $start . ") AS a ",
        $columns
      ];
      $where          = " is_delete = 0 and org_status!= 6 ";
  
      if(($_POST['from_date']!='')  && ($_POST['to_date']!=''))
      {
          $where  .= " and entry_date>='".$_POST['from_date']."' and entry_date<='".$_POST['to_date']."'";
      }
  
  
      if($_POST['batch_name']){
        $where  .= " and form_batch_id = '".$_POST['batch_name']."'";
      }
  
      if($_POST['status_type']){
        $where  .= " and org_status = '".$_POST['status_type']."'";
      }
      if($_POST['pit_name']){
        $where  .= " and pit_id = '".$_POST['pit_name']."'";
      }
  
      if($_POST['harvest_comp']){
        $where  .= " and harvest_comp = '".$_POST['harvest_comp']."'";
      }
  
      $order_by       = "entry_date,pit_id asc";
  
      if ($_POST['search']['value']) {
        $where .= " AND (pit_id LIKE '".pit_id(($_POST['search']['value']))."' )";
      }
  
      $sql_function   = "SQL_CALC_FOUND_ROWS";
      $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
      // print_r($result);
      $total_records  = total_records();
      if ($result->status) {
        $res_array      = $result->data;
        $data = [];
        foreach ($res_array as $key => $value) {
  
          switch ($value['org_status']) {
            case 1:
                $org_status = "<span>Organic Waste Added in Pit</span>";
                break;
            case 2:
                $org_status = "<span>Baby Larvae Added</span>";
                break;
            case 3:
                $org_status = "<span>Aeration Process</span>";
                break;
            case 4:
                $org_status = "<span>Measurement</span>";
                break;
            case 5:
                $org_status = "<span>Harvest</span>";
                break;
            case 6:
                $org_status = "<span>Vibro Screen</span>";
                break;  
            case 7:
                $org_status = "<span>Tippi</span>";
                break;  
               
          }
  
          switch ($value['measure_time']) {
            case 1:
                $measure_time = "Mor";
                break;
            case 2:
                $measure_time = "Eve";
                break;
            default:
                $measure_time = "None";
                break;
            }
  
          // $value['tippi_qty']        = $value['tippi_qty'];
  
          if(!empty($value['tippi_qty']))
         {
         $value['tippi_qty']     = $value['tippi_qty'];   
         }
         else{
          $value['tippi_qty']     ="-";
         }
  
          $value['entry_date']        = disdate($value['entry_date']);          
          $value['form_batch_id']     = $value['form_batch_id'];
          $value['pit_id']            = disname(pit_name($value['pit_id'])[0]['pit_name']);
          // $value['org_status']        = $org_status; 
  
          if(($value['org_status']) == 4){
            $value['org_status']         = $org_status . " " . "(" . $measure_time . ")";
          
          }else{
          $value['org_status']        = $org_status;   
          }  
          
  
          if(!empty($value['batch_id2']))
                {
                  $value['batch_id2'] = $value['batch_id2'];
  
                }
          else
          {
            $value['batch_id2'] = "-";
          }
          
        
          if($value['sess_user_id'] == '6700f08395b9e81382'){
            $value['sess_user_id'] = "Karthi";
          } else{
            $value['sess_user_id'] = disname(staff($value['sess_user_id'])[0]['user_name']); 
          }
         
         if(!empty($value['feed_qty']))
         {
         $value['feed_qty']     = $value['feed_qty'];   
         }
         else{
          $value['feed_qty']     ="-";
         }
  
         if(!empty($value['larvae_qty']))
         {
          $value['larvae_qty']     = $value['larvae_qty'];
         }
         else{
          $value['larvae_qty']     ="-";
         }
         
          $value['batch_id1']          = $value['batch_id1'];                             
          $harvest_comp               = $value['harvest_comp'];
         
  
          $current_date = date('d-m-Y');
          $entry_date = $value['entry_date'];
          $btn_update = '';
          $btn_delete = '';
          if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){
              if ($entry_date == $current_date && $harvest_comp == "2" ){ 
                                $btn_update = '';
                                $btn_delete = '';                                 
                }elseif($entry_date != $current_date){
                    $btn_update = '';
                    $btn_delete = '';
                }else {
                    $btn_update                 = btn_update($folder_name, $value['unique_id']);    
                    $btn_delete                 = btn_delete_pit($folder_name, $value['unique_id'], $value['batch_id1'], $value['tray_no'],$value['screen_unique_id']);              
                  }  
                }else{ 
                  $btn_update                 = btn_update($folder_name, $value['unique_id']);    
                  $btn_delete                 = btn_delete_pit($folder_name, $value['unique_id'], $value['batch_id1'], $value['tray_no'],$value['screen_unique_id']);                                                
                  }
                  $value['unique_id'] = $btn_update . $btn_delete;
                  
                  if($value['harvest_comp']=='2'){                             
                    $value['harvest_comp']  = "<span style='color: green;'>Completed</span>";
                  }
                  // else{
                  //   $value['harvest_comp']  = "<span style='color: red;'>Progressing</span>";
                  // }
                              
          if($value['tray_no']){
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
          
          // $value['tray_no'] = rtrim($site_display, ',');
        }
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
    


    case 'get_pit_name':
 
      $pit_name = $_POST["pit_id"];
      
      $data = [];
      $table = "pit_creation";
      $columns = [        
        
        "pit_name"
      ];
      
      
      $table_details = [
        $table,         
          $columns];
          
      $select_where = "unique_id = '$pit_name' AND is_active = 1 and is_delete=0 ";
  
      $result = $pdo->select($table_details, $select_where);
      
      if ($result->status) {
          $status = $result->status;
          $data = $result->data;
          $error = "";
          $sql = $result->sql;
          
          
          $pit_name = $data[0]["pit_name"];
          
  
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
              "pit_name" => $pit_name,
              
          ];
      
        echo json_encode($json_array);
  
      break;

      case 'gen_feed_count':

        $pit_id = $_POST["pit_id"];   
        $unique = $_POST["unique"]; 
    
        if (empty($unique)) {
          $result = $pdo->query("select max(feed_count) as feed_count, MAX(harvest_comp) as harvest_comp 
                                   from pit_status 
                                   WHERE is_delete = 0 
                                   and form_batch_id = (SELECT max(form_batch_id) 
                                                        FROM pit_status 
                                                        WHERE pit_id = '$pit_id' 
                                                        and is_delete = 0)");
        } else {
           
            $result = $pdo->query("select max(feed_count) as feed_count 
                                   from pit_status 
                                   WHERE is_delete = 0 
                                   and unique_id = '$unique'");
        }
        
        if ($result->status) {
            $status = $result->status;
            $data = $result->data;
            $error = "";
            $sql = $result->sql;
            $harvest_comp = isset($data[0]["harvest_comp"]) ? $data[0]["harvest_comp"] : null;
    
            if ($harvest_comp == 2) {
                $feed_count = '';
            } else {
                $feed_count = isset($data[0]["feed_count"]) ? $data[0]["feed_count"] : null;
            }
    
        } else {
            $status = $result->status;
            $data = $result->data;
            $error = "error";
            $sql = $result->sql;
        }
    
        $json_array = [
            "status"    => $status,
            "data"      => $data,
            "error"     => $error,
            "msg"       => $msg,
            "sql"       => $sql,
            "feed_count" => $feed_count,
        ];
    
        echo json_encode($json_array);
    
        break;
    



  case 'delete':
    $unique_id = $_POST['unique_id'];
    $batch_id  = $_POST['batch_id'];
    $screen_unique_id=$_POST['screen_unique_id'];
    $tray_no1   = $_POST['tray_no'];
    $tray_no = explode(',', $tray_no1);  
    $columns1            = [
      "is_delete"   => '1'
    ];
    $columns_frp            = [
      "batch_status"   => '1'
    ];
    $columns_frp_sub            = [
      "tray_status"   => '0'
    ];
    $column4            = [
      "tray_status"          => '1',
      "batch_id"          => $batch_id,
      
    ];
    $update_where1   = [
      "unique_id"     => $unique_id
    ];  
    $update_where2   = [
      "screen_unique_id"     => $screen_unique_id
    ];
    $update_where_frp = [
          "egg_batch_id" => $batch_id,  
           "is_delete" => '0',        
      ];
      
   
    $action_obj     = $pdo->update($table, $columns1, $update_where1);//--pit status
    $action_obj     = $pdo->update($table1, $columns1, $update_where2); //pit update
    $action_obj     = $pdo->update($table_frp, $columns_frp, $update_where_frp); // frp_process 
    foreach ($tray_no as $tray1) {
      
      $update_where_tray = [   
        "id" => $tray1,                 
        "is_delete" => '0',   
        "tray_type" => '2',   
    ];   
     $update_where_frp_sub = [   
        "frp_tray_no" => $tray1,                 
        "is_delete" => '0',  
        "egg_batch_id" => $batch_id,   
          
    ];    
       $action_obj     = $pdo->update($table_frp_sub, $columns_frp_sub, $update_where_frp_sub);   //frp_process_sublist
      //  print_r($action_obj);
       $action_obj    = $pdo->update($table4, $column4, $update_where_tray); //---tray_creation  
  }
// die()
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
  $columns = [
"frp_tray_no",
"frp_tray_no as id"  
];
  $table_details = 
  [    
   "frp_process_sublist" 
  , $columns];
  $select_where = "egg_batch_id = '$batch_id' AND is_active = 1  and is_delete= 0 and tray_status=0 ";
   
  $result = $pdo->select($table_details, $select_where);
  // print_r($result); die();
  if ($result) {
      $status = $result->status;
      $data = $result->data;
      $error = "error";    
      $sql = $result->sql;      
      $tray_options  ="";
      foreach ($data as $row){
          $tray_data = frp_tray_name($row['id']);
         $tray_name = $tray_data[0]['bin_name'];
          $batch_id = $row['frp_tray_no'];
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
        
      $pit_id         = $_POST["pit_id"];
      $org_status     = $_POST["org_status"];
      $batch_id       = $_POST["batch_id"];
      $harvest_comp   = $_POST["harvest_comp"];
      
          foreach ($pit_id as $pit_id_exp) {
              $pit_id = $pit_id_exp[0];
              if ($pit_id) {
                  $stmt = mysql_query("INSERT INTO pit_update (pit_id, org_status, batch_id, harvest_comp) VALUES ('$pit_id', '$org_status', '$batch_id', '$harvest_comp')");
              }
          }
      break;


    }



function btn_delete_pit($folder_name = "", $unique_id = "", $batch_id = "", $tray_no = "",$screen_unique_id= "") {
  
  $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\', \''.$batch_id.'\', \''.$tray_no.'\',\''.$screen_unique_id.'\')">
                <i class="mdi mdi-delete mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';
  return $final_str;
}





function batch_creation($table_name, $where, $pit_id, $pdo, $prefix = "") {
  $driver         = "mysql";
  $host           = "192.168.1.200";
  $username       = "my_root";
  $password       = "my@123456";
  $databasename   = "zigfly_erp";    
  try {
      $conn = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
      $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  } catch (PDOException $e) {
      return null;
    } 
  // $stmt = $conn->prepare("SELECT max(form_batch_id)as form_batch_id , max(harvest_comp)as harvest_comp FROM pit_update WHERE pit_id = :pit_id and is_delete =0");
  $stmt = $conn->prepare("SELECT * FROM pit_update WHERE pit_id = :pit_id and is_delete=0 and org_status !='6' ORDER BY id DESC LIMIT 1 ");
  $stmt->execute(['pit_id' => $pit_id]); 
  if ($pit_query = $stmt->fetch(PDO::FETCH_ASSOC)) {
      $billno = $pit_query['form_batch_id'];
      $harvest_comp = $pit_query['harvest_comp'];
      if ($harvest_comp == 2) {        
          $billno = $prefix;      
          $bill_order_no = generate_order_number($table_name, $conn,$pit_id);          
          $billno .= str_pad($bill_order_no, 5, '0', STR_PAD_LEFT);
          return $billno;
      }
      return $billno;
  } else {      
      $billno = $prefix;      
      $bill_order_no = generate_order_number($table_name, $conn,$pit_id);     
      $billno .= str_pad($bill_order_no, 5, '0', STR_PAD_LEFT);
      return $billno;
  }
}

function generate_order_number($table_name, $conn,$pit_id) { 
  $stmt = $conn->query("SELECT MAX(form_batch_id) AS max_id FROM $table_name where pit_id='$pit_id' and is_delete=0 and org_status !='6' ");
  $stmt->execute(); 
  $result = $stmt->fetch(PDO::FETCH_ASSOC);  
  $max_id = isset($result['max_id']) ? intval(substr($result['max_id'], -5)) : 0;
  $new_id = $max_id + 1;
  return $new_id;
}

  ?>