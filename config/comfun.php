<?php
$pdo->query("SET SESSION group_concat_max_len = 1000000;");

$logo_img       = "img/logo-light.png";
$logo_img_dark  = "img/logo-light.png";
$logo_img_sm    = "";
$logo_img_print = "";

// Default Admin User Type

$admin_user_type = "5f97fc3257f2525529";
$bde_user_type   = "5ff5e750c020c78104";


// Date Related Function
function today($format = "") {
    if ($format) {
        return date($format);
    }

    return date("Y-m-d");
}


function today_time($format = "") {
    if ($format) {
        return date($format);
    }

    return date("Y-m-d H:i:s");
}

function disdate ($date) {

    $result     = "";

    if ($date) {
        $result =  implode("-",array_reverse(explode("-",$date)));
    }

    return $result;
}

$today            = today();
$today_time       = today_time();

// Bill No Generation

function bill_no ($table_name,$where,$prefix = "", $y = 1,$m = 1, $d = 0,$custom_date = false) {
    $billno = $prefix;

    if (!$custom_date) {
        $custom_date = date("Y-m-d");
    }

    if ($y) {
        $billno .= date('Y',strtotime($custom_date));
    }

    if ($m) {
        $billno .= date('m',strtotime($custom_date))."-";
    }

    if ($d) {
        $billno .= date('d',strtotime($custom_date));
    }

    $bill_order_no  =  save_status($table_name,$where);

    $billno        .= sprintf("%05d",$bill_order_no);

    return $billno;
}

// Get Final Bill No

// Permissions Extract From user_screen_action Table 

$perm_columns       = [
    'variable_name',
    'is_active',
    'unique_id'
];

$perm_table         = 'user_screen_actions';
$perm_table_details = [
    $perm_table,
    $perm_columns
];

$perm_where         = '';      
$result_obj         = $pdo->select($perm_table_details,$perm_where);

if ($result_obj->status) {
    $status     = $result_obj->status;
    $data       = $result_obj->data;
    $error      = "";
    $sql        = $result_obj->sql;

    $perm_array = [];

    foreach ($data as $data_key => $data_value) {

        if (!$data_value['is_active']) {
            $data_value['unique_id'] = 0;
        }

        $perm_array[$data_value['variable_name']] = $data_value['unique_id'];
    }

    // Extract Permission Variables From $perm_array
    extract($perm_array);

    // Permissions Extract Ends Here

} else {
    $status     = $result_obj->status;
    $data       = $result_obj->data;
    $error      = $result_obj->error;
    $sql        = $result_obj->sql;
    $msg        = "error";
    exit;
}

// Uniqui ID Geneartor
function unique_id($prefix = "") {

    $unique_id = uniqid().rand(10000,99999);

    if($prefix) {
        $unique_id = $prefix.$unique_id;
    }

    return $unique_id;
}

function user_permission($permission_id = "", $folder_name = "") {

    if (($permission_id) && ($folder_name)) {

    }

    echo "";
    echo '<div class="container h-100">
            <div class="row h-100 justify-content-center align-items-center">
                <div class="form-group">
                <h1>You Don\'t Have a Permission to Access This Page</h1>
                </div>
            </div>  
        </div>';
    exit;
    // return false;
}

function menu_permission($user_type_id = "") {

    $return_arr = [
        "main_screens"  => "",
        "sections"      => "",
        "screens"       => ""
    ];

    if ($user_type_id) {

        global $pdo;

        $table_user_permission = "user_screen_permission";

        $select_where   = [
            "user_type" => $user_type_id
        ];

        $screen_columns = [
            // "GROUP_CONCAT(main_screen_unique_id) AS main_screens",
            // "GROUP_CONCAT(section_unique_id) AS sections",
            "GROUP_CONCAT(DISTINCT  screen_unique_id) AS screens"
        ];

        $table_details = [
            $table_user_permission,
            $screen_columns
        ];

        $group_by          = " screen_unique_id ";

        $screen_result     = $pdo->select($table_details,$select_where,"","","","",$group_by);

        if ($screen_result->status) {
            $screen_result_data     = $screen_result->data;

            $return_arr["screens"]  = array_implode($screen_result_data);
        } else {
            print_r($screen_result);
            echo "Menu Permission Error";
            exit;
        }

        $section_columns = [
            "GROUP_CONCAT(DISTINCT  section_unique_id) AS sections"
        ];

        $table_details = [
            $table_user_permission,
            $section_columns
        ];

        $group_by           = " section_unique_id ";

        $section_result     = $pdo->select($table_details,$select_where,"","","","",$group_by);

        if ($section_result->status) {
            $section_result_data     = $section_result->data;

            $return_arr["sections"]  = array_implode($section_result_data);
        } else {
            print_r($section_result);
            echo "Section Permission Error";
            exit;
        }

        $main_screen_columns = [
            "GROUP_CONCAT(DISTINCT  main_screen_unique_id) AS main_screens"
        ];

        $table_details = [
            $table_user_permission,
            $main_screen_columns
        ];

        $group_by               = " main_screen_unique_id ";

        $main_screen_result     = $pdo->select($table_details,$select_where,"","","","",$group_by);

        if ($main_screen_result->status) {
            $main_screen_result_data     = $main_screen_result->data;
            
            $return_arr["main_screens"]  = array_implode($main_screen_result_data);;
        } else {
            print_r($main_screen_result);
            echo "Section Permission Error";
            exit;
        }
    }

    return $return_arr;
}

function array_implode ($value_arr = "") {

    $return_arr = [];

    if (is_array($value_arr)) {

        foreach ($value_arr as $arr_key => $arr_value) {

            $return_arr[] = array_values($arr_value)[0];
            
        }

    }

    return $return_arr;
}

function folder_permission ($folder_name = "") {

}

function acc_year() {
    $acc_year 	= '';
	$curr_year 	= date("Y");
	
	$today 		= strtotime(date("d-m-Y"));	
	$end_date 	= strtotime("31-03-".$curr_year);
	$start_date = strtotime("01-04-".$curr_year);
	
	if ($today>=$start_date) {
		$next_year 		= $curr_year + 1;
		$acc_year  		= $curr_year."-".$next_year;
	}	
	else if ($today<=$end_date) {
		$previous_year 	= $curr_year - 1;
		$acc_year  		= $previous_year."-".$curr_year; 
	}

	return $acc_year;
    
}

function btn_add ($add_link = "") {
    $final_str = '<a href="'.$add_link.'" class="d-flex justify-content-center float-md-right"><button type="button" class="btn btn-primary add_btn" ><i class="bx bx-folder-plus ne-btns"></i> NEW </button></a>';

    return $final_str;
}

function btn_cancel ($list_link = "") {
    $final_str = '<a href="'.$list_link.'"><button type="button" class="btn btn-danger btn-rounded waves-effect waves-light float-right ml-2" >Cancel</button></a>';

    return $final_str;
}




function btn_createupdate($folder_name = "", $unique_id = "",$btn_text ,$prefix = "", $suffix = "_cu", $custom_class = "") {
    $final_str = '<button type="button" class="btn btn-primary  createupdate_btn  '.$custom_class.'" onclick="'.$folder_name.$suffix.'(\''.$unique_id.'\')">'.$btn_text.'</button>';

    return $final_str;
}

function btn_update($folder_name = "",$unique_id = "", $prefix = "",$suffix = "") {
    // $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/update&unique_id='.$unique_id.'"><button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1"><i class="mdi mdi-square-edit-outline"></i></button></a>';

    $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/form&unique_id='.$unique_id.'"><i class="mdi mdi-square-edit-outline mdi-24px waves-effect waves-light mt-n2 mb-n2 text-green"></i></a>';

    
    return $final_str;
}

function btn_delete($folder_name = "",$unique_id = "") {
   

    $final_str = '<a href="#" onclick="'.$folder_name.'_delete(\''.$unique_id.'\')"><i class="mdi mdi-delete  mdi-24px waves-effect waves-light mt-n2 mb-n2 text-danger"></i></a>';

    return $final_str;
}






function btn_call_update($folder_name = "",$unique_id = "", $prefix = "",$suffix = "") {
    $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/update&unique_id='.$unique_id.'"><i class="mdi mdi-account-plus  mdi-24px waves-effect waves-light mt-n2 mb-n2 text-warning"></i></a>';
    
    return $final_str;
}

function btn_view($folder_name = "",$unique_id = "", $prefix = "",$suffix = "") {
    // $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/update&unique_id='.$unique_id.'"><button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1"><i class="mdi mdi-square-edit-outline"></i></button></a>';

    $final_str = '<a href="index.php?file='.$prefix.$folder_name.$suffix.'/view&unique_id='.$unique_id.'"><i class="mdi mdi-eye-outline mdi-24px waves-effect waves-light mt-n2 mb-n2 text-pink mr-1"></i></a>';

    
    return $final_str;
}

function btn_call_start($customer_id = "", $followup_id = "") {
    $final_str = '<a href="javascript:void(0);" onclick="start_call(\''.$customer_id.'\',\''.$followup_id.'\')"><i class="mdi mdi-play-circle  mdi-24px waves-effect waves-light mt-n2 mb-n2 ml-2 text-primary"></i></a>';
    $final_str = '<a href="javascript:void(0);" onclick="start_call(\''.$customer_id.'\',\''.$followup_id.'\')"><img src="img/start.png" width="27" height="27" alt="Start Call" class="ml-2"></a>';
    
    return $final_str;
}

function btn_map($latitude = "",$longitude = "") {
    
    //$def_latitude="13.0456605"; //chennai location
    //$def_longitude="80.2086916"; //chennai location
    
    $def_latitude = "11.3380742"; // erode location
    $def_longitude = "77.7190644"; // erode location

    $final_str = '<a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin='.$def_latitude. "," .$def_longitude.'&destination='.$latitude.','.$longitude.'"><i class="mdi mdi-map-marker mdi-24px waves-effect waves-light mt-n2 mb-n2 text-primary"></i></a>';
    
    return $final_str;
}

function btn_print($folder_name = "",$unique_id = "", $file_name = "",$prefix = "",$suffix = "") {
    $final_str = '<a target="_blank" href="index.php?file='.$prefix.$folder_name.$suffix.'/'.$file_name.'&unique_id='.$unique_id.'"><button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1"><i class="mdi mdi-printer"></i></button></a>';

    $final_str = '<a target="_blank" href="index.php?file='.$prefix.$folder_name.$suffix.'/'.$file_name.'&unique_id='.$unique_id.'"><i class="mdi mdi-printer mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i></a>';
    
    return $final_str;
}


function btn_approval_print($folder_name = "",$unique_id = "",$sub_unique_id = "", $file_name = "",$prefix = "",$suffix = "") {
    $final_str = '<a target="_blank" href="index.php?file='.$prefix.$folder_name.$suffix.'/'.$file_name.'&unique_id='.$unique_id.'&sub_unique_id='.$sub_unique_id.'"><button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light mr-1"><i class="mdi mdi-lead-pencil"></i></button></a>';
    
    return $final_str;
}



function btn_edit($folder_name = "",$unique_id = "") {
    $final_str = '<button type="button" class="btn btn-asgreen btn-xs btn-rounded waves-effect waves-light " onclick="'.$folder_name.'_edit(\''.$unique_id.'\')"><i class="mdi mdi-square-edit-outline"></i></button>';

    return $final_str;
}

// Datatables Total Records Count Function
function total_records() {
    global $pdo;
    
	$total_records  = 0;
	$sql 	        = "SELECT FOUND_ROWS() as total";
	$result	        = $pdo->query($sql);
	if($result->status){
		$total      = $result->data[0]["total"];
    }
    	
	return $total;
}

// Convert Original folder Name to Display Name
function disname($name = "")
{
    if ($name) {
        $name = explode("_",$name);
        $name = array_map("ucfirst",$name);
        $name = implode(" ",$name);

        return $name;
    } else {
        return "Empty Title";
    }
}

// Continents Function
function continent($unique_id = "",$columns = "") {
    global $pdo;

    $where          = [];
    $table          = "continents";

    if (!$columns) {
        $table_columns = [
            $table,
            [
                "unique_id",
                "name"  
                ]
            ];
    } else {
        $table_columns = [
            $table,
            $columns
        ];
    }

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($unique_id) {
        // $where = " WHERE continent_id = '".$continent_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $continents = $pdo->select($table_columns, $where);

    // print_r($continents);

    if ($continents->status) {
        return $continents->data;
    } else {
        print_r($continents);
        return 0;
    }
}

function select_option($options = [],$description = "", $is_selected = [],$is_disabled = []) {
    
    $option_str     = "<option value='' selected='selected'>No Options to Select</option>";

    $data_attribute = "";

    if ($options) {

        $option_str     = "<option value=''>Select</option>";

        if ($description) {
            $option_str     = "<option value=''  selected>".$description."</option>";
        }
        foreach ($options as $key => $value) {

            $value      = array_values($value);
            $selected   = "";
            $disabled   = "";

            if (is_array($is_selected) AND in_array($value[0],$is_selected)) {            
                $selected = " selected='selected' ";
            } elseif ($is_selected == $value[0]) {
                
                $selected = " selected='selected' ";
            }
            
            if (is_array($is_disabled) AND in_array($value[0],$is_disabled)) {            
                $disabled = " disabled='disabled' ";
            } elseif ($is_disabled == $value[0]) {
                $disabled = " disabled='disabled' ";
            }

            if (strpos($value[1],"_")) {
                $value[1] = disname($value[1]);
            } else {
                $value[1] = ucfirst($value[1]);
            }

            if (isset($value[2])) {
                $data_attribute = "data-extra='".$value[2]."'";
            } 

            $option_str .= "<option value='".$value[0]."'".$data_attribute.$selected.$disabled.">".$value[1]."</option>";
        }
    }
    
    return $option_str;
}

function active_status($is_active_val = '') {
    $option_str    = "";
    $is_active     = "";
    $is_inactive   = "";

    if ($is_active_val == 1) {
        $is_active     = " selected = 'selected' ";
    } else {
        $is_inactive   = " selected = 'selected' ";
    }
    
    $option_str     =  "<option value='1'".$is_active.">Active</option>";
    $option_str     .=  "<option value='0'".$is_inactive.">In Active</option>";

    return $option_str;
}






// / Active and In Active Show in Data Table
function is_active_show($is_active = 0) {
    $act_str = "<span style='color: red'>In Active</span>";

    if ($is_active) {
        $act_str = "<span style='color: green'>Active</span>";
    }

    return $act_str;
}




function country($unique_id = "") {
    global $pdo;

    $table_name    = "countries";
    $where         = [];
    $table_columns = [
        "unique_id",
        "name"
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
        // $where = " WHERE unique_id = '".$unique_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $countries = $pdo->select($table_details, $where);

    // print_r($countries);

    if ($countries->status) {
        return $countries->data;
    } else {
        print_r($countries);
        return 0;
    }
}


// State Function
function state($unique_id = '',$country_id = "") {
    global $pdo;

    $table_name    = "states";
    $where         = [];
    $table_columns = [
        "unique_id",
        "state_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($country_id) {
        // $where = " WHERE country_id = '".$country_id."' ";
        $where["country_unique_id"] = $country_id;
    }

    if ($unique_id) {
        $table_details = $table_name;
        $where         = [
            "unique_id" => $unique_id
        ];
    }

    $states = $pdo->select($table_details, $where);

    // print_r($states);

    if ($states->status) {
        return $states->data;
    } else {
        print_r($states);
        return 0;
    }
}
// District Function
function districts($unique_id = "",$state_id = "") {
    global $pdo;

    $table_name    = "districts";
    $where         = [];
    $table_columns = [
        "unique_id",
        "district_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($state_id) {
        // $where = " WHERE state_id = '".$state_id."' ";
        $where["state_unique_id"] = $state_id;
    }

    if ($unique_id) {
        $table_details = $table_name;
        $where         = [];
        $where         = [
            "unique_id" => $unique_id
        ];
    }

    $districts = $pdo->select($table_details, $where);

    // print_r($districts);

    if ($districts->status) {
        return $districts->data;
    } else {
        print_r($districts);
        return 0;
    }
}


// pit id
function pit_name($unique_id = "") {
    global $pdo;

    $table_name    = "pit_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "pit_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $pit_name = $pdo->select($table_details, $where);

    if ($pit_name->status) {
        return $pit_name->data;
    } else {
        print_r($pit_name);
        return 0;
    }
}



function frp_tray_name($unique_id = "") {
    global $pdo;

    $table_name    = "tray_creation";
    $where         = [];
    $table_columns = [
        "id",
        "bin_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "tray_status" => 0,
        "is_active"   => 1,
        "is_delete"   => 0,
        "tray_type"   => 2
    ];

    if ($unique_id) {

        $where              = [];
        $where["id"] = $unique_id;
    }

    $bin_name = $pdo->select($table_details, $where);
    // print_r($bin_name);

    if ($bin_name->status) {
        return $bin_name->data;
    } else {
        // print_r($bin_name);
        return 0;
    }
}

function tray($unique_id = "") {
    global $pdo;

    $table_name    = "tray_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "bin_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0,
        "tray_type" => 1
    ];

    if ($unique_id) {

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $bin_name = $pdo->select($table_details, $where);
    // print_r($bin_name);

    if ($bin_name->status) {
        return $bin_name->data;
    } else {
        // print_r($bin_name);
        return 0;
    }
}

// City Function
function city($unique_id = "",$state_id = "",$district_id = "") {
    global $pdo;

    $table_name    = "cities";
    $where         = [];
    $table_columns = [
        "unique_id",
        "city_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($state_id) {
        // $where = " WHERE state_id = '".$state_id."' ";
        // $where["district_unique_id"] = $state_id;
        $where["state_unique_id"] = $state_id;
    }

    if ($district_id) {
        // $where = " WHERE state_id = '".$state_id."' ";
        $where["district_unique_id"] = $state_id;
        // $where["state_unique_id"] = $state_id;
    }

    if ($unique_id) {
        $table_details = $table_name;
        $where         = [];
        $where         = [
            "unique_id" => $unique_id
        ];
    }

    $cities = $pdo->select($table_details, $where);

    // print_r($cities);

    if ($cities->status) {
        return $cities->data;
    } else {
        print_r($cities);
        return 0;
    }
}

// Screen Type Function
function screen_type($unique_id = "") {
    global $pdo;

    $table_name    = "user_screen_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "type_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $screen_types = $pdo->select($table_details, $where);

    if ($screen_types->status) {
        return $screen_types->data;
    } else {
        print_r($screen_types);
        return 0;
    }
}

// material_received_supplier_name
function supplier_name($unique_id = "") {
    global $pdo;

    $table_name    = "supplier_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "supplier_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $supplier_name = $pdo->select($table_details, $where);

    if ($supplier_name->status) {
        return $supplier_name->data;
    } else {
        print_r($supplier_name);
        return 0;
    }
}



// material_received_unit_name
function unit_name($unique_id = "") {
    global $pdo;

    $table_name    = "unit_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "unit_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }



    $unit_name = $pdo->select($table_details, $where);
    // print_r($unit_name );
    if ($unit_name->status) {
        return $unit_name->data;
    } else {
        print_r($unit_name);
        return 0;
    }
}



// material_received_item_name
function item_name_select($unique_id = "") {
    global $pdo;

    $table_name    = "item_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "item_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $item_name_select = $pdo->select($table_details, $where);

    if ($item_name_select->status) {
        return $item_name_select->data;
    } else {
        print_r($item_name_select);
        return 0;
    }
}



function entry_no_select($unique_id = "") {
    global $pdo;

    $table_name    = "egg_process";
    $where         = [];
    $table_columns = [
        "unique_id",
        "entry_no"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

   $entry_no_select = $pdo->select($table_details, $where);

    if ($entry_no_select->status) {
        return $entry_no_select->data;
    } else {
        print_r($entry_no_select);
        return 0;
    }
}




function save_status ($table_name,$where) {
    if ($table_name) {
        global $pdo;

        $columns    = [
            "max(id) AS save_status"
        ];

        $table_details = [
            $table_name,
            $columns
        ];

        $result         = $pdo->select($table_details,$where);

        if ($result->status) {

        $res_array      = $result->data[0]['save_status'] + 1;

        } else {
            print_r($result);
            $res_array = uniqid().rand(10000,99999)."Error";
        }

        return $res_array;
    }
}


// Main Screen Function
function main_screen($unique_id = "") {
    global $pdo;

    $table_name    = "user_screen_main";
    $where         = [];
    $table_columns = [
        "unique_id",
        "screen_main_name",
        "icon_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $main_screens = $pdo->select($table_details, $where);

    if ($main_screens->status) {
        return $main_screens->data;
    } else {
        print_r($main_screens);
        return 0;
    }
}

// Main Screen Function
function section_name($unique_id ="",$main_screen_id = "") {
    global $pdo;

    $table_name    = "user_screen_sections";
    $where         = [];
    $table_columns = [
        "unique_id",
        "section_name",
        "icon_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    $order_by = [
        "order_no"
    ];

    if ($unique_id) {

        $where              = [];
        $where["unique_id"] = $unique_id;
    }
    if ($main_screen_id) {

        $where["screen_main_unique_id"] = $main_screen_id;
    }

    $section_names = $pdo->select($table_details, $where, "", "", $order_by);

    if ($section_names->status) {
        return $section_names->data;
    } else {
        print_r($section_names);
        return 0;
    }
}
// User Screen
function user_screen($unique_id = "",$screen_section_id = "",$folder_name = "") {
    global $pdo;

    $table_name    = "user_screen";
    $where         = [];
    $table_columns = [
        "unique_id",
        "screen_name",
        "folder_name",
        "icon_name",
        "screen_main_name as main_screen_unique_id",
        "actions",

    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    $order_by = [
        "order_no"
    ];

    if ($screen_section_id) {

        $where["screen_main_name"] = $screen_section_id;
    }  
    if ($unique_id) {

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    if ($folder_name) {

        $where              = [];
        $where["folder_name"] = $folder_name;
    }

    $user_screens = $pdo->select($table_details, $where, "", "", $order_by);

    if ($user_screens->status) {
        return $user_screens->data;
    } else {
        print_r($user_screens);
        return 0;
    }
}

// User Screen Actions Function
function user_actions($unique_id = "") {
    global $pdo;

    $table_name    = "user_screen_actions";
    $where         = [];
    $table_columns = [
        "unique_id",
        "action_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $user_actions = $pdo->select($table_details, $where);

    if ($user_actions->status) {
        return $user_actions->data;
    } else {
        print_r($user_actions);
        return 0;
    }
}

// Main Screen Function
function user_type($unique_id = "") {
    global $pdo;

    $table_name    = "user_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "user_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $user_types = $pdo->select($table_details, $where);

    if ($user_types->status) {
        return $user_types->data;
    } else {
        print_r($user_types);
        return 0;
    }
}

// Main Screen Function
function call_type($unique_id = "") {
    global $pdo;

    $table_name    = "call_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "call_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $call_types = $pdo->select($table_details, $where);

    if ($call_types->status) {
        return $call_types->data;
    } else {
        print_r($call_types);
        return 0;
    }
}

// Call type Function
function forecast($unique_id = "",$column_where = "") {
    global $pdo;

    $table_name    = "forecast";
    $where         = [];
    $table_columns = [
        "unique_id",
        "forecast",
        "is_active"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        // "is_active" => 1,
        "is_delete" => 0
    ];

    if ($unique_id) {
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    if ($column_where) {
        // $where[array_keys($column_where)[0]] = $column_where[array_keys($column_where)[0]];
        $where = array_merge($where,$column_where);
    }

    $forecasts = $pdo->select($table_details, $where);

    if ($forecasts->status) {
        return $forecasts->data;
    } else {
        print_r($forecasts);
        return 0;
    }
}

// Call type Function
function business_forecast($unique_id = "",$column_where = "") {
    global $pdo;

    $table_name    = "business_forecasts";
    $where         = [];
    $table_columns = [
        "business_forecast AS ids",
        "(SELECT forecast FROM forecast AS fc WHERE fc.unique_id = ".$table_name.".business_forecast) AS business_forecast"        
        // "business_forecast"
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
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    if ($column_where) {
        // $where[array_keys($column_where)[0]] = $column_where[array_keys($column_where)[0]];
        $where = array_merge($where,$column_where);
    }

    $business_forecasts = $pdo->select($table_details, $where);

    if ($business_forecasts->status) {
        return $business_forecasts->data;
    } else {
        print_r($business_forecasts);
        return 0;
    }
}

// Call type Function
function business_forecast_by_name($unique_id = "",$column_where = "") {
    global $pdo;

    $table_name    = "view_business_forecast";
    $where         = [];
    $table_columns = [
        "business_forecast AS id",
        "business_forecast"
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
        $where                      = [];
        $where["business_forecast"] = $unique_id;
    }

    if ($column_where) {
        // $where[array_keys($column_where)[0]] = $column_where[array_keys($column_where)[0]];
        $where = array_merge($where,$column_where);
    }

    $business_forecasts = $pdo->select($table_details, $where);

    if ($business_forecasts->status) {
        return $business_forecasts->data;
    } else {
        print_r($business_forecasts);
        return 0;
    }
}

// Call Status Function
function call_status($unique_id = "",$column_where = "") {
    global $pdo;

    $table_name    = "call_status";
    $where         = [];
    $table_columns = [
        "unique_id",
        "call_status"
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
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    if ($column_where) {
        // $where[array_keys($column_where)[0]] = $column_where[array_keys($column_where)[0]];
        $where = array_merge($where,$column_where);
    }

    $call_status = $pdo->select($table_details, $where);

    if ($call_status->status) {
        return $call_status->data;
    } else {
        print_r($call_status);
        return 0;
    }
}

// Main Screen Function
function call_type_stage ($unique_id = "") {
    global $pdo;

    $table_name    = "call_type";
    $where         = [];
    $table_columns = [
        "stages",
        "call_type"
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

        if (is_array($unique_id)) {

            $where = "";
            $where = "is_active = 1 AND is_delete = 0 ";
            $where .= " AND stages IN ('".implode("','",$unique_id)."')";
            
        } else {
            $where              = [];
            $where["unique_id"] = $unique_id;
        }

        
    }

    $call_types = $pdo->select($table_details, $where);

    if ($call_types->status) {
        return $call_types->data;
    } else {
        print_r($call_types);
        return 0;
    }
}


function curr_staff_customers () {
    global $pdo;

    $table_name     = "bdm_creation_sub";

    $where          = "";
    $table_columns  = [
        "GROUP_CONCAT(customer_unique_id) AS customers"
    ];

    $table_details  = [
        $table_name,
        $table_columns
    ];

    $group_by       = " staff_unique_id ";

    $where          = " staff_unique_id = '".$_SESSION['staff_id']."' ";

    $customers_list = $pdo->select($table_details, $where, "", "", "", "", $group_by);

    if ($customers_list->status) {
        return $customers_list->data;
    } else {
        print_r($customers_list);
        return 0;
    }
}



// Customers Function
function customers ($unique_id = "") {
    global $pdo;
    global $bde_user_type;

    $table_name    = "customer_profile";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    // $where     = [
    //     "is_active"         => 1,
    //     "approved_status"   => 1,
    //     "is_delete"         => 0
    // ];



    if ($unique_id) {

        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    } else {

        $where         = " is_active = 1 AND approved_status = 1 AND is_delete = 0 ";
        // BDE user condition check
        if ($bde_user_type == $_SESSION['sess_user_type']) {

            $select_result = curr_staff_customers();
            
            if (!empty($select_result) && ($select_result != 0)) {
                $customer_list  = $select_result[0]['customers'];
                
                if ($customer_list) {
                    $customer_list = explode(",",$customer_list);
                    $customer_list = '"'.implode('","',$customer_list).'"';
                    
                    $where         .= " AND unique_id IN (".$customer_list.")"; 
                }
            } else {
                $where         .= " AND unique_id IN ('')"; 
            }
        }
    }

    $customers_list = $pdo->select($table_details, $where);

    if ($customers_list->status) {
        return $customers_list->data;
    } else {
        print_r($customers_list);
        return 0;
    }
}

// //customer contact person Function
// function customer_contact_person ($unique_id = "") {
//     global $pdo;

//     $table_name    = "customer_contact_person";
//     $where         = [];
//     $table_columns = [
//         "unique_id",
//         "contact_person_name",
//         "contact_person_email",
//         "contact_person_contact_no"
//     ];

//     $table_details = [
//         $table_name,
//         $table_columns
//     ];

//     $where     = [
//         "is_active" => 1,
//         "is_delete" => 0
//     ];

//     if ($unique_id) {

//         $table_details      = $table_name;

//         $where              = [];
//         $where["customer_profile_unique_id"] = $unique_id;
//     }

//     $customer_contact_person_list = $pdo->select($table_details, $where);

//     if ($customer_contact_person_list->status) {
//         return $customer_contact_person_list->data;
//     } else {
//         print_r($customer_contact_person_list);
//         return 0;
//     }
// }

//category Function
function customer_category ($unique_id = "") {
    global $pdo;

    $table_name    = "customer_category";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_category"
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

    $customer_category_list = $pdo->select($table_details, $where);

    if ($customer_category_list->status) {
        return $customer_category_list->data;
    } else {
        print_r($customer_category_list);
        return 0;
    }
}

//category Function
function customer_category_dashboard ($unique_id = "") {
    global $pdo;

    $table_name    = "customer_category";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_category"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "unique_id" => "602a2b9b0e79040476",
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($unique_id) {

        $table_details      = $table_name;

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $customer_category_list = $pdo->select($table_details, $where);

    if ($customer_category_list->status) {
        return $customer_category_list->data;
    } else {
        print_r($customer_category_list);
        return 0;
    }
}

//Customers Sub Category Function
function customer_sub_category ($unique_id = "",$customer_category_id = "") {
    global $pdo;

    $table_name    = "customer_sub_category";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_sub_category"
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

    if ($customer_category_id) {

        $where["customer_category_id"] = $customer_category_id;
    }

    $customer_sub_category_list = $pdo->select($table_details, $where);


    if ($customer_sub_category_list->status) {
        return $customer_sub_category_list->data;
    } else {
        print_r($customer_sub_category_list);
        return 0;
    }
}

//Customers Group Function
function customer_group ($unique_id = "",$customer_category_id = "") {
    global $pdo;

    $table_name    = "customer_group";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_group"
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

    if ($customer_category_id) {

        $where["customer_category_id"] = $customer_category_id;
    }

    $customer_group_list = $pdo->select($table_details, $where);

    if ($customer_group_list->status) {
        return $customer_group_list->data;
    } else {
        print_r($customer_group_list);
        return 0;
    }
}


//Sub Customers Function
function sub_customer_type ($unique_id = "") {
    global $pdo;

    $table_name    = "sub_customer_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "sub_customer_type"
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
        
        $where              = [];
        $table_details      = $table_name;
        $where["unique_id"] = $unique_id;
    }

    $sub_customer_type_list = $pdo->select($table_details, $where);

    if ($sub_customer_type_list->status) {
        return $sub_customer_type_list->data;
    } else {
        print_r($sub_customer_type_list);
        return 0;
    }
}

// Product Category
function item_category ($unique_id = "") {
    global $pdo;

    $table_name    = "item_categorys";
    $where         = [];
    $table_columns = [
        "unique_id",
        "category_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $item_categorys = $pdo->select($table_details, $where);

    if ($item_categorys->status) {
        return $item_categorys->data;
    } else {
        print_r($item_categorys);
        return 0;
    }
}


//Group selection according to Category
function item_group($unique_id="",$item_category_id = "") {
    global $pdo;

    $table_name    = "item_groups";
    $where         = [];
    $table_columns = [
        "unique_id",
        "group_name",
        "item_category_unique_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active" => 1,
        "is_delete" => 0
    ];

    if ($item_category_id) {

        $where["item_category_unique_id"] = $item_category_id;
    }
     if ($unique_id) {

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $item_groups = $pdo->select($table_details, $where);

    if ($item_groups->status) {
        return $item_groups->data;
    } else {
        print_r($item_groups);
        return 0;
    }
}

// Units
function unit($unique_id = "") {
    global $pdo;

    $table_name    = "units";
    $where         = [];
    $table_columns = [
        "unique_id",
        "unit_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $unit = $pdo->select($table_details, $where);

    if ($unit->status) {
        return $unit->data;
    } else {
        print_r($unit);
        return 0;
    }
}

// Work Designation Function
function work_designation($unique_id = "") {
    global $pdo;

    $table_name    = "work_designation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "designation_type"
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
        // $where = " WHERE country_id = '".$country_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $work_designations = $pdo->select($table_details, $where);

    // print_r($countries);

    if ($work_designations->status) {
        return $work_designations->data;
    } else {
        print_r($work_designations);
        return 0;
    }
}


// Customer Segment Function
function customer_segment ($unique_id = "") {
    global $pdo;

    $table_name    = "customer_segment";
    $where         = [];
    $table_columns = [
        "unique_id",
        "customer_segment"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $customer_segment_list = $pdo->select($table_details, $where);

    if ($customer_segment_list->status) {
        return $customer_segment_list->data;
    } else {
        print_r($customer_segment_list);
        return 0;
    }
}



// Enquiry Type Function
function enquiry_type ($unique_id = "") {
    global $pdo;

    $table_name    = "enquiry_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "enquiry_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $enquiry_type_list = $pdo->select($table_details, $where);

    if ($enquiry_type_list->status) {
        return $enquiry_type_list->data;
    } else {
        print_r($enquiry_type_list);
        return 0;
    }
}



// BID Type Function
function bid_type ($unique_id = "") {
    global $pdo;

    $table_name    = "bid_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "bid_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $bid_type_list = $pdo->select($table_details, $where);

    if ($bid_type_list->status) {
        return $bid_type_list->data;
    } else {
        print_r($bid_type_list);
        return 0;
    }
}

// Tender Type Function
function tender_type ($unique_id = "") {
    global $pdo;

    $table_name    = "tender_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "tender_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $tender_type_list = $pdo->select($table_details, $where);

    if ($tender_type_list->status) {
        return $tender_type_list->data;
    } else {
        print_r($tender_type_list);
        return 0;
    }
}

// Tender Evaluation System Function
function tender_evaluation_system ($unique_id = "") {
    global $pdo;

    $table_name    = "tender_evaluation_system";
    $where         = [];
    $table_columns = [
        "unique_id",
        "tender_evaluation_system"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $tender_evaluation_system_list = $pdo->select($table_details, $where);

    if ($tender_evaluation_system_list->status) {
        return $tender_evaluation_system_list->data;
    } else {
        print_r($tender_evaluation_system_list);
        return 0;
    }
}

// BID Type Function
function mode_of_purchase ($unique_id = "") {
    global $pdo;

    $table_name    = "mode_of_purchase";
    $where         = [];
    $table_columns = [
        "unique_id",
        "mode_of_purchase"
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

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $mode_of_purchase_list = $pdo->select($table_details, $where);

    if ($mode_of_purchase_list->status) {
        return $mode_of_purchase_list->data;
    } else {
        print_r($mode_of_purchase_list);
        return 0;
    }
}

// BID Type Function
function item_name ($unique_id = "",$item_group_unique_id= "") {


    global $pdo;

    $table_name    = "item_names_code";
    $where         = [];
    $table_columns = [
        "unique_id",
        "CONCAT(item_code,' / ',item_name) AS item_name",
        "item_group_unique_id",
        "tax_unique_id"

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

        $table_columns = [
            "unique_id",
            "item_name",
            "item_group_unique_id",
            "tax_unique_id"

    
        ];
    
        $table_details = [
            $table_name,
            $table_columns
        ];

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

     if ($item_group_unique_id) {
        // $where = [];
        $where["item_group_unique_id"] = $item_group_unique_id;
    }

    $item_name_list = $pdo->select($table_details, $where);



    if ($item_name_list->status) {
        return $item_name_list->data;
    } else {
        print_r($item_name_list);
        return 0;
    }
}



// BID Type Function
function staff_name ($unique_id = "") {
    global $pdo;

    $table_name    = "staff";
    $where         = [];
    $table_columns = [
        "unique_id",
        "staff_name",
        "office_contact_no",
        "designation_unique_id"
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

    $staff_name_list = $pdo->select($table_details, $where);

    if ($staff_name_list->status) {
        return $staff_name_list->data;
    } else {
        print_r($staff_name_list);
        return 0;
    }
}

function staff ($unique_id = "") {
    global $pdo;

    $table_name    = "user";
    $where         = [];
    $table_columns = [
        "unique_id",
        "user_name",
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

// BID Type Function
function staff_ceo_name ($unique_id = "") {
    global $pdo;

    $table_name    = "staff";
    $where         = [];
    $table_columns = [
        "unique_id",
        "staff_name",
        "office_contact_no",
        "designation_unique_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active"             => 1,
        "designation_unique_id" => "5ff5d3423713a59778",
        "is_delete"             => 0
    ];

    if ($unique_id) {
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $staff_ceo_name_list = $pdo->select($table_details, $where);

    if ($staff_ceo_name_list->status) {
        return $staff_ceo_name_list->data;
    } else {
        print_r($staff_ceo_name_list);
        return 0;
    }
}




// BID Type Function
function staff_director_name ($unique_id = "") {
    global $pdo;

    $table_name    = "staff";
    $where         = [];
    $table_columns = [
        "unique_id",
        "staff_name",
        "office_contact_no",
        "designation_unique_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active"             => 1,
        "designation_unique_id" => "5ff5d3585747568896",
        "is_delete"             => 0
    ];

    if ($unique_id) {
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $staff_director_name_list = $pdo->select($table_details, $where);

    if ($staff_director_name_list->status) {
        return $staff_director_name_list->data;
    } else {
        print_r($staff_director_name_list);
        return 0;
    }
}




function btn_approve($folder_name = "",$unique_id = "",$approved_status = "") {
    if($approved_status) {
        $final_str = '<i class="mdi mdi-check btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light"></i>';
    } else {
        $final_str = '<i class=" mdi mdi-24px mdi-alert-circle-outline" style = "color :#e6f22b;"></i>';
    }
    
    return $final_str;
}

function btn_approve_status($folder_name = "",$unique_id = "",$approved_status = "") {
    if($approved_status=='0') {
        $final_str = '<button type="button" class="btn btn-danger  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-window-close"></i></button></a>';
    } else {
        $final_str = '<button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-check"></i></button></a>';
    }
    
    return $final_str;
}


function btn_qr_print($folder_name = "",$unique_id = "", $file_name = "",$prefix = "",$suffix = "") {
   
    $final_str = '<a href="javascript:new_external_window_print(\''.$folder_name.'\',\''.$unique_id.'\',\''.$file_name.'\')"><i class="mdi mdi-qrcode-scan mdi-24px waves-effect waves-light mt-n2 mb-n2 mr-1 text-success"></i></a>';
    
    return $final_str;
}
function btn_bid_approve_status($folder_name = "",$unique_id = "",$approved_status = "") {
    if($approved_status=='0') {
        $final_str = '<button type="button"  class="btn btn-danger  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-exclamation-thick"></i></button></a>';
    } else if($approved_status=='1') {
        $final_str = '<button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-check"></i></button></a>';
    }
    else if($approved_status=='2') {
        $final_str = '<button type="button"  class="btn btn-danger  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-window-close"></i></button></a>';
    }
    else if($approved_status=='3') {
        $final_str = '<button type="button" class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-check"></i></button></a>';
    }
    
    return $final_str;
}

function btn_approval ($folder_name = "",$unique_id = "",$approved_status = "") {
    
    if ($approved_status=='Cancel') {

        $final_str = '<button type="button"  class="btn btn-danger  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-window-close"></i></button></a>';

    } else if($approved_status=='Approved') {

        $final_str = '<button type="button"  class="btn btn-asgreen  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-check"></i></button></a>';

    } else {
        $final_str = '<button type="button"  class="btn btn-danger  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-exclamation"></i></button></a>';
    }
    
    return $final_str;
}

// BID Type Function
function blood_group ($unique_id = "") {
    global $pdo;

    $table_name    = "blood_group";
    $where         = [];
    $table_columns = [
        "unique_id",
        "blood_name"
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
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $blood_name_list = $pdo->select($table_details, $where);

    if ($blood_name_list->status) {
        return $blood_name_list->data;
    } else {
        print_r($blood_name_list);
        return 0;
    }
}

// Money Format India
function moneyFormatIndia($num) {
    $explrestunits = "";
    $amount 	= explode('.', $num);
    $num 		= $amount[0];
    $decimal 	= 0;
    if (count($amount)==2) {
    	$decimal = $amount[1];
    }
    if(strlen($num)>3) {
        $lastthree = substr($num, strlen($num)-3, strlen($num));
        $restunits = substr($num, 0, strlen($num)-3); // extracts the last three digits
        $restunits = (strlen($restunits)%2 == 1)?"0".$restunits:$restunits; // explodes the remaining digits in 2's formats, adds a zero in the beginning to maintain the 2's grouping.
        $expunit = str_split($restunits, 2);
        for($i=0; $i<sizeof($expunit); $i++) {
            // creates each of the 2's group and adds a comma to the end
            if($i==0) {
                $explrestunits .= (int)$expunit[$i].","; // if is first value , convert into integer
            } else {
                $explrestunits .= $expunit[$i].",";
            }
        }
        $thecash = $explrestunits.$lastthree;
    } else {
        $thecash = $num;
    }

    $decimal = number_format(floatval($decimal), 2, '.', '');
    $decimal = explode(".",$decimal)[1];

    return $thecash.".".$decimal; // writes the final format where $currency is the currency symbol.
}


// GST Name
function tax ($unique_id = "") {
    global $pdo;

    $table_name    = "tax";
    $where         = [];
    $table_columns = [
        "unique_id",
        "tax_name",
        "tax_value"
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
        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $tax_id = $pdo->select($table_details, $where);

    if ($tax_id->status) {
        return $tax_id->data;
    } else {
        print_r($tax_id);
        return 0;
    }
}

// GST Name
function account_year ($unique_id = "") {
    global $pdo;

    $table_name    = "account_year";
    $where         = [];
    $table_columns = [
        "unique_id",
        "account_year"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        // "is_active" => 1,
        "is_delete" => 0
    ];

    if ($unique_id) {
        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $account_year_id = $pdo->select($table_details, $where);

    if ($account_year_id->status) {
        return $account_year_id->data;
    } else {
        print_r($account_year_id);
        return 0;
    }
}

// competitor Function
function competitors ($unique_id = "") {
    global $pdo;

    $table_name    = "competitor_profile";
    $where         = [];
    $table_columns = [
        "unique_id",
        "competitor_name"
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

    $competitor_list = $pdo->select($table_details, $where);

    if ($competitor_list->status) {
        return $competitor_list->data;
    } else {
        print_r($competitor_list);
        return 0;
    }
}

function file_upload_extention_lowercase_helper () {
    // In case file Extention was uppercase letters convert to lowercase
    foreach ($_FILES as $f_key => $f_value) {

        if (is_array($f_value['name'])) {
            
            // Multi File Upload
            foreach ($f_value['name'] as $fn_key => $fn_value) {
                $_FILES[$f_key]['name'][$fn_key] = strtolower($fn_value);
            }
        } else {
            // Single file Upload
            $_FILES[$f_key]['name'] = strtolower($f_value['name']);
        }
    }
}



// Supplier Function
function supplier($unique_id = "") {
    global $pdo;

    $table_name    = "supplier_profile";
    $where         = [];
    $table_columns = [
        "unique_id",
        "supplier_name"
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
        // $where = " WHERE unique_id = '".$unique_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $supplier = $pdo->select($table_details, $where);

    // print_r($countries);

    if ($supplier->status) {
        return $supplier->data;
    } else {
        print_r($supplier);
        return 0;
    }
}

// Supplier Function
function branch($unique_id = "") {
    global $pdo;

    $table_name    = "company_and_branch_creation";
    $where         = [];
    $table_columns = [
        "unique_id",
        "branch_name"
    ];

    

    $where     = [
        "is_active"   => 1,
        "is_delete"   => 0
    ];

    if ($unique_id) {
        // $where = " WHERE unique_id = '".$unique_id."' ";
        $table_columns[]="address";
        $table_columns[]="country";
        $table_columns[]="state";
        $table_columns[]="city";
        $table_columns[]="pin_code";
        $table_columns[]="phone_number";
        $table_columns[]="mobile_number";
        $table_columns[]="gst_number";
        $table_columns[]="email_id";
        $table_columns[]="website";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $table_details = [
        $table_name,
        $table_columns
    ];
    
    $branch = $pdo->select($table_details, $where);

    // print_r($countries);

    if ($branch->status) {
        return $branch->data;
    } else {
        print_r($branch);
        return 0;
    }
}


function sublist_insert_update($table_name = "", $data = "",$prefix = "") {
    global $pdo;
    if ($table_name) {
        foreach ($data as $data_key => $columns) {

            $unique_id = $columns['unique_id'];

            if($unique_id) {

                unset($columns['unique_id']);

                $update_where   = [
                    "unique_id"     => $unique_id
                ];

                $action_obj     = $pdo->update($table_name,$columns,$update_where);

            // Update Ends
            } else {

                $columns['unique_id'] = $prefix.unique_id();
                // Insert Begins            
                $action_obj     = $pdo->insert($table_name,$columns);
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

                print_r($action_obj);
                break;
            }
        }
    } else {
        echo "table name not given";
    }
}

function sublist_delete($table_name = "", $sub_unique_ids = "",$main_unique_id = []) {

    global $pdo;

    if ($table_name) {

        if (($sub_unique_ids) && (!empty($main_unique_id))) {

            $column_name     = array_keys($main_unique_id)[0];
            $column_value    = $main_unique_id[$column_name];
            
            $where           = " unique_id NOT IN (".$sub_unique_ids.") AND ".$column_name."  = '".$column_value."'";
            
            $columns         = [
                "is_delete" => 1
            ];
            
            $update_result   = $pdo->update($table_name,$columns,$where);

            if ($update_result->status) {
                
            } else {
                print_r($update_result);
            }
        } else {
            echo "Sub List Delete Status Update Error";
        }
        
    }
}



// Purchase Order Delivery Type
function delivery_type ($unique_id = "") {
    global $pdo;

    $table_name    = "purchase_order_delivery_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "delivery_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $delivery_type_id = $pdo->select($table_details, $where);

    if ($delivery_type_id->status) {
        return $delivery_type_id->data;
    } else {
        print_r($delivery_type_id);
        return 0;
    }
}



// Purchase Order Delivery Via Type
function delivery_via_type ($unique_id = "") {
    global $pdo;

    $table_name    = "delivery_via_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "delivery_via_type"
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

        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $delivery_via_type_id = $pdo->select($table_details, $where);

    if ($delivery_via_type_id->status) {
        return $delivery_via_type_id->data;
    } else {
        print_r($delivery_via_type_id);
        return 0;
    }
}


function user_name ($unique_id = "" ){
    
    global $pdo;

    $return_result = [
        "user_name"      => "",
        "staff_name"     => ""
    ];

    if ($unique_id) {
        $table_name    = "user";
        $where         = [];
        $table_columns = [
            "unique_id",
            "user_name",
            "(SELECT a.staff_name FROM staff a WHERE a.unique_id = user.staff_unique_id) AS staff_name",
            "staff_unique_id"
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

            $where              = [];
    
            $where["unique_id"] = $unique_id;
    
        }
    
        $user_name_id = $pdo->select($table_details, $where);
    
        if ($user_name_id->status) {
            return $user_name_id->data;
        } else {
            print_r($user_name_id);
            return 0;
        }
    }
}
// under user Function
function team_user ($user_id = "") {
    global $pdo;

    $table_name    = "user";
    $where         = "";
    $table_columns = [
        "unique_id",
        "user_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1   AND is_team_head = 0 AND user_name != '".$user_id ."'";

   /* if ($unique_id) {

        $where["unique_id"] = $unique_id;
    }*/

    $user_name_list = $pdo->select($table_details, $where);

    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
}

// under user Function
function under_user ($user_id = "") {
    global $pdo;

    $table_name    = "user";
    $where         = "";
    $table_columns = [
        "unique_id",
        "user_name"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1 AND user_name != '".$user_id ."'";

   /* if ($unique_id) {

        $where["unique_id"] = $unique_id;
    }*/

    $user_name_list = $pdo->select($table_details, $where);

    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
}

// under user type Function
function under_user_type ($user_type = "") {
    global $pdo;

    $table_name    = "user_type";
    $where         = "";
    $table_columns = [
        "unique_id",
        "user_type"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1 AND user_type != '".$user_type ."'";

   /* if ($unique_id) {

        $where["unique_id"] = $unique_id;
    }*/

    $user_type_list = $pdo->select($table_details, $where);

    if ($user_type_list->status) {
        return $user_type_list->data;
    } else {
        print_r($user_type_list);
        return 0;
    }
}

// Show Entries Based On User Hierarcy
function user_hierarchy ($user_id = "", $user_type_id = "") {

    global $pdo;

    $table_user         = "user";
    $table_user_type    = "user_type";

    $return_result = [
        "under_user"        => "",
        "under_user_type"   => ""
    ];

    if ($user_id) {
        $user_where = [
            "unique_id" => $user_id
        ];

        $user_columns = [
            "under_user"
        ];

        $user_table_details = [
            $table_user,
            $user_columns
        ];

        $user_select = $pdo->select($user_table_details, $user_where);

        if ($user_select->status) {
            $user_data = $user_select->data[0];

            if ($user_data['under_user']) {
                $user_data['under_user'] = '"'.implode('","',explode(",",$user_data['under_user'])).'",';
            }

            $user_data['under_user'] .= '"'.$user_id.'"';

            $return_result['under_user'] = $user_data['under_user'];
        } else {
            print_r($user_select);
            exit;
        }
    }

    if ($user_type_id) {
        $user_where = [
            "unique_id" => $user_type_id
        ];

        $user_columns = [
            "under_user_type"
        ];

        $user_table_details = [
            $table_user_type,
            $user_columns
        ];

        $user_select = $pdo->select($user_table_details, $user_where);

        if ($user_select->status) {
            $user_data = $user_select->data[0];

            if ($user_data['under_user_type']) {
                $user_data['under_user_type'] = '"'.implode('","',explode(",",$user_data['under_user_type'])).'",';
            }

            $user_data['under_user_type'] .= '"'.$user_type_id.'"';

            $return_result['under_user_type'] = $user_data['under_user_type'];
        } else {
            print_r($user_select);
            exit;
        }
    }

    return $return_result;
}

//datatable search
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
//expense type function
function expense_type ($unique_id = "") {
    global $pdo;

    $table_name    = "expense_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "expense_type"
        
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

    $expense_type_list = $pdo->select($table_details, $where);

    if ($expense_type_list->status) {
        return $expense_type_list->data;
    } else {
        print_r($expense_type_list);
        return 0;
    }
}

function item_unit_decimal ($item_id = 0) {

    $decimal  = 0;

    if ($item_id) {
        global $pdo;
        $table_name = "item_names_code";

        $columns    = [
            "unit_unique_id"
        ];

        $where      = [
            "unique_id" => $item_id
        ];

        $table_details = [
            $table_name,
            $columns
        ];

        $select_result  = $pdo->select($table_details,$where);

        if (!($select_result->status)) {
            print_r($select_result);
        } else {
            $item_unit = $select_result->data[0];
            
            if ($item_unit) {

                $item_unit          = $item_unit['unit_unique_id'];

                // Get Unit Decimal
                $table_unit         = "units";

                $columns_unit       = [
                    "decimal_points"
                ];
        
                $where_unit         = [
                    "unique_id" => $item_unit
                ];
        
                $table_unit_details = [
                    $table_unit,
                    $columns_unit
                ];

                $decimal_select     = $pdo->select($table_unit_details,$where_unit);

                if (!($decimal_select->status)) {
                    print_r($decimal_select);
                } else {
                    $decimal = $decimal_select->data[0];

                    $decimal = $decimal['decimal_points'];

                    if (!($decimal)) {
                        $decimal    = 0;
                    }
                }
            }
        }
    }

    return $decimal;
}

function item_unit ($item_id = 0) {

    $unit_name  = "";

    if ($item_id) {
        global $pdo;
        $table_name = "item_names_code";

        $columns    = [
            "unit_unique_id"
        ];

        $where      = [
            "unique_id" => $item_id
        ];

        $table_details = [
            $table_name,
            $columns
        ];

        $select_result  = $pdo->select($table_details,$where);

        if (!($select_result->status)) {
            print_r($select_result);
        } else {
            $item_unit = $select_result->data[0];
            
            if ($item_unit) {

                $item_unit          = $item_unit['unit_unique_id'];

                // Get Unit Decimal
                $table_unit         = "units";

                $columns_unit       = [
                    "unit_name"
                ];
        
                $where_unit         = [
                    "unique_id" => $item_unit
                ];
        
                $table_unit_details = [
                    $table_unit,
                    $columns_unit
                ];

                $unit_name_select     = $pdo->select($table_unit_details,$where_unit);

                if (!($unit_name_select->status)) {
                    print_r($unit_name_select);
                } else {
                    $unit_name = $unit_name_select->data[0];

                    $unit_name = $unit_name['unit_name'];

                    if (!($unit_name)) {
                        $unit_name    = "";
                    }
                }
            }
        }
    }
    
    return $unit_name;
}

function item_tax ($item_id = 0) {

    $item_tax_value  = "";

    if ($item_id) {
        global $pdo;
        $table_name = "item_names_code";

        $columns    = [
            "tax_unique_id"
        ];

        $where      = [
            "unique_id" => $item_id
        ];

        $table_details = [
            $table_name,
            $columns
        ];

        $select_result  = $pdo->select($table_details,$where);

        if (!($select_result->status)) {
            print_r($select_result);
        } else {
            // print_r($select_result);

            $item_tax = $select_result->data[0];
            
            if ($item_tax) {

                $item_tax          = $item_tax['tax_unique_id'];

                // Get Unit Decimal
                $table_tax         = "tax";

                $columns_unit      = [
                    "tax_value"
                ];
        
                $where_unit         = [
                    "unique_id" => $item_tax
                ];
        
                $table_tax_details  = [
                    $table_tax,
                    $columns_unit
                ];

                $item_tax_value_select   = $pdo->select($table_tax_details,$where_unit);

                if (!($item_tax_value_select->status)) {
                    print_r($item_tax_value_select);
                } else {
                    // print_r($item_tax_value_select);

                    $item_tax_value = $item_tax_value_select->data[0];

                    $item_tax_value = $item_tax_value['tax_value'];

                    if (!($item_tax_value)) {
                        $item_tax_value    = "";
                    }
                }
            }
        }
    }
    
    return $item_tax_value;
}

function unit_decimal_cal ($number_val = 0,$decimal = 0) {

    $return_result  = 0;

    if ($number_val) {
        $return_result = number_format($number_val,$decimal,".","");
    }

    return $return_result;
}

function getIndianCurrency(float $number) {
    
    $decimal = round($number - ($no = floor($number)), 2) * 100;
    $hundred = null;
    $digits_length = strlen($no);
    $i = 0;
    $str = array();
    $words = array(0 => '', 1 => 'one', 2 => 'two',
        3 => 'three', 4 => 'four', 5 => 'five', 6 => 'six',
        7 => 'seven', 8 => 'eight', 9 => 'nine',
        10 => 'ten', 11 => 'eleven', 12 => 'twelve',
        13 => 'thirteen', 14 => 'fourteen', 15 => 'fifteen',
        16 => 'sixteen', 17 => 'seventeen', 18 => 'eighteen',
        19 => 'nineteen', 20 => 'twenty', 30 => 'thirty',
        40 => 'forty', 50 => 'fifty', 60 => 'sixty',
        70 => 'seventy', 80 => 'eighty', 90 => 'ninety');
    $digits = array('', 'hundred','thousand','lakh', 'crore');
    while( $i < $digits_length ) {
        $divider = ($i == 2) ? 10 : 100;
        $number = floor($no % $divider);
        $no = floor($no / $divider);
        $i += $divider == 10 ? 1 : 2;
        if ($number) {
            $plural = (($counter = count($str)) && $number > 9) ? 's' : null;
            $hundred = ($counter == 1 && $str[0]) ? ' and ' : null;
            $str [] = ($number < 21) ? $words[$number].' '. $digits[$counter]. $plural.' '.$hundred:$words[floor($number / 10) * 10].' '.$words[$number % 10]. ' '.$digits[$counter].$plural.' '.$hundred;
        } else $str[] = null;
    }
    $Rupees = implode('', array_reverse($str));
    $paise = ($decimal > 0) ? "." . ($words[$decimal / 10] . " " . $words[$decimal % 10]) . ' Paise' : '';
    return strtoupper(($Rupees ? $Rupees . 'Rupees ' : '') . $paise. " only ");
}


// Population Year Function
function population_year ($unique_id = "") {
    global $pdo;

    $table_name    = "population_year";
    $where         = [];
    $table_columns = [
        "year as unique_id",
        "year"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active"         => 1,
        "is_delete"         => 0
    ];

    if ($unique_id) {

        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $population_year_list = $pdo->select($table_details, $where);

    if ($population_year_list->status) {
        return $population_year_list->data;
    } else {
        print_r($population_year_list);
        return 0;
    }
}

// bdm_name
function staff_bdm_name ($unique_id = "") {
    global $pdo;

    $table_name    = "staff";
    $where         = [];
    $table_columns = [
        "unique_id",
        "staff_name",
        "office_contact_no",
        "designation_unique_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        "is_active"             => 1,
        "designation_unique_id" => "5ff5d2fe56ffb59257",
        "is_delete"             => 0
    ];

    if ($unique_id) {
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $staff_bdm_name_list = $pdo->select($table_details, $where);

    if ($staff_bdm_name_list->status) {
        return $staff_bdm_name_list->data;
    } else {
        print_r($staff_bdm_name_list);
        return 0;
    }
}




//Customers category state  Function
function states_customer_category ($unique_id = "",$customer_category_id = "") {
    global $pdo;

    $table_name    = "states";
    $where         = [];
    $table_columns = [
        "unique_id",
        "state_name"
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

    if ($customer_category_id) {

        $where              = [];
        $where["state_type"] = $customer_category_id;
    }

    $states_customer_category_list = $pdo->select($table_details, $where);

    if ($states_customer_category_list->status) {
        return $states_customer_category_list->data;
    } else {
        print_r($states_customer_category_list);
        return 0;
    }
}



// Country Function
function country_mobile_no_code($unique_id = "") {
    global $pdo;

    $table_name    = "countries";
    $where         = [];
    $table_columns = [
        "unique_id",
        "phone_code"
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
        // $where = " WHERE unique_id = '".$unique_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $countries_mobile_code = $pdo->select($table_details, $where);

    // print_r($countries_mobile_code);

    if ($countries_mobile_code->status) {
        return $countries_mobile_code->data;
    } else {
        print_r($countries_mobile_code);
        return 0;
    }
}


// type of company Function
function type_of_company($unique_id = "") {
    global $pdo;

    $table_name    = "company_type";
    $where         = [];
    $table_columns = [
        "unique_id",
        "company_type"
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
        // $where = " WHERE unique_id = '".$unique_id."' ";
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $company_type = $pdo->select($table_details, $where);

    // print_r($company_type);

    if ($company_type->status) {
        return $company_type->data;
    } else {
        print_r($company_type);
        return 0;
    }
}


// Contact Person Function
function customer_contact_person ($unique_id = "",$customer_profile_unique_id= "") {


    global $pdo;

    $table_name    = "customer_contact_person";
    $where         = [];
    $table_columns = [
        "unique_id",
        "contact_person_name",
        "customer_profile_unique_id",
        "contact_person_name",
        "contact_person_email",
        "contact_person_contact_no"

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

        $table_columns = [
            "unique_id",
            "contact_person_name",
            "customer_profile_unique_id",

    
        ];
    
        $table_details = [
            $table_name,
            $table_columns
        ];

        $where              = [];
        $where["unique_id"] = $unique_id;
    }

     if ($customer_profile_unique_id) {
        // $where = [];
        $where["customer_profile_unique_id"] = $customer_profile_unique_id;
    }

    $contact_perosn_name_list = $pdo->select($table_details, $where);



    if ($contact_perosn_name_list->status) {
        return $contact_perosn_name_list->data;
    } else {
        print_r($contact_perosn_name_list);
        return 0;
    }
}

//rate contract no
function rate_contract_no ($unique_id = "") {
    global $pdo;

    $table_name    = "rate_contracts_main";
    $where         = [];
    $table_columns = [
        "unique_id",
        "tender_code"
        
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

    $rate_contract_list = $pdo->select($table_details, $where);

    if ($rate_contract_list->status) {
        return $rate_contract_list->data;
    } else {
        print_r($rate_contract_list);
        return 0;
    }
}

// Product brand
function item_brand ($unique_id = "") {
    global $pdo;

    $table_name    = "item_brands";
    $where         = [];
    $table_columns = [
        "unique_id",
        "brand_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $item_brands = $pdo->select($table_details, $where);

    if ($item_brands->status) {
        return $item_brands->data;
    } else {
        print_r($item_brands);
        return 0;
    }
}

function technical_bid_submission($unique_id = '') {

    if ($unique_id) {

        global $pdo;
        global $today;

        $call_no                = $_POST['call_no'];
        $call_unique_id         = $_POST['call_unique_id'];
        $bid_no                 = $_POST['bid_no'];
        $bid_unique_id          = $_POST['bid_unique_id'];
        $bid_date               = $_POST['bid_date'];

        $table_name             = "tender_submission";
        $table_bid_product      = "bid_management_product_details";
        $table_tender_product   = "tender_submission_product";

        $where                  = " acc_year = '".$_SESSION["acc_year"]."'";

        $tender_no               = bill_no ($table_name,$where,$prefix = "TEN-", 1,1,0);

        $customer_id            = $_POST['customer_id'];
        // $tender_type            = $_POST['bids_tender_type'];

        $columns = [
            "bid_no"             => $bid_no,
            "entry_date"         => $today,
            "call_unique_id"     => $call_unique_id,
            "call_no"            => $call_no,
            "bid_no"             => $bid_no,
            "bid_date"           => $bid_date,
            "bid_unique_id"      => $bid_unique_id,
            // "bids_tender_type"   => $tender_type,
            "customer_id"        => $customer_id,
            "unique_id"          => $tender_unique_id = unique_id("tender")
        ];

        $table_details = [
            $table_name,
            $columns
        ];

        // Insert Data in Table
        $action_obj     = $pdo->insert($table_name,$columns);

        if (!($action_obj->status)) {
            print_r($action_obj);
            exit;
        } else {
            $select_columns = [
                "bids_type_id",
                "sales_or_service",
                "item_category_id",
                "item_group_id",
                "item_id",
                "quantity",
                "rate",
                "tax_id",
                "tax_value",
                "total",
                "bid_releasing_month",
                "purchase_replicate",
                "remark"
            ];

            $select_table_details = [
                $table_bid_product,
                $select_columns
            ];

            $select_where = [
                "bid_unique_id" => $_POST['bid_unique_id'],
                "is_delete"     => 0
            ];

            $select_obj = $pdo->select($select_table_details,$select_where);

            if (!($select_obj->status)) {

                print_r($select_obj);
                exit;

            } else {

                $result_val = $select_obj->data;

                foreach ($result_val as $key => $value) {

                    $value['unique_id']        = unique_id("tender");
                    $value['bid_no']           = $bid_no;
                    $value['bid_unique_id']    = $bid_unique_id;
                    $value['tender_submission_unique_id'] = $tender_unique_id;

                    $insert_obj = $pdo->insert($table_tender_product,$value);

                    if (!($insert_obj->status)) {
                        print_r($insert_obj);
                        exit;
                    }
                }               
            }
        }
    }
    return true;
}

function team_heads($head_id = "")
{
    global $pdo;

    $team_heads_sql = "SELECT unique_id,staff_unique_id AS staff_id,team_members FROM user WHERE is_delete = 0 AND is_team_head = 1";


    $team_head_columns = [
        "unique_id",
        "staff_unique_id",
        "(SELECT staff_name FROM staff WHERE unique_id = user.staff_unique_id) AS staff_name",
        "(SELECT file_name FROM staff WHERE unique_id = user.staff_unique_id) AS user_image",
        "team_members",
        "team_id",
        "profile_image"
    ];

    $team_head_details = [
        "user", // Table Name 
        $team_head_columns
    ];

    $team_head_where   = [
        "is_delete" => 0,
        "is_team_head" => 1
    ];

    if ($head_id) {
        $team_head_where['unique_id'] = $head_id;
    }

    $team_head_result = $pdo->select($team_head_details,$team_head_where);

    if ($team_head_result->status) {
        return $team_head_result->data;
    } else {
        print_r($team_head_result);
    }
    return [];
}

function team_members($team_members)
{
    global $pdo;
    if ($team_members) {
        $team_members_columns = [
            "unique_id",
            "staff_unique_id",
            "(SELECT staff_name FROM staff WHERE unique_id = user.staff_unique_id) AS staff_name",
            "(SELECT file_name FROM staff WHERE unique_id = user.staff_unique_id) AS user_image",
            "profile_image"

        ];
    
        $team_members_details = [
            "user", // Table Name 
            $team_members_columns
        ];

        // Exploding the String
        $team_members = explode(",",$team_members);
        $team_members = "'".implode("','",$team_members)."'";
    
        $team_members_where  = "is_delete = 0 AND unique_id IN (".$team_members.")";

        $order_by = " is_team_head DESC";
    
        $team_members_result = $pdo->select($team_members_details,$team_members_where,'','',$order_by);
    
        if ($team_members_result->status) {
            return $team_members_result->data;
        } else {
            print_r($team_members_result);
        }
    }

    return [];
}

function week_range ($week, $year)
{

    $dates          = [];
    $time           = strtotime("1 January $year", time());
	$day            = date('w', $time);
	$time           += ((7*$week)+1-$day)*24*3600;
	$dates["from"]  = date('Y-n-j', $time);
	$time           += 6*24*3600;
	$dates["to"]    = date('Y-n-j', $time);

	return $dates;
}

function datatable_sorting($column = 0, $direction = "ASC", $columns_array = []) {
    $order_by   = "";
    if (!empty($columns_array)) {
        if ($column) {

            $is_found  = strripos($columns_array[$column]," AS ");
            
            if ($is_found) {
                $as_column = substr($columns_array[$column],$is_found+3);
            } else {
                $as_column = false;
            }

            if ($as_column) {
                $order_by       = $as_column." ".$direction;
            } else {
                $order_by       = $columns_array[$column]." ".$direction;
            }
        }
    }
    return $order_by;
}

function datatable_searching($search_query = '',$columns_array = []) {
    $search_string = "";

    if ($search_query) {
        if (!empty($columns_array)) {
            // Remove AS in Subquery in $columns_array
            $temp_arr   = [];
            foreach ($columns_array as $col_key => $col_value) {
                
                $is_found  = strripos($col_value," AS ");
            
                if ($is_found) {
                    $as_column = substr($col_value,0,$is_found);
                } else {
                    $as_column = $col_value;
                }
                $temp_arr[] = $as_column." LIKE '%".$search_query."%' ";
            }
            
            unset($temp_arr[count($temp_arr)-1]); // Unique ID Endry Disable
            unset($temp_arr[0]); // S.No Search Disable
            $search_string = implode(" OR ",$temp_arr);
        }
    }
    return $search_string;
}

// Attendance Setting
function attendance_setting($unique_id = "") {
    global $pdo;

    $table_name    = "attendance_setting";
    $where         = [];
    $table_columns = [
        "unique_id",
        "attendance_shift_name"
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

        $where              = [];
        $where["unique_id"] = $unique_id;

    }

    $attendance_settings = $pdo->select($table_details, $where);

    if ($attendance_settings->status) {
        return $attendance_settings->data;
    } else {
        print_r($attendance_settings);
        return 0;
    }
}

//Staff Employee ID
function staff_id ($unique_id = "") {
    global $pdo;
    $table_name    = "staff";
    $where         = [];
    $table_columns = [
        "unique_id",
        "employee_id"   
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

    $staff_id_list = $pdo->select($table_details, $where);

    if ($staff_id_list->status) {
        return $staff_id_list->data;
    } else {
        print_r($staff_id_list);
        return 0;
    }
}

function file_show ($file_name = "",$img_folder_name = "") {

    $file_names = explode(',', $file_name);
    $image_view = '';

    if($file_name){
        foreach ($file_names as $file_key => $file_name) {

            if($file_key!=0){
                if($file_key%4!=0){
                    $image_view .= "&nbsp";
                } else {
                    $image_view .= "<br><br>";
                }
            }

            $cfile_name = explode('.',$file_name);
            // $img_folder_name    = 'bids_management';

            if(($cfile_name[1]=='jpg')||($cfile_name[1]=='png')){

                $image_view .= '<a href="javascript:print_image(\''.$file_name.'\',\''.$img_folder_name.'\')"><img src="uploads/'.$img_folder_name.'/'.$file_name.'" height="50px" width="50px" ></a>';

            } else if ($cfile_name[1]=='xlsx') {

                $image_view .= '<a href="javascript:print_image(\''.$file_name.'\',\''.$img_folder_name.'\')"><button type="button" class="btn btn-excel  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-36px mdi-microsoft-excel" height="50px" width="50px"></i></button></a>';
                
            } else {

                $image_view .= '<a href="javascript:print_image(\''.$file_name.'\',\''.$img_folder_name.'\')"><button type="button" class="btn btn-pdf  btn-xs btn-rounded waves-effect waves-light" ><i class="mdi mdi-36px mdi-file-pdf-outline" height="50px" width="50px"></i></button></a>';
            } 
        }
    }

    return $image_view;
}

// under user Function
function batch_no($unique_id = "") {
    global $pdo;

    $table_name    = "material_received";
    $where         = "";
    $table_columns = [
        "unique_id",
        "batch_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1 order by id desc";

    if ($unique_id) {
    
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }
    $user_name_list = $pdo->select($table_details, $where);
    // print_r($user_name_list);

    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }

}

function batch_name($unique_id = "") {
    global $pdo;

    $table_name    = "material_received";
    $where         = "";
    $table_columns = [
        "unique_id",
        "batch_id"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = "is_delete = 0 AND is_active = 1";

    if ($unique_id) {
    
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }
    $user_name_list = $pdo->select($table_details, $where);
    // print_r($user_name_list);

    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
}




function total_quantity($unique_id = "") {
    global $pdo;

    $table_name    = "material_received";
    $where         = [];
    $table_columns = [
        "unique_id",
        "qty"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];

    $where     = [
        
    ];

    if ($unique_id) {
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }

    $module_name_list = $pdo->select($table_details, $where);
// print_r($module_name_list);
    if ($module_name_list->status) {
        return $module_name_list->data;
    } else {
        print_r($module_name_list);
        return 0;
    }
}


function  item_code_gen($item_code){
    global $pdo;

    $table_name    = "item_creation";
    $where         = "";
    $table_columns = [   
        "max(item_code)as item_code"
    ];

    $table_details = [
        $table_name,
        $table_columns
    ];
    
    
    $item_code_list = $pdo->select($table_details);
       
    if ($item_code_list->status) {              
        return $item_code_list->data[0]['item_code']+1;
    } else {
        print_r($item_code_list);
        return 0;
    }
}

function select_option_create($options = [],$description = "", $is_selected = [],$is_disabled = []) {
    
    $option_str     = "<option value='' disabled>No Options to Select</option>";

    $data_attribute = "";

    if ($options) {
        $option_str = '';

        // $option_str     = "<option value=''>Select</option>";

        // if ($description) {
        //     $option_str     = "<option value='' selected>".$description."</option>";
        // }
        foreach ($options as $key => $value) {

            $value      = array_values($value);
            $selected   = "";
            $disabled   = "";

            if (is_array($is_selected) AND in_array($value[0],$is_selected)) {            
                $selected = " selected='selected' ";
            } elseif ($is_selected == $value[0]) {
                
                $selected = " selected='selected' ";
            }
            
            if (is_array($is_disabled) AND in_array($value[0],$is_disabled)) {            
                $disabled = " disabled='disabled' ";
            } elseif ($is_disabled == $value[0]) {
                $disabled = " disabled='disabled' ";
            }

            if (strpos($value[1],"_")) {
                $value[1] = disname($value[1]);
            } else {
                $value[1] = ucfirst($value[1]);
            }

            if (isset($value[2])) {
                $data_attribute = "data-extra='".$value[2]."'";
            } 

            $option_str .= "<option value='".$value[0]."'".$data_attribute.$selected.$disabled.">".$value[1]."</option>";
        }
    }
    
    return $option_str;
}

function batch_no_report($unique_id = "") {
    
    global $pdo;
    $table_name    = "material_received";
    $where         = "";
    $table_columns = [
        "unique_id",
        "batch_id"
    ];
  
    $table_details = [
        $table_name,
        $table_columns
    ];
  
    $where     = " is_delete = 0 AND is_active = 1 and item_name='6683a7c6460c777119'";
  
    if ($unique_id) {
        $table_details      = $table_name;
        $where              = [];
        $where["unique_id"] = $unique_id;
    }
    $user_name_list = $pdo->select($table_details, $where);
    // print_r($user_name_list);
    if ($user_name_list->status) {
        return $user_name_list->data;
    } else {
        print_r($user_name_list);
        return 0;
    }
  }

  function pit_id($search_key = "") {

  
    $result     = "''";

    if ($search_key) {
        global $pdo;

        $table_name = "pit_creation";

        $columns        = [
            "unique_id",
            "pit_name",
        ];

        $where          = " pit_name LIKE '".mysql_like($search_key)."' ";

        $table_details  = [
            $table_name,
            $columns
        ];

        // $group_by     = " quotation_unique_id ";
        // $group_by     = " ";
        

        $select_result  = $pdo->select($table_details,$where,"","","","","");
        // print_r($select_result);

        if (!($select_result->status)) {
            print_r($select_result);
        } else {
            $result     = $select_result->data[0];

            $result     = $result['unique_id'];

            if ($result == "") {
                $result = "''";
            }
        }
    }

    return $result;
}

function batch_search($search_key = "") {
    // print_r("hi");
      
        $result     = "''";
    
        if ($search_key) {
            global $pdo;
    
            $table_name = "material_received";
    
            $columns        = [
                "unique_id",
                "batch_id",
            ];
    
            $where          = "is_delete= 0 and  batch_id LIKE '".mysql_like($search_key)."' ";
    
            $table_details  = [
                $table_name,
                $columns
            ];
    
            // $group_by     = " quotation_unique_id ";
            // $group_by     = " ";
            
    
            $select_result  = $pdo->select($table_details,$where);
            // print_r($select_result);
    
            if (!($select_result->status)) {
                print_r($select_result);
            } else {
                $result     = $select_result->data[0];
    
                $result     = $result['unique_id'];
    
                if ($result == "") {
                    $result = "''";
                }
            }
        }
    
        return $result;
    }    

function supplier_id($search_key = "") {
    // print_r("hi"),die();
      
        $result     = "''";
    
        if ($search_key) {
            global $pdo;
    
            $table_name = "supplier_creation";
    
            $columns        = [
                "unique_id",
                "supplier_name",
            ];
    
            $where          = "is_delete=0 and  supplier_name LIKE '".mysql_like($search_key)."' ";
    
            $table_details  = [
                $table_name,
                $columns
            ];
    
            // $group_by     = " quotation_unique_id ";
            // $group_by     = " ";
            
    
            $select_result  = $pdo->select($table_details,$where);
            // print_r($select_result);
    
            if (!($select_result->status)) {
                print_r($select_result);
            } else {
                $result     = $select_result->data[0];
    
                $result     = $result['unique_id'];
    
                if ($result == "") {
                    $result = "''";
                }
            }
        }
    
        return $result;
    }

?>