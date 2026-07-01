$(document).ready(function () {
	// var table_id 	= "main_user_screen_datatable";
	// init_datatable(table_id,form_name,action);
	ticket_Filter();
});
var company_name 	= sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	= sessionStorage.getItem("company_name");
var form_name 		= 'status_update';
var form_header		= '';
var form_footer 	= '';
var table_name 		= '';
var table_id 		= 'status_update_datatable';
var action 			= "datatable";

function status_update_cu(unique_id = "") {
    var internet_status  = is_online();
    var data = new FormData();
    if (!internet_status) {
        sweetalert("no_internet");
        return false;
    }
    	var entry_date       = $("#entry_date").val();
    	var entry_no       	 = $("#entry_no").val();
    	var starting_day     = $("#starting_day").val();
		var staff_name       = $("#staff_name").val();
		var batch_id    	 = $("#batch_id").val();
		var day     		 = $("#day").val();
		// var inward_date		 = $("#inward_date").val();
		var hatching_status  = $("#hatching_status").val();
		var remarks          = $("#remarks").val();
		var unique_id        = $("#unique_id").val();
		var test_file   = $("#test_file").val();
		// alert(test_file)
     
		var updated_images   = document.getElementById("test_file");
		// alert(updated_images);
        if (updated_images != '') { 
            for (var i = 0; i < updated_images.files.length; i++) {
                data.append("test_file[]", document.getElementById('test_file').files[i]);
            }
        } else {
                data.append("test_file[]", '');
        }

    
    // if(entry_date != '' && entry_no != '' && starting_day != '' && staff_name != '' && batch_id != '' && day != '' && hatching_status != '' && (updated_images.files.length!= 0 || updated_images.files.length !='') ){		
		if(entry_date != '' && entry_no != '' && starting_day != '' && staff_name != '' && batch_id != '' && day != '' && hatching_status != '' ){	
        	data.append("entry_date", entry_date);
        	data.append("entry_no", entry_no);
        	data.append("starting_day", starting_day);
			data.append("staff_name", staff_name);
			data.append("batch_id", batch_id);
			data.append("day", day);
			// data.append("inward_date", inward_date);
			data.append("hatching_status", hatching_status);
			data.append("test_file", updated_images);
			data.append("remarks", remarks);
			data.append("unique_id", unique_id);
        
           data.append("action", "createupdate");
		// let fileName = data.get("test_file").name;

        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var url      = sessionStorage.getItem("list_link");

    //    alert(remarks);
        $.ajax({
			type 	: "POST",
			url 	: ajax_url,
			data 	: data,
            cache: false,
			contentType: false,
			processData: false,
			method: 'POST',
			success		: function(data) {

				var obj     = JSON.parse(data);
				var msg     = obj.msg;
				var status  = obj.status;
				var error   = obj.error;

				if (!status) {
					url 	= '';
                    $(".createupdate_btn").text("Error");
                    // console.log(error);
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
	var from_date = $("#from_date").val();
  	var to_date = $("#to_date").val();
	  var data = {
		"action": action,
		"from_date":from_date,
		"to_date":to_date,
	  };
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var datatable = table.DataTable({

		ordering    : true,
		searching   : true,
    	"searching" : true,
	
	"ajax"		: {
		url 	: ajax_url,
		type 	: "POST",
		data 	: data
	},
		
	});
}

function document_upload_add_update(){
    var internet_status         = is_online();

	
	var document_name           = $("#document_name").val();
	var screen_unique_id        = $("#screen_unique_id").val();
	

    var file = $('#test_file').val();
	var output_image = $('#output_image').val();

	if (!internet_status) {
		sweetalert("no_internet");
		return false;
	}
  
    
	if (document_name) {

		var data = new FormData();
		var image_s = document.getElementById("test_file");
		if (image_s != '') {
			for (var i = 0; i < image_s.files.length; i++) {
				data.append("test_file", document.getElementById('test_file').files[i]);

			}
		} else {
			data.append("test_file", '');
		}
		
		data.append("screen_unique_id", screen_unique_id);
		data.append("action", "document_upload_add_update");
		data.append("document_name", document_name);

		var ajax_url = sessionStorage.getItem("folder_crud_link");
		var url      = '';

		$.ajax({
			type    : "POST",
			url     : ajax_url,
			data    : data,
			cache   : false,
			contentType: false,
			processData: false,
			method  : 'POST',
			beforeSend: function () {
				$(".sublist_save_btn").attr("disabled", "disabled");
				$(".sublist_save_btn").text("Loading...");
			},
			success: function (data) {

				var obj = JSON.parse(data);
				var msg = obj.msg;
				var status = obj.status;
				var error = obj.error;

				if (!status) {
					$(".sublist_save_btn").text("Error");
					console.log(error);
				} else {
					if (msg !== "already") {
						form_reset("basictab4");
                        $("#document_name").val(null).trigger('change');
                        $("#test_file").val("");
						//showPreview(event);
                        
						//$(".upload_image").trigger("click");
					}
					$(".sublist_save_btn").removeAttr("disabled", "disabled");
					if (msg == "already") {
						$(".sublist_save_btn").text("Update");
					} else {
						$(".sublist_save_btn").text("Add");
						$(".sublist_save_btn").attr("onclick", "('')");
					}
					// Init Datatable
					// sub_list_datatable("document_upload_sub_datatable");
				}
				sweetalert(msg, url);
			},
			error: function (data) {
				alert("Network Error");
			}
		});


	} else {

		sweetalert("custom", '', '', 'Create Sub Details');

		if (document_name == '') {
			document.getElementById('document_name').focus();
		}

	}
}


function status_update_delete(unique_id = "" ,batch_id1 ) {
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var url      = sessionStorage.getItem("list_link");
	// alert(batch_id1);
	confirm_delete('delete')
	.then((result) => {
		if (result.isConfirmed) {
			var data = {
				"unique_id" 	: unique_id,
				"batch_id1"     : batch_id1,
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
	debugger
   // Only ASCII character in that range allowed
   var ASCIICode = (evt.which) ? evt.which : evt.keyCode
   if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
	   return false;
   return true;
}

function print_view(file_name) {
    onmouseover = window.open('uploads/status_update/' + file_name, 'onmouseover', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}



$(document).ready(function () {
	// $(".select2").select2();

	$("#batch_id").change(function(){
		var batch_id = $("#batch_id").val();
    	get_entrydate_from_egg_process(batch_id);
	});

	$("#entry_no").change(function(){
	})
	$("#starting_day").change(function(){
		calculateDays();
	})
    
});
    function get_entrydate_from_egg_process(batch_id) {
        
        // alert();
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var data = {
           
            "batch_id": batch_id,
            "action": "select_entry_date"
        };

        $.ajax({
            type: "POST",
            url: ajax_url,
            data: data,
            
            success: function (response) {
                if (response) {
					var data = response.split(",");
                	var entry_date = data[0];
                	var entry_no = data[1];
					// alert(entry_date)
					// alert(entry_no)
                    $("#entry_no").val(entry_no); 
                    $("#starting_day").val(entry_date); 
					calculateDays();
                }
            }
        });
    }


	function calculateDays() {
		var entryDate = new Date($("#entry_date").val());
		var startingDate = new Date($("#starting_day").val());
		var timeDifference = entryDate - startingDate;
		var dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
	
		dayDifference += 1;
	
		$("#day").val(dayDifference);
	}
	


	function  ticket_Filter(){
		init_datatable(table_id, form_name, action);
	}
	function print(file_name) {
    onmouseover = window.open('uploads/status_update/' + file_name, 'onmouseover', 'height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}