<?php include 'config/dbconfig.php'; ?>
<html lang="en">
  <?php 
  // Temp variables
    $company_name = "Zigma";
    $user_id      = "";

    if (isset($_SESSION['user_id'])) {
      $user_id      = $_SESSION['user_id'];
    }
    if (session_id() AND ($user_id)) { 
      include 'inc/header.php';
      include 'body.php';
      include 'inc/footer.php';

    } else {
      // LOGIN PAGE 
      $folder_name_org = "login";
  ?>
    <body class="loading auth-fluid-pages pb-0">
        <?php include "folders/login/login.php";?>
        <?php include 'inc/footer.php';?>
		
    </body>
  <?php }?>
</html>