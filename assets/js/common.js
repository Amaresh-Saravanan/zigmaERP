const weekday   =   new Array(7);
weekday[0]      =   "Sunday";
weekday[1]      =   "Monday";
weekday[2]      =   "Tuesday";
weekday[3]      =   "Wednesday";
weekday[4]      =   "Thursday";
weekday[5]      =   "Friday";
weekday[6]      =   "Saturday";

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var months_short = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];


// Select2 Init

$(document).ready(function(){
  // Select 2 Global Initialiation
  $(".select2").select2({
      theme: 'bootstrap4',
  });


  $('.dropify').dropify({
      allowedFileExtensions : "pdf xlsx doc docx txt xls wav jpg jpeg png",
      maxFileSize           : "5M",
      errorsPosition        : "outside",
      error: {
          'fileSize': 'The file size is too big ({{ value }} max).',
          'minWidth': 'The image width is too small ({{ value }}}px min).',
          'maxWidth': 'The image width is too big ({{ value }}}px max).',
          'minHeight': 'The image height is too small ({{ value }}}px min).',
          'maxHeight': 'The image height is too big ({{ value }}px max).',
          'imageFormat': 'The image format is not allowed ({{ value }} only).'
      }
  }); 
 

  // Datatables Bottom Button init
      var a = $("#datatable-buttons").DataTable({
        serverSide  : false,
          lengthChange: !1,
          buttons: [{
              extend: "copy",
              className: "btn-light"
          }, {
              extend: "print",
              className: "btn-light"
          }, {
              extend: "pdf",
              className: "btn-light"
          }],
          language: {
              paginate: {
                  previous: "<i class='mdi mdi-chevron-left'>",
                  next: "<i class='mdi mdi-chevron-right'>"
              }
          },
          drawCallback: function () {
              $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
          }
      });
});

$.extend( $.fn.dataTable.defaults, {
  // searching: false,
  destroy	    : true,
  stateSave	: true,
  ordering    : false,
  responsive  : true,
  paging	    : true,
  processing  : true,
  serverSide  : true,
  searching   : false,
  "columnDefs": [
      {"className": "text-center", "targets": [0, -1]}
  ],
  lengthMenu	: [
      [10,25,50,-1],
      [10,25,50,"All"]
  ],
  language    : {
      paginate    : {
          previous    : "<i class='mdi mdi-chevron-left'>",
          next        : "<i class='mdi mdi-chevron-right'>"
      },
      processing  : '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>',
  },
 
  drawCallback: function () {
      $(".dataTables_paginate > .pagination").addClass("pagination-rounded")
  }
} );

// Form Validity Checking Function
function form_validity_check(class_name = '',form_name = '') {

  var forms         = document.getElementsByClassName(class_name);

  // If ID based Form validation Needs Not Working
  if (form_name) {
      var forms         = document.getElementsByName(form_name);
  }

  var formValidity  = false;
  var validation    = Array.prototype.filter.call(forms, function (form) {

    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      formValidity = false;
    } else {
      formValidity = true;
    }
  });
  if (formValidity) {
    return true;
  } else {
    return false;
  }
}

// Form Validity Checking Function Ends

// Sweet Alert Function Starts

function sweetalert(msg='',url='',callback ='',title='') {

  switch (msg) {
    case "create":
      Swal.fire({
          icon: 'success',
          title: 'Successfully Saved',
          // text: 'Modal with a custom image.',  
          // imageUrl:'img/emoji/success.webp',
          imageWidth: 250,
          imageHeight: 200,
          imageAlt: 'Custom image',
          showConfirmButton: true,
          timer: 2500,
          timerProgressBar: true,
          willClose: () => {
              if (url) {
                  window.location = url;
              }
          }
      });
    break;

    case "update":
      Swal.fire({
          icon: 'success',
          title: 'Successfully Updated',
          // imageUrl:'img/emoji/clapping.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
              if (url) {
                  window.location = url;
              }
          }
      });
    break;

    case "error":
      Swal.fire({
          icon: 'error',
          title: 'Error Occured',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;

    case "network_err":
      Swal.fire({
          icon: 'error',
          title: 'Network Error Occured',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;

    

    case "already":
      Swal.fire({
          icon: 'warning',
          title: 'Already Exist',
          // imageUrl:'img/emoji/already.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;
    
    case "leave_already":
      Swal.fire({
          icon: 'warning',
          title: 'Cancel the Previous leave request',
          // imageUrl:'img/emoji/already.webp',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;
    
    case "no_internet":
      Swal.fire({
          icon: 'warning',
          title: 'Please Check Your Internet Connection!',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;

     case "no_location":
      Swal.fire({
          icon: 'warning',
          title: 'Please Check Your Geo Location!',
          showConfirmButton: true,
          timer: 2000,
          timerProgressBar: true,
          willClose: () => {
            // alert("Hi");
          }
      });
    break;

    case "delete":
      return Swal.fire({ 
        title: 'Are you sure to Delete?',
        text: "You won't be able to revert this!",
        // icon: 'warning',
        // imageUrl:'img/emoji/delete.webp',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        preConfirm: () => {
          return true;
        }
      });
    break;

    case "success_delete":
      Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          // imageUrl:'img/emoji/success_delete.webp',
          showConfirmButton: true,
          timer: 1500,
          timerProgressBar: true
      });
    break;

    case "form_alert":
      Swal.fire({
        icon: 'info',
        title: 'Fill Out All Mantantory Fields',
        // imageUrl:'img/emoji/form_fill.webp',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      })
    break;
    
    case "approve":
      Swal.fire({
          icon: 'success',
          title: 'Successfully Approved',
          showConfirmButton: true,
          timer: 2000,
          willClose: () => {
            window.location = url;
          }
      });
    break; 

    case "convert":
      Swal.fire({
          icon: 'success',
          title: 'Successfully Converted',
          showConfirmButton: true,
          timer: 2000,
          willClose: () => {
            window.location = url;
          }
      });
    break; 
    
    case "add":
      Swal.fire({
          icon: 'success',
          title: 'Successfully Added',
    // imageUrl:'img/emoji/success_delete.webp',
          showConfirmButton: true,
          timer: 2000,
          willClose: () => {
          //   window.location = url;
          }
      });
    break;

    case "custom":
      Swal.fire({
          icon: 'info',
          title: title,
          willClose: () => {

            if (url != "") {
              window.location = url;
            }
          }
      });
    break;
    case "custom_attendance":
      Swal.fire({
          icon: 'success',
          title: title,
          willClose: () => {

            if (url != "") {
              window.location = url;
            }
          }
      });
    break;
    case "custom_mail":
      Swal.fire({
          icon: 'success',
          title: title,
          willClose: () => {

            if (url != "") {
              window.location = url;
            }
          }
      });
    break;
  case "password_alert":
      Swal.fire({
        icon: 'info',
        title: 'Please Update either Password Or Profile Image',
        // imageUrl:'img/emoji/form_fill.webp',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      })
    break;
  }
}

//   Sweet Alert Delete Confirmation Function
confirm_delete = function(msg) { 
return sweetalert(msg); // <--- return the swal call which returns a promise
};

//   Sweet Alert Function Ends

// Online Offline Check Function

function is_online() {
  return true;
  // return(navigator.onLine);
  return false;
}

// GEO Location Check Function

function geo_location() {
  if (!navigator.geolocation) {
     sweetalert("no_location");
      return false;
  }
  return true;
 
}

function is_online1() {
  if (!navigator.onLine) {
      sweetalert("no_internet");
      return false;
  }
}

function form_reset(form_class = "",form_name = "",form_id = "") {

  if (form_class) {
    $('.'+form_class).find('input').val('');
    $('.'+form_class).find('select').val('');
    $('.'+form_class).find('.select2').val(null).trigger('change');
    $('.'+form_class).find('textarea').val('');
  } else if (form_id) {
    $('#'+form_id).find('input').val('');
    $('#'+form_id).find('select').val('');
    $('#'+form_id).find('.select2').val(null).trigger('change');
    $('#'+form_id).find('textarea').val('');
  }
  // $("#mySelect option[value='']").attr('selected', true)
}

// From date must be lower than to date
function fromToDateValidity (fromDate = "", toDate = "") {
fromDate  	= new Date(fromDate);
toDate  	  = new Date(toDate);

// To calculate the time difference of two dates 
var Difference_In_Time = fromDate.getTime() - toDate.getTime(); 

// To calculate the no. of days between two dates 
var Difference_In_Days = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));

// alert(Difference_In_Days);
if (Difference_In_Days > 0) {
  sweetalert("custom","","","From Date Must be Equal or Lower than To Date");
  return false;
  }
  
  return true;
}


// function Indian Money Format

function indianMoneyFormat(value = "") {

value = Number(value);

if (isNaN(value)) {
  value = 0;
}

return (value).toFixed(2).replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');

}

function number_only(event) {

 if((event.keyCode < 46)||(event.keyCode > 57)) event.returnValue = false;

}

function same_item_repeat_validation(input_name = "",input_id = "",input_value = ""){

  var input_name = document.getElementsByName(input_name); 
  
  input_name.forEach(insert_arr);

  function insert_arr(data) {

    if((data.value == input_value) && (data.id!= input_id)) {

      sweetalert("custom","","","Already  Exist in List");
      $("#"+input_id).val(null).trigger("change");
      return false;      
    }
  }
}

// Geolocation Enable check
function getLocation() {
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(showPosition,showError);

    } else {

      alert("This form Needs Location Permission! Please allow to continue");
      // document.getElementById('show_locaiton').innerHTML = "Geolocation is not supported by this browser.";

    }
}

function showPosition(position) {

  document.getElementById('latitude').value  = position.coords.latitude;
  document.getElementById('longitude').value = position.coords.longitude;

}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

function print_image(file_name, folder_name = "bids_management")
{
    var url = 'uploads/'+folder_name+'/'+file_name;
    onmouseover= window.open(url,'onmouseover','height=600,width=900,scrollbars=yes,resizable=no,left=200,top=150,toolbar=no,location=no,directories=no,status=no,menubar=no');
}

function time_to_minute(time = "") {
  let min   = 0;
  if (time) {
    time = time.split(":");
    min = (Number(time[0]) * 60 ) + Number(time[1]);
  }
  return Number(min);
}

function minute_to_time (min = 0) {
  let time = "00:00";
  if (min) {
    hour = parseInt(min / 60);
    min  = min - (hour * 60);
    min  = pad(min,2);
    hour = pad(hour,2);
    time = hour + ":" + min;
  }
  return time;
} 

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}