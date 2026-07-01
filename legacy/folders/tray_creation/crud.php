<?php
// Get folder Name From Currnent Url 
$folder_name = explode("/", $_SERVER['PHP_SELF']);
$folder_name = $folder_name[count($folder_name) - 2];

// Database Country Table Name
$table = "tray_creation";

// Include DB file and Common Functions
include '../../config/dbconfig.php';

// Variables Declaration
$action = $_POST['action'];
$action_obj = (object) [
    "status" => 0,
    "data" => "",
    "error" => "Action Not Performed"
];
$json_array = "";
$sql = "";

$bin_name = "";
$is_active = "";
$unique_id = "";
$prefix = "";

$data = "";
$msg = "";
$error = "";
$status = "";
$test = ""; // For Developer Testing Purpose

switch ($action) {
    case 'createupdate':

        $bin_name = $_POST["bin_name"];
        $tray_type = $_POST["tray_type"];
        $is_active = $_POST["active_status"];
        $batch_id = '';
        $unique_id = $_POST["unique_id"];

        $update_where = "";

        $columns = [
            "tray_type" => $tray_type,
            "bin_name" => $bin_name,
            "is_active" => $is_active,
            "batch_id"  => $batch_id,
            "unique_id" => unique_id($prefix)
        ];

        // check already Exist Or not
        $table_details = [
            $table,
      [
        'COUNT(unique_id) AS count'
      ]
    ];
    $select_where       = '(bin_name = "' . $bin_name . '") AND is_delete = 0  ';
    // When Update Check without current id
    if ($unique_id) {
      $select_where   .= ' AND unique_id !="' . $unique_id . '" ';
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
            // Update Begins
            if ($unique_id) {

                unset($columns['unique_id']);

                $update_where = [
                    "unique_id" => $unique_id
                ];

                $action_obj = $pdo->update($table, $columns, $update_where);

                // Update Ends
            } else {

                // Insert Begins            
                $action_obj = $pdo->insert($table, $columns);
                // Insert Ends

            }

            if ($action_obj->status) {
                $status = $action_obj->status;
                $data = $action_obj->data;
                $error = "";
                $sql = $action_obj->sql;

                if ($unique_id) {
                    $msg = "update";
                } else {
                    $msg = "create";
                }
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
        $columns = [
            "@a:=@a+1 s_no",
            "tray_type",
            "bin_name",
            "is_active",
            "unique_id as qr_code",
            "unique_id"
        ];
        $table_details = [
            $table . " , (SELECT @a:= " . $start . ") AS a ",
            $columns
        ];
        $where = "is_delete = 0";

        if ($_POST['search']['value']) {
            $searchValue = $_POST['search']['value'];
           
            $searchValue = str_replace(' ', '', $searchValue);
            $where .= " AND (UPPER(REPLACE(bin_name, ' ', '')) LIKE UPPER('%" . mysql_like($searchValue) . "%')) ";
        }

        $order_by = "id desc";


        $sql_function = "SQL_CALC_FOUND_ROWS";

        $result = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
        $total_records = total_records();

        if ($result->status) {

            $res_array = $result->data;

            foreach ($res_array as $key => $value) {


                 $value['tray_type'] = disname($value['tray_type']);
                       switch ($value['tray_type']) {
                        case '1':
                            $value['tray_type'] = 'Egg Tray';
                            break;
                    
                        case '2':
                            $value['tray_type'] = 'FRP Tray';
                            break;

                        default:
                            $value['tray_type'] = 'Unknown';
                            break;
                    }


                $value['bin_name'] = disname($value['bin_name']);
                $value['is_active'] = is_active_show($value['is_active']);
                $btn_qr = btn_qr_print($folder_name, $value['unique_id'], "qr_generator.php");
               // $value['qr_code']    = '<span class="mdi mdi-qrcode-scan mdi-24px"></span>';
                $value['qr_code']    = $btn_qr;
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

?>