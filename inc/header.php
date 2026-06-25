<!doctype html>
<html lang="en" data-layout="vertical" data-topbar="light" data-sidebar="light" data-sidebar-size="lg" data-sidebar-image="none" data-preloader="disable" data-theme="default" data-theme-colors="default">
<head>
    <meta charset="utf-8" />
    <title>Zigfly </title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- App favicon -->
  <link rel="icon" type="image/x-icon"  href="assets/images/favi-icon.png">
           <!-- dropzone css -->
           <!-- <link rel="stylesheet" href="assets/libs/dropzone/dropzone.css" type="text/css" /> -->
 <!-- Dropify -->
 <link href="assets/libs/dropify/dist/css/dropify.min.css" rel="stylesheet" type="text/css" />
 
<!-- Filepond css -->
<link rel="stylesheet" href="assets/libs/filepond/filepond.min.css" type="text/css" />
<link rel="stylesheet" href="assets/libs/filepond-plugin-image-preview/filepond-plugin-image-preview.min.css">




    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/2.0.8/css/dataTables.bootstrap5.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/responsive/2.4.1/css/responsive.bootstrap.min.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet" />

   <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.2.2/css/buttons.dataTables.min.css">

    <!-- jsvectormap css -->
    <link href="assets/libs/jsvectormap/css/jsvectormap.min.css" rel="stylesheet" type="text/css" />
    <!--Swiper slider css-->
    <link href="assets/libs/swiper/swiper-bundle.min.css" rel="stylesheet" type="text/css" />
    <!-- Layout config Js -->
    <script src="assets/js/layout.js"></script>
    <!-- Bootstrap Css -->
    <link href="assets/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <!-- Icons Css -->
    <link href="assets/css/icons.min.css" rel="stylesheet" type="text/css" />
    <!-- App Css-->
    <link href="assets/css/app.min.css" rel="stylesheet" type="text/css" />
    <!-- custom Css-->
    <link href="assets/css/custom.min.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <!-- Begin page -->
    <div id="layout-wrapper">
        <header id="page-topbar">
            <div class="layout-width">
                <div class="navbar-header">
                    <div class="d-flex">
                        <!-- LOGO -->
                        <div class="navbar-brand-box horizontal-logo">
                            <a href="index.php" class="logo logo-dark">
                                <span class="logo-sm">
                                    <img src="assets/images/zig-fly-logo.png" alt="" height="62">
                                </span>
                                <span class="logo-lg">
                                    <img src="assets/images/zig-fly-logo.png" alt="" height="47">
                                </span>
                            </a>
                            <a href="index.html" class="logo logo-light">
                                <span class="logo-sm">
                                    <img src="assets/images/zig-fly-logo.png" alt="" height="62">
                                </span>
                                <span class="logo-lg">
                                    <img src="assets/images/zig-fly-logo.png" alt="" height="47">
                                </span>
                            </a>
                        </div>
                        <button type="button" class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger material-shadow-none" id="topnav-hamburger-icon">
                            <span class="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                    <div class="d-flex align-items-center">
                    </div>
                    <div class="dropdown ms-sm-3 header-item topbar-user">
                        <button type="button" class="btn material-shadow-none" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="d-flex align-items-center">
                                <span style="width: 50px;height: 16px;" class="ri-user-fill header-profile-user"></span>
                                <span class="text-start ms-xl-2">
                                    <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text"><?= disname($_SESSION['user_name']); ?></span>
                                    <span class="d-none d-xl-block ms-1 fs-12 user-name-sub-text"><?= user_type($_SESSION['sess_user_type'])[0]['user_type']; ?></span>
                                </span>
                            </span>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end">
                            <!-- item-->
                            <h6 class="dropdown-header">Welcome <?= disname($_SESSION['user_name']); ?>!</h6>
                            <a class="dropdown-item" href="logout.php"><i class="mdi mdi-logout text-muted fs-16 align-middle me-1"></i> <span class="align-middle" data-key="t-logout">Logout</span></a>
                        </div>
                    </div>
                </div>
            </div>
    </div>
    </header>
    <?php include 'menu.php' ?>