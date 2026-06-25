<?php
// Form variables
$btn_text = "Save";
$btn_form = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";
$screen_type_id = "";
$entry_date = "";
$type = "";
$drying_method = "";
$quantity = "";
$qty_manure = "";
$icon_name = "";
$is_active = 1;
$description = "";
$docs = "";

if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {
        $unique_id = $_GET["unique_id"];
        $where = ["unique_id" => $unique_id];
        $table = "dry_process";
        $columns = [
            "date",
            "type",
            "drying_method",
            "quantity",
            "qty_manure",
            "image_name"
        ];
        $table_details = [$table, $columns];
        $result_values = $pdo->select($table_details, $where);
        if ($result_values->status) {
            $result_values = $result_values->data;
            $entry_date = $result_values[0]["date"];
            $type = $result_values[0]['type'];
            $drying_method = $result_values[0]['drying_method']; 
            $quantity = $result_values[0]["quantity"];
            $qty_manure = $result_values[0]["qty_manure"];
            $docs = $result_values[0]["image_name"];
            $btn_text = "Update";
            $btn_form = "Update";
            $btn_action = "update";
        } else {
            $btn_text = "Error";
            $btn_action = "error";
            $is_btn_disable = "disabled='disabled'";
        }
    }
}

$type_options = [
    "1" => ["unique_id" => "1", "value" => "Input"],
    "2" => ["unique_id" => "2", "value" => "Output"],
];
$type_options = select_option($type_options, "Select the type", $type);

$method_options = [
    "1" => ["unique_id" => "1", "value" => "Solar"],
    "2" => ["unique_id" => "2", "value" => "Electric"],
];
$method_options = select_option($method_options, "Select the drying method", $drying_method);
?>
<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pb-0">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="mb-0 mt-2 d-flex align-items-center">Dry Process <?= $btn_form; ?></h5>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off" enctype="multipart/form-data" method="post">
                    <div class="row">
                        <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">
                        <div class="col">
                            <label for="entry_date">Date </label>
                            <!-- <input type="date" class="form-control" id='entry_date' name='entry_date' value="<?php echo $entry_date ?: date('Y-m-d'); ?>" required> -->
                            <input type="datetime-local" class="form-control" id="entry_date" name="entry_date" 
       value="<?php echo $entry_date ? date('Y-m-d\TH:i', strtotime($entry_date)) : date('Y-m-d\TH:i'); ?>" required>

                        </div>
                        <div class="col">
                            <label for="type">Type </label>
                            <select name="type" id="type" class="select2 form-control" required>
                                <?php echo $type_options; ?>
                            </select>
                        </div>
                        <div class="col">
                            <label for="drying_method">Drying Method</label>
                            <select name="drying_method" id="drying_method" class="select2 form-control" required>
                                <?php echo $method_options; ?>
                            </select>
                        </div>
                        <div class="col">
                            <label for="quantity">Quantity(kg)</label>
                            <input type="number" step="0.01" id="quantity" name="quantity" class="form-control" min="1" value="<?php echo $quantity; ?>" required>
                        </div>
                    </div>
                    <div class = "row">
                    <div class="col-3 mb-3">
                        <label>Image Upload</label>
                        <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify" value="<?php echo $docs; ?>">
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
                                        $icon = $file_path; // default to actual image if jpg, jpeg, or png
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
                    
                    <div class="col-md-3 qty_manure_container mb-3" style="display: none;">
                        <label for="qty_manure">Qty of Manure(Kg)</label>
                        <input type="number" step="0.01" class="form-control" id="qty_manure" name="qty_manure" value="<?php echo $qty_manure; ?>">  
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
