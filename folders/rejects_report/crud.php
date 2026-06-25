<?php
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
$servername = "zigmaglobal.in"; 
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

try {  
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);  
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
   
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$action             = $_POST['action'];

switch ($action) {
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
        $columns = [
            "@a:=@a+1 s_no",
            "TicketNumber",
            "VehicleNumber",
            "SupplierName",
            "Date",
            "Time",
            "EmptyWeight",
            "LoadedWeight",
            "NetWeight",
            "'' as print",
            "'' as upload_image"
        ];
        
        // Constructing SQL query
        $sql = "SELECT SQL_CALC_FOUND_ROWS " . implode(",", $columns) . " FROM bsf_reject_transaction";
        $where = " WHERE 1 = 1 ";
        
        // Applying date filters
        if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
            $where .= " AND Date >= :from_date AND Date <= :to_date";
        }
        
        if (!empty($search)) {
            $where .= " AND (TicketNumber LIKE '" . mysql_like($search) . "' ) ";
        }

        $sql .= $where;
        
        // Add ORDER BY clause for sorting by TicketNumber in ascending order
        $sql .= " ORDER BY TicketNumber desc";
        
        // Adding limit to query if applicable
        if (!empty($limit)) {
            $sql .= " LIMIT :start, :limit";
        }
        
        // Preparing SQL statement
        $stmt = $pdo->prepare($sql);
        
        // Binding date parameters
        if (!empty($_POST['from_date']) && !empty($_POST['to_date'])) {
            $stmt->bindParam(':from_date', $_POST['from_date']);
            $stmt->bindParam(':to_date', $_POST['to_date']);
        }
        
        // Binding limit parameters
        if (!empty($limit)) {
            $stmt->bindParam(':start', $start, PDO::PARAM_INT);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        }
        
        // Execute the query
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total records count
        $total_records = $pdo->query("SELECT FOUND_ROWS()")->fetchColumn();
        
        $s_no = $start + 1; 
        if ($result) {
            foreach ($result as $value) {
                $value['s_no'] = $s_no++;
                $value['TicketNumber'] = $value['TicketNumber'];
                $value['VehicleNumber'] = $value['VehicleNumber'];
                $value['SupplierName'] = $value['SupplierName'];
                $value['Date'] = date('d-m-Y', strtotime($value['Date']));
                $value['Time'] = $value['Time'];
                $value['EmptyWeight'] = $value['EmptyWeight']/1000;
                $value['LoadedWeight'] = $value['LoadedWeight']/1000;
                $value['NetWeight'] = $value['NetWeight']/1000;
                
                // Generate print and upload buttons
                $btn_update = btn_print_2($folder_name, $value['TicketNumber'], "print.php");
                $value['print'] = $btn_update;
        
                $btn_upload = btn_upload_image($folder_name, $value['TicketNumber'], "image_upload.php");
                $value['upload_image'] = $btn_upload;
        
                $data[] = array_values($value);
            }
        }
        
        // Prepare JSON response
        $json_array = [
            "draw" => intval($draw),
            "recordsTotal" => intval($total_records),
            "recordsFiltered" => intval($total_records),
            "data" => $data
        ];
        
        // If no result is found, ensure to send an empty data array
        if (empty($result)) {
            $json_array['data'] = [];  // Set empty data
            $json_array['recordsTotal'] = 0;
            $json_array['recordsFiltered'] = 0;
        }
        
        // Output JSON response
        echo json_encode($json_array);
        break;
    
    
default:

    break;
}


function btn_print_2($folder_name = "",$ticket_no = "", $file_name = "") {
    $final_str = '<button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1" onclick="new_external_window_print(event,\'folders/'.$folder_name.'/'.$file_name.'\',\''.$ticket_no.'\');"><i class="mdi mdi-printer mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i></button></a>';
    return $final_str;
}
function btn_upload_image($folder_name = "", $ticket_no = "", $file_name = "image_upload.php") {
    $svg_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';

    $final_str = '<a href="javascript:void(0);" onclick="new_external_window_upload(event,\'folders/'.$folder_name.'/'.$file_name.'\',\''.$ticket_no.'\');">
        '.$svg_icon.'</a>';
    return $final_str;
}


function mysql_like ($search_query = "", $search_term = "") {

    $return_result = "";

    if ($search_query) {
        switch ($search_term) {
            case "first":
                $return_result = "%".$search_query;
                break;
            
            case "last":
                $return_result = $search_query."%";
                break;
            
            default:
                // For All result
                $return_result = "%".$search_query."%";
                break;
        }
    }

    return $return_result;
}



?>