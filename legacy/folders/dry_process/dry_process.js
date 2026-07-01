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
var form_name   = 'dry_process';
var form_header = '';
var form_footer = '';
var table_name  = '';
var table_id    = 'dry_process_datatable';
var action      = "datatable";

// function dry_Filter(){
//   init_datatable(table_id, form_name, action);
// }
function dry_Filter(){
  // alert("hiii");
  var from_date = $('#from_date').val();
  var to_date = $('#to_date').val();
  var type = $('#type').val();
  var drying_method = $('#drying_method').val();
  var table_id = 'dry_process_datatable';  // Adjust with your actual table ID
  var form_name = 'dry_process';  // Adjust with your actual form name
  var action = 'datatable';  // Adjust with your actual action

  init_datatable(table_id, form_name, action, from_date, to_date, type, drying_method);
}

function dry_process_cu(unique_id = "") {
  var internet_status = is_online();
  var data = new FormData();
  if (!internet_status) {
      sweetalert("no_internet");
      return false;
  }
  
  var entry_date = $("#entry_date").val();
  var type = $("#type").val();
  var drying_method = $("#drying_method").val();
  var quantity = $("#quantity").val(); // Get quantity value
  var qty_manure = $("#qty_manure").val();
  var unique_id = $("#unique_id").val();
  var test_file = $("#test_file").val();
  var updated_images = document.getElementById("test_file");

  if (updated_images != '') { 
      for (var i = 0; i < updated_images.files.length; i++) {
          data.append("test_file[]", updated_images.files[i]);
      }
  } else {
      data.append("test_file[]", '');
  }

  // Check if the quantity is valid
  if (entry_date != '' && type != '' && drying_method != '' && quantity > 0) {
      data.append("entry_date", entry_date);
      data.append("type", type);
      data.append("drying_method", drying_method);
      data.append("quantity", quantity);
      data.append("qty_manure", qty_manure);
      data.append("test_file", updated_images);
      data.append("unique_id", unique_id);
      data.append("action", "createupdate");

      var ajax_url = sessionStorage.getItem("folder_crud_link");
      var url = sessionStorage.getItem("list_link");

      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          cache: false,
          contentType: false,
          processData: false,
          method: 'POST',
          beforeSend: function () {
              $(".createupdate_btn").attr("disabled", "disabled");
              $(".createupdate_btn").text("Loading...");
          },
          success: function (data) {
              var obj = JSON.parse(data);
              var msg = obj.msg;
              var status = obj.status;
              var error = obj.error;
              if (!status) {
                  url = '';
                  $(".createupdate_btn").text("Error");
                  console.log(error);
              } else {
                  if (msg == "already") {
                      url = '';
                      $(".createupdate_btn").removeAttr("disabled");
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


// function dry_process_cu1(unique_id = "") {
//   var internet_status = is_online();
//   // var data = new FormData();
//   if (!internet_status) {
//     sweetalert("no_internet");
//     return false;
//   }
//   var is_form = form_validity_check("was-validated");
//   if (is_form) {
//     var data = $(".was-validated").serialize();
//     data += "&unique_id=" + unique_id + "&action=createupdate";
//     var ajax_url = sessionStorage.getItem("folder_crud_link");
//     var url = sessionStorage.getItem("list_link");
//     // console.log(data);
//     $.ajax({
//       type: "POST",
//       url: ajax_url,
//       data: data,
//       beforeSend: function () {
//         $(".createupdate_btn").attr("disabled", "disabled");
//         $(".createupdate_btn").text("Loading...");
//       },
//       success: function (data) {
//         var obj    = JSON.parse(data);
//         var msg    = obj.msg;
//         var status = obj.status;
//         var error  = obj.error;
//         if (!status) {
//           url = '';
//           $(".createupdate_btn").text("Error");
//           console.log(error);
//         } else {
//           if (msg == "already") {
//             // Button Change Attribute
//             url = '';
//             $(".createupdate_btn").removeAttr("disabled", "disabled");
//             if (unique_id) {
//               $(".createupdate_btn").text("Update");
//             } else {
//               $(".createupdate_btn").text("Save");
//             }
//           }
//         }
//         sweetalert(msg, url);
//       },
//       error: function (data) {
//         alert("Network Error");
//       }
//     });
//   } else {
//     sweetalert("form_alert");
//   }
// }

function print_view(file_name) {
    onmouseover = window.open('uploads/dry_process/' + file_name, 'onmouseover', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}

function init_datatable(table_id = '', form_name = '', action = '', from_date = '', to_date = '', type = '', drying_method = '') {
  var table = $("#" + table_id);
  var data  = {
    "action": action,
    "from_date": from_date,
    "to_date": to_date,
    "type": type,
    "drying_method": drying_method,
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

function dry_process_delete(unique_id = "") {
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

