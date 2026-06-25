
$(document).ready(function () {
  frp_process_Filters();
  console.log("Document is ready. Looking for cancel button.");
  console.log(document.getElementById('btn-cancel-id'));
  
  var unique_id = $('#unique_id').val();

 
});


var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "frp_process";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "frp_process_datatable";
var action = "datatable";

function frp_tray_process_cu(unique_id) {
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }

var frp_tray_count = $("#frp_tray_count").val();
var frp_tray_name_count = $("#frp_tray_name option:selected").length;

if (frp_tray_count != frp_tray_name_count) {
    alert("Select correct count and tray names, both should be same");
    return false;
}

  var is_form = form_validity_check("was-validated");

  if (is_form) {
    var data = $(".was-validated").serialize();

    data 		+= "&unique_id="+unique_id+"&action=createupdate";
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
          url = "";
          $(".createupdate_btn").text("Error");
        } else {
          if (msg == "already") {
            url = "";
            $(".createupdate_btn").removeAttr("disabled");
            if (unique_id) {
              $(".createupdate_btn").text("Update");
            } else {
              $(".createupdate_btn").text("Save");
            }
          } else {
            sweetalert(msg, url);
          }
        }
      },
      error: function (data) {
        alert("Network Error");
      },
      complete: function () {
        $(".createupdate_btn").removeAttr("disabled");
        $(".createupdate_btn").text(unique_id ? "Update" : "Save");
      },
    });
  } else {
    sweetalert("form_alert");
  }
}




function frp_tray_sublist_cu() {
    var unique_id    = $("#unique_id").val();
    var egg_batch_id = $("#egg_unique_id").val();  // <span id="egg_batch_id">

    var rows_data = [];

    $("#frp_sublist tbody tr").each(function () {
        var row = $(this);

        
        var tray_hidden = row.find("input[name='tray_hidden']").val();
        var larvae      = row.find("input[name='larvae']").val();
        var organic     = row.find("input[name='organic']").val();

        rows_data.push({
            tray_hidden: tray_hidden,
            larvae: larvae,
            organic: organic
        });
    });

    var data = {
        unique_id: unique_id,
        egg_batch_id: egg_batch_id,
        rows_data: rows_data,
        action: "add_sublist"
    };

    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");

    $.ajax({
        type: "POST",
        url: ajax_url,
        data: data,
        beforeSend: function () {
            $(".createupdate_btn").attr("disabled", "disabled").text("Loading...");
        },
        success: function (resp) {
// alert(resp);
            var obj = JSON.parse(resp);
            console.log(obj); 
            if (!obj.status) {
                $(".createupdate_btn").text("Error");
            } else {
                sweetalert(obj.msg, url);
            }
        },
        error: function () {
            alert("Network Error");
        },
        complete: function () {
            $(".createupdate_btn").removeAttr("disabled");
            $(".createupdate_btn").text(unique_id ? "Update" : "Save");
        }
    });
}

function frp_tray_sublist_update_cu() {
    
    

    var rows_data = [];

    $("#frp_sublist tbody tr").each(function () {
        var row = $(this);

        
        var tray_hidden = row.find("input[name='tray_hidden']").val();
        var larvae      = row.find("input[name='larvae']").val();
        var organic     = row.find("input[name='organic']").val();

        rows_data.push({
            tray_hidden: tray_hidden,
            larvae: larvae,
            organic: organic
        });
    });

    var data = {       
        rows_data: rows_data,
        action: "add_sublist_update"
    };

    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");

    $.ajax({
        type: "POST",
        url: ajax_url,
        data: data,
        beforeSend: function () {
            $(".createupdate_btn").attr("disabled", "disabled").text("Loading...");
        },
        success: function (resp) {
// alert(resp);
            var obj = JSON.parse(resp);
            console.log(obj); 
            if (!obj.status) {
                $(".createupdate_btn").text("Error");
            } else {
                sweetalert(obj.msg, url);
            }
        },
        error: function () {
            alert("Network Error");
        },
        complete: function () {
            $(".createupdate_btn").removeAttr("disabled");
            $(".createupdate_btn").text(unique_id ? "Update" : "Save");
        }
    });
}

function form_validity_check(className) {
  var forms = document.getElementsByClassName(className);
  var isValid = true;
  Array.prototype.filter.call(forms, function (form) {
    if (form.checkValidity() === false) {
      isValid = false;
    }
    form.classList.add("was-validated");
  });
  return isValid;
}

function frp_process_Filters() {
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var batch_id = $("#batch_id").val();
  // alert(supplier_name);
  var table_id = "frp_process_datatable";
  var form_name = "frp_process";
  var action = "datatable";

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    batch_id
  );
}

function init_datatable(
  table_id = "",
  form_name = "",
  action = "",
  from_date = "",
  to_date = "",
  batch_id = ""
) {
  var table = $("#" + table_id);
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var batch_id = $("#batch_id").val();

  var data = {
    action: action,
    from_date: from_date,
    to_date: to_date,
    batch_id: batch_id,
  };
  // alert(data.supplier_name);
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({

    ordering    : true,
    searching   : true,
    "searching" : true,
    
    ajax: {
      url: ajax_url,
      type: "POST",
      data: data,
    },
    //   "destroy": true, // Ensure the old instance is destroyed before reinitializing
  });
}

function frp_tray_process_delete(unique_id, batch_id, tray_no) {
  // alert();
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");

  confirm_delete("delete").then((result) => {
    if (result.isConfirmed) {
      // alert();
      var data = {
        unique_id: unique_id,
        batch_id: batch_id,
        tray_no: tray_no,
        action: "delete",
      };
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
            url = "";
          } else {
            init_datatable(table_id, form_name, action);
          }
          sweetalert(msg, url);
        },
      });
    } else {
      // alert("cancel");
    }
  });
}

function onlyNumberKey(evt) {
  // Only ASCII character in that range allowed
  var ASCIICode = evt.which ? evt.which : evt.keyCode;
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) return false;
  return true;
}

function countChecked() {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  document.getElementById("checkedCount").value = checkboxes.length;

  const checkBoxes = document.querySelectorAll('input[name="option[]"]');
  const checkedValues = [];
  let checkedCount = 0;

  checkBoxes.forEach((checkBox) => {
    if (checkBox.checked) {
      checkedValues.push(checkBox.value);
      checkedCount++;
    }
  });
  document.getElementById("checkedvalue").value = checkedValues.join(",");
}





