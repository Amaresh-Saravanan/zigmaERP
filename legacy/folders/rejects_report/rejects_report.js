$(document).ready(function () {
  	rejects_Filters();
    init_datatable(table_id="", form_name = "", $acton ="");
  
});
var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "rejects";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "rejects_creation_datatable";
var action = "datatable";


function init_datatable(
  table_id    = "",
  form_name   = "",
  action      = "",
  from_date   = "",
  to_date     = "",
  location    = "",
  pit_id      = "",
) {
  // alert('hi');
  var table = $("#" + table_id);
  var data = {
    action: action,
    "from_date": from_date,
    "to_date": to_date,
   
  };
  // alert(location);
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({

    ordering    : true,
		searching   : true,
    "searching" : true,
        
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

function rejects_Filters() {
  // alert('hlo');
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
 
  
  // alert(location);
  var table_id = "rejects_creation_datatable";
  var form_name = "measurable";
  var action = "datatable";

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    
  );
}


function new_external_window_print(event, url, pit_id) {


  var link = url + "?ticket_no=" + pit_id;

  onmouseover = window.open(
    link,
    "onmouseover",
    "height=550,width=950,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no"
  );
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
