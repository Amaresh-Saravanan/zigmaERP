<?php
include '../../config/dbconfig.php';
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 1,
        'isAuthenticated' => true,
        'user' => [
            'userId' => $_SESSION['user_id'],
            'userName' => $_SESSION['user_name'],
            'userType' => $_SESSION['sess_user_type'],
            'userImage' => $_SESSION['user_image'],
            'companyName' => $_SESSION['sess_company_name'],
            'mainScreens' => $_SESSION['main_screens'],
            'sections' => $_SESSION['sections'],
            'screens' => $_SESSION['screens']
        ]
    ]);
} else {
    echo json_encode([
        'status' => 0,
        'isAuthenticated' => false,
        'user' => null
    ]);
}
?>
