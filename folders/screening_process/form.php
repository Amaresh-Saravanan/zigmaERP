<?php
// Form variables
$table              = "pit_status";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$entry_date         = "";
$pit_id             = "";
$form_batch_id      = "";
$qty_manure_1       = "";
$qty_manure_2       = "";
$qty_rejets         = "";
$notes              = "";
$harvest_comp       = "";
$is_active          = 1;

if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "pit_status";
    $columns    = [
      "entry_date",
      "pit_id",
      "form_batch_id",
      "qty_manure_1 ",
      "qty_manure_2 ",
      "qty_rejets",
      "notes",
      "harvest_comp"
    ];
    $table_details   = [
      $table,
      $columns
    ];
    $result_values  = $pdo->select($table_details, $where);
    // print_r($result_values );
    if ($result_values->status) {
      $result_values     = $result_values->data;
      $entry_date        = $result_values[0]["entry_date"];
      $pit_id            = $result_values[0]["pit_id"];
      $form_batch_id     = $result_values[0]["form_batch_id"];
      $qty_manure_1      = $result_values[0]["qty_manure_1"];
      $qty_manure_2      = $result_values[0]["qty_manure_2"];
      $qty_rejets        = $result_values[0]["qty_rejets"];
      $notes             = $result_values[0]["notes"];
      $harvest_comp      = $result_values[0]["harvest_comp"];
      $btn_text          = "Update";
      $btn_form          = "Update";
      $btn_action        = "update";
    } else {
      $btn_text          = "Error";
      $btn_action        = "error";
      $is_btn_disable    = "disabled='disabled'";
    }

    $harvest_options      =[
            
      "2" => [
        "unique_id" => "2",
        "value"     => "Completed",
      ],
    ];
    $harvest_options       = select_option($harvest_options ,"Select The Status", $harvest_comp);
  }

} else {
    $harvest_comp = "";
    $harvest_options  = [
      "2" => [
        "unique_id" => "2",
        "value"     => "Completed",
      ],
    ];
    $harvest_options         = select_option($harvest_options ,"Select The Status", $harvest_comp);
  }

    $pit_name_options        = pit_name();
    $pit_name_options        = select_option($pit_name_options, "Select Pit Number ", $pit_id);

    


?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Screening Process </h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
      <form class="was-validated" autocomplete="off">

      <div class="row">

        <div class="col-md-3">
          <label for="entry_date">Entry Date</label>
          <input type="date" class="form-control" id="entry_date" name="entry_date" value="<?php echo $entry_date ?: date('Y-m-d'); ?>" required>
        </div>

        <div class="col-md-3 mb-3">
          <label for="pit_id" class="form-label">Pit Number</label>
          <select id="pit_id" name="pit_id" class="select2 form-control" required onchange="get_form_batch_id_vibro()">
            <?php echo $pit_name_options; ?>
          </select>
        </div>

        <div class="col-md-3 batch">
          <label for="batch_id" class="form-label">Pit Batch Id</label>
          <input id="batch_id" name="batch_id" class="select2 form-control" readonly value="<?php echo $form_batch_id; ?>">
        </div>

        <div class="col-md-3 vibro mb-3">
          <label for="qty_manure_1" class="form-label">Qty of Manure(-4mm)(kg)</label>
          <input type="number" step="0.01" id="qty_manure_1" name="qty_manure_1" class="form-control" value="<?php echo $qty_manure_1; ?>">
        </div>

        <div class="col-md-3 vibro mb-3">
          <label for="qty_manure_2" class="form-label">Qty of Manure(+4mm)(kg)</label>
          <input type="number" step="0.01" id="qty_manure_2" name="qty_manure_2" class="form-control" value="<?php echo $qty_manure_2; ?>">
        </div>

        <div class="col-md-3 vibro mb-3">
          <label for="qty_rejets" class="form-label">Qty of Rejects(kg)</label>
          <input type="number" step="0.01" id="qty_rejets" name="qty_rejets" class="form-control " value="<?php echo $qty_rejets; ?>">
        </div>

        <div class="col-md-3">
          <label for="notes">Remarks</label>
          <input name="notes" id="notes" class="select2 form-control" value="<?php echo $notes; ?>">
        </div>

        <div class="col-md-3 mb-3">
          <label for="harvest_comp" class="form-label">Harvest Status</label>
          <select id="harvest_comp" name="harvest_comp" class="select2 form-control" required>
            <?php echo $harvest_options; ?>
          </select>
        </div>
      </div>

    
          <div class="row mt-2">
            <div class="col-md-12 text-end">
              
              <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
              <?php echo btn_cancel($btn_cancel); ?>
             
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>