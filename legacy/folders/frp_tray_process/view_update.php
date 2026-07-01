<?php
// Form variables
$table_sublist      = "frp_process_sublist";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";



if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
      $unique_id  = $_GET["unique_id"];
      
        
      $columns = [
        "form_unique_id",
        "egg_batch_id",                   
        "frp_tray_no",
        "baby_larvae_qty",
        "organic_qty",
        "unique_id"
      ];
      $table_details = [
        $table_sublist,
        $columns
    ];
    $where = 'form_unique_id = "' . $unique_id . '" and is_delete = 0';
      $result_values = $pdo->select($table_details, $where);
      // print_r($result_values);
      if ($result_values->status) {
          $result_values = $result_values->data;          
          $egg_batch_id = disname(batch_no($result_values[0]["egg_batch_id"])[0]['batch_id']);            
          $form_unique_id   = $result_values[0]["form_unique_id"];
          $sublist_unique_id   = $result_values[0]["unique_id"];
          $frp_tray_names   = $result_values[0]["frp_tray_no"];
          $baby_larvae_qty  = $result_values[0]["baby_larvae_qty"];
          $organic_qty      = $result_values[0]["organic_qty"];

      } 
  }
}





?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">FRP Tray Sublist</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <form class="was-validated" autocomplete="off">
          <input type="hidden" class="form-control" id='unique_id' name='unqiue_id' value="<?php echo $form_unique_id; ?>" required>         
          <div class="row">
        

          <div class="col-3 mb-3">
              <label for="egg_batch_id">Egg Batch Id </label>
              <label class="col-md-1 col-form-label" for="egg_batch_id"> : </label>
              <strong><span id="egg_batch_id"><?= $egg_batch_id; ?></span></strong>
              
          </div>

  
          </div>        
          <div class="row mt-2">
          <div class="row mt-3">
          <div class="row mt-3">
          <div class="row mt-3">

</div>

<div class="table-responsive scrollbar">
          <table class="table table-striped table-hover" id="frp_sublist" style="width:100%;">
            <thead>
              <tr>
                <th>#</th>                
                <th>Tray Name</th>                              
                <th>Baby Larvae Qty(g)</th>
                <th>Organic Waste(kg)</th>
                
              </tr>
            </thead>
            
         
    <tbody>
<?php foreach ($result_values as $index => $tray) {
    $sublist_unique_id    = $tray["unique_id"]; 
    $frp_tray_no     = $tray["frp_tray_no"];
    $baby_larvae_qty = $tray["baby_larvae_qty"];
    $organic_qty     = $tray["organic_qty"];

    
    $tray_name = disname(frp_tray_name($frp_tray_no)[0]['bin_name']); 
?>    
    <tr>
        <td><?php echo $index + 1; ?></td>
        <td>            
            <input type="text" name="tray_id" 
                   id="tray_id_<?php echo $frp_tray_no . "_" . $index; ?>" 
                   class="form-control" 
                   value="<?php echo $tray_name; ?>" readonly>

                <input type="hidden" name="tray_hidden" 
                   id="tray_hidden_<?php echo $tray . "_" . $index; ?>" 
                   class="form-control" 
                   value="<?php echo $sublist_unique_id; ?>" readonly>


        </td>
        <td>            
            <input type="number" name="larvae" 
                   id="larvae_<?php echo $frp_tray_no . "_" . $index; ?>" 
                   class="form-control" 
                   value="<?php echo $baby_larvae_qty; ?>" >
        </td>
        <td>            
            <input type="number" name="organic" 
                   id="organic_<?php echo $frp_tray_no . "_" . $index; ?>" 
                   class="form-control"  
                   value="<?php echo $organic_qty; ?>" >
        </td>
        
    </tr>
<?php } ?>
</tbody>

  



 </table>


        </div>



            <div class="col-md-12 text-end">
              <?php echo btn_createupdate("frp_tray_sublist_update", $unique_id, "Update"); ?>
              <?php echo btn_cancel($btn_cancel); ?>

            </div>
          </div>
        </form>


      </div>
    </div>
  </div>
</div>



                            
  




<style>
.table-nowrap td, .table-nowrap th {
    text-align: center;
    border-right: 1px solid #ddd;
}
.form-check {
    text-align: center;
}
.ad_trafixed {
    position: fixed;
    top: 0;
    margin-left: 80px;
}
</style>
