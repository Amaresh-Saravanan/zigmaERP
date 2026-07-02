<?php
include '../../config/dbconfig.php';
header('Content-Type: application/json');

$main_screens = main_screen();
$menu = [];

if ($main_screens) {
    foreach ($main_screens as $main_value) {
        $sub_screens = user_screen('', $main_value['unique_id']);
        
        $menu[] = [
            'unique_id' => $main_value['unique_id'],
            'screen_main_name' => $main_value['screen_main_name'],
            'icon_name' => $main_value['icon_name'],
            'sub_screens' => $sub_screens ? $sub_screens : []
        ];
    }
}

echo json_encode(['status' => 1, 'menu' => $menu]);
?>
