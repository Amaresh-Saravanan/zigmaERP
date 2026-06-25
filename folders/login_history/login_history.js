$(document).ready(function () {
  	login_history_filter();
    init_datatable(table_id="", form_name = "", $acton ="");
  
});
var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "Login History Report";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "login_history_datatable";
var action = "datatable";


function init_datatable(
  table_id    = "",
  form_name   = "",
  action      = "",
  from_date   = "",
  to_date     = "",
) {
  // alert('hi');
  var table = $("#" + table_id);
  var from_date       = $('#from_date').val();
  var to_date         = $('#to_date').val(); 
  var staff_name      = $('#staff_name').val();
  var data = {
    action          : action,
    "from_date"     : from_date,
    "to_date"       : to_date,
    "staff_name"    : staff_name,
   
  };
  // alert(location);
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({
    ordering: true,
    searching: true,
    // paging: true,       // Enable paging
    // lengthChange: true, // Allow user to change the number of records per page
    // pageLength: 10,     // Default number of records per page
    "ajax"      : { 
    url     : ajax_url, 
    type    : "POST", 
    data    : data 
  }, 

    // dom: 'Blfrtip',
    dom: '<"top"lB><"middle"f><"bottom"rtip>',
    // dom: '<"top"B><"middle"l><"bottom"frtip>',
    buttons: [ 
      'copy', 'csv', 'excel', 'pdf', 'print' 
    ],
});
  // alert(data);
}

function login_history_filter() {
  // alert('hlo');
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var staff_name     = $('#staff_name').val();
  
  // alert(location);
  var table_id = "login_history_datatable";
  var form_name = "Login History Report";
  var action = "datatable";



  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    staff_name,
    
  );
}


function new_external_window_print(event, url, unique_id,entry_date,user_name,user_type) {
  // alert();
      // var link = url + '?unique_id=' + unique_id;
      var link = url + '?unique_id=' + unique_id + '&entry_date=' + entry_date + '&user_type=' + user_type + '&user_name=' + user_name;
  
  
      onmouseover = window.open(link, 'onmouseover', 'height=550,width=950,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
      event.preventDefault();
  }

function new_external_window_upload(event, file_path, ticket_no) {
  event.preventDefault();
  const url = file_path + '?ticket_number=' + ticket_no;
  // Open the window in full screen by setting width and height to the screen's size
  window.open(url, 'Image Upload', 'fullscreen=yes');
}



function openImageUploadWindow(ticketNumber) {
  const url = 'image_upload.php?ticket_number=' + ticketNumber;
  window.open(url, 'Image Upload', 'width=600,height=400');
}
