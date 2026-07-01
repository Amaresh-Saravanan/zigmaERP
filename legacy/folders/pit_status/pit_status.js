$(document).ready(function () {
  // var table_id 	= "main_user_screen_datatable";
  init_datatable(table_id, form_name, action);
  pit_status_Filter();
     var batch_id = $("#batch_id").val();
    // get_select_tray_no(batch_id);
});
var company_name = sessionStorage.getItem("company_name");
var company_address = sessionStorage.getItem("company_name");
var company_phone = sessionStorage.getItem("company_name");
var company_email = sessionStorage.getItem("company_name");
var company_logo = sessionStorage.getItem("company_name");
var form_name = 'Pit_Status';
var form_header = '';
var form_footer = '';
var table_name = '';
var table_id = 'pit_status_datatable';
var action = "datatable";





function pit_status_cu(unique_id = "") {
  // alert();
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }
  var is_form = form_validity_check("was-validated");
  if (is_form) {
    // alert();
    var pit_id = document.getElementById('pit_id').value;
    var formData = $(".was-validated").serializeArray();
        formData.push({ name: "unique_id", value: unique_id });
        formData.push({ name: "pit_id", value: pit_id });
        formData.push({ name: "action", value: "createupdate" });
        var data = $.param(formData);

// alert(data);
    // data += "&unique_id=" + unique_id + "&action=createupdate";
    var ajax_url = sessionStorage.getItem("folder_crud_link");
    var url = sessionStorage.getItem("list_link");
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: data,
      beforeSend: function () {
        $(".createupdate_btn").attr("disabled", "disabled").text("Loading...");
      },
      success: function (response) {
        // alert(response);
        var obj = JSON.parse(response);
        var msg = obj.msg;
        var status = obj.status;
        var error = obj.error;
        if (!status) {
          $(".createupdate_btn").text("Error");
          console.log(error);
        } else {
          if (msg == "already") {
            $(".createupdate_btn").removeAttr("disabled").text(unique_id ? "Update" : "Save");
          }
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


function pit_status_Filter()
{
    init_datatable(table_id,form_name,action);
}

function init_datatable(table_id = '',form_name = '', action = '') {
  var table = $("#" + table_id);
  var from_date = $('#from_date').val();
  var to_date   = $('#to_date').val();
  var batch_name  = $('#batch_id').val();
  var status_type   = $('#status').val();
  var pit_name   = $('#pit_id').val();
  var harvest_comp  = $('#harvest_comp').val();
// alert(batch_name);
  var data = {
    "action": action, 
    "from_date" : from_date,
    "to_date"   : to_date,
    "batch_name" : batch_name,    
    "status_type" : status_type,
    "pit_name" : pit_name,
    "harvest_comp" : harvest_comp
  };

  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var datatable = table.DataTable({

    ordering    : true,
		searching   : true,
    "searching" : true,

    "ajax": {
      url: ajax_url,
      type: "POST",
      data: data
    },
    
  });
}



function get_pit_name() {  
  var pit_name1 = $('#pit_id').val();   
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (pit_name1) {
   
      var data = {
          "pit_id": pit_name1, 
          "action": "get_pit_name"
      }
      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {      
              var obj     = JSON.parse(data);
              var msg     = obj.msg;
              var status  = obj.status;
              var error   = obj.error;              
              var pit_name = obj.pit_name;
              if (data) {                   
                   $('#pit_name').val(pit_name);
              }             
          }
      });
  }
}

function pit_status_delete(unique_id, batch_id, tray_no, screen_unique_id) {
  var ajax_url = sessionStorage.getItem("folder_crud_link");
  var url = sessionStorage.getItem("list_link");

  confirm_delete('delete')
    .then((result) => {
      if (result.isConfirmed) {
        var data = {
          "unique_id": unique_id,
          "batch_id": batch_id,
          "tray_no": tray_no,
          "screen_unique_id":screen_unique_id,
          "action": "delete"
        }
        // alert(screen_unique_id);
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

function get_feed_count() { 
   
  var pit_name1 = $('#pit_id').val();  
  var org_status = $('#org_status').val();
  var unique= $('#unique').val();
  var ajax_url = sessionStorage.getItem("folder_crud_link");

  if (pit_name1) {
   
      var data = {
          "pit_id": pit_name1,
          "org_status": org_status,
          "unique": unique,  
          "action": "gen_feed_count"
      }

      $.ajax({
          type: "POST",
          url: ajax_url,
          data: data,
          success: function (data) {      
              var obj     = JSON.parse(data);
              var msg     = obj.msg;
              var status  = obj.status;
              var error   = obj.error;              
              var feed_count = obj.feed_count;

              // alert(feed_count);

              if (data) {                   
                  if (!unique) { // If unique is empty
                    if (feed_count == '1') {
                      $('#feed_count').val(2);
                      // $('#feed_count_name').val("First Feeding");
                      $('#feed_count_name').val("Second Feeding");  
                    } else if (feed_count == '2') {
                      $('#feed_count').val(3);
                      $('#feed_count_name').val("Third Feeding");
                    } else if (feed_count == '3') {
                      $('#feed_count').val(4);
                      $('#feed_count_name').val("Fourth Feeding");
                    } else if (feed_count == '4') {
                      $('#feed_count').val(5);
                      $('#feed_count_name').val("Fifth Feeding");
                    } else if (feed_count == '5') {
                      $('#feed_count').val(6);
                      $('#feed_count_name').val("Sixth Feeding");
                    } else {                 
                      $('#feed_count').val(1);
                      $('#feed_count_name').val("First Feeding");
                    }
                  } else { // If unique is not empty
                    if (feed_count == '1') {
                      $('#feed_count').val(1);
                      $('#feed_count_name').val("First Feeding");
                    } else if (feed_count == '2') {
                      $('#feed_count').val(2);
                      $('#feed_count_name').val("Second Feeding");
                    } else if (feed_count == '3') {
                      $('#feed_count').val(3);
                      $('#feed_count_name').val("Third Feeding");
                    } else if (feed_count == '4') {
                      $('#feed_count').val(4);
                      $('#feed_count_name').val("Fourth Feeding");
                    } else if (feed_count == '5') {
                      $('#feed_count').val(5);
                      $('#feed_count_name').val("Fifth Feeding");
                    } else if (feed_count == '6') {
                      $('#feed_count').val(6);
                      $('#feed_count_name').val("Sixth Feeding");
                    } else {                 
                      $('#feed_count').val(1);
                      $('#feed_count_name').val("First Feeding");
                    }

                  }
              }             
          }
      });
  }
}




    function get_select_tray_no(batch_id) {        
        // alert();
        var ajax_url = sessionStorage.getItem("folder_crud_link");
        var data = {           
            "batch_id": batch_id,
            "action": "select_tray_no"
        };

        $.ajax({
            type: "POST",
            url: ajax_url,
            data: data,
            
            success: function (response) {
    if (response) {
        $("#tray_no").html(response); 
        $("#tray_no option").prop("selected", true);  // Select all options
        $("#tray_no").trigger("change");  // Trigger change event for select2 to update
    }
}



        });
    }



function pit_read_only() {
    
    var org_status = document.getElementById('org_status').value;
    var pit_id     = document.getElementById('pit_id');
    if(org_status !== '') {
        pit_id.disabled = true;
    } else {
        pit_id.disabled = false;
    }
}

$(document).ready(function() {
  
  function toggleRemarksBasedOnStatus() {
      var selectedStatus = $('#org_status').val(); 
      
      if (selectedStatus === '1') {
        get_feed_count();
        $('#feed_qty').closest('.org_waste').show();
        $('#feed_count').closest('.org_waste').show();
        $('#feed_qty').attr('required', true);
      } else {
        
        $('#feed_qty').closest('.org_waste').hide();
        $('#feed_count').closest('.org_waste').hide();
        $('#feed_qty').removeAttr('required');
      }


      if (selectedStatus === '2') {
        $('#tray_no').closest('.larvae').show();
        $('#tray_no').attr('required', true);
        $('#batch_div').show();
        $('#batch_div').attr('required', true);
        $('#larvae_qty_in').attr('required', true)
      } else {
        $('#tray_no').closest('.larvae').hide();
        $('#tray_no').removeAttr('required');
        $('#batch_div').hide(); 
        $('#larvae_qty_in').removeAttr('required');
      }


      if (selectedStatus === '3') {
        $('#method').closest('.aera_process').show();
        $('#method').attr('required', true);
      } else {   
        $('#method').closest('.aera_process').hide();
        $('#method').removeAttr('required');
      }


      if (selectedStatus === '4') {
        $('#measure_time').closest('.measure').show();
        $('#tempstart').closest('.measure').show();
        $('#tempmid').closest('.measure').show();
        $('#tempend').closest('.measure').show();
        $('#humistart').closest('.measure').show();
        $('#humimid').closest('.measure').show();
        $('#humiend').closest('.measure').show();

        $('#measure_time').attr('required', true);
        $('#tempstart').attr('required', true);
        $('#tempmid').attr('required', true);
        $('#tempend').attr('required', true);
        $('#humistart').attr('required', true);
        $('#humimid').attr('required', true);
        $('#humiend').attr('required', true);
      } else {
   
    $('#measure_time').closest('.measure').hide();   
    $('#tempstart').closest('.measure').hide();
    $('#tempmid').closest('.measure').hide();
    $('#tempend').closest('.measure').hide();
    $('#humistart').closest('.measure').hide();
    $('#humimid').closest('.measure').hide();
    $('#humiend').closest('.measure').hide();

    $('#measure_time').removeAttr('required');
    $('#tempstart').removeAttr('required');
    $('#tempmid').removeAttr('required');
    $('#tempend').removeAttr('required');
    $('#humistart').removeAttr('required');
    $('#humimid').removeAttr('required');
    $('#humiend').removeAttr('required');
}

  
if (selectedStatus === '5') {
   
    $('#larvae_qty').closest('.harvest').show();
    $('#qty_manure_1').closest('.harvest').show();
    $('#qty_manure_2').closest('.harvest').show();
    $('#qty_manure_3').closest('.harvest').show();
    $('#qty_rejets').closest('.harvest').show();
    $('#harvest_comp').closest('.harvest').show();

    $('#larvae_qty').attr('required', true);
    // $('#qty_manure_1').attr('required', true);
    // $('#qty_manure_2').attr('required', true);
    // $('#qty_manure_3').attr('required', true);
    // $('#qty_rejets').attr('required', true);
    $('#harvest_comp').attr('required', true);
} else {

    $('#larvae_qty').closest('.harvest').hide();
    $('#qty_manure_1').closest('.harvest').hide();
    $('#qty_manure_2').closest('.harvest').hide();
    $('#qty_manure_3').closest('.harvest').hide();
    $('#qty_rejets').closest('.harvest').hide();
    $('#harvest_comp').closest('.harvest').hide();

    $('#larvae_qty').removeAttr('required');
    // $('#qty_manure_1').removeAttr('required');
    // $('#qty_manure_2').removeAttr('required');
    // $('#qty_manure_3').removeAttr('required');
    // $('#qty_rejets').removeAttr('required');
    $('#harvest_comp').removeAttr('required');
}


if (selectedStatus === '7') {
  $('#tippi_qty').closest('.tippi').show();
  $('#tippi_qty').attr('required', true);
} else {   
  $('#tippi_qty').closest('.tippi').hide();
  $('#tippi_qty').removeAttr('required');
}

}

 
  $('#org_status').change(toggleRemarksBasedOnStatus);
  
  
  toggleRemarksBasedOnStatus();
});
