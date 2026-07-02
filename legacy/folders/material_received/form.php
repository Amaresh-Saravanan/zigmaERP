<?php
// Form variables
$btn_text = "Save";
$btn_form = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";

$date = "";
$qty = "";
$supplier_name = "";
$unit = "";
$item_name = "";
$batch_id = "";

// $is_active = 1;

if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {
        $unique_id = $_GET["unique_id"];
        $where = ["unique_id" => $unique_id];
        $table = "material_received";
        $columns = [
            "batch_id",
            "date",
            "qty",
            "supplier_name",
            "unit",
            "item_name",
            "doc_name",
            "(Select label from supplier_creation where material_received.supplier_name = supplier_creation.unique_id)as label",
            "invoice_date",
            "invoice_no",
        ];
        $table_details = [$table, $columns];
        $result_values = $pdo->select($table_details, $where);

        if ($result_values->status) {
            $result_values = $result_values->data;
            $batch_id = $result_values[0]["batch_id"];
            $date = $result_values[0]["date"];
            $supplier_name = $result_values[0]["supplier_name"];
            $item_name = $result_values[0]["item_name"];
            $qty = $result_values[0]["qty"];
            $unit2 = $result_values[0]["unit"];
            $docs = $result_values[0]["doc_name"];
            $label = $result_values[0]["label"];
            $invoice_no = $result_values[0]["invoice_no"];
            $invoice_date = $result_values[0]["invoice_date"];
            $unit = disname(unit_name($unit2)[0]['unit_name']);
            $btn_text = "Update";
            $btn_form = "Update";
            $btn_action = "update";
        } else {
            $btn_text = "Error";
            $btn_action = "error";
            $is_btn_disable = "disabled='disabled'";
        }
        $item_name_options = item_name_select($item_name);
        $item_name_options = select_option($item_name_options, "Select Item Name", $item_name);
    }
} else {
    $item_name_options = item_name_select();
    $item_name_options = select_option($item_name_options, "Select Item Name", $item_name);
}

// if (empty($date)) {
//     $date = date('Y-m-d');
// }

$supplier_name_options = supplier_name();
$supplier_name_options = select_option($supplier_name_options, "Select Supplier Name", $supplier_name);
?>
<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pt-3 pb-2">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="d-flex align-items-center">Material/Egg Received <?= $btn_form; ?></h5>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off" enctype="multipart/form-data" method="post">
                    <div class="row">

                    <div class="col-4 mb-3">
                        <input type="hidden" class="form-control" id="batch_id" name="batch_id" value="<?php echo $batch_id; ?>">
                        <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                        <label for="date">Entry Date</label>
                        <?php $current_date = date('Y-m-d'); ?>
                        <input type="date" class="form-control" id="date" name="date" value="<?php echo $date; ?>" 
                            <?php
                            if( $_SESSION['sess_user_id'] !="66604f07ae42a24843"){
                                if (!empty($unique_id)){ 
                                    echo ($date != $current_date) ? 'readonly' : '';
                                } else {
                                    echo ($date != $current_date) ;
                                }
                            } else {
                                echo ($date != $current_date) ; 
                            }
                            ?> required>
                    </div>

                    <div class="col-4 mb-3">
                            <input type="hidden" class="form-control" id="batch_id" name="batch_id" value="<?php echo $batch_id; ?>">
                            <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                            <label for="supplier_name" class="form-label">Supplier Name</label>
                            <?php $current_date = date('Y-m-d'); ?>
                            <select name="supplier_name" id="supplier_name" class="select2 form-control" onchange="get_label_name(this.value)" 
                                <?php
                                if ($_SESSION['sess_user_id'] != "66604f07ae42a24843") {
                                    if (!empty($unique_id)){
                                    echo ($date != $current_date) ? 'disabled' : ''; 
                                    } else {
                                        echo ($date != $current_date);
                                    }
                                } else {
                                    echo ($date != $current_date);
                                }  
                                ?> required>
                                <?php echo $supplier_name_options; ?>
                            </select>
                        </div>

                        <div class="col-4 mb-3">
                            <input type="hidden" class="form-control" id="batch_id" name="batch_id" value="<?php echo $batch_id; ?>">
                            <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                            <label for="item_name" class="form-label">Item Name</label>
                            <?php $current_date = date('Y-m-d'); ?>
                            <select name="item_name" id="item_name" class="select2 form-control" onchange="get_unit_details(this.value)" 
                                <?php
                                if ($_SESSION['sess_user_id'] != "66604f07ae42a24843") {
                                    if (!empty($unique_id)){
                                        echo ($date != $current_date) ? 'disabled' : ''; 
                                    } else {
                                        echo ($date != $current_date);
                                    }
                                } else {
                                    echo ($date != $current_date);
                                }
                                ?> required>
                                <?php echo $item_name_options; ?>
                            </select>
                        </div>

                        <div class="col-4 mb-3">
                            <input type="hidden" class="form-control" id="batch_id" name="batch_id" value="<?php echo $batch_id; ?>">
                            <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                            <label for="qty">Qty</label>
                            <?php $current_date = date('Y-m-d'); ?>
                            <input type="number" id="qty" name="qty" class="form-control" min="1" value="<?php echo $qty; ?>"
                                <?php
                                if ($_SESSION['sess_user_id'] != "66604f07ae42a24843") {
                                    if (!empty($unique_id)){
                                        echo ($date != $current_date) ? 'readonly' : ''; 
                                    } else {
                                        echo ($date != $current_date);
                                    }
                                } else {
                                    echo ($date != $current_date);
                                }
                                ?> required>
                        </div>

                        <div class="col-4 mb-3">
                            <label for="unit" class="form-label">Unit </label>
                            <input type="hidden" id="unit1" name="unit1" class="form-control" value="<?php echo $unit2; ?>">
                            <input type="hidden" id="unit" name="unit" class="form-control" value="<?php echo $unit; ?>" readonly required>
                            <br><h5 id="unit-display"><?php echo $unit; ?></h5>
                        </div>

                        <div class="col-4 mb-3">
                            <label for="invoice_date">Invoice Date</label>
                            <input type="date" id="invoice_date" name="invoice_date" class="form-control" value="<?php echo $invoice_date; ?>" >
                        </div>

                        <div class="col-4 mb-3">
                            <label for="invoice_no">Invoice Number</label>
                            <input type="text" id="invoice_no" name="invoice_no" class="form-control" value="<?php echo $invoice_no; ?>" >
                        </div>

                        <div class="col-4 mb-3">
                            <label>Invoice Image</label>
                            <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify">
                        </div>

                        <input type="hidden" id="label" name="label" class="form-control" value="<?php echo $label; ?>">
                    </div>
                    <?php if (!empty($docs)) { ?>
                        <div class="row mb-3">
                            <label class="form-label">Uploaded Files:</label>
                            <?php
                            $doc_array = explode(",", $docs);
                            foreach ($doc_array as $doc) {
                                $file_path = "uploads/material_received/" . $doc;
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
                                        $icon = $file_path; // default to actual image if jpg, jpeg, or png
                                        break;
                                }

                                if (in_array($file_ext, ['jpg', 'jpeg', 'png'])) {
                                    echo "<div class='col-2'><img src='$icon' alt='$doc' style='width:50px; height:50px;' onclick='print_view(\"$file_path\")'></div>";
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
