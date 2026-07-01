<?php

// Get folder Name From Currnent Url 
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];

$table  = "user_login_details";

include '../../config/dbconfig.php';

$action             = $_POST['action'];

switch ($action) {
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
            "user_id",
            "entry_date",
            "login_time",
            "logout_time",
            "sess_user_type"
        ];
        $table_details  = [
            $table . " , (SELECT @a:= " . $start . ") AS a ",
            $columns
        ];
    
        // Conditions
        $where  = " is_delete = 0 ";
    
        if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
            $where .= " AND entry_date >= '{$_POST['from_date']}' AND entry_date <= '{$_POST['to_date']}'";
        }
    
        if (!empty($_POST['staff_name'])) {
            $where .= " AND user_id = '{$_POST['staff_name']}'";
        }
    
        $order_column   = $_POST["order"][0]["column"];
        $order_dir      = $_POST["order"][0]["dir"];
        // $order_by       = datatable_sorting($order_column, $order_dir, $columns);
 
        
        // if ($_POST['search']['value']) {  
        //     $searchValue = $_POST['search']['value'];
        
        //     $where .= " AND u.user_id LIKE '%" . user_id($searchValue) . "%'";
        //     $where .= " OR u.entry_date LIKE '%" . entry_date($searchValue) . "%'";
        //     $where .= " OR u.sess_user_type LIKE '%" . sess_user_type($searchValue) . "%')";
        // }
        

        // Search
    if (!empty($search)) {
        $search_key = htmlspecialchars($search, ENT_QUOTES);

        // Search user_name and get corresponding user_ids
        $user_matches = user_name_id_by_name($search_key); // returns array of user_ids (unique_id)
        $type_matches = user_type_id_by_type($search_key); // returns array of sess_user_type (unique_id)

        $conditions = [];

        if (!empty($user_matches)) {
            $escaped_user_ids = implode("','", array_map('addslashes', $user_matches));
            $conditions[] = "u.user_id IN ('$escaped_user_ids')";
        }

        if (!empty($type_matches)) {
            $escaped_type_ids = implode("','", array_map('addslashes', $type_matches));
            $conditions[] = "u.sess_user_type IN ('$escaped_type_ids')";
        }

        if (!empty($conditions)) {
            $where .= " AND (" . implode(" OR ", $conditions) . ")";
        }
    }


    
        $sql_function   = "SQL_CALC_FOUND_ROWS";
    
        // SQL Query to fetch first login and last logout time per user per day
        $query = "
            SELECT 
                @a:=@a+1 AS s_no, 
                u.user_id, 
                u.entry_date,
                (SELECT entry_time FROM $table AS t1 
                    WHERE t1.user_id = u.user_id 
                    AND t1.entry_date = u.entry_date 
                    AND t1.log_type = 1 
                    LIMIT 1) AS login_time,
                (
                    SELECT entry_time FROM $table AS t2 
                    WHERE t2.user_id = u.user_id 
                    AND t2.entry_date = u.entry_date 
                    AND t2.log_type IN (2,3,4) 
                    ORDER BY id DESC 
                    LIMIT 1
                ) AS logout_time,
                u.sess_user_type,
                '' as total_worked_hours,
                '' as action,
                u.unique_id
            FROM $table u
            WHERE $where
            GROUP BY u.user_id, u.entry_date
        ";
    
        // print_r($query);

        $result         = $pdo->query($query);
        $total_records  = total_records();
    
        if ($result->status) {
            $res_array = $result->data;
            
            foreach ($res_array as $key => $value) {
        static $sno = 0;
        $value['s_no'] = ++$sno;
        // Store the original user ID
        $originalUserId = $value['user_id'];
        $userid     = disname($value['user_id']);
        $value['user_id'] = disname(staff($value['user_id'])[0]['user_name']); 
        
        $entry_date =  $value['entry_date'];
        
        $value['sess_user_type'] = disname(user_type_login($value['sess_user_type'])[0]['user_type']); 

        // Calculate Total Worked Hours using the original user ID
    $totalSeconds = 0;
    $loginTime = null;
    
    $sessionsQuery = "SELECT entry_time, log_type FROM $table 
                      WHERE user_id = '{$originalUserId}' 
                        AND entry_date = '{$value['entry_date']}' 
                      ORDER BY entry_time ASC";
    $sessionsResult = $pdo->query($sessionsQuery);
    
    if ($sessionsResult->status) {
        foreach ($sessionsResult->data as $session) {
            if ($session['log_type'] == 1) {
                // Mark the start time of a session
                $loginTime = strtotime($session['entry_time']);
            } else if (in_array($session['log_type'], [2,3,4]) && $loginTime !== null) {
                // Logout detected, calculate worked duration
                $logoutTime = strtotime($session['entry_time']);
                
                // Handle next-day logout scenario
                if ($logoutTime < $loginTime) {
                    $logoutTime += 86400; // Add 24 hours (1 day) to logout time
                }
    
                $totalSeconds += ($logoutTime - $loginTime);
                $loginTime = null; // Reset for the next session
            }
        }
    }
    
    // Format total seconds as H:i:s
    $value['total_worked_hours'] = gmdate("H:i:s", $totalSeconds);
    
        $value['action']           = btn_login_history($folder_name ,"view.php", $userid, $entry_date,$value['user_id'], $value['sess_user_type'] );
    
        $data[] = array_values($value);
    }
    
    
            $json_array = [
                "draw"              => intval($draw),
                "recordsTotal"      => intval($total_records),
                "recordsFiltered"   => intval($total_records),
                "data"              => $data,
                "query"             => $query
            ];
        } else {
            print_r($result);
        }
    
        echo json_encode($json_array);
        break;
    
    
    
    }    
      
      
      
    
    function btn_login_history($folder_name = "", $file_name = "", $unique_id = "", $entry_date = "", $user_name = "",$user_type = "") {
        $final_str = '<button type="button" class="btn btn-asgreen btn-xs btn-rounded waves-effect waves-light mr-1" 
            onclick="new_external_window_print(event,\'folders/'.$folder_name.'/'.$file_name.'\',\''.$unique_id.'\',\''.$entry_date.'\',\''.$user_name.'\',\''.$user_type.'\');">
            <i class="mdi mdi-printer"></i>
        </button>';
    // print_r($user_type);
        return $final_str;
    }
    

    function user_type_login ($unique_id = "") {
        global $pdo;
    
        $table_name    = "user_type";
        $where         = [];
        $table_columns = [
            "unique_id",
            "user_type",
        ];
    
        $table_details = [
            $table_name,
            $table_columns
        ];
    
        $where     = [
            "is_active" => 1,
            "is_delete" => 0
        ];
    
        if ($unique_id) {
            $table_details      = $table_name;
            $where              = [];
            $where["unique_id"] = $unique_id;
        }
    
        $staff_list = $pdo->select($table_details, $where);
    
        if ($staff_list->status) {
            return $staff_list->data;
        } else {
            print_r($staff_list);
            return 0;
        }
    }




    // Search Function


    function user_name_id_by_name($name_search = "") {
        global $pdo;
        $table_name = "user";
        $columns = ["unique_id"];
        $where = "is_delete = 0 AND is_active = 1 AND name LIKE '%$name_search%'";
    
        $res = $pdo->select([$table_name, $columns], $where);
        return ($res->status) ? array_column($res->data, 'unique_id') : [];
    }
    
    function user_type_id_by_type($type_search = "") {
        global $pdo;
        $table_name = "user_type";
        $columns = ["unique_id"];
        $where = "is_delete = 0 AND is_active = 1 AND user_type LIKE '%$type_search%'";
    
        $res = $pdo->select([$table_name, $columns], $where);
        return ($res->status) ? array_column($res->data, 'unique_id') : [];
    }
    



    
?>