$(document).ready(function () {
	leachate_Filters();
	// init_datatable(table_id, form_name, action);
  });
var company_name 	  = sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	  = sessionStorage.getItem("company_name");
var form_name 		  = 'leachate';
var form_header		  = '';
var form_footer 	  = '';
var table_name 		  = '';
var table_id 		    = 'leachate_datatable';
var action 			    = "datatable";

function leachate_cu(unique_id = "") {
  var internet_status = is_online();
  if (!internet_status) {
      sweetalert("no_internet");
      return false;
  }

  var is_form = form_validity_check("was-validated");
  if (is_form) {
      var data = new FormData($(".was-validated")[0]);

      data.append("unique_id", unique_id);
      data.append("action", "createupdate");

      var updated_images = document.getElementById("test_file");

      if (updated_images && updated_images.files.length > 0) {
          for (var i = 0; i < updated_images.files.length; i++) {
              data.append("test_file[]", updated_images.files[i]);
          }
      } 
      else {
          data.append("test_file[]", '');
      }

      var ajax_url = sessionStorage.getItem("folder_crud_link");
      var url = sessionStorage.getItem("list_link");

      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          processData: false, 
          contentType: false,
          beforeSend: function() {
              $(".createupdate_btn").attr("disabled", "disabled");
              $(".createupdate_btn").text("Loading...");
          },
          success: function(response) {
              var obj = JSON.parse(response);
              var msg = obj.msg;
              var status = obj.status;
              var error = obj.error;

              if (!status) {
                  url = '';
                  $(".createupdate_btn").text("Error");
                  console.log(error);
              } else {
                  if (msg === "already") {
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
          error: function() {
              alert("Network Error");
          }
      });
  } else {
      sweetalert("form_alert");
  }
}

function init_datatable(
	table_id	  = '',
	form_name	  = '',
	action		  = '', 
	from_date 	= '', 
	to_date 	  = '',
) {
	
	var table = $("#"+table_id); 			
	var data = {

      "action"   : action,
      "from_date": from_date,
      "to_date"  : to_date,
    };	
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var datatable = table.DataTable({

		// ordering    : true,
		// searching   : true,
    // "searching" : true,
	
	"ajax"		: {
		url 	: ajax_url,
		type 	: "POST",
		data 	: data,
	},
		
	});
}


function leachate_Filters() {
  var from_date = $("#from_date").val();
  var to_date   = $("#to_date").val();

  var table_id  = "leachate_datatable";
  var form_name = "leachate";
  var action    = "datatable";

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
  );
}


function leachate_delete(unique_id = "") {
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