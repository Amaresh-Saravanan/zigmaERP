<?php
// Form variables
$table = "culling_process";
$btn_text = "Save";
$btn_form = "Create";
$btn_action = "create";
$is_btn_disable = "";
$unique_id = "";
$entry_date = "";
$shift_type = "";
$cylinder_type = "";
$cylinder_no = "";
$starting_weight = "";
$ending_weight = "";
$fuel_consumption = "";
$raw_material_weight = "";
$final_larvae_weight = "";
$work_done = "";
$others_remarks = "";
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
            "shift_type",
            "cylinder_type",
            "cylinder_no",
            "starting_weight",
            "ending_weight",
            "fuel_consumption",
            "raw_material_weight",
            "final_larvae_weight",
            "work_done",
            "others_remarks",
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
            $shift_type = $result_values[0]["shift_type"];
            $cylinder_type = $result_values[0]["cylinder_type"];
            $cylinder_no = $result_values[0]["cylinder_no"];
            $starting_weight = $result_values[0]["starting_weight"];
            $ending_weight = $result_values[0]["ending_weight"];
            $fuel_consumption = $result_values[0]["fuel_consumption"];
            $raw_material_weight = $result_values[0]["raw_material_weight"];
            $final_larvae_weight = $result_values[0]["final_larvae_weight"];
            $work_done = $result_values[0]["work_done"];
            $others_remarks = $result_values[0]["others_remarks"];
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

$shift_options = [
    "1" => ["unique_id" => "1", "value" => "Day"],
    "2" => ["unique_id" => "2", "value" => "Night"],
    "3" => ["unique_id" => "3", "value" => "General"],
];
$shift_options = select_option($shift_options, "Select Shift", $shift_type);

$cylinder_options = [
    "1" => ["unique_id" => "1", "value" => "O2"],
    "2" => ["unique_id" => "2", "value" => "LPG"],
    "3" => ["unique_id" => "3", "value" => "Other"],
];
$cylinder_options = select_option($cylinder_options, "Select Cylinder Type", $cylinder_type);

$work_done_options = [
    "1" => ["unique_id" => "1", "value" => "Cutting"],
    "2" => ["unique_id" => "2", "value" => "Heating"],
    "3" => ["unique_id" => "3", "value" => "Others"],
];
$work_done_options = select_option($work_done_options, "Select Work Done", $work_done);
?>
<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pb-0">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="mb-0 mt-2 d-flex align-items-center">Culling Process</h5>
                    </div>
                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off">
                    <input type="hidden" id="unique_id" name="unique_id" value="<?php echo $unique_id; ?>">

                    <div class="row">
                        <div class="col-md-3">
                            <label for="entry_date">Work Date</label>
                            <input type="date" class="form-control" id="entry_date" name="entry_date" value="<?php echo $entry_date ? date('Y-m-d', strtotime($entry_date)) : date('Y-m-d'); ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="shift_type">Shift Type</label>
                            <select name="shift_type" id="shift_type" class="select2 form-control" required>
                                <?php echo $shift_options; ?>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="cylinder_type">Cylinder Type</label>
                            <select name="cylinder_type" id="cylinder_type" class="select2 form-control" required>
                                <?php echo $cylinder_options; ?>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label for="cylinder_no">Cylinder No / ID</label>
                            <input type="text" class="form-control" id="cylinder_no" name="cylinder_no" value="<?php echo $cylinder_no; ?>" required>
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col-md-3">
                            <label for="starting_weight">Starting Weight (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="starting_weight" name="starting_weight" value="<?php echo $starting_weight; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="ending_weight">Final Weight (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="ending_weight" name="ending_weight" value="<?php echo $ending_weight; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="fuel_consumption">Fuel Consumption (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="fuel_consumption" name="fuel_consumption" value="<?php echo $fuel_consumption; ?>" readonly required>
                        </div>

                        <div class="col-md-3">
                            <label for="raw_material_weight">Raw Material / Live Larvae (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="raw_material_weight" name="raw_material_weight" value="<?php echo $raw_material_weight; ?>" required>
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col-md-3">
                            <label for="final_larvae_weight">Final Larvae After Culling (Kg)</label>
                            <input type="number" step="0.01" class="form-control" id="final_larvae_weight" name="final_larvae_weight" value="<?php echo $final_larvae_weight; ?>" required>
                        </div>

                        <div class="col-md-3">
                            <label for="work_done">Work Done</label>
                            <select name="work_done" id="work_done" class="select2 form-control" required>
                                <?php echo $work_done_options; ?>
                            </select>
                        </div>

                        <div class="col-md-3 others_remarks_container">
                            <label for="others_remarks">Others Remarks</label>
                            <input type="text" class="form-control" id="others_remarks" name="others_remarks" value="<?php echo $others_remarks; ?>">
                        </div>

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
