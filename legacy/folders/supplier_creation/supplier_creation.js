$(document).ready(function () {
	// var table_id 	= "main_user_screen_datatable";
	init_datatable(table_id,form_name,action);
	$('#gst_no').on('input', function (e) {
        const gstNoPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        const inputField = e.target;
		//  alert(inputField);
        const inputValue = inputField.value.toUpperCase(); // Convert to uppercase automatically
		// alert(inputValue);
        inputField.value = inputValue; // Set the input value to uppercase
        if (gstNoPattern.test(inputValue)) {
            inputField.setCustomValidity(''); // Valid GST No
        } else {
            inputField.setCustomValidity('Invalid GST No'); // Invalid GST No
        }
    });
});
var company_name 	= sessionStorage.getItem("company_name");
var company_label 	= sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	= sessionStorage.getItem("company_name");
var form_name 		= 'supplier_creation';
var form_header		= '';
var form_footer 	= '';
var table_name 		= '';
var table_id 		= 'supplier_creation_datatable';
var action 			= "datatable";

function supplier_creation_cu(unique_id = "") {
    var internet_status  = is_online();
    if (!internet_status) {
        sweetalert("no_internet");
        return false;
    }
    var is_form = form_validity_check("was-validated");
    if (is_form) {
        var data 	 = $(".was-validated").serialize();
        data 		+= "&unique_id="+unique_id+"&action=createupdate";
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var url      = sessionStorage.getItem("list_link");
        // console.log(data);
        $.ajax({
			type 	: "POST",
			url 	: ajax_url,
			data 	: data,
			beforeSend 	: function() {
				$(".createupdate_btn").attr("disabled","disabled");
				$(".createupdate_btn").text("Loading...");
			},
			success		: function(data) {
				var obj     = JSON.parse(data);
				var msg     = obj.msg;
				var status  = obj.status;
				var error   = obj.error;
				if (!status) {
					url 	= '';
                    $(".createupdate_btn").text("Error");
                    console.log(error);
				} else {
					if (msg=="already") {
						// Button Change Attribute
						url 		= '';
						$(".createupdate_btn").removeAttr("disabled","disabled");
						if (unique_id) {
							$(".createupdate_btn").text("Update");
						} else {
							$(".createupdate_btn").text("Save");
						}
					}
				}
				sweetalert(msg,url);
			},
			error 		: function(data) {
				alert("Network Error");
			}
		});
    } else {
        sweetalert("form_alert");
    }
}
function init_datatable(table_id='',form_name='',action='') {
	var table = $("#"+table_id); 
	var data 	  = {
		"action"	: action, 
	};
	var ajax_url  = sessionStorage.getItem("folder_crud_link");
	var datatable = table.DataTable({
	
	"ajax"		: {
		url 	: ajax_url,
		type 	: "POST",
		data 	: data
	},
		
	});
}
function supplier_creation_delete(unique_id = "") {
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var url      = sessionStorage.getItem("list_link");
	
	confirm_delete('delete')
	.then((result) => {
		if (result.isConfirmed) {
			var data = {
				"unique_id" 	: unique_id,
				"action"		: "delete"
			}
			$.ajax({
				type 	: "POST",
				url 	: ajax_url,
				data 	: data,
				success : function(data) {
					var obj     = JSON.parse(data);
					var msg     = obj.msg;
					var status  = obj.status;
					var error   = obj.error;
					if (!status) {
						url 	= '';
						
					} else {
						init_datatable(table_id,form_name,action);
					}
					sweetalert(msg,url);
				}
			});
		} else {
			// alert("cancel");
		}
	});
}

function onlyNumberKey(evt) {
	
   // Only ASCII character in that range allowed
   var ASCIICode = (evt.which) ? evt.which : evt.keyCode
   if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
	   return false;
   return true;
}

function validateInput(input) {
	input.value = input.value.replace(/[^a-zA-Z]/g, '');
	input.value = input.value.toUpperCase();
}

