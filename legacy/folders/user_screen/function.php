<?php 
function user_action_list($user_action_array = "",$selected = "") {
    $all_checked                = "";

    if ($selected) {
        $selected   = explode(",",$selected);
        $user_action_array_count    = count($user_action_array);
        $selected_count             = count($selected);

        if ($user_action_array_count == $selected_count) {
            $all_checked        = " checked ";
        }
    }

    $return_str =   '<li>
                        <input type="checkbox" id="dis_check" disabled>
                        <label for="dis_check">No Options</label>
                    </li>';

    if ($user_action_array) {

        $return_str = '<li>
                            <input type="checkbox" id="all" '.$all_checked.'>
                            <label for="all">All</label>
                        </li>';

        foreach ($user_action_array as $key => $value) {
            $checked    = "";

            if (is_array($selected)) {
                if (in_array($value["unique_id"],$selected)) {
                    $checked = " checked ";
                }
            }
            // print_r($action_name);
            $return_str .= '<li>
                                <input type="checkbox" id="'.$value["unique_id"].'" '.$checked.' name="user_actions" value="'.$value["unique_id"].'" class="action_check">
                                <label for="'.$value["unique_id"].'">'.disname($value["action_name"]).'</label>
                            </li>';
        }
    }

    return $return_str;
}
?>