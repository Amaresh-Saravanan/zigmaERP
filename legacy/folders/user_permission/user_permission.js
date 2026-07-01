$(document).ready(function () {
	// var table_id 	= "user_permission_datatable";
	init_datatable(table_id,form_name,action);
	init_sub_datatable(table_id,form_name,action);
});
var company_name 	= sessionStorage.getItem("company_name");
var company_address	= sessionStorage.getItem("company_name");
var company_phone 	= sessionStorage.getItem("company_name");
var company_email 	= sessionStorage.getItem("company_name");
var company_logo 	= sessionStorage.getItem("company_name");
var form_name 		= 'user_permission';
var form_header		= '';
var form_footer 	= '';
var table_name 		= '';
var table_id 		= 'user_permission_datatable';
var action 			= "datatable";
function perm_ui_val() {
	var main_screen = $("#main_screen").val();
	var update_user_type = $("#update_user_type").val();
	// alert(main_screen);
	if (main_screen) {
		var ajax_url = sessionStorage.getItem("folder_crud_link");
		var url      = sessionStorage.getItem("list_link");
		
		var data 	 = {
			"action" 		: "permission_ui",
			"main_screen" 	: main_screen,
			"user_type" 	: update_user_type
		}
        // console.log(data);
        $.ajax({
			type 	: "POST",
			url 	: ajax_url,
			data 	: data,
			success		: function(data) {
				$("#perm_ui").html(data);
				init_sub_datatable(table_id,form_name,action);
			},
			error 		: function(data) {
				alert("Network Error");
			}
		});
	}
}

function check_all(class_name = "",this_obj = "") {
	if (this_obj.type == "button") {
		is_check = $(this_obj).val();
		if (is_check == "unchecked") {
			$('.'+class_name).each(function () {
				$(this).prop('checked', true); // checks it
			});
			$(this_obj).attr("data-check","checked");
			$(this_obj).val("checked");
		} else {
			$('.'+class_name).each(function () {
				$(this).prop('checked', false); // checks it
			});
			$(this_obj).attr("data-check","unchecked");
			$(this_obj).val("unchecked");
		}
	} else {
		if (this_obj.checked) {
			$('.'+class_name).each(function () {
				$(this).prop('checked', true); // checks it
			});
		} else {
			$('.'+class_name).each(function () {
				$(this).prop('checked', false); // Un Checks it
			});
		}
	}
}
function check_me (class_name = "") {
	var is_value = 1;
	if (class_name) {
		$('.allcheck-'+class_name).each(function () {
			if (!this.checked) {
				is_value *= 0;
			} 
		});
		if (is_value) {
			$("#all"+class_name).prop('checked',true);
		} else {
			$("#all"+class_name).prop('checked',false);
		}
	}
}
function user_permission_cu(unique_id = "") {
	// alert('2');
    var internet_status  = is_online();
    if (!internet_status) {
        sweetalert("no_internet");
        return false;
	}
	var is_form = form_validity_check("was-validated");
    if (is_form) {
	
	var is_valid  		= 0;
	var data_obj 		= [];
	$('.all-checkbox').each(function () {
		if (this.checked) {
			is_valid = 1;
			return false;
		}
	});
    if (is_valid) {
		$('.all-checkbox').each(function () {
			if (this.checked) {
				var this_obj 		= new Object();
				this_obj.main 		= $(this).data("main");
				this_obj.section 	= $(this).data("section");
				this_obj.screen 	= $(this).data("screen");
				this_obj.action 	= $(this).data("action");
				data_obj.push(this_obj);
			}
		});
		var json_data = JSON.stringify(data_obj);
		var data 	  = $(".was-validated").serialize();
		data 		 += "&json_data="+json_data;
        data 		+= "&unique_id="+unique_id+"&action=createupdate";
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var url      = sessionStorage.getItem("list_link");
        $.ajax({
			type 	: "POST",
			url 	: ajax_url,
			data 	: data,
			beforeSend 	: function() {
				$(".createupdate_btn").attr("disabled","disabled");
				$(".createupdate_btn").text("Loading...");
			},
			success		: function(data) {
				// alert(data);
				var obj     = JSON.parse(data);
				var msg     = obj.msg;
				var status  = obj.status;
				var error   = obj.error;
				if (!status) {
					url 	= '';
                    $(".createupdate_btn").text("Error");
                    console.log(error);
				} else {
					// if (msg=="already") {
						// Button Change Attribute
					
						url 		= '';
						$(".createupdate_btn").removeAttr("disabled","disabled");
						if (unique_id) {
							$(".createupdate_btn").text("Update");
						} else {
							$(".createupdate_btn").text("Save");
						}
					// }
				}
				sweetalert(msg);
				$("#main_screen").focus();
			},
			error 		: function(data) {
				alert("Network Error");
			}
		});
    } else {
        sweetalert("custom",'','',"Please Select Minimum One Permission");
	}
	} else {
		sweetalert("form_alert");
	}
}


function init_datatable(table_id='',form_name='',action='') {
	var table = $("#"+table_id);
	var data 	  = {
		"action"	: action, 
	};
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var datatable = table.DataTable({
	
	"ajax"		: {
		url 	: ajax_url,
		type 	: "POST",
		data 	: data
	},
		
	});
}
function init_sub_datatable(table_id='',form_name='',action='') {
	var table = $("."+table_id);
	var data 	  = {
		"action"	: action, 
	};
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	var datatable   = table.DataTable({
		"columnDefs": [
			{ 
				className: "td-text-center", "targets":  "_all"
				// className: "td-text-left", "targets":  1
		 	}
		],
		"searching": false,
        "paging":   false,
        "ordering": false,
        "info":     false,
		"serverSide": false,
    	"deferLoading": 0
	});
}
function user_permission_delete(unique_id = "") {
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
// Get Section Names Based On Main Screen Selection
function get_sections (main_screen_id = "") {
	var ajax_url = sessionStorage.getItem("folder_crud_link");
	if (main_screen_id) {
		var data = {
			"main_screen_id" 	: main_screen_id,
			"action"			: "sections"
		}
		$.ajax({
			type 	: "POST",
			url 	: ajax_url,
			data 	: data,
			success : function(data) {
				if (data) {
					$("#section_name").html(data);
				}
			}
		});
	}
} 
// All CheckBox Change Functions Start
$('#all').change(function(e) {
	if (e.currentTarget.checked) {
		$('.check_all').prop('checked', true);
  	} else {
	  	$('.check_all').prop('checked', false);
	}
});
$('.check_all').change(function(e) {
	var all_check = 1;
	$('.check_all').each(function() {
		if (this.checked) {
			all_check *= 1;
		} else {
			all_check *= 0;
		}
		if (all_check) {
			$('#all').prop('checked', true);
		} else {
			$('#all').prop('checked', false);
		}
	});
});
// All CheckBox Change Functions End
// Main Screen Change Functions
$('.main_all').change(function(e) {
	var unique_id = $("."+$(this).val()+"section");
	if (e.currentTarget.checked) {
		$(unique_id).prop('checked', true);
  	} else {
		
	  	$(unique_id).prop('checked', false);
	}
});
// Screen Section Change Functions
$('.main_all').change(function(e) {
	var unique_id = $("."+$(this).val()+"section");
	if (e.currentTarget.checked) {
		$(unique_id).prop('checked', true);
  	} else {
		
	  	$(unique_id).prop('checked', false);
	}
});
// Screen Section Change Functions
$('.section_all').change(function(e) {
	var unique_id = $("."+$(this).val()+"screen");
	if (e.currentTarget.checked) {
		$(unique_id).prop('checked', true);
  	} else {
		
	  	$(unique_id).prop('checked', false);
	}
});