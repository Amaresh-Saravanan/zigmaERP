$(document).ready(function () {
  // var table_id 	= "main_user_screen_datatable";
  // init_datatable(table_id, form_name, action);
  dry_Filter();
});
var company_name    = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone   = sessionStorage.getItem("company_name");
var company_email   = sessionStorage.getItem("company_name");
var company_logo    = sessionStorage.getItem("company_name");
var form_name   = 'rejects_image_upload';
var form_header = '';
var form_footer = '';
var table_name  = '';
var table_id    = 'rejects_image_upload_datatable';
var action      = "datatable";

// function dry_Filter(){
//   init_datatable(table_id, form_name, action);
// }
function dry_Filter(){
  // alert("hiii");
  var from_date = $('#from_date').val();
  var to_date = $('#to_date').val();
  // var type = $('#type').val();
  // var drying_method = $('#drying_method').val();
  var table_id = 'rejects_image_upload_datatable';  // Adjust with your actual table ID
  var form_name = 'rejects_image_upload';  // Adjust with your actual form name
  var action = 'datatable';  // Adjust with your actual action

  init_datatable(table_id, form_name, action, from_date, to_date);
}

function rejects_image_upload_cu(unique_id = "") {
  var internet_status = is_online();
  var data = new FormData();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }
  var entry_date       = $("#entry_date").val();    	
  var ticket_number    = $("#ticket_number").val();		
var weigh_date    	 = $("#weigh_date").val();
var vehicle_number     = $("#vehicle_number").val();
var net_weight         = $("#net_weight").val();
var unique_id          = $("#unique_id").val();		
var test_file          = $("#test_file").val();
// alert(unique_id);
var updated_images   = document.getElementById("test_file");
// alert(updated_images);

if (updated_images != '') { 
  for (var i = 0; i < updated_images.files.length; i++) {
      data.append("test_file[]", document.getElementById('test_file').files[i]);
  }
} else {
      data.append("test_file[]", '');
}


if(entry_date != '' && ticket_number != '' && net_weight != '' && vehicle_number != ''){		
data.append("entry_date", entry_date);
data.append("ticket_number", ticket_number );
data.append("net_weight", net_weight);
data.append("vehicle_number", vehicle_number);
data.append("weigh_date", weigh_date);
data.append("test_file", updated_images);
data.append("unique_id", unique_id);
data.append("action", "createupdate");

// alert(type);
    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");
  
    $.ajax({
      type 	: "POST",
			url 	: ajax_url,
			data 	: data,
     cache: false,
			contentType: false,
			processData: false,
			method: 'POST',
      beforeSend: function () {
        $(".createupdate_btn").attr("disabled", "disabled");
        $(".createupdate_btn").text("Loading...");
      },
      
      success: function (data) {
        // alert(data);
        var obj    = JSON.parse(data);
        var msg    = obj.msg;
        var status = obj.status;
        var error  = obj.error;
        if (!status) {
          url = '';
          $(".createupdate_btn").text("Error");
          console.log(error);
        } else {
          if (msg == "already") {
            // Button Change Attribute
            url = '';
            $(".createupdate_btn").removeAttr("disabled", "disabled");
            if (unique_id) {
              $(".createupdate_btn").text("Update");
            } else {
              $(".createupdate_btn").text("Save");
            }
          }
        }
        sweetalert(msg, url);
      },
      error: function (data) {
        alert("Network Error");
      }
    });
  } else {
    sweetalert("form_alert");
  }
}



function print_view(file_name) {
    onmouseover = window.open('uploads/rejects_image_upload/' + file_name, 'onmouseover', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}

function init_datatable(table_id = '', form_name = '', action = '', from_date = '', to_date = '') {
  var table = $("#" + table_id);
  var data  = {
    "action": action,
    "from_date": from_date,
    "to_date": to_date,
  };
  var ajax_url  = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({

    ordering    : true,
		searching   : true,
    "searching" : true,

    "ajax": {
      url: ajax_url,
      type: "POST",
      data: data
    },
    "destroy": true, // Ensure the old instance is destroyed before reinitializing
  });
}

function rejects_image_upload_delete(unique_id = "") {
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");
  confirm_delete('delete')
    .then((result) => {
      if (result.isConfirmed) {
        var data = {
          "unique_id": unique_id,
          "action": "delete"
        }
        $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {
            var obj    = JSON.parse(data);
            var msg    = obj.msg;
            var status = obj.status;
            var error  = obj.error;
            if (!status) {
              url = '';
            } else {
              init_datatable(table_id, form_name, action);
            }
            sweetalert(msg, url);
          }
        });
      } else {
        // alert("cancel");
      }
    });
}

$(document).ready(function() {
  
  toggleQtyManure();

 
  $('#type').change(toggleQtyManure);

  function toggleQtyManure() {
    var selectedType = $('#type').val();
    
    if (selectedType === '2') {
      $('.qty_manure_container').show();
      
    } else {
      $('.qty_manure_container').hide();
      $('#qty_manure').val(''); 
    }
  }
});

