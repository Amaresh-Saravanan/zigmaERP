$(document).ready(function () {
	// init_datatable(table_id, form_name, action);
    ticket_Filter();
	handleItemSelected();
    
  });
  
  function handleItemSelected() {
	var selectedItems = $('#item_name').val();
	var dynamicInputs = $('#dynamicInputs');
	dynamicInputs.empty(); // Clear previous inputs
  
	selectedItems.forEach(function(item) {
	  var optionText = $('#item_name option[value="' + item + '"]').text();
	  var inputField = `
		<div class="form-group mt-3">
          <label for="${item}">${optionText}</label>
          <input type="hidden" class="form-control" id="hidden_${item}" name="hidden_${item}" value="${item}">
          <input type="text" class="form-control" id="${item}" name="${item}" required>
        </div>
	   `;
	  dynamicInputs.append(inputField);
	});
}
var company_name 	= sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	= sessionStorage.getItem("company_name");
var form_name 		= 'Egg Process Report';
var form_header		= '';
var form_footer 	= '';
var table_name 		= '';
var table_id 		= 'egg_process_report_datatable';
var action 			= "datatable";


function egg_process_report_cu(unique_id = "") {
    // alert();
    var internet_status = is_online();
    if (!internet_status) {
        sweetalert("no_internet");
        return false;
    }

    var checkedvalue = $('#checkedvalue').val();
    var is_form = form_validity_check("was-validated");

    // Check if "Add Tray" sublist is filled
    var isTrayFilled = checkTraySublist();
    if (!isTrayFilled) {
		sweetalert("custom", '', '', 'Please fill the Add Tray Sublist');
        // alert("Please fill the Add Tray sublist.");
        return false;
    }

    if (is_form) {
        var data = $(".was-validated").serialize();
        data += "&unique_id=" + unique_id + "&checkedvalue=" + checkedvalue + "&action=createupdate";
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var url = sessionStorage.getItem("list_link");

        $.ajax({
            type: "POST",
            url: ajax_url,
            data: data,
            beforeSend: function() {
                $(".createupdate_btn").attr("disabled", "disabled");
                $(".createupdate_btn").text("Loading...");
            },
            success: function(data) {
                console.log("Server response: ", data); // Log server response for debugging
                var obj = JSON.parse(data);
                var msg = obj.msg;
                var status = obj.status;
                var error = obj.error;
                if (!status) {
                    url = '';
                    $(".createupdate_btn").text("Error");
                    console.log("Error: ", error); // Log error for debugging
                } else {
                    if (msg == "already") {
                        // Button Change Attribute
                        url = '';
                        $(".createupdate_btn").removeAttr("disabled");
                        if (unique_id) {
                            $(".createupdate_btn").text("Update");
                        } else {
                            $(".createupdate_btn").text("Save");
                        }
                        console.log("Already exists, unique_id: ", unique_id); // Log if already exists
                    } else {
                        // Successfully created or updated
                        console.log("Success, unique_id: ", unique_id); // Log successful creation/update
                        sweetalert(msg, url);
                    }
                }
            },
            error: function(data) {
                alert("Network Error");
                console.log("AJAX Error: ", data); // Log AJAX error for debugging
            },
            complete: function() {
                $(".createupdate_btn").removeAttr("disabled");
                $(".createupdate_btn").text(unique_id ? "Update" : "Save");
            }
        });
    } else {
        sweetalert("form_alert");
    }
}

// Function to check if "Add Tray" sublist is filled
function checkTraySublist() {
    // Check if any tray checkboxes are selected
    var checkboxes = document.querySelectorAll('input[name="option[]"]:checked');
    return checkboxes.length > 0;
}
// // Function to count checked checkboxes and update the count field
// function countChecked() {
//     var checkboxes = document.querySelectorAll('input[name="option[]"]:checked');
//     document.getElementById('checkedCount').value = checkboxes.length;
// }

function ticket_Filter()
{
    // alert();
    init_datatable(table_id,form_name,action);
}

function init_datatable(table_id='',form_name='',action='') {
	var table = $("#"+table_id);
    var from_date = $('#from_date').val();
    var to_date   = $('#to_date').val();
    var batch_id   = $('#batch_id').val();
    var supplier_name =$('#supplier_name').val();
    // alert();
	var data 	  = {
		"action"	: action,
        "from_date" : from_date,
        "to_date"   : to_date,
        "batch_id"  : batch_id,
        "supplier_name" : supplier_name

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
    // dom: "Bfrtip", buttons: ["copy", "csv", "excel", "print"]
		
	});
}

function egg_process_report_delete(unique_id ,batch_id,tray_no) {
    // alert();
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var url      = sessionStorage.getItem("list_link");
	
	confirm_delete('delete')
	.then((result) => {
    
		if (result.isConfirmed) {
            // alert();
			var data = {
				"unique_id" 	: unique_id,
                "batch_id"      : batch_id,
                "checkedvalue"  : tray_no,
				"action"		: "delete"
			}
            // alert(data);
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
	debugger
   // Only ASCII character in that range allowed
   var ASCIICode = (evt.which) ? evt.which : evt.keyCode
   if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
	   return false;
   return true;
}



function countChecked() {
	const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
	document.getElementById('checkedCount').value = checkboxes.length;
	
	const checkBoxes = document.querySelectorAll('input[name="option[]"]');
    const checkedValues = [];
    let checkedCount = 0;

    checkBoxes.forEach((checkBox) => {
        if (checkBox.checked) {
            checkedValues.push(checkBox.value);
            checkedCount++;
        }
    });
    document.getElementById('checkedvalue').value = checkedValues.join(',');


}


function get_tray_count(tray_utilized){
    var ajax_url = sessionStorage.getItem("folder_crud_link");
	var check_cnt = $('#checkedCount').val();
	
    var selectedTraysContainer = document.getElementById('selected-trays');
    selectedTraysContainer.innerHTML = ''; // Clear existing trays

    var selectedTrayValues = [];
    $("input[name='option[]']:checked").each(function() {
        var trayName = $(this).data('tray-name'); // Get the tray name from the data attribute
        selectedTrayValues.push(trayName);
    });

    selectedTrayValues.forEach(function(name) {
        var trayElement = document.createElement('div');
        trayElement.textContent = 'Tray Name: ' + name;
        selectedTraysContainer.appendChild(trayElement);
    });

	if(tray_utilized == check_cnt){
	   var entry_date    = $('#entry_date').val();
	   var staff_name    = $('#staff_name').val();
	   var tot_qty       = $('#tot_qty').val();
	   var tray_utilized = $('#tray_utilized').val();
	   var batch_id      = $('#batch_id').val();
	   var checkedvalue  = $('#checkedvalue').val();
	   var screen_unique_id = $('#screen_unique_id').val();
	   var data = new FormData();		  
	   
	   	data.append("entry_date", entry_date);
		data.append("staff_name", staff_name);
		data.append("tot_qty", tot_qty);
		data.append("tray_utilized", tray_utilized);
		data.append("batch_id", batch_id);
		data.append("checkedvalue", checkedvalue);
		data.append("screen_unique_id", screen_unique_id);
		data.append("action", "sub_add_update");
		      
        
	    $.ajax({
			type: "POST",
			url: ajax_url,
			data: data,
			cache: false,
			contentType: false,
			processData: false,
			method: 'POST',
			beforeSend: function () {
				$(".status_sub_add_update_btn").attr("disabled", "disabled");
				$(".status_sub_add_update_btn").text("Loading...");
			},
			success: function (data) {
				var obj = JSON.parse(data);
				var msg = obj.msg;
	
				if (msg == 'insert') {
					$(".status_sub_add_update_btn").removeAttr("disabled");
					$(".status_sub_add_update_btn").text("Save");
					$('.modal').modal('hide');

					// Store select values in hidden inputs
					$('#staff_name_hidden').val(staff_name);
					$('#batch_id_hidden').val(batch_id);

					// Make all the fields read-only
					$('#entry_date').prop('readonly', true);
					// $('#staff_name').prop('disabled', true);
					$('#tot_qty').prop('readonly', true);
					$('#tray_utilized').prop('readonly', true);
					$('#batch_id').prop('disabled', true);
					$('#checkedCount').prop('readonly', true);
					$('#checkedvalue').prop('readonly', true);
				} else {
					alert("Error: " + msg);
				}
	
			},
			error: function (data) {
				alert("Network Error");
			}
		});
	}else{
		sweetalert("custom", '', '', 'Mismatched Tray utilized and Tray count value');
	}
}

function get_task_details() {
    // alert("Hii");
    var ticket_no = $('#batch_id').val(); 
    var ajax_url = sessionStorage.getItem("folder_crud_link");

    if (ticket_no) {
        var data = {
            "ticket_no": ticket_no, 
            "action": "problem"
        }
//alert(data);
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
                var tot_qty = obj.tot_qty;
                var supplier_name = obj.supplier_name;
                
                if (data) {
                    $('#tot_qty').val(tot_qty);
                    $('#supplier_name').val(supplier_name);
                    alert(supplier_name);
					// alert(tot_qty);
                    // $("#project_name").html(project_name_options);
                    // $("#call_type").html(call_type_options);
                }
                // alert(data);
            }
        });
    }
}

function get_task_details1() {
    // alert("Hii");
    var ticket_no = $('#supplier_name').val(); 
    var ajax_url = sessionStorage.getItem("folder_crud_link");

    if (ticket_no) {
        var data = {
            "ticket_no": ticket_no, 
            "action": "supplier"
        }
//alert(data);
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
                // var tot_qty = obj.tot_qty;
                var supplier_name = obj.supplier_name;
                
                if (data) {
                    //  $('#tot_qty').val(tot_qty);
                    $('#supplier_name').val(supplier_name);
                    alert(supplier_name);
					//  alert(tot_qty);
                    // $("#project_name").html(project_name_options);
                    // $("#call_type").html(call_type_options);
                }
                // alert(data);
            }
        });
    }
}

function saveAddOn() {
    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var entry_date = $('#entry_date').val();
    var staff_name = $('#staff_name').val();
    var batch_id = $('#batch_id').val();
    var tot_qty = $('#tot_qty').val();
    var screen_unique_id = $('#screen_unique_id').val();

    var data = new FormData();

    data.append("entry_date", entry_date);
    data.append("staff_name", staff_name);
    data.append("tot_qty", tot_qty);
    data.append("batch_id", batch_id);
    data.append("screen_unique_id", screen_unique_id);
    data.append("action", "sub_add_on");

    $('#dynamicInputs input[type="text"]').each(function() {
        var item_name = $(this).attr('name');
        var checkedvalue = $(this).val();
        data.append("item_names[]", item_name);
        data.append("checkedvalues[]", checkedvalue);
    });

    $.ajax({
        type: "POST",
        url: ajax_url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        beforeSend: function () {
            $(".status_sub_add_on_btn").attr("disabled", "disabled");
            $(".status_sub_add_on_btn").text("Loading...");
        },
        success: function (data) {
            var obj = JSON.parse(data);
            var msg = obj.msg;

            if (msg == 'insert') {
                $(".status_sub_add_on_btn").removeAttr("disabled");
                $(".status_sub_add_on_btn").text("Save");
                $('.modal').modal('hide');

                // Store select values in hidden inputs
                $('#staff_name_hidden').val(staff_name);
                $('#batch_id_hidden').val(batch_id);

                // Make all the fields read-only
                $('#entry_date').prop('readonly', true);
                $('#tot_qty').prop('readonly', true);
                $('#batch_id').prop('disabled', true);
                $('#item_name').prop('readonly', true);
                $('#dynamicInputs input[type="text"]').prop('readonly', true);
            } else {
                alert("Error: " + msg);
            }
        },
        error: function (data) {
            alert("Network Error");
        }
    });
}

function print_view(file_name) {
    window.open(file_name, '_blank', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}