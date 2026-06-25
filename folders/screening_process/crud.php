<?php
// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table             = "pit_status";
$table1            = "pit_update";
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
$pit_id             = "";
$form_batch_id      = "";
$qty_manure_1       = "";
$qty_manure_2       = "";
$qty_rejets         = "";
$notes              = "";
$harvest_comp       = "2";
$org_status         = "6";
$unique_id          = "";
$prefix             = "";
$data               = "";
$msg                = "";
$error              = "";
$test               = ""; // For Developer Testing Purpose
switch ($action) {
  case 'createupdate':
    $entry_date       = $_POST["entry_date"];
    $pit_id           = $_POST["pit_id"];
    $form_batch_id    = $_POST["batch_id"];
    $qty_manure_1     = $_POST["qty_manure_1"];
    $qty_manure_2     = $_POST["qty_manure_2"];
    $qty_rejets       = $_POST["qty_rejets"];
    $notes            = $_POST["notes"];
    $harvest_comp     = $_POST["harvest_comp"];
    $org_status       = $org_status;
    $unique_id        = $_POST["unique_id"];
    $screen_unique_id = unique_id("scr");
// print_r($pit_id );
    $update_where     = "";
    $columns          = [      
      "entry_date"            => $entry_date,
      "pit_id"                => $pit_id,
      "form_batch_id"         => $form_batch_id,
      "qty_manure_1"          => $qty_manure_1,
      "qty_manure_2"          => $qty_manure_2,
      "qty_rejets"            => $qty_rejets,
      "notes"                 => $notes, 
      "harvest_comp"          => $harvest_comp,    
      "unique_id"             => unique_id($prefix),
      "screen_unique_id"      => $screen_unique_id,
      "org_status"            => '6'
    ];
    // check already Exist Or not

    $columns1          = [      
      "entry_date"            => $entry_date,
      "unique_id"             => unique_id($prefix),
      "screen_unique_id"      => $screen_unique_id,
      "pit_id"                => $pit_id,
      "form_batch_id"         => $form_batch_id,
      "org_status"            => '6',
      "harvest_comp"          => $harvest_comp
    ];

    $table_details  = [
      $table . " , (SELECT @a:= " . $start . ") AS a ",
      $columns
    ];
    $select_where     = ' is_delete = 0 ';

    
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
        $update_where1   = [
          "screen_unique_id"     => $screen_unique_id
        ];
        $action_obj     = $pdo->update($table, $columns, $update_where);
        $action_obj     = $pdo->update($table1, $columns1, $update_where1); //up
        // Update Ends
      } else {
        // Insert Begins            
        $action_obj     = $pdo->insert($table,$columns);
        $action_obj     = $pdo->insert($table1,$columns1); //up
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


  // case 'datatable':
  //   // DataTable Variables
  //   $search     = $_POST['search']['value'];
  //   $length     = $_POST['length'];
  //   $start      = $_POST['start'];
  //   $draw       = $_POST['draw'];
  //   $limit      = $length;
  //   $data       = [];
  //   if ($length == '-1') {
  //     $limit  = "";
  //   }

  //   $json_array     = "";
  //   $columns        = [
  //     "@a:=@a+1 s_no",
  //     "entry_date",
  //     "pit_id",
  //     "form_batch_id",
  //     "qty_manure_1",
  //     "qty_manure_2",
  //     "qty_rejets",
  //     "notes",
  //     "harvest_comp",
  //     "unique_id",
  //     "screen_unique_id"
  //   ];


  //     $table_details  = [
  //     $table . " , (SELECT @a:= " . $start . ") AS a ",
  //     $columns
  //     ];
    
  //   $where = " is_delete = 0 and org_status = 6";

  //   if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
  //       $where .= " and entry_date >= '" . $_POST['from_date'] . "' and entry_date <= '" . $_POST['to_date'] . "'";
  //   }

  //   if($_POST['pit_id']){
  //     $where  .= " and pit_id = '".$_POST['pit_id']."'";
  //   }

  //   $order_by       = "entry_date desc";
  //   $sql_function   = "SQL_CALC_FOUND_ROWS";
  //   $result         = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
  //   // print_r($result);
  //   $total_records  = total_records();
  //   if ($result->status) {
  //     $res_array      = $result->data;
  //     foreach ($res_array as $key => $value) {

  //       switch ($value['org_status']) {
  //         case 1:
  //             $org_status = "<span>Organic Waste Added in Pit</span>";
  //             break;
  //         case 2:
  //             $org_status = "<span>Baby Larvae Added</span>";
  //             break;
  //         case 3:
  //             $org_status = "<span>Aeration Process</span>";
  //             break;
  //         case 4:
  //             $org_status = "<span>Measurement</span>";
  //             break;
  //         case 5:
  //             $org_status = "<span>Harvest</span>";
  //             break;
  //         case 6:
  //             $org_status = "<span>Vibro Screen</span>";
  //             break;    
  //       }

  //       $value['entry_date']       = disdate($value['entry_date']);
  //       $value['pit_id']           = disname(pit_name($value['pit_id'])[0]['pit_name']);
  //       $value['form_batch_id']    = $value['form_batch_id'];
  //       $value['qty_manure_1']     = $value['qty_manure_1'];
  //       $value['qty_manure_2']     = $value['qty_manure_2'];
  //       $value['qty_rejets']       = $value['qty_rejets'];
  //       $value['notes']            = $value['notes'];
  
  //       if($value['harvest_comp']=='2'){                             
  //         $value['harvest_comp']  = "<span style='color: green;'>Completed</span>";
  //       }

  //       $btn_update                = btn_update($folder_name, $value['unique_id']);        
  //       $btn_delete                = btn_delete2($folder_name ,$value['unique_id'], $value['screen_unique_id']);              
  //       $value['unique_id']        = $btn_update . $btn_delete;       
  //       $data[]                    = array_values($value);
  //     }
  //     $json_array = [
  //       "draw"              => intval($draw),
  //       "recordsTotal"      => intval($total_records),
  //       "recordsFiltered"   => intval($total_records),
  //       "data"              => $data,
  //       "testing"           => $result->sql
  //     ];
  //   } else {
  //     print_r($result);
  //   }
  //   echo json_encode($json_array);
  //   break;


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

    $json_array = "";
    $columns = [
        "@a:=@a+1 s_no",
        "entry_date",
        "pit_id",
        "form_batch_id",
        "qty_manure_1",
        "qty_manure_2",
        "qty_rejets",
        "notes",
        "harvest_comp",
        "sess_user_id", 
        "unique_id",
        "screen_unique_id"
    ];

    $table_details = [
        $table . " , (SELECT @a:= " . $start . ") AS a ",
        $columns
    ];

    $where = " is_delete = 0 and org_status = 6";

    if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
        $where .= " and entry_date >= '" . $_POST['from_date'] . "' and entry_date <= '" . $_POST['to_date'] . "'";
    }

    if ($_POST['pit_id']) {
        $where .= " and pit_id = '" . $_POST['pit_id'] . "'";
    }

    $order_by = "entry_date asc";

    if ($_POST['search']['value']) {
      $where .= " AND (pit_id LIKE '".pit_id(($_POST['search']['value']))."' )";
    }
    
    $sql_function = "SQL_CALC_FOUND_ROWS";
    $result = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);

    $total_records = total_records();
    if ($result->status) {
        $res_array = $result->data;
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
            }

            $value['entry_date'] = disdate($value['entry_date']);
            $value['pit_id'] = disname(pit_name($value['pit_id'])[0]['pit_name']);
            $value['form_batch_id'] = $value['form_batch_id'];
            $value['qty_manure_1'] = $value['qty_manure_1'];
            $value['qty_manure_2'] = $value['qty_manure_2'];
            $value['qty_rejets'] = $value['qty_rejets'];
            $value['notes'] = $value['notes'];

            if ($value['harvest_comp'] == '2') {
                $value['harvest_comp'] = "<span style='color: green;'>Completed</span>";
            }

            if($value['sess_user_id'] == '6700f08395b9e81382'){
              $value['sess_user_id'] = "Karthi";
            } else{
              $value['sess_user_id'] = disname(staff($value['sess_user_id'])[0]['user_name']); 
            }

            $current_date = date('d-m-Y');
            $entry_date = $value['entry_date'];

            $entryDate = new DateTime($entry_date);
            $currentDate = new DateTime($current_date);

            $endDate = clone $entryDate;
            $endDate->add(new DateInterval('P4D'));

            $btn_update = '';
            $btn_delete = '';

            if ($_SESSION['sess_user_id'] != "66604f07ae42a24843") {
                if ($currentDate == $entryDate) {
                    $btn_update = btn_update($folder_name, $value['unique_id']);
                    $btn_delete = btn_delete($folder_name, $value['unique_id']);
                } elseif ($currentDate >= $entryDate && $currentDate <= $endDate) {
                    $btn_update = btn_update($folder_name, $value['unique_id']);
                    $btn_delete = btn_delete($folder_name, $value['unique_id']);
                } else {
                    $btn_update = '';
                    $btn_delete = '';
                }
            } else {
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
    $screen_unique_id  = $_POST['screen_unique_id'];
    // print_r($screen_unique_id);
    // print_r("hi");
    // die();
    $columns            = [
      "is_delete"   => 1,
    ];
    $update_where   = [
      "unique_id"   => $unique_id
    ];
    $update_where1   = [
      "screen_unique_id"   => $screen_unique_id
    ];
    $action_obj     = $pdo->update($table, $columns, $update_where);
    $action_obj     = $pdo->update($table1, $columns, $update_where1);

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


    case 'get_form_batch_id_vibro':

    $pit_id = $_POST["pit_id"]; 
    $entry_date = $_POST["entry_date"];

    // print_r($entry_date);
    $result = $pdo->query("SELECT MAX(form_batch_id) as form_batch_id, MAX(entry_date) as harvest_date 
                           FROM pit_status 
                           WHERE is_delete = 0 AND harvest_comp = 2 and org_status=5 AND pit_id = '$pit_id'");

// print_r($result);
    if ($result->status) {
        $status = $result->status;
        $data = $result->data;
        $error = "";
        $sql = $result->sql;

        $harvest_date = $data[0]["harvest_date"];  
        $current_date = date('Y-m-d');

        $harvestDateObj = new DateTime($harvest_date);
        $currentDateObj = new DateTime($current_date);

        $date_diff = $currentDateObj->diff($harvestDateObj);
        $days_diff = $date_diff->days; 

        if ($harvestDateObj > $currentDateObj) {
            $days_diff = -$days_diff;
        }

        // print_r($days_diff);
        // print_r("hi");

        if ($days_diff < 4) {
          $form_batch_id_vibro = $data[0]["form_batch_id"];
        }else{
          
          $form_batch_id_vibro = null; 
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
        "form_batch_id_vibro" => $form_batch_id_vibro,
    ];

    echo json_encode($json_array);
    break;
}

function btn_delete2($folder_name = "",$unique_id = "",$screen_unique_id = "") {
  //  alert("hai i am delete");
  $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\',\''.$screen_unique_id.'\')"><i class="mdi mdi-delete  mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';
  return $final_str;
}

?>