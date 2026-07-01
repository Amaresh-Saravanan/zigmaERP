<?php
// Get folder Name From Currnent Url 
$folder_name = explode("/", $_SERVER['PHP_SELF']);
$folder_name = $folder_name[count($folder_name) - 2];
// Database Country Table Name
$table = "frp_status_update";
$table1 = "frp_process";

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

$entry_date = "";
$starting_day = "";
$entry_no = "";
$staff_name = "";
$batch_id = "";
$day = "";
$inward_date = "";
$hatching_status = "";
$remarks = "";

$unique_id = "";
$prefix = "";
$data = "";
$msg = "";
$error = "";
$status = "";
$test = ""; // For Developer Testing Purpose


$fileUploadPath = $fileUploadConfig->get("upload_folder");

// Create Folder in root->uploads->(this_folder_name) Before using this file upload
$fileUploadConfig->set("upload_folder", $fileUploadPath . $folder_name . DIRECTORY_SEPARATOR);

// File Upload Library Call
$fileUpload = new Alirdn\SecureUPload\SecureUPload($fileUploadConfig);

switch ($action) {
  case 'createupdate':
    
    $entry_date = $_POST["entry_date"];
    $entry_no = $_POST["entry_no"];
    $starting_day = $_POST["starting_day"];
    $staff_name = $_POST["staff_name"];
    $batch_id = $_POST["batch_id"];
    $day = $_POST["day"];    
    $x=$_FILES["test_file"]['name'];    
    $hatching_status = $_POST["hatching_status"];
    $remarks = $_POST["remarks"];
    $columns1 = ["batch_status" => '1'];  //status closed
    $update_where1 = [
      "egg_batch_id" => $batch_id
    ];
    if ($hatching_status == '2') {
      $action_obj = $pdo->update($table1, $columns1, $update_where1);  // frp process      
    }


    $unique_id = $_POST["unique_id"];

    $update_where = "";
        
        if (is_array($_FILES["test_file"]['name'])) {
            if ($_FILES["test_file"]['name'][0] != "") {
                // Multi file Upload 
                $allowedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'xls', 'xlsx', 'txt', 'docx', 'doc'];
                $confirm_upload     = $fileUpload->uploadFiles("test_file");
                // if (in_array($confirm_upload, $allowedFormats)) {
                if (is_array($confirm_upload)) {
                    $_FILES["test_file"]['file_name'] = [];
                        
                    foreach ($confirm_upload as $c_key => $c_value) {
                        if ($c_value->status == 1) {
                           $c_file_name = $c_value->name ? $c_value->name.".".$c_value->ext : "";
                            array_push($_FILES["test_file"]['file_name'],$c_file_name);
                        }else {   
                        // if Any Error Occured in File Upload Stop the loop
                        $status     = $confirm_upload->status;
                        $data       = "file not uploaded";
                        $error      = $confirm_upload->error;
                        $sql        = "file upload error";
                        $msg        = "file_error";
                        break;
                        }
                    }  
                        // }
                }
            }else if (!empty($_FILES["test_file"]['name'])) {// Single File Upload
                $confirm_upload     = $fileUpload->uploadFile("test_file");
                        
                if($confirm_upload->status == 1) {
                    $c_file_name = $confirm_upload->name ? $confirm_upload->name.".".$confirm_upload->ext : "";
                            $_FILES["test_file"]['file_name']  = $c_file_name;
                } else {// if Any Error Occured in File Upload Stop the loop
                   $status     = $confirm_upload->status;
                   $data       = "file not uploaded";
                   $error      = $confirm_upload->error;
                   $sql        = "file upload error";
                   $msg        = "file_error";
                }                    
            }
        }
    // }

        if (is_array($_FILES["test_file"]['name'])) {
            if ($_FILES["test_file"]['name'][0] != "") {
                $file_names     = implode(",",$_FILES["test_file"]['file_name']);
                $file_org_names = implode(",",$_FILES["test_file"]['name']);
            }                            
        } else if (!empty($_FILES["test_file"]['name'])) {
            $file_names     = $_FILES["test_file"]['file_name'];
            $file_org_names = $_FILES["test_file"]['name'];
        }
        // print_r("hii".$file_names);die();

       
        if($file_names){
          $columns = [
            "entry_date" => $entry_date,
            "entry_no" => $entry_no,
            "starting_day" => $starting_day,
            "staff_name" => $staff_name,
            "batch_id" => $batch_id,
            "day" => $day,
            
            "hatching_status" => $hatching_status,
            
            "doc_name" => $file_names,
            "remarks" => $remarks,
            "unique_id" => unique_id($prefix)
          ];
            
        }
        else{
          $columns = [
            "entry_date" => $entry_date,
            "entry_no" => $entry_no,
            "starting_day" => $starting_day,
            "staff_name" => $staff_name,
            "batch_id" => $batch_id,
            "day" => $day,
            
            "hatching_status" => $hatching_status,
            "remarks" => $remarks,            
            "unique_id" => unique_id($prefix)
          ];
        }

            // check already Exist Or not
            $table_details = [
              $table,
              ["COUNT(unique_id) AS count"]
            ];
            $select_where       = 'batch_id =  "'.$egg_batch_id.'"  AND is_delete = 0  ';
        
            // When Update, check without current id
            if ($unique_id) {
              $select_where .= ' AND unique_id != "' . $unique_id . '"';
            }
        
            $action_obj = $pdo->select($table_details, $select_where);
        // print_r($action_obj);
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
              // Update begins
              if ($unique_id) {
                unset($columns['unique_id']);
                $update_where = [
                  "unique_id" => $unique_id
                ];
                $action_obj = $pdo->update($table, $columns, $update_where);
                // Update ends
              } else {
                // Insert begins
                $action_obj = $pdo->insert($table, $columns);
                
                // Insert ends
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
                  "entry_date",
                  "(SELECT batch_id FROM material_received WHERE material_received.unique_id = " . $table . " .batch_id) AS batch_id",
                  "day-1",
                  "(SELECT date FROM material_received WHERE material_received.unique_id = " . $table . ".batch_id and is_delete = 0) AS inward_date",
                  "hatching_status",
                  
                  "doc_name",
                  "staff_name",
                  // "remarks",
                  "unique_id",
                  "batch_id as batch_id1"
              ];
              $table_details = [
                  $table . " , (SELECT @a:= " . $start . ") AS a ",
                  $columns
              ];

              $where = "is_delete = 0";

              if (($_POST['from_date'] != '') && ($_POST['to_date'] != '')) {
                  $where .= " and entry_date>='" . $_POST['from_date'] . "' and entry_date<='" . $_POST['to_date'] . "'";
              }
              $order_by = "entry_date desc";

              if ($_POST['search']['value']) {
                $where .= " AND (batch_id LIKE '". batch_search(($_POST['search']['value']) )."')";
              
              }
              
              $sql_function = "SQL_CALC_FOUND_ROWS";
              $result = $pdo->select($table_details, $where, $limit, $start, $order_by, $sql_function);
              // print_r($result);
              $total_records = total_records();
              if ($result->status) {
                  $res_array = $result->data;
                  foreach ($res_array as $key => $value) {
          
                      switch ($value['hatching_status']) {
                          case 1:
                              $hatching_status = "<span style='color: red;'>Progressing</span>";
                              break;
                          case 2:
                              $hatching_status = "<span style='color: green;'>Completed</span>";
                              break;
                          default:
                              $hatching_status = "<span style='font-size:12px;font-weight : bold;color:blue'>Pending</span>";
                              break;
                      }
                      
                      $current_date = date('Y-m-d');
                      $entry_date = $value['entry_date'];
                      $batch_id1 = $value['batch_id1'];
                      
                      if ($value['staff_name'] == '6700f08395b9e81382') {
                        $value['staff_name'] = "Karthi";
                      } else {
                          $value['staff_name'] = disname(staff($value['staff_name'])[0]['user_name']);
                      }
                    
                      $value['entry_date'] = disdate($value['entry_date']);
                      $value['inward_date'] = disdate($value['inward_date']);
                      $value['$batch_id'] = batch_no($value['batch_id'])[0]['batch_id'];
                      $value['doc_name'] = image_view1("status_update", $value['unique_id'], $value['doc_name']);
                      $value['hatching_status'] = $hatching_status;
                      $value['remarks'] = $value['remarks'];
          
                      $btn_update = '';
                      $btn_delete = '';
                      
                      if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){
                      if (($entry_date != $current_date) || ($entry_date == $current_date && $value['hatching_status'] == "<span>Completed</span>")) {
                        $btn_update = '';
                        $btn_delete = '';
                    } else {
                        $btn_update = btn_update($folder_name, $value['unique_id']);
                        $btn_delete = btn_delete_status1($folder_name, $value['unique_id'], $batch_id1);
                    }
                  }else{
                      $btn_update = btn_update($folder_name, $value['unique_id']);
                      $btn_delete = btn_delete_status1($folder_name, $value['unique_id'], $batch_id1);
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
    $unique_id = $_POST['unique_id'];
    $batch_id = $_POST['batch_id1'];
    // print_r($batch_id);
    $columns = [
      "is_delete" => 1,
    ];
    $update_where = [
      "unique_id" => $unique_id
    ];
    $columns1 = ["batch_status" => 0];
    $update_where1 = [
      "egg_batch_id" => $batch_id,
      "is_delete" => '0'

    ];
    $action_obj = $pdo->update($table1, $columns1, $update_where1); //frp_process
    // print_r($action_obj);
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

  case 'select_entry_date':

    $batch_id = $_POST['batch_id'];
    $data = [];
    $columns = [
      "entry_date",
      "entry_no"
    ];
    $table_details =
      [

        "egg_process "
        ,
        $columns
      ];
    $select_where = "batch_id = '$batch_id' AND is_active = 1 and is_delete= 0 ";

    $result = $pdo->select($table_details, $select_where);
    // print_r($result);
    if ($result) {
      $status = $result->status;
      $data = $result->data;
      $error = "error";
      $sql = $result->sql;
      // $starting_day = "";
      foreach ($data as $row) {
        $entrydate = $row['entry_date'];
        $entry_no = $row['entry_no'];
        // $starting_day .= $entrydate;
        // $entry_no .= $entry_no;
      }
      echo $entrydate . "," . $entry_no;
    } else {
      $status = $result->status;
      $data = $result->data;
      $error = "error";
      $sql = $result->sql;
    }
    break;

    case 'document_upload_add_update':          
          $document_name          = $_POST["document_name"];        
          $screen_unique_id       = $_POST["screen_unique_id"]; 
          $update_where            = "";
  
         // print_r($document_name);
          if($_POST["document_name"] == 3){
                  $allowedExts = array("mp3", "mp4", "wma" , "wav");
                  $extension = pathinfo($_FILES["test_file"]['name'], PATHINFO_EXTENSION);

                  if ((($_FILES["test_file"]["type"] == "audio/mp3")|| ($_FILES["test_file"]["type"] == "audio/wav"))){

                    $file_exp = explode(".",$_FILES["test_file"]['name']);
                    $tem_name =  random_strings(25).".".$file_exp[1];
               
                    move_uploaded_file($_FILES["test_file"]["tmp_name"], "../../uploads/status_update/" . $tem_name);
                  }
                  if (!empty($_FILES["test_file"]['name'])) {
                  $file_names     = $tem_name;
                  $file_org_names = $_FILES["test_file"]['name'];
              }
          } 

          if($_REQUEST["document_name"] == 1){
                  $allowedExts = array("jpeg","png","jpg");
                  $extension = pathinfo($_FILES["test_file"]['name'], PATHINFO_EXTENSION);

                  if ((($_FILES["test_file"]["type"] == "image/jpeg")|| ($_FILES["test_file"]["type"] == "image/png")|| ($_FILES["test_file"]["type"] == "image/jpg"))){
                          $file_exp = explode(".",$_FILES["test_file"]['name']);
                          $tem_name =  random_strings(25).".".$file_exp[1];
               
                          move_uploaded_file($_FILES["test_file"]["tmp_name"], "../../uploads/status_update/" . $tem_name);
                  }
                  if (!empty($_FILES["test_file"]['name'])) {
                  $file_names     = $tem_name;
                  $file_org_names = $_FILES["test_file"]['name'];
              }
          } 

          if($_REQUEST["document_name"] == 2){
              // print_r($document_name);
             
                  $allowedExts = array("xls","xlsx","pdf");
                  $extension = pathinfo($_FILES["test_file"]['name'], PATHINFO_EXTENSION);
                    //  print_r($extension);
                  if ((($_FILES["test_file"]["type"] == "application/pdf")|| ($_FILES["test_file"]["type"] == "application/vnd.ms-excel")|| ($_FILES["test_file"]["type"] == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || ($_FILES["test_file"]["type"] == "application/xls"))){                    
                          $file_exp = explode(".",$_FILES["test_file"]['name']);
                          $tem_name =  random_strings(25).".".$file_exp[1];
               
                          move_uploaded_file($_FILES["test_file"]["tmp_name"], "../../uploads/status_update/" . $tem_name);
                  }
                  
                  if (!empty($_FILES["test_file"]['name'])) {
                  $file_names     = $tem_name;
                  //print_r($file_names);
                  $file_org_names = $_FILES["test_file"]['name'];
              }
          }         
      if($file_names != ''){
          $columns            = [
              "screen_unique_id"     => $screen_unique_id,
              "doc_name"             => $document_name,
              "file_name"            => $file_names,
              "unique_id"            => unique_id($prefix)
          ];     
                 $action_obj     = $pdo->insert($table_sub,$columns);
                      
                  $msg                = "create";

                  $file_names = "";
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
         }
          $json_array   = [
              "status"    => $status,
              "data"      => $data,
              "error"     => $error,
              "msg"       => $msg,
              "sql"       => $sql,
              
          ];
  
          echo json_encode($json_array);
      break;


  default:
    break;
}

function random_strings($length_of_string)
{

  // String of all alphanumeric character
  $str_result = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  // Shuffle the $str_result and returns substring
  // of specified length
  return substr(
    str_shuffle($str_result),
    0,
    $length_of_string
  );
}
function btn_delete_status1($folder_name = "", $unique_id = "", $batch_id1 = "")
{

  $final_str = '<a href="#" onclick="' . $folder_name . '_delete(\'' . $unique_id . '\', \'' . $batch_id1 . '\')"><i class="mdi mdi-delete  mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';

  return $final_str;
}


function image_view1($folder_name = "", $unique_id = "", $doc_name = "")
{
  // print_r($doc_name);
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
      // print_r($cfile_name);
      if ($doc_name) {
        if (($cfile_name[1] == 'jpg') || ($cfile_name[1] == 'png') || ($cfile_name[1] == 'jpeg')) {
          $image_view .= '<a href="javascript:print_view(\'/' . $doc_name . '\')"><img src="uploads/' . $folder_name . '/' . $doc_name . '"  height="50px" width="50px" ></a>';
          // $image_view .= '<img src="uploads/'.$folder_name.'/'.$doc_name.'"  height="50px" width="50px" >';
        } else if ($cfile_name[1] == 'pdf') {
          $image_view .= '<a href="javascript:print(\'/' . $doc_name . '\')"><img src="uploads/pdf.png"  height="50px" width="50px" ></a>';
        } else if (($cfile_name[1] == 'pdf') || ($cfile_name[1] == 'xls') || ($cfile_name[1] == 'xlsx')) {
          $image_view .= '<a href="javascript:print(\'/' . $doc_name . '\')"><img src="uploads/excel.png"  height="50px" width="50px" ></a>';
        } else if (($cfile_name[1] == 'txt') || ($cfile_name[1] == 'docx') || ($cfile_name[1] == 'doc')) {
          $image_view .= '<a href="javascript:print(\'/' . $doc_name . '\')"><img src="uploads/word.png"  height="50px" width="50px" ></a>';
        }
      }

    }
  }
  // print_r($image_view);    
  return $image_view;
}
?>