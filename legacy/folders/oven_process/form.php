<?php
// Form variables
$table = "oven_process";
$btn_text = "Save";
$btn_form = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";
$entry_date = "";
$starting_time = "";
$closing_time = "";
$running_hours = "";
$diesel_topup = "";
$raw_larvae_process = "";
$dried_larvae_production = "";
$dried_larvae_stock = "";
$docs = "";
$is_active = 1;

if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {
        $unique_id = $_GET["unique_id"];
        $where = [
            "unique_id" => $unique_id
        ];
        $columns = [
            "entry_date",
            "starting_time",
            "closing_time",
            "running_hours",
            "diesel_topup",
            "raw_larvae_process",
            "dried_larvae_production",
            "dried_larvae_stock",
            "image_name"
        ];
        $table_details = [
            $table,
            $columns
        ];
        $result_values = $pdo->select($table_details, $where);
        if ($result_values->status) {
            $result_values = $result_values->data;
            $entry_date = $result_values[0]["entry_date"];
            $starting_time = $result_values[0]["starting_time"];
            $closing_time = $result_values[0]["closing_time"];
            $running_hours = $result_values[0]["running_hours"];
            $diesel_topup = $result_values[0]["diesel_topup"];
            $raw_larvae_process = $result_values[0]["raw_larvae_process"];
            $dried_larvae_production = $result_values[0]["dried_larvae_production"];
            $dried_larvae_stock = $result_values[0]["dried_larvae_stock"];
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
?>
<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pb-0">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="mb-0 mt-2 d-flex align-items-center">Oven Process</h5>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off">
                    <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">

                    <div class="row">
                        <div class="col-md-3">
                            <label for="entry_date">Date</label>
                            <input type="date" class="form-control" id="entry_date" name="entry_date" value="<?php echo $entry_date ? date('Y-m-d', strtotime($entry_date)) : date('Y-m-d'); ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="starting_time">Start Time</label>
                            <input type="time" class="form-control" id="starting_time" name="starting_time" value="<?php echo $starting_time; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="closing_time">Close Time</label>
                            <input type="time" class="form-control" id="closing_time" name="closing_time" value="<?php echo $closing_time; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="running_hours">Total Run Hours</label>
                            <input type="number" step="0.01" class="form-control" id="running_hours" name="running_hours" value="<?php echo $running_hours; ?>" readonly required>
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col-md-3">
                            <label for="diesel_topup">Diesel Top Up (Litres)</label>
                            <input type="number" step="0.01" class="form-control" id="diesel_topup" name="diesel_topup" value="<?php echo $diesel_topup; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="raw_larvae_process">Total Raw (Live Larvae) Process (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="raw_larvae_process" name="raw_larvae_process" value="<?php echo $raw_larvae_process; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="dried_larvae_production">Dried Larvae Production (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="dried_larvae_production" name="dried_larvae_production" value="<?php echo $dried_larvae_production; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="dried_larvae_stock">Dried Larvae Stock (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="dried_larvae_stock" name="dried_larvae_stock" value="<?php echo $dried_larvae_stock; ?>" required>
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col-md-3 mb-3">
                            <label for="test_file">Image Upload</label>
                            <input type="file" id="test_file" multiple name="test_file[]" class="form-control dropify" value="<?php echo $docs; ?>">
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
