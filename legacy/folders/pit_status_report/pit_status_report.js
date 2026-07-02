$(document).ready(function () {

  ticket_Filter();
  // var table_id 	= "main_user_screen_datatable";
  // init_datatable(table_id, form_name, action);
});
var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = 'Pit Status';
var form_header = '';
var form_footer = '';
var table_name = '';
var table_id = 'pit_status_datatable';
var action = "datatable";

function pit_status_cu(unique_id = "") {
  // alert();
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }
  var is_form = form_validity_check("was-validated");
  if (is_form) {
    // alert();
    var formData = $(".was-validated").serializeArray();
        formData.push({ name: "unique_id", value: unique_id });
        formData.push({ name: "action", value: "createupdate" });
        var data = $.param(formData);

// alert(data);
    // data += "&unique_id=" + unique_id + "&action=createupdate";
    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: data,
      beforeSend: function () {
        $(".createupdate_btn").attr("disabled", "disabled").text("Loading...");
      },
      success: function (response) {
        // alert(response);
        var obj = JSON.parse(response);
        var msg = obj.msg;
        var status = obj.status;
        var error = obj.error;
        if (!status) {
          $(".createupdate_btn").text("Error");
          console.log(error);
        } else {
          if (msg == "already") {
            $(".createupdate_btn").removeAttr("disabled").text(unique_id ? "Update" : "Save");
          }
        }
        sweetalert(msg, url);
      },
      error: function () {
        alert("Network Error");
      } 
    });
  } else {
    sweetalert("form_alert");
  }
}

function  ticket_Filter(){
    init_datatable(table_id, form_name, action);
}


function init_datatable(table_id = '', form_name = '', action = '') {
  var table = $("#" + table_id);

  var from_date     = $("#from_date").val();
  var to_date       = $("#to_date").val();
  var pit_id        = $("#pit_id").val();
  var status_type   = $('#status').val();
  var harvest_comp  = $('#harvest_comp').val();
  // alert(pit_id);
  var data = {
    "action"        : action,
    "from_date"     : from_date,
    "to_date"       : to_date,
    "pit_id"        : pit_id,
    "status_type"   : status_type,
    "harvest_comp"  : harvest_comp,

  };
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
    // dom: 'Blfrtip',
		// buttons: [
		// 	'copy', 'csv', 'excel', 'pdf', 'print'
		// ]
    // dom: "Bfrtip", buttons: ["copy", "csv", "excel", "print"]
  });
}

function pit_status_delete(unique_id, batch_id, tray_no) {
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");

  confirm_delete('delete')
    .then((result) => {
      if (result.isConfirmed) {
        var data = {
          "unique_id": unique_id,
          "batch_id": batch_id,
          "tray_no": tray_no,
          "action": "delete"
        }
        // alert(data);
        $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {
            var obj = JSON.parse(data);
            var msg = obj.msg;
            var status = obj.status;
            var error = obj.error;
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
function new_external_window_print(event, url, pit_id) {
 

  var link = url + "?pit_id=" + pit_id;

  onmouseover = window.open(
    link,
    "onmouseover",
    "height=550,width=950,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no"
  );
  event.preventDefault();
}

$(document).ready(function() {
  // Function to show/hide remarks field based on status
  function toggleRemarksBasedOnStatus() {
      var selectedStatus = $('#org_status').val(); // Get selected value
      
      if (selectedStatus === '1') {
        // Show the larvae_added field row
        $('#feed_qty').closest('.org_waste').show();
    } else {
        // Hide the larvae_added field row
        $('#feed_qty').closest('.org_waste').hide();
    }

   if (selectedStatus === '2') {
    $('#tray_no').closest('.larvae').show();
    $('#batch_div').show(); // Show the new div
} else {
    $('#tray_no').closest('.larvae').hide();
    $('#batch_div').hide(); // Hide the new div
}


  if (selectedStatus === '3') {
    // Show the larvae_added field row
    $('#method').closest('.aera_process').show();
} else {
    // Hide the larvae_added field row
    $('#method').closest('.aera_process').hide();
}

  if (selectedStatus === '4') {
    // Show the larvae_added field row
    $('#dry_method').closest('.dry_process').show();
  } else {
    // Hide the larvae_added field row
    $('#dry_method').closest('.dry_process').hide();
  }

  if (selectedStatus === '5') {
    // Show the larvae_added field row
    $('#larvae_qty').closest('.harvest').show();
    $('#qty_manure_1').closest('.harvest').show();
    $('#qty_rejets').closest('.harvest').show();
    $('#harvest_comp').closest('.harvest').show();
  } else {
    // Hide the larvae_added field row
    $('#larvae_qty').closest('.harvest').hide();
    $('#qty_manure_1').closest('.harvest').hide();
    $('#qty_rejets').closest('.harvest').hide();
    $('#harvest_comp').closest('.harvest').hide();
  }

}

  // Attach the function to the change event of the org_status dropdown
  $('#org_status').change(toggleRemarksBasedOnStatus);
  
  // Initial call to set the correct visibility on page load
  toggleRemarksBasedOnStatus();
});
