<?php
// Form variables
$btn_text = "Save";
$btn_form    = "Create";
$btn_action = "create";
$is_btn_disable = "";

$unique_id = "";

$bin_name = "";
$is_active = 1;


if (isset($_GET["unique_id"])) {
    if (!empty($_GET["unique_id"])) {

        $unique_id = $_GET["unique_id"];
        $where = [
            "unique_id" => $unique_id
        ];

        $table = "tray_creation";

        $columns = [
            "tray_type",
            "bin_name",
            "is_active",
        ];

        $table_details = [
            $table,
            $columns
        ];

        $result_values = $pdo->select($table_details, $where);

        if ($result_values->status) {

            $result_values = $result_values->data;

            $bin_name = $result_values[0]["bin_name"];
            $is_active = $result_values[0]["is_active"];

            $btn_text = "Update";
            $btn_form                = "Update";
            $btn_action = "update";
        } else {
            $btn_text = "Error";
            $btn_action = "error";
            $is_btn_disable = "disabled='disabled'";
        }
    }
}



$active_status_options = active_status($is_active);



$tray_type_options          =[
    "1" => [
         "unique_id" => "1",
         "value"     => "EGG Tray",
         ],
    "2" => [
         "unique_id" => "2",
         "value"     => "FRP Tray",
         ],
    ];
$tray_type_options         = select_option($tray_type_options , "Select The Status", $tray_type);

?>
<div class="row g-3 mb-3">
    <div class="col-md-12 col-xxl-12">
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-header pt-3 pb-2">
                <div class="row flex-between-end">
                    <div class="col-auto align-self-center">
                        <h5 class="d-flex align-items-center">Tray Creation <?=$btn_form ;?></h5>
                    </div>

                </div>
            </div>
            <div class="card-body d-flex flex-column justify-content-end">
                <form class="was-validated" autocomplete="off">
                    <div class="row">
                        <div class="col-4 mb-3">
                            <label for="tray_type">Type </label>
                            <select name="tray_type" id="tray_type" class="select2 form-control" required>
                                <?php echo $tray_type_options; ?>
                            </select>
                        </div>

                        <div class="col-4 mb-3">
                            <label for="bin_name">Tray Name</label>
                            <input type="text" class="form-control" id='bin_name' name='bin_name'
                                oninput='tray_name_validateinput(this)' value='<?php echo $bin_name; ?>'
                                placeholder="Tray-1" required>
                        </div>
                        <div class="col-4 mb-3">
                            <label for="is_active">Status </label>
                            <select name="active_status" id="active_status" class="select2 form-control" required>
                                <?php echo $active_status_options; ?>
                            </select>
                        </div>
                    </div>


                    <div class="row mt-2">
                        <div class="col-md-12 text-end">
                            <!-- Cancel,save and update Buttons -->
                            <?php echo btn_createupdate($folder_name_org, $unique_id, $btn_text); ?>
                            <?php echo btn_cancel($btn_cancel); ?>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    </div>
</div>