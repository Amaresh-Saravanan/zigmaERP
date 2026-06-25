<?php

$item_options =  item_name_select();
$item_options = select_option($item_options, "Select Item name", $item_name);

$supplier_name_options = supplier_name();
$supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);

if ($_GET['from_date'] == ''){
  $from_date = date("Y-m-01");
 
} else {
  $from_date = $_GET['from_date'];
}
if ($_GET['to_date'] == ''){
  $to_date = date("Y-m-d");
} else {
  $to_date = $_GET['to_date'];
}

if ($_GET['item_name'] == '') {
  $item_options = item_name_select();
  $item_options = select_option($item_options, "Select Item name", $item_name);
} else {
  $item_name_option = item_name_select();
  $item_name_option = select_option($item_name_option, "Select Item Name", $item_name);
}
if ($_GET['supplier_name'] == '') {
  $supplier_name_options = supplier_name();
  $supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);
} else {
  $supplier_name_options = supplier_name();
  $supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);
}
?>



<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">Material/Egg Received List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">

      
         <div class="row mb-2">
          <div class="col-md-2">
            <label for="from_date" class="form-label">From Date</label>
            <input type="date" class="form-control" id='from_date' name='from_date' value='<?php echo $from_date; ?>'>
          </div>

          <div class="col-md-2">
            <label for="to_date" class="form-label">To Date</label>
            <input type="date" class="form-control" id='to_date' name='to_date' value='<?php echo $to_date; ?>'>
          </div>

        


         <div class="col-md-3">
               <div class="form-group">
                         <label>Item Name</label>
                                <select name="item_name" id="item_name" class="select2 form-control" required>
                                    <?php echo $item_options; ?>                                   
                                </select>
                </div>
          </div>

          <div class="col-md-3">
               <div class="form-group">
                         <label>Supplier Name</label>
                                <select name="supplier_name" id="supplier_name" class="select2 form-control" required>
                                    <?php echo $supplier_name_options; ?>                                   
                                </select>
                </div>
          </div>



         <div class="col-md-2 align-self-end">
            <button id="filter_btn" class="btn btn-primary" onclick="ticket_Filter()">Go</button>
          </div>

        </div>



      
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="material_received_datatable">
            <thead class="bg-200">
            <tr>
                <th>#</th>
                <!-- <th>Date</th> -->
                <th>Batch Id</th>
                <th>Supplier Name</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Invoice Date</th>
                <th>Invoice Number</th>
                <th>Invoice Document</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody class="list">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>