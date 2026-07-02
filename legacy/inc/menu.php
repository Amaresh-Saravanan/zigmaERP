
    <div class="app-menu navbar-menu">
            <!-- LOGO -->
            <div class="navbar-brand-box mt-2 pb-2 ">
                <!-- Dark Logo-->
                <a href="index.php" class="logo logo-dark">
                    <span class="logo-sm">
                        <img src="assets/images/favi-icon.png" alt="" height="32">
                    </span>
                    <span class="logo-lg ">
                        <img src="assets/images/zig-fly-logo.png" alt="" height="64">
                    </span>
                </a>
                <!-- Light Logo-->
                <a href="index.php" class="logo logo-light">
                    <span class="logo-sm">
                        <img src="assets/images/favi-icon.png" alt="" height="32">
                    </span>
                    <span class="logo-lg">
                        <img src="assets/images/zig-fly-logo.png" alt="" height="64">
                    </span>
                </a>
                <button type="button" class="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover">
                    <i class="ri-record-circle-line"></i>
                </button>
            </div>
    
            
            <div id="scrollbar">
                <div class="container-fluid">


                    <div id="two-column-menu">
                    </div>
                    <ul class="navbar-nav" id="navbar-nav">
                        <li class="menu-title"><span data-key="t-menu">Menu</span></li>
                        <li class="nav-item">
                            <?php
      if (isset($_GET['file'])) {
        $file_str        = $_GET['file'];
        $file_arr        = explode("/", $file_str);
        $folder_name_org = $file_arr[0];
        $file_name_org   = $file_arr[1];
      }
      if ($folder_name_org == 'dashboard') {
        $active = "active";
      } else {
        $active = "";
      } ?>
       <?php if($_SESSION['sess_user_type'] != '6213273aa04b228161'){?>
                            <a class="nav-link menu-link <?= $active; ?>" href="index.php?file=dashboard/form"  aria-controls="sidebarDashboards">
                                <i class="ri-home-3-fill"></i> <span data-key="t-dashboards">Dashboards</span>
                            </a>
                           <?php }?>
                        </li> <!-- end Dashboard Menu -->
                        
                        
                        
                        
                        
                        <li class="nav-item">
                            
                            <?php
      if (isset($_GET['file'])) {
        $file_str        = $_GET['file'];
        $file_arr        = explode("/", $file_str);
        $folder_name_org = $file_arr[0];
        $file_name_org   = $file_arr[1];
      }

      $main_screens  = main_screen();
      
      foreach ($main_screens as $main_key => $main_value) {
        
        if (in_array($main_value['unique_id'], $_SESSION['main_screens'])) {

          $menu_main_name    =  disname($main_value["screen_main_name"]);
          $menu_main_icon    = "";
          if ($main_value["icon_name"]) {
            $menu_main_icon    =  '<i class="nav-icon ' . $main_value["icon_name"] . '"></i>';
          }
          $user_screens_act     = user_screen('','', $folder_name_org);

      ?>
          <?php if ($user_screens_act[0]['main_screen_unique_id'] == $main_value['unique_id']) {
            $active = "";
          } else {
            $active = "collapsed";
          } ?>
                            <a class="nav-link menu-link <?=$active;?>" href="#sidebarDashboards<?php echo $main_value["unique_id"]; ?>" data-bs-toggle="collapse" role="button" aria-expanded="false" aria-controls="sidebarDashboards<?php echo $main_value["unique_id"]; ?>">
                                <?php echo $menu_main_icon; ?> <span data-key="t-dashboards"><?php echo $menu_main_name; ?></span>
                            </a>
                            <div class="collapse menu-dropdown" id="sidebarDashboards<?php echo $main_value["unique_id"]; ?>">
                                <ul class="nav nav-sm flex-column  <?= $main_value["unique_id"]; ?>">
                                    <?php
                  $user_screens     = user_screen('', $main_value['unique_id']);
                  foreach ($user_screens as $sub_key => $sub_value) {
                    if (in_array($sub_value['unique_id'], $_SESSION['screens'])) {
                    $screen_name    =  disname($sub_value["screen_name"]);
                    $screen_icon    = "";
                    $folder         = $sub_value["folder_name"];
                    if ($sub_value["icon_name"]) {
                      $screen_icon    =  '<i class="nav-icon ' . $sub_value["icon_name"] . '"></i>';
                    }
                  ?>
                                    <li <?php if ($folder_name_org == $folder) { ?>class="active" <?php } ?> class="<?php if ($folder_name_org == $folder) { ?>active <?php } ?> nav-item> nav-item">
                                        <a href="index.php?file=<?php echo $folder; ?>/list" class="nav-link" data-key="t-analytics"> <?php echo $screen_name; ?> </a>
                                    </li>
                                     <?php 
                                     } }?>
                 
                                </ul>
                            </div>
                        </li>
                     <?php
        
      } }
      ?>
                                </ul>
                            </div>
                        </li>

                    </ul>
                </div>
                <!-- Sidebar -->
            </div>


            <div class="sidebar-background"></div>
        </div>
        <!-- Left Sidebar End -->
        <!-- Vertical Overlay-->
        <div class="vertical-overlay"></div>
