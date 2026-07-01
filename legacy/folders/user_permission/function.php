<?php
// Permission UI Create Function
function user_permission_ui($main_screen_unique_id = "",$user_type="") {
    $total_ui = '';
    if ($main_screen_unique_id) {
       // Section Tab UI starts Here
        $show                 = 1;
        $show1                 = 1;
        
      
        $total_ui .= '</ul>';
        // Section Tab UI Ends Here
        $total_ui            .= '<div class="tab-content">';
        // Section Tab Content UI Starts Here
            $active              = "";
            
            if ($show1++ == 1) {          
                $active          = " show active ";
            }
            // Tab DIV Start
            // Get Section Based Screens
            $user_screens       = user_screen('',$main_screen_unique_id);
            $user_actions       = user_actions();
            // UI Table Start
            $total_ui           .= '<div class="row">
                                        <div class="col-12">';
            
            $total_ui           .= '<table class="user_permission_datatable table dt-responsive nowrap w-100">
                                        <thead>
                                            <tr>';
            $total_ui           .= '<th>#</th>';
            $total_ui           .= '<th>Screen</th>';
            $total_ui           .= '<th>';
            $total_ui           .= '<button onclick="check_all(\'all'.$main_screen_unique_id.'\',this)" type="button" data-id = "all'.$main_screen_unique_id.'" data-check="checked" class="btn btn-sm btn-soft-info btn-rounded waves-effect waves-light table-bt" value="unchecked">All</button>';
            $total_ui           .= '</th>';
            foreach ($user_actions as $action_key => $action_value) {
                $action_name    = disname($action_value["action_name"]);
                $total_ui       .= '<th><button onclick="check_all(\''.$action_value["action_name"].$main_screen_unique_id.'\',this)" data-check="unchecked" type="button" data-id = "'.$action_value["action_name"].$main_screen_unique_id.'" class="btn btn-sm btn-soft-info btn-rounded waves-effect waves-light table-bt" value="unchecked">'.$action_name.'</button></th>';
            }
            $total_ui           .= '    </tr>
                                    </thead>';
            $total_ui           .= '<tbody>';
            $s_no               = 1;
            foreach ($user_screens as $screen_key => $screen_value) {
                $all_checked        = "";
                $user_per_arr       = "";
                
                
                $screen_name        = disname($screen_value["screen_name"]);
                $screen_unique_id   = $screen_value["unique_id"];
                $screen_actions     = explode(",",$screen_value["actions"]);
                
                if ($user_type) {
                    $screen_perm = get_permissions($user_type,"","","",$screen_unique_id);
                     if (empty($screen_perm)) {
                        $screen_perm = [];
                    } else {
                        $screen_perm = explode(",",$screen_perm[0]["action_unique_id"]);
                        if (count($screen_actions) == count($screen_perm)) {
                            $all_checked = " checked ";
                        }
                    }
                    
                }
                $total_ui       .= '<tr>';
                $total_ui       .= '<td>'.$s_no.'</td>';
                $total_ui       .= '<td>'.$screen_name.'</td>';
                $total_ui       .= '<td>
                                        <span class="toggle-button toggle-button--tuuli">
                                            <input class = "all'.$main_screen_unique_id.'" onclick="check_all(\'screen'.$screen_unique_id.'\',this)" id="all'.$screen_unique_id.'" type="checkbox" '.$all_checked.'>
                                            <label for="all'.$screen_unique_id.'"></label>
                                            <div class="toggle-button__icon"></div>
                                        </span>
                                    </td>';
                foreach ($user_actions as $action_key => $action_value) {
                    $checked            = "";
                    
                    $action_unique_id   = $action_value["unique_id"];
                    $total_ui       .= '<td>';
                    
                    if ($user_type) {
                        if(in_array($action_unique_id,$screen_perm)) {
                            $checked            = " checked ";
                        }
                    }
                    if (in_array($action_unique_id,$screen_actions)) {
                        $total_ui   .= '<span class="toggle-button toggle-button--tuuli">
                                            <input onclick="check_me(\''.$screen_unique_id.'\',this)" class="all-checkbox '.$action_value["action_name"].$main_screen_unique_id.' all'.$main_screen_unique_id.' screen'.$screen_unique_id.' allcheck-'.$screen_unique_id.'" data-main="'.$main_screen_unique_id.'" data-section="'.$main_screen_unique_id.'" data-screen="'.$screen_unique_id.'" data-action="'.$action_unique_id.'"  id="'.$screen_unique_id."-".$action_unique_id.'" type="checkbox" '.$checked.'>
                                            <label for="'.$screen_unique_id."-".$action_unique_id.'"></label>
                                            <div class="toggle-button__icon"></div>
                                        </span>';
                    } else {
                        $total_ui   .= '<span class="table_empty_dot"></span>';
                    }
                    $total_ui       .= '</td>';
    
                }
                $total_ui       .= '</tr>';
                
                $s_no++;            
            }
            $total_ui           .= '</tbody>';
            $total_ui           .= '</table>';
            // UI Table End
            $total_ui           .= '    </div>
                                    </div>';
            // Tab DIV End
            $total_ui            .= '</div>';
       // }
        $total_ui            .= '</div>';
        // Section Tab Content UI Ends Here
    }
    return $total_ui;
}
function get_permissions($user_type = "",$main_screen = null,$screen_section = null,$screens=null,$screen_actions=null) {
    if ($user_type) {
        global $pdo;
        $all_permissions        = [];
        $main_permissions       = [];
        $section_permissions    = [];
        $screen_permissions     = [];
        $action_permissions     = [];
        $permission_table       = "user_screen_permission";
        $columns                = [
            "user_type",
            "main_screen_unique_id",
            "screen_unique_id",
            "GROUP_CONCAT(action_unique_id) AS action_unique_id"
        ];
        
        $where                  = [
            "is_delete"     => 0,
            "is_active"     => 1,
            "user_type"     => $user_type
        ];
        $group_by               = "screen_unique_id";
        if ($main_screen) {
            $columns                = [
                "GROUP_CONCAT(main_screen_unique_id) AS main_screen_unique_id"
            ];
            $group_by               = "";
        }
        if ($screens) {
            $columns                = [
                "GROUP_CONCAT(screen_unique_id) AS screen_unique_id"
            ];
            $group_by               = "";            
        }
        if ($screen_actions) {
            $columns                = [
                "GROUP_CONCAT(action_unique_id) AS action_unique_id"
            ];
            $group_by               = "screen_unique_id";
            
            $where['screen_unique_id']              = $screen_actions;
        }
        $table_details      = [
            $permission_table,
            $columns
        ];
        $result_values  = $pdo->select($table_details,$where,null,null,[],"",$group_by);
        if ($result_values->status) {
          return $result_values->data;
        } else {
            print_r($result_values);
        }
    }
}
?>