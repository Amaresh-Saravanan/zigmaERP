//   $(document).ready(function () {
//   egg_Filters();
//   handleItemSelected();
//   console.log("Document is ready. Looking for cancel button.");
//   console.log(document.getElementById("btn-cancel-id"));
// });

$(document).ready(function () {
  egg_Filters();
  handleItemSelected();
  console.log("Document is ready. Looking for cancel button.");
  console.log(document.getElementById('btn-cancel-id'));
  
  var unique_id = $('#unique_id').val();

  if (unique_id !== null && unique_id !== undefined && unique_id !== '') { 
      $('#select_label').hide();
      $('#addontag_display').hide();
  }
});





function handleItemSelected() {
  var selectedItems = $("#item_name").val();
  var dynamicInputs = $("#dynamicInputs");
  dynamicInputs.empty(); // Clear previous inputs

  selectedItems.forEach(function (item) {
    var option = $('#item_name option[value="' + item + '"]');
    var optionText = option.text();
    var uniqueId = option.data("unit"); // Assuming 'unit' data attribute contains the unique ID

    var inputField = `
            <div class="form-group mt-3">
                <label for="${item}">${optionText} (${uniqueId})</label>
                <input type="hidden" class="form-control" id="hidden_${item}" name="hidden_${item}" value="${item}">
                <input type="text" class="form-control" id="${item}" name="${item}" required>
            </div>
        `;
    dynamicInputs.append(inputField);
  });
}

var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = "egg_process";
var form_header = "";
var form_footer = "";
var table_name = "";
var table_id = "egg_process_datatable";
var action = "datatable";

function egg_process_cu(unique_id = "") {
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }

  var checkedvalue = $("#checkedvalue").val();
  var is_form = form_validity_check("was-validated");

  // Check if "Add Tray" sublist is filled
  // if (unique_id) {
  // } else {
  //   var isTrayFilled = checkTraySublist();
  //   if (!isTrayFilled) {
  //     sweetalert("custom", "", "", "Please fill the Add Tray Sublist ");
  //     return false;
  //   }
  // }
  var isTrayFilled = checkTraySublist();
  if (!isTrayFilled) {
      sweetalert("custom", '', '', 'Please fill the Add Tray Sublist');
      return false;
  }

  // Custom form validation
  var isValid = true;
  var requiredFields = [
    "entry_date",
    "staff_name",
    "tot_qty",
    "tray_utilized",
    "batch_id",
  ];
  requiredFields.forEach(function (field) {
    if (!$("#" + field).val()) {
      isValid = false;
      $("#" + field).addClass("is-invalid"); // Add Bootstrap class to highlight invalid fields
    } else {
      $("#" + field).removeClass("is-invalid");
    }
  });

  if (!isValid) {
    sweetalert("custom", "", "", "Please fill all required fields");
    return false;
  }

  if (is_form) {
    var data = $(".was-validated").serialize();
    data +=
      "&unique_id=" +
      unique_id +
      "&checkedvalue=" +
      checkedvalue +
      "&action=createupdate";
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

function checkTraySublist() {
  var checkboxes = document.querySelectorAll('input[name="option[]"]:checked');
  return checkboxes.length > 0;
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

function egg_Filters() {
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var supplier_name = $("#supplier_name").val();
  // alert(supplier_name);
  var table_id = "egg_process_datatable";
  var form_name = "egg_process";
  var action = "datatable";

  init_datatable(
    table_id,
    form_name,
    action,
    from_date,
    to_date,
    supplier_name
  );
}

function init_datatable(
  table_id = "",
  form_name = "",
  action = "",
  from_date = "",
  to_date = "",
  supplier_name = ""
) {
  var table = $("#" + table_id);
  var from_date = $("#from_date").val();
  var to_date = $("#to_date").val();
  var supplier_name = $("#supplier_name").val();

  var data = {
    action: action,
    from_date: from_date,
    to_date: to_date,
    supplier_name: supplier_name,
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

function egg_process_delete(unique_id, batch_id, tray_no) {
  // alert();
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");

  confirm_delete("delete").then((result) => {
    if (result.isConfirmed) {
      // alert();
      var data = {
        unique_id: unique_id,
        batch_id: batch_id,
        checkedvalue: tray_no,
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

function get_tray_count(tray_utilized) {
  // alert("yoo");
  $('#select_label').show();
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var check_cnt = $("#checkedCount").val();

  var selectedTraysContainer = document.getElementById("selected-trays");
  selectedTraysContainer.innerHTML = ""; // Clear existing trays

  var selectedTrayValues = [];
  $("input[name='option[]']:checked").each(function () {
    var trayName = $(this).data("tray-name"); // Get the tray name from the data attribute
    selectedTrayValues.push(trayName);
  });

  selectedTrayValues.forEach(function (name) {
    var trayElement = document.createElement("div");
    trayElement.textContent = name;

    // Apply the primary color range from CSS custom properties
    trayElement.setAttribute("style", "color: var(--vz-primary);"); // Primary color
    trayElement.setAttribute("class", "col-md-1"); // Add the 'container' class

    selectedTraysContainer.appendChild(trayElement);
  });

  if (tray_utilized == check_cnt) {
    var entry_date = $("#entry_date").val();
    var staff_name = $("#staff_name").val();
    var tot_qty = $("#tot_qty").val();
    var tray_utilized = $("#tray_utilized").val();
    var batch_id = $("#batch_id").val();
    var checkedvalue = $("#checkedvalue").val();
    var screen_unique_id = $("#screen_unique_id").val();
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
      method: "POST",
      beforeSend: function () {
        $(".status_sub_add_update_btn").attr("disabled", "disabled");
        $(".status_sub_add_update_btn").text("Loading...");
        hideMainCancelButton();
        // alert(disableCancelButton());
      },
      success: function (data) {
        var obj = JSON.parse(data);
        var msg = obj.msg;

        if (msg == "insert") {
          $(".status_sub_add_update_btn").removeAttr("disabled");
          $(".status_sub_add_update_btn").text("Save");
          $(".modal").modal("hide");
          $('#tray_id_update').hide();
                    $('#select_label1').hide();

          // Store select values in hidden inputs
          $("#staff_name_hidden").val(staff_name);
          $("#batch_id_hidden").val(batch_id);

          // Make all the fields read-only
          $("#entry_date").prop("readonly", true);
          // $('#staff_name').prop('disabled', true);
          $("#tot_qty").prop("readonly", true);
          $("#tray_utilized").prop("readonly", true);
          $("#batch_id").prop("disabled", true);
          $("#checkedCount").prop("readonly", true);
          $("#checkedvalue").prop("readonly", true);
        } else {
          alert("Error: " + msg);
        }
      },
      error: function (data) {
        alert("Network Error");
      },
    });
  } else {
    sweetalert(
      "custom",
      "",
      "",
      "Mismatched Tray utilized and Tray count value"
    );
  }
}

function get_task_details() {
  // alert("Hii");
  var ticket_no = $("#batch_id").val();
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (ticket_no) {
    var data = {
      ticket_no: ticket_no,
      action: "problem",
    };
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: data,
      success: function (data) {
        // alert(data);
        var obj = JSON.parse(data);
        var msg = obj.msg;
        var status = obj.status;
        var error = obj.error;

        //var problem = obj.problem;
        var tot_qty = obj.tot_qty;
        var supplier_name = obj.supplier_name;
        var supplier_name1 = obj.supplier_name1;

        if (data) {
          $("#tot_qty").val(tot_qty);
          $("#supplier_name").val(supplier_name);
          $("#supplier_name1").val(supplier_name1);
          //  alert(supplier_name);
          //  alert(tot_qty);
          // $("#project_name").html(project_name_options);
          // $("#call_type").html(call_type_options);
        }
      },
    });
  }
}

function get_batch_details() {
  // alert("Hii");
  var ticket_no = $("#supplier_name").val();
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (ticket_no) {
    var data = {
      ticket_no: ticket_no,
      action: "supplier",
    };
    //alert(data);
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: data,
      success: function (data) {
        // alert(data);
        var obj = JSON.parse(data);
        var msg = obj.msg;
        var status = obj.status;
        var error = obj.error;

        //var problem = obj.problem;
        // var tot_qty = obj.tot_qty;
        var batch_name = obj.batch_name;
        var batch_id = obj.batch_id;

        if (data) {
          // Populate the select options
          var select = $("#batch_id");
          select.empty(); // Clear any existing options
          for (var i = 0; i < batch_name.length; i++) {
            var option = $("<option></option>")
              .val(batch_id[i])
              .text(batch_name[i]);
            select.append(option);
          }
        }
      },
    });
  }
}

// Ensure to update hidden field when a batch is selected
$("#batch_id").on("change", function () {
  var selectedBatchId = $(this).val();
  $("#batch_id_hidden").val(selectedBatchId);
});

function saveAddOn() {
  $('#addontag_display').show();
    
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var entry_date = $('#entry_date').val();
  var staff_name = $('#staff_name').val();
  var batch_id = $('#batch_id').val();
  var tot_qty = $('#tot_qty').val();
  var screen_unique_id = $('#screen_unique_id').val();
  var unique_id = $('#unique_id').val();

  var data = new FormData();

  data.append("entry_date", entry_date);
  data.append("staff_name", staff_name);
  data.append("tot_qty", tot_qty);
  data.append("batch_id", batch_id);
  data.append("screen_unique_id", screen_unique_id);
  data.append("unique_id", unique_id);
  data.append("action", "sub_add_on");

  var dynamicInputsHTML = '';

  $('#dynamicInputs input[type="text"]').each(function() {
      var item_name = $(this).attr('name');
      var checkedvalue = $(this).val();
      data.append("item_names[]", item_name);
      data.append("checkedvalues[]", checkedvalue);

     if(item_name =='66a3467a54eed94471'){
      item_name1='Chicken feed (Kg)';
     }else if(item_name =='66a7954fcaf3b34759'){
      item_name1= 'Water(ltr)';
  }else{
      item_name1= 'others';
  }
      dynamicInputsHTML += '<div class="col-md-4">' + item_name1 + ' =  ' + checkedvalue + '</div>';
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

          if (msg == 'insert' || msg == 'update' ) {
              $(".status_sub_add_on_btn").removeAttr("disabled");
              $(".status_sub_add_on_btn").text("Save");
              $('.modal').modal('hide');
              $('#select_label2').hide();
              $('#addon_update').hide();

              // Store select values in hidden inputs
              $('#staff_name_hidden').val(staff_name);
              $('#batch_id_hidden').val(batch_id);

              // Make all the fields read-only
              $('#entry_date').prop('readonly', true);
              $('#tot_qty').prop('readonly', true);
              $('#batch_id').prop('disabled', true);
              $('#item_name').prop('readonly', true);
              // $('#dynamicInputs input[type="text"]').prop('readonly', true);

              // Display the dynamic inputs in the item_name_display div
              $('#item_name_display').html(dynamicInputsHTML);
          } else {
              alert("Error: " + msg);
          }
      },
      error: function (data) {
          alert("Network Error");
      }
  });
}




// function saveAddOn() {
//   var ajax_url = sessionStorage.getItem("folder_crud_link");
//   var entry_date = $("#entry_date").val();
//   var staff_name = $("#staff_name").val();
//   var batch_id = $("#batch_id").val();
//   var tot_qty = $("#tot_qty").val();
//   var screen_unique_id = $("#screen_unique_id").val();
//   var unique_id = $('#unique_id').val();

//   var data = new FormData();

//   data.append("entry_date", entry_date);
//   data.append("staff_name", staff_name);
//   data.append("tot_qty", tot_qty);
//   data.append("batch_id", batch_id);
//   data.append("screen_unique_id", screen_unique_id);
//   data.append("unique_id", unique_id);
//   data.append("action", "sub_add_on");

//   $('#dynamicInputs input[type="text"]').each(function () {
//     var item_name = $(this).attr("name");
//     var checkedvalue = $(this).val();
//     data.append("item_names[]", item_name);
//     data.append("checkedvalues[]", checkedvalue);
//   });

//   $.ajax({
//     type: "POST",
//     url: ajax_url,
//     data: data,
//     cache: false,
//     contentType: false,
//     processData: false,
//     method: "POST",
//     beforeSend: function () {
//       $(".status_sub_add_on_btn").attr("disabled", "disabled");
//       $(".status_sub_add_on_btn").text("Loading...");
//       // disableCancelButton();
//     },
//     success: function (data) {
//       var obj = JSON.parse(data);
//       var msg = obj.msg;

//       // if (msg == "insert") {
//         if (msg == 'insert' || msg == 'update' ) {
//         $(".status_sub_add_on_btn").removeAttr("disabled");
//         $(".status_sub_add_on_btn").text("Save");
//         $(".modal").modal("hide");

//         // Store select values in hidden inputs
//         $("#staff_name_hidden").val(staff_name);
//         $("#batch_id_hidden").val(batch_id);

//         // Make all the fields read-only
//         $("#entry_date").prop("readonly", true);
//         $("#tot_qty").prop("readonly", true);
//         $("#batch_id").prop("disabled", true);
//         $("#item_name").prop("readonly", true);
//         $('#dynamicInputs input[type="text"]').prop("readonly", true);
//       } else {
//         alert("Error: " + msg);
//       }
//     },
//     error: function (data) {
//       alert("Network Error");
//     },
//   });
// }

function hideMainCancelButton() {
  var cancelButton = document.getElementById("btn-cancel-id");
  if (cancelButton) {
    cancelButton.style.display = "none";
  } else {
    console.error("Cancel button not found");
  }
}
