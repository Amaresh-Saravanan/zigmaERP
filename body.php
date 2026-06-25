<!-- ============================================================== -->
<!-- Start Page Content here -->
<!-- ============================================================== -->
<?php 
                
                if (isset($_GET['file'])) {
        
                    $file_str        = $_GET['file'];
                    $file_arr        = explode("/",$file_str);
        
                    $folder_name_org = $file_arr[0];
                    $file_name_org   = $file_arr[1];
        
                    $add_btn_link    = "index.php?file=".$folder_name_org."/create";
                    $cancel_btn_link = "index.php?file=".$folder_name_org."/list";
                    $folder_crud_link= "folders/".$folder_name_org."/crud.php";
        
                    $btn_add         = "index.php?file=".$folder_name_org."/form";
                    $btn_cancel      = "index.php?file=".$folder_name_org."/list";
                    $folder_crud_link= "folders/".$folder_name_org."/crud.php";
        
                    $folder_name     = disname($folder_name_org);
                    $file_name       = disname($file_name_org);
                
                } else {
        
                    
        
                        $file_str        = "dashboard/form";
                        $folder_name     = "dashboard";
                        $file_name       = "";
        
                        $folder_name_org = "dashboard";
                        $file_name_org   = "dashboard";
        
                        $btn_add         = "index.php?file=".$folder_name_org."/form";
                        $btn_cancel      = "index.php?file=".$folder_name_org."/list";
                        $folder_crud_link= "folders/".$folder_name_org."/crud.php";
        
                  
        
                }
            ?>
            <script>
                sessionStorage.setItem("folder_crud_link","<?php echo $folder_crud_link; ?>");
                sessionStorage.setItem("list_link","<?php echo $btn_cancel; ?>");
                sessionStorage.setItem("company_name","<?php echo "Zigma Global Environ Solutions Private Limited"; ?>");
            </script>
        
      <div class="main-content">

            <div class="page-content">
                <div class="container-fluid">

        
                <!-- Location -->
                <input type="hidden" name="location" id="location" class="form-control" value="" disabled>
                <input type="hidden" name="latitude" id="latitude" class="form-control" value="" >
                <input type="hidden" name="longitude" id="longitude" class="form-control" value="" >
        
       
                <!-- Breadcrumbs Begins Here -->
                    <?php //include 'breadcrumbs.php'; ?>
                <!-- Breadcrumbs Ends Here -->
        
        
                <!-- Page content Begins Here -->
                    <?php include 'folders/'.$file_str.'.php';?>
                <!-- Page content Ends Here -->
                    
                </div> <!-- container -->
        
            </div> <!-- content -->
        
        
        
        <!-- ============================================================== -->
        <!-- End Page content -->
        <!-- ============================================================== -->