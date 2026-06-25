<?php
// Form variables
$table              = "leachate";
$btn_text           = "Save";
$btn_form           = "Create";
$btn_action         = "create";
$is_btn_disable     = "";
$unique_id          = "";
$entry_date         = "";
$qty_leachate       = "";
$is_active          = 1;
if (isset($_GET["unique_id"])) {
  if (!empty($_GET["unique_id"])) {
    $unique_id  = $_GET["unique_id"];
    $where      = [
      "unique_id" => $unique_id
    ];
    $table      =  "leachate";
    $columns    = [
      "entry_date",
      "qty_leachate",
      "doc_name",
      "remarks"
      
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
      $qty_leachate      = $result_values[0]["qty_leachate"];
      $docs              = $result_values[0]["doc_name"];
      $remarks           = $result_values[0]["remarks"];
      $btn_text          = "Update";
      $btn_form          = "Update";
      $btn_action        = "update";
    } else {
      $btn_text          = "Error";
      $btn_action        = "error";
      $is_btn_disable    = "disabled='disabled'";
    }
  }
}

if (empty($date)) {
  $date = date('Y-m-d');
}

?>
<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pb-0">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="mb-0 mt-2 d-flex align-items-center">Leachate Form</h5>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
      <form class="was-validated" autocomplete="off" enctype="multipart/form-data" method="post">

        <div class="row">
            <div class="col-md-3">
                <label for="entry_date">Entry Date</label>
                <input type="date" class="form-control" id="entry_date" name="entry_date" value="<?php echo $entry_date ?: date('Y-m-d'); ?>" required>
            </div>

            <div class="col-md-3">
                <label for="qty_leachate" class="form-label">Qty Leachate(L)</label>
                <input type="number" step="0.01" name="qty_leachate" id="qty_leachate" class="select2 form-control" value="<?php echo $qty_leachate; ?>" required>
            </div>

            <div class="col-md-3">
                <label>Image Upload</label>
                <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify" value="<?php echo $docs; ?>" required>
            </div>

            <div class="col-md-3">
                <label for="remarks">Remarks</label>
                <input type="text" name="remarks" id="remarks" class="select2 form-control" value="<?php echo $remarks; ?>">
            </div>
            </div>
                    
            <?php if (!empty($docs)) { ?>
              <div class="row mb-3">
                <label class="form-label">Uploaded Files:</label>
                <?php
                $doc_array = explode(",", $docs);
                foreach ($doc_array as $doc) {
                    $file_path = "uploads/dry_process/" . $doc;
                    $file_ext = pathinfo($file_path, PATHINFO_EXTENSION);
                    $icon_path = "uploads/";

                    switch ($file_ext) {
                        case 'pdf':
                            $icon = $icon_path . 'pdf.png';
                            break;
                        case 'doc':
                        case 'docx':
                            $icon = $icon_path . 'word.png';
                            break;
                        case 'xls':
                        case 'xlsx':
                            $icon = $icon_path . 'excel.png';
                            break;
                        default:
                            $icon = $file_path;
                            break;
                    }

                    if (in_array($file_ext, ['jpg', 'jpeg', 'png'])) {
                        echo "<div class='col-2'><img src='$icon' alt='$doc' style='width:50px; height:50px;' onclick='print_view(\"$doc\")'></div>";
                    } else {
                        echo "<div class='col-2'><a href='$file_path' target='_blank'><img src='$icon' alt='$doc' style='width:50px; height:50px;'></a></div>";
                    }
                }
                ?>
              </div>
            <?php } ?>

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