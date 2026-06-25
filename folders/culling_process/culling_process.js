$(document).ready(function () {
  culling_process_Filter();

  $("#starting_weight, #ending_weight").on("input change", function () {
    calculate_fuel_consumption();
  });

  toggle_others_remarks();
  $("#work_done").on("change", function () {
    toggle_others_remarks();
  });
});

var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "culling_process";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "culling_process_datatable";
var action = "datatable";

function calculate_fuel_consumption() {
  var starting_weight = parseFloat($("#starting_weight").val());
  var ending_weight = parseFloat($("#ending_weight").val());

  if (isNaN(starting_weight) || isNaN(ending_weight)) {
    return false;
  }

  var fuel_consumption = starting_weight - ending_weight;
  $("#fuel_consumption").val(fuel_consumption.toFixed(2));
  return true;
}

function toggle_others_remarks() {
  if ($("#work_done").val() == "3") {
    $(".others_remarks_container").show();
    $("#others_remarks").attr("required", "required");
  } else {
    $(".others_remarks_container").hide();
    $("#others_remarks").removeAttr("required").val("");
  }
}

function culling_process_Filter() {
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var shift_type = $("#shift_type").val();
  var cylinder_type = $("#cylinder_type").val();
  var work_done = $("#work_done").val();

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    shift_type,
    cylinder_type,
    work_done
  );
}

function culling_process_cu(unique_id = "") {
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }

  calculate_fuel_consumption();
  toggle_others_remarks();

  var is_form = form_validity_check("was-validated");
  if (is_form) {
    var data = new FormData($(".was-validated")[0]);
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
          console.log(error);
        } else if (msg == "already") {
          url = "";
          $(".createupdate_btn").removeAttr("disabled");
          $(".createupdate_btn").text(unique_id ? "Update" : "Save");
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

function init_datatable(
  table_id = "",
  form_name = "",
  action = "",
  from_date = "",
  to_date = "",
  shift_type = "",
  cylinder_type = "",
  work_done = ""
) {
  var table = $("#" + table_id);
  if (table.length == 0) {
    return false;
  }

  var data = {
    action: action,
    from_date: from_date,
    to_date: to_date,
    shift_type: shift_type,
    cylinder_type: cylinder_type,
    work_done: work_done
  };
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  table.DataTable({
    ordering: true,
    searching: true,
    ajax: {
      url: ajax_url,
      type: "POST",
      data: data
    },
    destroy: true,
    dom: '<"top"lB><"middle"f><"bottom"rtip>',
    buttons: [
      "copy",
      "csv",
      "excel",
      "pdf",
      "print"
    ]
  });
}

function culling_process_delete(unique_id = "") {
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");
  confirm_delete("delete")
    .then((result) => {
      if (result.isConfirmed) {
        var data = {
          unique_id: unique_id,
          action: "delete"
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
              url = "";
            } else {
              init_datatable(table_id, form_name, action);
            }
            sweetalert(msg, url);
          }
        });
      }
    });
}

function print_view(file_name) {
  window.open("uploads/culling_process/" + file_name, "onmouseover", "height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no");
}
