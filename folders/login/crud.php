<?php
$folder_name        = explode("/", $_SERVER['PHP_SELF']);
$folder_name        = $folder_name[count($folder_name) - 2];
$table              = "user";
$table_log          = "user_login_details";
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
$data               = "";
$msg                = "";
$error              = "";
$status             = "";
$test               = ""; // For Developer Testing Purpose
$from_year      = "2020";
$to_year        = "2021";
$sess_acc_year  = $from_year . "-" . $to_year;
$sess_acc_year  = acc_year();
switch ($action) { 
   
  case 'login':
    $user_name  = $_POST['user_name'];
    $password   = $_POST['password'];
    $columns    = [
      "COUNT(unique_id) AS count",
      "user_type_unique_id",
      "'' as user_image",
      "unique_id"
    ];
    $table_details = [
      $table,
      $columns
    ];
    $where  = " user_name = '" . $user_name . "' AND password = '" . $password . "' AND is_active = 1 AND is_delete = 0 ";
    $action_obj    = $pdo->select($table_details, $where);
    if ($action_obj->status) {
      $count_data     = $action_obj->data[0]["count"];
      if ($count_data == 1) {
        // session_start();
        $user                              = $action_obj->data[0];
        $msg                               = "success_login";
        $user_id                           = $user['unique_id'];
        $_SESSION["acc_year"]              = $sess_acc_year;
        $_SESSION["user_id"]               = $user_id;
        $_SESSION["staff_id"]              = $user['staff_unique_id'];
        $_SESSION["user_name"]             = $user_name;
        $_SESSION['sess_user_type']        = $user['user_type_unique_id'];
        $_SESSION['sess_user_id']          = $user_id;
        $_SESSION['sess_user_location']    = 'Erode';
        $_SESSION['sess_company_name']     = 'Zigma Global Environ Solutions';
        $_SESSION['sess_company_address']  = '24,Kalaimagal Kalvi Nilayam Road,';
        $_SESSION['sess_company_district'] = 'Erode 638001,';
        $_SESSION['sess_company_state']    = 'Tamil Nadu, INDIA.';
        $_SESSION['sess_company_phone_no'] = '9894326007';
        $_SESSION['sess_company_id']       = "comp5fa3b1c2a3bab70290";
        $_SESSION['sess_img_path']         = "img/";
        $_SESSION['company_logo']          = "logo-light.png";
        $_SESSION['sess_branch_id']        = "bran5fa3b1dced5d363322";
        $msg                               = "success_login";
        $permissions                       = menu_permission($user['user_type_unique_id']);
        $main_screens                      = $permissions["main_screens"];
        $sections                          = $permissions["sections"];
        $screens                           = $permissions["screens"];
        $_SESSION['main_screens']          = $main_screens;
        $_SESSION['sections']              = $sections;
        $_SESSION['screens']               = $screens;
        $user_image                        = "img/user.jpg";
        if ((file_exists("../../uploads/staff/" . $user['user_image'])) && ($user['user_image'] != "")) {
          $user_image = "uploads/staff/" . $user['user_image'];
        }
        $_SESSION["user_image"] = $user_image;

        //login CURD function

        if($user_id!=''){

          $columns_login       = [
                  
                  "user_id"              => $user_id,
                  "entry_date"           => date('Y-m-d'),
                  "entry_time"           => date('H:i:s'),
                  "log_type"             => 1,
                  "unique_id"            => unique_id($prefix)
           ];

           $action_obj_log     = $pdo->insert($table_log,$columns_login);

        }
// login crud end

        $json_array = [
          "status"    => 1,
          "data"      => 1,
          "error"     => 0,
          "msg"       => "success_login",
          "sql"       => $_SESSION["user_id"]
        ];
      } else {
        // Incorrect username and password handling 
        $json_array = [
          "status"    => 0,
          "data"      => 1,
          "error"     => 0,
          "msg"       => "incorrect",
          "sql"       => ""
        ];
      }
    } else {
      $msg    = "error";
    }
    echo json_encode($json_array);
    break;
  default:
    break;
}
