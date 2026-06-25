$(document).ready(function () {
	screening_process_Filters();
	// init_datatable(table_id, form_name, action);
  });
var company_name 	  = sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	  = sessionStorage.getItem("company_name");
var form_name 		  = 'screening_process';
var form_header		  = '';
var form_footer 	  = '';
var table_name 		  = '';
var table_id 		    = 'screening_process_creation_datatable';
var action 			    = "datatable";

function screening_process_cu(unique_id = "") {
  var internet_status = is_online();
  if (!internet_status) {
      sweetalert("no_internet");
      return false;
  }

  var is_form = form_validity_check("was-validated");
  if (is_form) {

      var batchIdField = $("#batch_id").val();
      if (!batchIdField || batchIdField.trim() === "") {
          sweetalert("form_alert");
          return false; 
      }

      var data = $(".was-validated").serialize();
      data += "&unique_id=" + unique_id + "&action=createupdate";
      var ajax_url = sessionStorage.getItem("folder_crud_link");
      var url = sessionStorage.getItem("list_link");

      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
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

function init_datatable(
	table_id	= '',
	form_name	= '',
	action		= '', 
	from_date = '', 
	to_date 	= '',
  pit_id    = '',
) {
	
	var table = $("#"+table_id); 
				
	var data = {

      "action"   : action,
      "from_date": from_date,
      "to_date"  : to_date,
      "pit_id"   : pit_id,
    };	
	var ajax_url  = sessionStorage.getItem("folder_crud_link");
	var datatable = table.DataTable({

		ordering    : true,
		searching   : true,
    "searching" : true,
	
	"ajax"		: {
		url 	: ajax_url,
		type 	: "POST",
		data 	: data,
	},		
	});
}


function screening_process_Filters() {
  var from_date = $("#from_date").val();
  var to_date   = $("#to_date").val();
  var pit_id    = $("#pit_id").val();

  var table_id  = "screening_process_creation_datatable";
  var form_name = "screening_process";
  var action    = "datatable";

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    pit_id,
  );
}


function screening_process_delete(unique_id = "", screen_unique_id = "") {
    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");

    confirm_delete('delete')
      .then((result) => {
        if (result.isConfirmed) {
          var data = {
            "unique_id": unique_id,
            "screen_unique_id": screen_unique_id,
            "action": "delete"
          };

          $.ajax({
            type: "POST",
            url: ajax_url,
            data: data,
            success: function (data) {
              var obj = JSON.parse(data);
              var msg = obj.msg;
              var status = obj.status;

              if (!status) {
                url = '';
              } else {
                init_datatable(table_id, form_name, action);
              }
              
              sweetalert(msg, url);
            }
          });
        }
      });
}


function get_form_batch_id_vibro() { 
    var pit_name   = $('#pit_id').val();
    var entry_date = $('#entry_date').val();
    var ajax_url   = sessionStorage.getItem("folder_crud_link");

    var data = {
        "pit_id"     : pit_name,
        "entry_date" : entry_date,
        "action"     : "get_form_batch_id_vibro"
    }

    $.ajax({
        type: "POST",
        url: ajax_url,
        data: data,
        success: function (response) {
            var obj = JSON.parse(response);
            var form_batch_id_vibro = obj.form_batch_id_vibro;

            $('#batch_id').val(form_batch_id_vibro);
        },
        error: function (xhr, status, error) {
            console.error("Error: " + error);
        }
    });
}
