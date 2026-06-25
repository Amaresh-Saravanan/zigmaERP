$(document).ready(function () {
  // var table_id 	= "main_user_screen_datatable";
  init_datatable(table_id, form_name, action);
});
var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = 'material_received';
var form_header = '';
var form_footer = '';
var table_name = '';
var table_id = 'material_received_datatable';
var action = "datatable";

function material_received_cu(unique_id = "") {
  var internet_status = is_online();
  var data = new FormData();
  if (!internet_status) {
      sweetalert("no_internet");
      return false;
  }

  var date = $("#date").val();
  var supplier_name = $("#supplier_name").val();
  var label = $("#label").val();
  var item_name = $("#item_name").val();
  var qty = $("#qty").val();
  var unit1 = $("#unit1").val();
  var invoice_date = $("#invoice_date").val();
  var invoice_no = $("#invoice_no").val();
  var unique_id = $("#unique_id").val() || ''; // Ensure unique_id is an empty string if not set
  var updated_images = document.getElementById("test_file");

  if (updated_images && updated_images.files.length > 0) { 
      for (var i = 0; i < updated_images.files.length; i++) {
          data.append("test_file[]", updated_images.files[i]);
      }
  } else {
      data.append("test_file[]", '');
  }

  if(date && supplier_name  && item_name && qty && unit1 && label) {		
      data.append("date", date);
      data.append("supplier_name", supplier_name);
      data.append("label", label);
      data.append("item_name", item_name);
      data.append("qty", qty);    
      data.append("unit1", unit1);
      data.append("invoice_date", invoice_date);
      data.append("invoice_no", invoice_no);
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
          success: function(data) {
              var obj = JSON.parse(data);
              var msg = obj.msg;
              var status = obj.status;
              var error = obj.error;

              if (!status) {
                  $(".createupdate_btn").text("Error");
              } else {
                  if (msg == "already") {
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
          error: function() {
              alert("Network Error");
          }
      });
  } else {
      sweetalert("form_alert");
  }
}
function get_label_name() {
  // alert("Hii");
  var supplier_name = $('#supplier_name').val(); 
  // alert(supplier_name);
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (supplier_name) {
    // alert();
      var data = {
          "supplier_name": supplier_name, 
          "action": "get_label_name"
      }
// alert(data);
      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {
      // alert(data);
              var obj     = JSON.parse(data);
              var msg     = obj.msg;
              var status  = obj.status;
              var error   = obj.error;
              
              
              var label = obj.label;
              
             
              
              if (data) {
                   
                   $('#label').val(label);
                   
                 
              }
             
          }
      });
  }
}

function get_unit_details() {
  // alert("Hii");
  var item_name = $('#item_name').val(); 
  // alert(item_name);
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (item_name) {
    // alert();
      var data = {
          "item_name": item_name, 
          "action": "unit"
      }
// alert(data);
      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {
      // alert(data);
              var obj     = JSON.parse(data);
              var msg     = obj.msg;
              var status  = obj.status;
              var error   = obj.error;
              
              //var problem = obj.problem;
              var unit = obj.unit;
              var unit1 = obj.unit1;
             
              
              if (data) {
                   
                   $('#unit').val(unit);
                   $('#unit-display').text(unit);
                   $('#unit1').val(unit1);
             
              }
             
          }
      });
  }
}

function  ticket_Filter(){
    init_datatable(table_id, form_name, action);
}

function init_datatable(table_id = '', form_name = '', action = '') {
  var table = $("#" + table_id);

  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var item_name = $("#item_name").val();
  var supplier_name = $("#supplier_name").val();
  // alert(item_name);
  
  var data = {
    "action": action,
    "from_date":from_date,
    "to_date":to_date,
    "item_name":item_name,
    "supplier_name":supplier_name,

  };
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({
    "ajax": {
      url: ajax_url,
      type: "POST",
      data: data
    },
  });
}
function material_received_delete(unique_id = "") {
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

function print_view(file_name) {
  window.open(file_name, '_blank', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}
