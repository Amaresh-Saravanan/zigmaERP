$(document).ready(function () {
  oven_process_Filter();
  $("#starting_time, #closing_time").on("change", function () {
    calculate_running_hours();
  });
});

var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "Oven_process";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "oven_process_datatable";
var action = "datatable";

function calculate_running_hours() {
  var starting_time = $("#starting_time").val();
  var closing_time = $("#closing_time").val();

  if (starting_time == "" || closing_time == "") {
    return false;
  }

  var start = time_to_minutes(starting_time);
  var close = time_to_minutes(closing_time);

  if (start === false || close === false) {
    return false;
  }

  if (close < start) {
    close += 24 * 60;
  }

  var diff = (close - start) / 60;
  $("#running_hours").val(diff.toFixed(2));

  return true;
}

function time_to_minutes(time_value) {
  var time_parts = time_value.split(":");

  if (time_parts.length < 2) {
    return false;
  }

  var hours = parseInt(time_parts[0], 10);
  var minutes = parseInt(time_parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return false;
  }

  return (hours * 60) + minutes;
}

function oven_process_Filter() {
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date
  );
}

function oven_process_cu (unique_id = "") {
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }

  calculate_running_hours();

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
  to_date = ""
) {
  var table = $("#" + table_id);
  if (table.length == 0) {
    return false;
  }
  var data = {
    action: action,
    from_date: from_date,
    to_date: to_date
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

function oven_process_delete(unique_id = "") {
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
  window.open("uploads/Oven_process/" + file_name, "onmouseover", "height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no");
}
