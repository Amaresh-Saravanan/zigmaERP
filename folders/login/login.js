// ! function (i) {
// 	"use strict";
// 	console.log(i);
// 	function e() {}
// 	e.prototype.init = function () {
// 		i("#basic-datepicker").flatpickr(), i("#datetime-datepicker").flatpickr({
// 			enableTime: !0,
// 			dateFormat: "Y-m-d H:i"
// 		}), i("#humanfd-datepicker").flatpickr({
// 			altInput: !0,
// 			altFormat: "F j, Y",
// 			dateFormat: "Y-m-d"
// 		}), i("#minmax-datepicker").flatpickr({
// 			minDate: "2020-01",
// 			maxDate: "2020-03"
// 		}), i("#disable-datepicker").flatpickr({
// 			onReady: function () {
// 				this.jumpToDate("2025-01")
// 			},
// 			disable: ["2025-01-10", "2025-01-21", "2025-01-30", new Date(2025, 4, 9)],
// 			dateFormat: "Y-m-d"
// 		}), i("#multiple-datepicker").flatpickr({
// 			mode: "multiple",
// 			dateFormat: "Y-m-d"
// 		}), i("#conjunction-datepicker").flatpickr({
// 			mode: "multiple",
// 			dateFormat: "Y-m-d",
// 			conjunction: " :: "
// 		}), i("#acc_year").flatpickr({
// 			mode: "range",
// 			dateFormat: "Y-m-d",
// 			defaultDate: [
// 				"2020-04-01",
// 				"2021-03-31"
// 			]			
// 		}), i("#inline-datepicker").flatpickr({
// 			inline: !0
// 		}), i("#basic-timepicker").flatpickr({
// 			enableTime: !0,
// 			noCalendar: !0,
// 			dateFormat: "H:i"
// 		}), i("#24hours-timepicker").flatpickr({
// 			enableTime: !0,
// 			noCalendar: !0,
// 			dateFormat: "H:i",
// 			time_24hr: !0
// 		}), i("#minmax-timepicker").flatpickr({
// 			enableTime: !0,
// 			noCalendar: !0,
// 			dateFormat: "H:i",
// 			minDate: "16:00",
// 			maxDate: "22:30"
// 		}), i("#preloading-timepicker").flatpickr({
// 			enableTime: !0,
// 			noCalendar: !0,
// 			dateFormat: "H:i",
// 			defaultDate: "01:45"
// 		})
// 	}, i.FormPickers = new e, i.FormPickers.Constructor = e
// }(window.jQuery),
// function () {
// 	"use strict";
// 	window.jQuery.FormPickers.init()
// }();
// // Particle JS init
// /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
// particlesJS.load('particles-js', 'folders/login/particlesjs-config.json', function() {
// 	console.log('callback - particles.js config loaded');
//   });
function login() {
  var internet_status = is_online();
  if (!internet_status) {
    sweetalert("no_internet");
    return false;
  }
  var user_name = $("#user_name").val();
  var password = $("#password").val();
  if ((user_name != "") && (password != "")) {
    var data = {
      "user_name": user_name,
      "password": password,
      "action": "login"
    };
    var ajax_url = "folders/login/crud.php";
    var url = "index.php";
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: data,
      // success: function (data) {
      //   var obj = JSON.parse(data);
      //   var msg = obj.msg;
      //   var status = obj.status;
      //   var error = obj.error;
      //   if (!status) {
      //     url = '';
          
      //   } else {
      //     window.location = "index.php";
      //   }
      //   log_sweetalert(msg, url);
      // }

      success: function (data) {
          var obj = JSON.parse(data);
          var msg = obj.msg;
          var status = obj.status;
          var error = obj.error;
          if (!status) {
            url = '';
            
          } else {

            if (password == "password") {
              window.location = "index.php?file=password/update&default=true";
            } else {
              log_sweetalert("success_login");
              url = "index.php";
            }


            if(user_name == 'admin'){
              window.location = "index.php?file=dashboard/form";
          }else{
            window.location = "index.php?file=dashboard/form";
          }



            // window.location = "index.php";
          }
          log_sweetalert(msg, url);
        }









    });
  } else {
    log_sweetalert("empty");
  }
}
// Login only Sweeet Alert Functions
function log_sweetalert(msg = '', url = '', callback = '') {
  switch (msg) {
    case "create":
      Swal.fire({
        icon: 'success',
        title: 'Successfully Saved',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
        onClose: () => {
          window.location = url;
        }
      });
      break;
    case "update":
      Swal.fire({
        icon: 'success',
        title: 'Successfully Updated',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
        onClose: () => {
          window.location = url;
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
        onClose: () => {
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
        onClose: () => {
          // alert("Hi");
        }
      });
      break;
    case "already":
      Swal.fire({
        icon: 'warning',
        title: 'Already Exist',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
        onClose: () => {
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
        onClose: () => {
          // alert("Hi");
        }
      });
      break;
    case "delete":
      return Swal.fire({
        title: 'Are you sure to Delete?',
        text: "You won't be able to revert this!",
        icon: 'warning',
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
        showConfirmButton: true,
        timer: 1500,
        timerProgressBar: true
      });
      break;
    case "form_alert":
      Swal.fire({
        icon: 'info',
        title: 'Fill Out All Mantantory Fields',
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
        onClose: () => {
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
        onClose: () => {
          window.location = url;
        }
      });
      break;
    case "incorrect":
      Swal.fire({
        //icon: 'error',
        title: 'Incorrect UserName and Password',
        imageUrl: 'img/emoji/invalid.webp',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true,
        onClose: () => {
          // alert("Hi");
        }
      });
      break;
    case "empty":
      Swal.fire({
        //icon: 'info',
        title: 'Enter Username and Password!',
        imageUrl: 'img/emoji/form_fill.webp',
        showConfirmButton: true,
        timer: 2000,
        timerProgressBar: true
      })
      break;
  }
}
function is_online() {
  return true;
  // return(navigator.onLine);
  return false;
}
$('body').on('keyup', function (evt) {
  if (evt.keyCode == 13) {
    // Simulate clicking on the submit button.
    login();
  }
});