<footer class="footer">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-sm-6">
                            <script>document.write(new Date().getFullYear())</script> © Zigfly.
                        </div>
                        <div class="col-sm-6">
                            <div class="text-sm-end d-none d-sm-block">
                                Design & Develop by Zigma
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div><!-- End Page-content -->   
    </div> <!-- END layout-wrapper -->
<script type="text/javascript" language="javascript" src="https://code.jquery.com/jquery-3.7.1.js"></script>
    <!-- JAVASCRIPT -->
    <script src="assets/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/libs/simplebar/simplebar.min.js"></script>
    <script src="assets/libs/node-waves/waves.min.js"></script>
    <script src="assets/libs/feather-icons/feather.min.js"></script>
    <script src="assets/js/pages/plugins/lord-icon-2.1.0.js"></script>
    <script src="assets/js/plugins.js"></script>

        <!-- dropzone min -->
        <!-- <script src="assets/libs/dropzone/dropzone-min.js"></script> -->

         <!-- Dropify -->
         <script src="assets/libs/dropify/dist/js/dropify.min.js"></script>

         
    <!-- filepond js -->
    <script src="assets/libs/filepond/filepond.min.js"></script>
    <script src="assets/libs/filepond-plugin-image-preview/filepond-plugin-image-preview.min.js"></script>
    <script src="assets/libs/filepond-plugin-file-validate-size/filepond-plugin-file-validate-size.min.js"></script>
    <script src="assets/libs/filepond-plugin-image-exif-orientation/filepond-plugin-image-exif-orientation.min.js"></script>
    <script src="assets/libs/filepond-plugin-file-encode/filepond-plugin-file-encode.min.js"></script>

    <script src="assets/js/pages/form-file-upload.init.js"></script>
    <!-- apexcharts -->
    <script src="assets/libs/apexcharts/apexcharts.min.js"></script>

    <!-- Vector map-->
    <script src="assets/libs/jsvectormap/js/jsvectormap.min.js"></script>
    <script src="assets/libs/jsvectormap/maps/world-merc.js"></script>
    
     <!-- Sweetalert2 -->
        <script src="assets/libs/sweetalert2/sweetalert2.all.min.js"></script>  
    <!--Swiper slider js-->
    <script src="assets/libs/swiper/swiper-bundle.min.js"></script>

    <!-- Dashboard init -->
    <script src="assets/js/pages/dashboard-ecommerce.init.js"></script>

    <!-- Select2 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.min.js"></script>
    <script>
      $(document).ready(function() {
          $("#single").select2({
              placeholder: "Select a programming language",
              allowClear: true
          });
          $("#multiple").select2({
              placeholder: "Select a programming language",
              allowClear: true
          });
      });
    </script>

    <!-- DataTables -->
    <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/2.0.8/js/dataTables.js"></script>
    <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/2.0.8/js/dataTables.bootstrap5.js"></script>
    <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/responsive/3.0.2/js/dataTables.responsive.js"></script>
    <script type="text/javascript" language="javascript" src="https://cdn.datatables.net/responsive/3.0.2/js/responsive.bootstrap5.js"></script>

    <script src="https://cdn.datatables.net/buttons/3.0.2/js/dataTables.buttons.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.print.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/3.0.2/js/buttons.html5.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>




    <!-- Custom Scripts -->
    <script src="assets/js/common.js"></script>
    <script type="text/javascript" src="<?php echo 'folders/'.$folder_name_org."/".$folder_name_org;?>.js"></script>
   
    <script type="text/javascript" class="init">
        $(document).ready(function() {
            new DataTable('#example', {
                responsive: true
            });
            new DataTable('#example1', {
                responsive: true
            });
        });
    </script>

    <!-- App js -->
    <script src="assets/js/app.js"></script>