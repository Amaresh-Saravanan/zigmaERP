<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "frp_process";
$table_sublist     = "frp_process_sublist";
$table_egg         = "egg_process";
$table_tray        = "tray_creation";



// Include DB file and Common Functions
include '../../config/dbconfig.php';

// Variables Declaration
$action             = $_POST['action'];
// print_r($action);
$action_obj         = (object) [
  "status"    => 0,
  "data"      => "",
  "error"     => "Action Not Performed"
];

switch ($action) {
  case 'createupdate':
    $entry_date         = $_POST["entry_date"];
    $egg_batch_id       = $_POST["egg_batch_id"];    
    $frp_tray_count     = $_POST["frp_tray_count"];     
    $unique_id          = $_POST["unique_id"];    
    $frp_tray_name      = $_POST["frp_tray_name"] ?? null;
    $frp_tray_name_exp  = implode(',', $frp_tray_name) ?? null;
    $unique_id          = $_POST["unique_id"];  
    
    $columns = [
      "entry_date"          => $entry_date,      
      "egg_batch_id"        => $egg_batch_id,
      "frp_tray_count"      => $frp_tray_count,      
      "frp_tray_name"       => $frp_tray_name_exp,            
      "unique_id"           => unique_id()
  ];
   
    // check already Exist Or not
    $table_details      = [
      $table,
      [
        "COUNT(unique_id) AS count"
      ]
    ];
    $select_where       = 'egg_batch_id =  "'.$egg_batch_id.'"  AND is_delete = 0  ';
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
        $action_obj     = $pdo->update($table, $columns, $update_where);
        // print_r($action_obj);
        // Update Ends
      } else {
        
        // Insert Begins        
        $action_obj      = $pdo->insert($table, $columns);//frp
        // print_r($action_obj);die();
         $column_egg            = [
      "batch_status"          => '2',  //closed    
        ];

        $update_where_egg   = [
          "batch_id"     => $egg_batch_id,
          "is_delete"     => '0'
        ];

        $action_obj     = $pdo->update($table_egg, $column_egg, $update_where_egg); // egg_process table


    
    $column_tray            = [    
          "batch_id"             => $egg_batch_id,  
          "tray_status"          => '1',   //frp load   
        ];
    foreach ($frp_tray_name as $tray1) {         
          $update_where_tray = [            
            "id" => $tray1,
            "tray_type" => '2'
        ];          
          
           $action_obj     = $pdo->update($table_tray, $column_tray, $update_where_tray); //---frp_tray_creation
      // print_r($action_obj);die();
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

case 'add_sublist_update':    
    $rows           = $_POST["rows_data"];  

    $results = [];
    $status  = true;
    $error   = "";
    $sql     = "";

    foreach ($rows as $row) {
        $unique_id  = $row['tray_hidden'];      
        $larvae_qty   = $row['larvae'];
        $organic_qty  = $row['organic'];

        $columns = [     
            "baby_larvae_qty" => $larvae_qty, 
            "organic_qty"     => $organic_qty                              
        ];           


        $update_where = [     
            "unique_id" => $unique_id 
        ]; 
        $action_obj = $pdo->update($table_sublist, $columns,$update_where);  
        // print_r($action_obj);die();
        $results[]  = $action_obj;

        if (!$action_obj->status) {
            $status = false;
            $error  = $action_obj->error;
            $sql    = $action_obj->sql;
            break; 
        }
    }
   
    $json_array = [
        "status"  => $status,
        "results" => $results,   
        "error"   => $error,
        "msg"     => "update",
        "sql"     => $sql
    ];

    echo json_encode($json_array);
    break;



 case 'add_sublist':    
  
    $form_unique_id = $_POST["unique_id"];  
    $egg_batch_id   = $_POST["egg_batch_id"];   
    $rows           = $_POST["rows_data"];  

    $results = [];
    $status  = true;
    $error   = "";
    $sql     = "";

    foreach ($rows as $row) {
        $frp_tray_no  = $row['tray_hidden'];      
        $larvae_qty   = $row['larvae'];
        $organic_qty  = $row['organic'];

        $columns = [
            "form_unique_id"  => $form_unique_id,      
            "egg_batch_id"    => $egg_batch_id,
            "frp_tray_no"     => $frp_tray_no,      
            "baby_larvae_qty" => $larvae_qty, 
            "organic_qty"     => $organic_qty,                  
            "unique_id"       => unique_id()
        ];           

        $action_obj = $pdo->insert($table_sublist, $columns); 
        
        $column_tray            = [   
          "batch_id"          => null,   
          "tray_status"          => '0',  //normal tray empty
      
      ];
      $update_where_tray = [            
            "batch_id"  => $egg_batch_id,     // need to work tray based concept
            "tray_type" => '1',
            "is_delete" => '0'           
        ];
        $action_obj     = $pdo->update($table_tray, $column_tray, $update_where_tray); //tray empty
        // die();
        $results[]  = $action_obj;

        if (!$action_obj->status) {
            $status = false;
            $error  = $action_obj->error;
            $sql    = $action_obj->sql;
            break; 
        }
    }

    $msg = !empty($form_unique_id) ? "update" : "create";

    $json_array = [
        "status"  => $status,
        "results" => $results,  
        "error"   => $error,
        "msg"     => $msg,
        "sql"     => $sql
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
        $limit = "";
    }

    // Query Variables
    $json_array     = "";
    $columns        = [
      "@a:=@a+1 s_no",
      "f.entry_date",
      "f.egg_batch_id",       
      "f.frp_tray_count",
      "frp_tray_name",
      "f.unique_id as add_on",    
      "f.unique_id",
      "fs.form_unique_id"
    ];

    $table_details  = [
      $table . " as f left join frp_process_sublist as fs on f.unique_id=fs.form_unique_id, (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
  
    $where          .= "f.is_delete = 0 ";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        $where .= " and f.entry_date >= '" . $_POST['from_date'] . "' and f.entry_date <= '" . $_POST['to_date'] . "'";
    }
    if (!empty($_POST['batch_id'])) {
        $where .= " and f.egg_batch_id = '" . $_POST['batch_id'] . "'";
    }

    $where          .= " and f.egg_batch_id !='' group by f.egg_batch_id";
    // $group         ='f.egg_batch_id';
    $order_by       = "f.egg_batch_id desc";

    if ($_POST['search']['value']) {      
      $where .= " And( f.egg_batch_id LIKE '". batch_search(($_POST['search']['value']) )."')";
    }
    
    $sql_function   = "SQL_CALC_FOUND_ROWS";
    $result         = $pdo->select($table_details, $where, $limit, $start,$order_by);
    // PRINT_r($result);
    $total_records  = total_records();
    if ($result->status) {
        $res_array = $result->data;
        $s_no = $start + 1;
        foreach ($res_array as $key => $value) {
          $value['s_no'] = $s_no;
            $s_no++;
            $value['entry_date'] = disdate($value['entry_date']);
            $egg_batch_id =$value['egg_batch_id'];
            $value['egg_batch_id'] = disname(batch_no($value['egg_batch_id'])[0]['batch_id']);


    $frp_tray_name_delete = $value['frp_tray_name'];


if ($value['frp_tray_name']) {
    $exp_site = explode(',', $value['frp_tray_name']);
    $unique_bin_names = [];
    $site_display = [];

    foreach ($exp_site as $tray_no) {
        $bin_name = frp_tray_name($tray_no);
        if ($bin_name) {
            $tray_id = $bin_name[0]['bin_name'];
            if (!in_array($tray_id, $unique_bin_names)) {
                $unique_bin_names[] = $tray_id;
                $site_display[] = $tray_id;
            }
        }
    }

    $value['frp_tray_name'] = implode(',', $site_display);
}


            $current_date = date('d-m-Y');
            $entry_date = $value['entry_date'];

          
          if($value['form_unique_id']){
          $value['add_on']      = btn_update_sublist($folder_name, $value['unique_id']);
          }else{
          $value['add_on']     = btn_view($folder_name, $value['unique_id']);
          }


          $value['hatching_status'] = $hatching_status;
            $btn_update = '';
            $btn_delete = '';
              if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){
                if($value['form_unique_id']){
                $btn_update = '';
                $btn_delete = '';  
                }else{
                  $btn_update = btn_update($folder_name, $value['unique_id']);
                  $btn_delete = btn_delete_egg($folder_name, $value['unique_id'], $egg_batch_id, $frp_tray_name_delete);
                }
              }else{
                $btn_update = btn_update($folder_name, $value['unique_id']);
                $btn_delete = btn_delete_egg($folder_name, $value['unique_id'], $egg_batch_id, $frp_tray_name_delete);
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
    $batch_id = $_POST['batch_id'];
    $tray_no = $_POST['tray_no'];
    $frp_tray_name = explode(',', $tray_no);

    $columns            = [
      "is_delete"   => 1,
    ];
    $columns_egg            = [
      "batch_status"   => 1,
    ];
 

    $update_where   = [
      "unique_id"     => $unique_id
    ];
    $update_where_sublist   = [
      "form_unique_id"     => $unique_id
    ];
    $update_where_egg   = [
      "batch_id"     => $batch_id
    ];
  
    $action_obj     = $pdo->update($table, $columns, $update_where);
    $action_obj     = $pdo->update($table_sublist, $columns, $update_where_sublist);
    $action_obj     = $pdo->update($table_egg, $columns_egg, $update_where_egg);

     $column_tray            = [      
          "tray_status"          => '0',   //frp empty  
        ];
    foreach ($frp_tray_name as $tray1) {         
          $update_where_tray = [            
            "id" => $tray1,
            "tray_type" => '2'
        ];                   
           $action_obj     = $pdo->update($table_tray, $column_tray, $update_where_tray); //---tray_creation
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


  
      
  }   
function btn_delete_egg($folder_name = "", $unique_id = "", $batch_id = "", $tray_no = "") {
  
  $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\', \''.$batch_id.'\', \''.$tray_no.'\')">
                <i class="mdi mdi-delete mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';
  return $final_str;
}




function btn_update_sublist($folder_name = "",$unique_id = "", $prefix = "",$suffix = "") {
    // $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/update&unique_id='.$unique_id.'"><button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1"><i class="mdi mdi-square-edit-outline"></i></button></a>';

    $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/view_update&unique_id='.$unique_id.'"><i class="mdi mdi-square-edit-outline mdi-24px waves-effect waves-light mt-n2 mb-n2 text-green"></i></a>';

    
    return $final_str;
}
?>