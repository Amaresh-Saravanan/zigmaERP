<center><div class="col-9 d-flex align-items-center">
    <img src="../zig-fly-logo.png" alt="Logo" height="" width="10%">
    <div class="address ms-3">
        <p class="mb-0"><b>Zigma Global Environ Solutions Pvt.Ltd</b><br>
            178, Indu Nagar, Palayapalayam, Perundurai Road,<br/> Erode - 638 012.
        </p>
        <p class="mb-0">0424-222 5157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</p>
        <p class="mb-2">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</p>
    </div>
</div>
</center>


<?php 
 include '../../config/dbconfig.php'; 

$type = $_GET['type'];
if($type =='organic'){ ?>
    <style>

    .col-9 {
        display: flex;
        align-items: center;
        justify-content: center; 
        margin-top: 20px; 
    }
    
    .address {
        text-align: left; 
        margin-left: 15px; 
    }
    
    img {
        height: auto;
        width: 10%; 
    }
    
    body {
        margin: 0; 
    }
    
    .table-container {
        display: flex;              
        justify-content: center;   
        align-items: center;        
        height: 100vh;         
    }
    
    table {
        border: 1.5px solid #ccc;
        border-collapse: collapse;
        width: 90%; 
        max-width: 6000px;
    }
    
    th, td {
        padding: 20px;      
        text-align: center;
    }
    
    .org_head {
        font-weight: bold; 
        font-size: 30px;
    }
    
    .bg-light {
        text-align: center;
    }
    .table-header {
        font-size: 50px;
        font-weight: 600; 
    }
    
    </style>
    
    
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" /> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
    
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                <div class="container">     
                    <div class="row">
                        <div class="container" style="background-color:#fff;">
                            <div class="compl_print">
                                <div class="zone_boxbor">                                       
                        </div>
                    </div>
                </div>
        
    
    <br>
    <center><h2 class="org_head"> Organic Waste Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
                <?php
                    $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                    $currentMonth = date('F Y'); 
                ?>
    
                <div class="row justify-content-end">
                    <div class="col-md-6 text-end">
                        <h5 style="margin: 0; font-size:18px;">
                        <span style="font-weight: bold;">Month:</span>
                            <?= date('M - Y', strtotime($month)); ?></h5>
                    </div>
                </div>
    
                        <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit Number</th>  
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit Batch Id</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Feeding Count</th>                                                                   
                            <th width="10%" style='text-align:center; font-size:18px;'>Feeding Qty(Tons)</th>                     
                            <th width="15%" style='text-align:center; font-size:18px;'>Remarks</th>
                        </tr>
                    </thead>   
                <tbody>
                    <br>
        <?php
        // $pit_id = $_GET['pit_id'];
        // include '../../config/dbconfig.php';
    
        $org_status = $_GET['unique_id'];
        $month      = $_GET['month'];
        $table_main = "pit_status";
        $start = 0;
        $columns_list = [
            "@a:=@a+1 s_no", 
            "entry_date",
            "pit_id",
            "form_batch_id",
            "feed_count",        
            "feed_qty",      
            "notes", 
            // "sum(feed_qty) as total_feed ", 
        ];
    
        $table_details_list = [
            $table_main . ", (SELECT @a:= " . $start . ") AS a ",
            $columns_list
        ];
        $order_by = "entry_date ASC";
        $where_list = "DATE_FORMAT(entry_date,'%Y-%m')='$month' and  is_delete=0 and org_status=1";
        $result = $pdo->select($table_details_list, $where_list,$limit, $start ,$order_by);
        if ($result->status) {
            $res_array = $result->data;
            $table_data = "";
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {
                    $value['entry_date'] = disdate($value['entry_date']);
                    $total_feed     = $value["feed_qty"];
                    $total_feed_sum += $value['feed_qty'];
                   
                    
                    switch ($value['feed_count']) {
                        case 1:
                            $feed_count = "First Feeding";
                            break;
                        case 2:
                            $feed_count = "Second Feeding";
                            break;
                        case 3:
                            $feed_count = "Third Feeding";
                            break;
                        case 4:
                            $feed_count = "Fourth Feeding";
                            break;
                        case 5:
                            $feed_count = "Fifth Feeding";
                            break;
                        case 6:
                            $feed_count = "Sixth Feeding";
                            break;
                        default:
                            $feed_count = "-"; // or another default value
                            break;
                    }
                    
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . disname(pit_name($value['pit_id'])[0]['pit_name']) . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['form_batch_id'] . "</td>";
                    $table_data .= "<td style='text-align:left; font-size:17px;'>" . $feed_count . "</td>";              
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" .  $total_feed . "</td>";  
                    // $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['notes'] . "</td>";   
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . (!empty($value['notes']) ? $value['notes'] : "-") . "</td>";
         
                    $table_data .= "</tr>";                 
                    } 
                    $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                    $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . $total_feed_sum . "</td>";   
                }
            }    
            echo $table_data;
            echo $Total;
        ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    
    </body>
    </html>



<?php

}else if($type=='purchasing'){ ?>
    <style>

.col-9 {
    display: flex;
    align-items: center;
    justify-content: center; 
    margin-top: 20px; 
}

.address {
    text-align: left; 
    margin-left: 15px; 
}

img {
    height: auto;
    width: 10%; 
}

body {
    margin: 0; 
}

.table-container {
    display: flex;              
    justify-content: center;   
    align-items: center;        
    height: 100vh;         
}

table {
    border: 1.5px solid #ccc;
    border-collapse: collapse;
    width: 90%; 
    max-width: 6000px;
}

th, td {
    padding: 20px;      
    text-align: center;
}

.org_head {
    font-weight: bold; 
    font-size: 30px;
}

.bg-light {
    text-align: center;
}
.table-header {
    font-size: 50px;
    font-weight: 600; 
}

</style>


<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" /> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
</head>
<body>

    <div class="card h-md-100 ecommerce-card-min-width">
        <div class="card-body d-flex flex-column justify-content-end pt-1 ">
            <div class="container">     
                <div class="row">
                    <div class="container" style="background-color:#fff;">
                        <div class="compl_print">
                            <div class="zone_boxbor">                                       
                    </div>
                </div>
            </div>
    

<br>
<center><h2 class="org_head"  > Egg Purchasing Report </h2></center>
    <div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable" >
            <thead class="bg-light table-header">
            <?php
                $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                $currentMonth = date('F Y'); 
            ?>

            <div class="row justify-content-end">
                <div class="col-md-6 text-end">
                    <h5 style="margin: 0; font-size:18px;">
                    <span style="font-weight: bold;">Month:</span>
                        <?= date('M - Y', strtotime($month)); ?></h5>
                </div>
            </div>

                    <tr>
                        <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                        <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                        <th width="10%" style='text-align:center; font-size:18px;'>Invoice Date</th>  
                        <th width="10%" style='text-align:center; font-size:18px;'>Supplier Name</th> 
                        <th width="10%" style='text-align:center; font-size:18px;'>Invoice No</th>                                                                   
                        <th width="10%" style='text-align:center; font-size:18px;'>Qty(Kg)</th>                     
                    </tr>
                </thead>   
            <tbody>
    <br>

    <?php

    $org_status = $_GET['unique_id'];
    $month      = $_GET['month'];
    $table_main = "material_received";
    $start = 0;
    $columns_list = [
        "@a:=@a+1 s_no", 
        "date",
        "invoice_date",
        "supplier_name",
        "invoice_no",
        "qty"
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    // $order_by = "entry_date ASC";
    $where_list = "DATE_FORMAT(date,'%Y-%m')='$month' and  is_delete=0";
    $result = $pdo->select($table_details_list, $where_list, $limit, $start);
    // print_r($result);
    if ($result->status) {
        $res_array = $result->data;
        $table_data = "";
        if (count($res_array) == 0) {            
            $table_data .= "<tr>";
            $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
            $table_data .= "</tr>";
        } else {            
            foreach ($res_array as $key => $value) {

                $value['date'] = disdate($value['date']); 
                $total_feed_sum += $value['qty'];
                
                $table_data .= "<tr>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['date'] . "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . (!empty($value['invoice_date']) ? disdate($value['invoice_date']) : '-') . "</td>";
                $table_data .= "<td style='text-align:left; font-size:17px;'>" . disname(supplier_name($value['supplier_name'])[0]['supplier_name']) . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . (!empty($value['invoice_no']) ? ($value['invoice_no']) : '-') . "</td>";  
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['qty'] / 1000 , 1). "</td>";            
                $table_data .= "</tr>";                 
                }   

                $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . number_format($total_feed_sum / 1000, 1) . "</td>";

            }
        }    
        echo $table_data;
        echo $Total;
    ?>  
</tbody>                    
</div>
</div>
</div>
</div>

</body>
</html>


<?php

} else if($type=='hatching'){ ?>
    <style>

.col-9 {
    display: flex;
    align-items: center;
    justify-content: center; 
    margin-top: 20px; 
}

.address {
    text-align: left; 
    margin-left: 15px; 
}

img {
    height: auto;
    width: 10%; 
}

body {
    margin: 0; 
}

.table-container {
    display: flex;              
    justify-content: center;   
    align-items: center;        
    height: 100vh;         
}

table {
    border: 1.5px solid #ccc;
    border-collapse: collapse;
    width: 90%; 
    max-width: 6000px;
}

th, td {
    padding: 20px;      
    text-align: center;
}

.org_head {
    font-weight: bold; 
    font-size: 30px;
}

.bg-light {
    text-align: center;
}
.table-header {
    font-size: 50px;
    font-weight: 600; 
}

</style>


<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" /> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
</head>
<body>

    <div class="card h-md-100 ecommerce-card-min-width">
        <div class="card-body d-flex flex-column justify-content-end pt-1 ">
            <div class="container">     
                <div class="row">
                    <div class="container" style="background-color:#fff;">
                        <div class="compl_print">
                            <div class="zone_boxbor">                                       
                    </div>
                </div>
            </div>
    

<br>
<center><h2 class="org_head"  > Egg Hatching Report </h2></center>
    <div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable" >
            <thead class="bg-light table-header">
            <?php
                $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                $currentMonth = date('F Y'); 
            ?>

            <div class="row justify-content-end">
                <div class="col-md-6 text-end">
                    <h5 style="margin: 0; font-size:18px;">
                    <span style="font-weight: bold;">Month:</span>
                        <?= date('M - Y', strtotime($month)); ?></h5>
                </div>
            </div>

                    <tr>
                        <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                        <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                        <th width="10%" style='text-align:center; font-size:18px;'>Pit Number</th>  
                        <th width="15%" style='text-align:center; font-size:18px;'>Egg Batch Id</th> 
                        <th width="10%" style='text-align:center; font-size:18px;'>Tray Count</th>                                                                   
                        <th width="10%" style='text-align:center; font-size:18px;'>Qty(Kg)</th> 
                        <th width="20%" style='text-align:center; font-size:18px;'>Remarks</th>                    
                    </tr>
                </thead>   
            <tbody>
    <br>

    <?php

    $org_status = $_GET['unique_id'];
    $month      = $_GET['month'];
    $table_main = "pit_status";
    $start = 0;
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "pit_id",
        "(select batch_id from material_received where material_received.unique_id = pit_status.batch_id)as batch_id",
        // "(select bin_name from tray_creation where tray_creation.unique_id = pit_status.tray_no)as tray_no",
        // "(select COUNT(*) from tray_creation where tray_creation.unique_id = pit_status.tray_no) as tray_count",
        "''as tray_count",
        "larvae_qty_in",
        "notes",
        "tray_no"
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    // $order_by = "entry_date ASC";
    $where_list = "DATE_FORMAT(entry_date,'%Y-%m')='$month' and  is_delete=0 and org_status=2";
    $result = $pdo->select($table_details_list, $where_list, $limit, $start);
    // print_r($result);
    if ($result->status) {
        $res_array = $result->data;
        $table_data = "";
        if (count($res_array) == 0) {            
            $table_data .= "<tr>";
            $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
            $table_data .= "</tr>";
        } else {            
            foreach ($res_array as $key => $value) {

                $value['entry_date'] = disdate($value['entry_date']);
                $total_feed_sum += $value['larvae_qty_in']; 

                if ($value['tray_no']) {
                    $exp_site = explode(',', $value['tray_no']);
                    $unique_bin_names = []; 
                    foreach ($exp_site as $tray_no) {
                        $bin_name = tray($tray_no);            
                        if ($bin_name) {
                            $tray_id = $bin_name[0]['bin_name'];
                            if (!in_array($tray_id, $unique_bin_names)) {
                                $unique_bin_names[] = $tray_id; // Store unique tray names
                            }
                        }
                    }
                    
                    $value['tray_count'] = count($unique_bin_names); // Get the count of unique trays
                }
                

                
                $table_data .= "<tr>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . disname(pit_name($value['pit_id'])[0]['pit_name']) . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_count'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['larvae_qty_in'], 1) . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . (!empty($value['notes']) ? $value['notes'] : "-") . "</td>";
         
                $table_data .= "</tr>";                 
                }    
                $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . $total_feed_sum . "</td>";
            }
        }    
        echo $table_data;
        echo $Total;
    ?>  
</tbody>                    
</div>
</div>
</div>
</div>

</body>
</html>
<?php

    } else if($type=='larvae_harvested'){ ?>
        
    <style>
    
    .col-9 {
        display: flex;
        align-items: center;
        justify-content: center; 
        margin-top: 20px; 
    }
    
    .address {
        text-align: left; 
        margin-left: 15px; 
    }
    
    img {
        height: auto;
        width: 10%; 
    }
    
    body {
        margin: 0; 
    }
    
    .table-container {
        display: flex;              
        justify-content: center;   
        align-items: center;        
        height: 100vh;         
    }
    
    table {
        border: 1.5px solid #ccc;
        border-collapse: collapse;
        width: 90%; 
        max-width: 6000px;
    }
    
    th, td {
        padding: 20px;      
        text-align: center;
    }
    
    .org_head {
        font-weight: bold; 
        font-size: 30px;
    }
    
    .bg-light {
        text-align: center;
    }
    .table-header {
        font-size: 50px;
        font-weight: 600; 
    }
    
    </style>
    
    
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" /> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
    
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                <div class="container">     
                    <div class="row">
                        <div class="container" style="background-color:#fff;">
                            <div class="compl_print">
                                <div class="zone_boxbor">                                       
                        </div>
                    </div>
                </div>
        
    
    <br>
    <center><h2 class="org_head"  > Larvae Harvested Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
                <?php
                    $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                    $currentMonth = date('F Y'); 
                ?>
    
                <div class="row justify-content-end">
                    <div class="col-md-6 text-end">
                        <h5 style="margin: 0; font-size:18px;">
                        <span style="font-weight: bold;">Month:</span>
                            <?= date('M - Y', strtotime($month)); ?></h5>
                    </div>
                </div>
    
                        <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit No</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit Batch Id</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Qty of Live Larvae(Tons)</th> 
                            <th width="15%" style='text-align:center; font-size:18px;'>Remarks</th>                    
                        </tr>
                    </thead>   
                <tbody>
        <br>
    
        <?php
    
        $org_status = $_GET['unique_id'];
        $month      = $_GET['month'];
        $table_main = "pit_status";
        $start = 0;
        $columns_list = [
            "@a:=@a+1 s_no", 
            "entry_date",
            "pit_id",
            "form_batch_id",
            "larvae_qty",
            "notes"
        ];
    
        $table_details_list = [
            $table_main . ", (SELECT @a:= " . $start . ") AS a ",
            $columns_list
        ];
        // $order_by = "entry_date ASC";
        $where_list = "DATE_FORMAT(entry_date,'%Y-%m')='$month' and  is_delete=0 and org_status=5";
        $result = $pdo->select($table_details_list, $where_list, $limit, $start);
        // print_r($result);
        if ($result->status) {
            $res_array = $result->data;
            $table_data = "";
            
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {
    
                    $value['entry_date'] = disdate($value['entry_date']);
                    $total_feed_sum += $value['larvae_qty']; 
                    
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . disname(pit_name($value['pit_id'])[0]['pit_name']) . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['form_batch_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['larvae_qty']/1000, 1) . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . (!empty($value['notes']) ? $value['notes'] : "-") . "</td>";
         
                    $table_data .= "</tr>";                 
                    }   
                    $Total .= "<td colspan='4' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                    $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . number_format($total_feed_sum / 1000, 1) . "</td>"; 
                }
                
            }    
            echo $table_data;
            echo $Total;
        ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    
    </body>
    </html>
    <?php
    
} else if($type=='manure'){ ?>

    <style>
    
    .col-9 {
        display: flex;
        align-items: center;
        justify-content: center; 
        margin-top: 20px; 
    }
    
    .address {
        text-align: left; 
        margin-left: 15px; 
    }
    
    img {
        height: auto;
        width: 10%; 
    }
    
    body {
        margin: 0; 
    }
    
    .table-container {
        display: flex;              
        justify-content: center;   
        align-items: center;        
        height: 100vh;         
    }
    
    table {
        border: 1.5px solid #ccc;
        border-collapse: collapse;
        width: 90%; 
        max-width: 6000px;
    }
    
    th, td {
        padding: 20px;      
        text-align: center;
    }
    
    .org_head {
        font-weight: bold; 
        font-size: 30px;
    }
    
    .bg-light {
        text-align: center;
    }
    .table-header {
        font-size: 50px;
        font-weight: 600; 
    }
    
    </style>
        
        
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" /> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
    
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                <div class="container">     
                    <div class="row">
                        <div class="container" style="background-color:#fff;">
                            <div class="compl_print">
                                <div class="zone_boxbor">                                       
                        </div>
                    </div>
                </div>
        
    
    <br>
    <center><h2 class="org_head"  > Manure Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
                <?php
                    $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                    $currentMonth = date('F Y'); 
                ?>
    
                <div class="row justify-content-end">
                    <div class="col-md-6 text-end">
                        <h5 style="margin: 0; font-size:18px;">
                        <span style="font-weight: bold;">Month:</span>
                            <?= date('M - Y', strtotime($month)); ?></h5>
                    </div>
                </div>
    
                        <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit No</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit Batch Id</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Manure(-4mm)(Tons)</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Manure(+4mm)(Tons)</th> 
                            <th width="15%" style='text-align:center; font-size:18px;'>Remarks</th>                    
                        </tr>
                    </thead>   
                <tbody>
        <br>
    
    <?php
    
        $org_status = $_GET['unique_id'];
        $month      = $_GET['month'];
        $table_main = "pit_status";
        $start = 0;
        $columns_list = [
            "@a:=@a+1 s_no", 
            "entry_date",
            "pit_id",
            "form_batch_id",
            "qty_manure_1",
            "qty_manure_2",
            "notes",
            // "qty_manure_2"
        ];
    
        $table_details_list = [
            $table_main . ", (SELECT @a:= " . $start . ") AS a ",
            $columns_list
        ];
        // $order_by = "entry_date ASC";
        $where_list = "DATE_FORMAT(entry_date,'%Y-%m')='$month' and  is_delete=0 and org_status=6";
        $result = $pdo->select($table_details_list, $where_list, $limit, $start);
        // print_r($result);
        if ($result->status) {
            $res_array = $result->data;
            $table_data = "";
            
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {
    
                    $value['entry_date'] = disdate($value['entry_date']);
                    $total_feed_sum += $value['qty_manure_1']; 
                    $total_feed_sum1 += $value['qty_manure_2']; 
                    
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . disname(pit_name($value['pit_id'])[0]['pit_name']) . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['form_batch_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['qty_manure_1'] / 1000, 1) . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['qty_manure_2'] / 1000, 1) . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['notes'] . "</td>";          
                    $table_data .= "</tr>";                 
                    }   
                    $Total .= "<td colspan='4' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                    $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . number_format($total_feed_sum / 1000, 1) . "</td>"; 
                    $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . number_format($total_feed_sum1 / 1000, 1) . "</td>"; 
                }
                
            }    
            echo $table_data;
            echo $Total;
        ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    
    </body>
    </html>
    <?php
        
} else if($type=='processing-rejects'){ ?>

    <style>
            
    .col-9 {
        display: flex;
        align-items: center;
        justify-content: center; 
        margin-top: 20px; 
    }
    
    .address {
        text-align: left; 
        margin-left: 15px; 
    }
    
    img {
        height: auto;
        width: 10%; 
    }
    
    body {
        margin: 0; 
    }
    
    .table-container {
        display: flex;              
        justify-content: center;   
        align-items: center;        
        height: 100vh;         
    }
    
    table {
        border: 1.5px solid #ccc;
        border-collapse: collapse;
        width: 90%; 
        max-width: 6000px;
    }
    
    th, td {
        padding: 20px;      
        text-align: center;
    }
    
    .org_head {
        font-weight: bold; 
        font-size: 30px;
    }
    
    .bg-light {
        text-align: center;
    }
    .table-header {
        font-size: 50px;
        font-weight: 600; 
    }
    
    </style>
    
            
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" /> 
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
            <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
    </head>
    <body>
    
        <div class="card h-md-100 ecommerce-card-min-width">
            <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                <div class="container">     
                    <div class="row">
                        <div class="container" style="background-color:#fff;">
                            <div class="compl_print">
                                <div class="zone_boxbor">                                       
                        </div>
                    </div>
                </div>
        
            
    <br>
    <center><h2 class="org_head"  > Processing Rejects Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
                <?php
                    $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                    $currentMonth = date('F Y'); 
                ?>
    
                <div class="row justify-content-end">
                    <div class="col-md-6 text-end">
                        <h5 style="margin: 0; font-size:18px;">
                        <span style="font-weight: bold;">Month:</span>
                            <?= date('M - Y', strtotime($month)); ?></h5>
                    </div>
                </div>
    
                        <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit No</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Pit Batch Id</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Qty of Rejects(Tons)</th> 
                            <th width="15%" style='text-align:center; font-size:18px;'>Remarks</th>                    
                        </tr>
                    </thead>   
                <tbody>
        <br>
    
    <?php
            
    $org_status = $_GET['unique_id'];
    $month      = $_GET['month'];
    $table_main = "pit_status";
    $start = 0;
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "pit_id",
        "form_batch_id",
        "qty_rejets",
        "notes"
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    // $order_by = "entry_date ASC";
    $where_list = "DATE_FORMAT(entry_date,'%Y-%m')='$month' and  is_delete = 0 and org_status=6";
    $result = $pdo->select($table_details_list, $where_list, $limit, $start);
    // print_r($result);
    if ($result->status) {
        $res_array = $result->data;
        $table_data = "";
        
        if (count($res_array) == 0) {            
            $table_data .= "<tr>";
            $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
            $table_data .= "</tr>";
        } else {            
            foreach ($res_array as $key => $value) {

                $value['entry_date'] = disdate($value['entry_date']);
                $total_feed_sum += $value['qty_rejets']; 
                
                $table_data .= "<tr>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . disname(pit_name($value['pit_id'])[0]['pit_name']) . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['form_batch_id'] . "</td>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . number_format($value['qty_rejets'] / 1000 , 1). "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['notes'] . "</td>";          
                $table_data .= "</tr>";                 
                }   
                $Total .= "<td colspan='4' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . number_format($total_feed_sum / 1000, 1)  . "</td>"; 
            }
            
        }    
        echo $table_data;
        echo $Total;
        ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    
    </body>
    </html>
    <?php
    
    }   else if($type=='inward-rejects1'){ ?>
        
        <style>
            
        .col-9 {
            display: flex;
            align-items: center;
            justify-content: center; 
            margin-top: 20px; 
        }
        
        .address {
            text-align: left; 
            margin-left: 15px; 
        }
        
        img {
            height: auto;
            width: 10%; 
        }
        
        body {
            margin: 0; 
        }
        
        .table-container {
            display: flex;              
            justify-content: center;   
            align-items: center;        
            height: 100vh;         
        }
        
        table {
            border: 1.5px solid #ccc;
            border-collapse: collapse;
            width: 90%; 
            max-width: 6000px;
        }
        
        th, td {
            padding: 20px;      
            text-align: center;
        }
        
        .org_head {
            font-weight: bold; 
            font-size: 30px;
        }
        
        .bg-light {
            text-align: center;
        }
        .table-header {
            font-size: 50px;
            font-weight: 600; 
        }
        
        </style>
                    
                    
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" /> 
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
                <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
        
            <div class="card h-md-100 ecommerce-card-min-width">
                <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                    <div class="container">     
                        <div class="row">
                            <div class="container" style="background-color:#fff;">
                                <div class="compl_print">
                                    <div class="zone_boxbor">                                       
                            </div>
                        </div>
                    </div>
            
            
        <br>
        <center><h2 class="org_head"  > Inward Rejects Report </h2></center>
            <div class="container-fluid">
                <div class="box mt-2">
                <div class="gridtable">
                    <table  class="table table-bordered table-striped flytable" >
                    <thead class="bg-light table-header">
                    <?php
                        $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                        $currentMonth = date('F Y'); 
                    ?>
        
                    <div class="row justify-content-end">
                        <div class="col-md-6 text-end">
                            <h5 style="margin: 0; font-size:18px;">
                            <span style="font-weight: bold;">Month:</span>
                                <?= date('M - Y', strtotime($month)); ?></h5>
                        </div>
                    </div>
        
                        <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Ticket No</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Vehicle Number</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Net Weight(Tons)</th> 
                            <th width="15%" style='text-align:center; font-size:18px;'>Remarks</th>                    
                        </tr>
                    </thead>   
                <tbody>
        <br>
                
     <?php
                
        $org_status = $_GET['unique_id'];
        $month      = $_GET['month'];
        $table_main = "rejects_image_upload";
        $start = 0;
        $columns_list = [
            "@a:=@a+1 s_no", 
            "date",
            "ticket_no",
            "vehicle_number",
            "net_weight",
            
        ];
    
        $table_details_list = [
            $table_main . ", (SELECT @a:= " . $start . ") AS a ",
            $columns_list
        ];
        // $order_by = "entry_date ASC";
        $where_list = "DATE_FORMAT(date,'%Y-%m')='$month' and  is_delete=0 ";
        $result = $pdo->select($table_details_list, $where_list, $limit, $start);
        // print_r($result);
        if ($result->status) {
            $res_array = $result->data;
            $table_data = "";
            
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {
    
                    $value['entry_date'] = disdate($value['entry_date']);
                    $total_feed_sum += $value['net_weight']/1000; 
                    
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['s_no'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['date'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['ticket_no']. "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['vehicle_number'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . ($value['net_weight'])/1000 . "</td>"; 
                    // $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['notes'] . "</td>";          
                    $table_data .= "</tr>";                 
                    }   
                    $Total .= "<td colspan='4' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                    $Total .= "<td style='text-align:center; font-size:15; font-weight:bold'>" . ($total_feed_sum) . "</td>"; 
                }
                
            }    
            echo $table_data;
            echo $Total;
        ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        </body>
        </html>
        <?php
    









    
        } else if($type=='inward'){ ?>
        
            <style>
                
            .col-9 {
                display: flex;
                align-items: center;
                justify-content: center; 
                margin-top: 20px; 
            }
            
            .address {
                text-align: left; 
                margin-left: 15px; 
            }
            
            img {
                height: auto;
                width: 10%; 
            }
            
            body {
                margin: 0; 
            }
            
            .table-container {
                display: flex;              
                justify-content: center;   
                align-items: center;        
                height: 100vh;         
            }
            
            table {
                border: 1.5px solid #ccc;
                border-collapse: collapse;
                width: 90%; 
                max-width: 6000px;
            }
            
            th, td {
                padding: 20px;      
                text-align: center;
            }
            
            .org_head {
                font-weight: bold; 
                font-size: 30px;
            }
            
            .bg-light {
                text-align: center;
            }
            .table-header {
                font-size: 50px;
                font-weight: 600; 
            }
            
            </style>
                            
                            
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8" /> 
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
                    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
            </head>
            <body>
            
                <div class="card h-md-100 ecommerce-card-min-width">
                    <div class="card-body d-flex flex-column justify-content-end pt-1 ">
                        <div class="container">     
                            <div class="row">
                                <div class="container" style="background-color:#fff;">
                                    <div class="compl_print">
                                        <div class="zone_boxbor">                                       
                                </div>
                            </div>
                        </div>
                
                
            <br>
            <center><h2 class="org_head"  > Inward Report </h2></center>
                <div class="container-fluid">
                    <div class="box mt-2">
                    <div class="gridtable">
                        <table  class="table table-bordered table-striped flytable" >
                        <thead class="bg-light table-header">
                        <?php
                            $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                            $currentMonth = date('F Y'); 
                        ?>
            
                        <div class="row justify-content-end">
                            <div class="col-md-6 text-end">
                                <h5 style="margin: 0; font-size:18px;">
                                <span style="font-weight: bold;">Month:</span>
                                    <?= date('M - Y', strtotime($month)); ?></h5>
                            </div>
                        </div>
            
                            <tr>
                            <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Vendor</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Start Time</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>End Time</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Number Of Tickets</th> 
                            <th width="15%" style='text-align:center; font-size:18px;'>Net Weight(Tons)</th>                   
                            </tr>
                        </thead>   
                    <tbody>
            <br>
                    
            <?php 
         $servername = "zigmaglobal.in"; 
         $username = "zigmaglobal_new_user";
         $password = "Bq3[1PYLs6q2";
         $dbname = "zigmaglo_erp";
         
         // Create connection
         $conn_zigma = mysqli_connect($servername, $username, $password, $dbname);
         
         // Check connection
         if (!$conn_zigma) {
             die("Connection failed: " . mysqli_connect_error());
         }
         
         $org_status = $_GET['unique_id'];
         $month = $_GET['month'];    
         
         $sql = "SELECT Date ,MIN(STR_TO_DATE(Time, '%h:%i:%s %p')) AS start_time,
    MAX(STR_TO_DATE(Time, '%h:%i:%s %p')) AS end_time,count(TicketNumber) as num_ticket,sum(NetWeight)as netweight,SupplierName as vendor FROM bsf_transaction 
                 WHERE site='BSF Brahmapuram' AND closed='1' AND DATE_FORMAT(date, '%Y-%m')='$month' group by Date";
         
         $result = mysqli_query($conn_zigma, $sql);
        //  print_r($sql);
         if ($result === false) {
             die("Query failed: " . mysqli_error($conn_zigma));
         }
         
         if (mysqli_num_rows($result) == 0) {
            $table_data .= "<tr><td colspan='10' style='text-align:center'>NO DATA FOUND</td></tr>";
        } else {
            $serialNo = 1;
            while ($value = mysqli_fetch_assoc($result)){
                $table_data .= "<tr>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" .$serialNo. "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['Date']) . "</td>";                      
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['vendor']) . "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['start_time']) . "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['end_time']) . "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['num_ticket']) . "</td>"; 
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars(round(round($value['netweight']) / 1000)) . "</td>";


                $table_data .= "</tr>";                 
                $totalWeight += round($value['netweight']/1000); 
                $serialNo++;
            }
        }

        $table_data .= "<tr><td></td><td></td><td></td><td></td><td colspan='2' style='text-align:right; font-size:15; font-weight:bold'>Total</td><td style='text-align:center; font-size:17px;'>" . htmlspecialchars(round($totalWeight)) . "</td></tr>";

        // echo "<table border='1'>";
        echo $table_data;
        echo "</table>";
        
        // Close the connection
        mysqli_close($conn_zigma);
                ?>  
                </tbody>                    
                </div>
                </div>
                </div>
                </div>
                </body>
                </html>
                <?php
            
                } else if($type=='inward-rejects'){ ?>
<!-- ------------------------------------- -->


<style>
                
.col-9 {
    display: flex;
    align-items: center;
    justify-content: center; 
    margin-top: 20px; 
}

.address {
    text-align: left; 
    margin-left: 15px; 
}

img {
    height: auto;
    width: 10%; 
}

body {
    margin: 0; 
}

.table-container {
    display: flex;              
    justify-content: center;   
    align-items: center;        
    height: 100vh;         
}

table {
    border: 1.5px solid #ccc;
    border-collapse: collapse;
    width: 90%; 
    max-width: 6000px;
}

th, td {
    padding: 20px;      
    text-align: center;
}

.org_head {
    font-weight: bold; 
    font-size: 30px;
}

.bg-light {
    text-align: center;
}
.table-header {
    font-size: 50px;
    font-weight: 600; 
}

</style>
                
                
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" /> 
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
        <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
</head>
<body>

    <div class="card h-md-100 ecommerce-card-min-width">
        <div class="card-body d-flex flex-column justify-content-end pt-1 ">
            <div class="container">     
                <div class="row">
                    <div class="container" style="background-color:#fff;">
                        <div class="compl_print">
                            <div class="zone_boxbor">                                       
                    </div>
                </div>
            </div>
    
    
<br>
<center><h2 class="org_head"  > Inward Rejects  Report  </h2></center>
    <div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable" >
            <thead class="bg-light table-header">
            <?php
                $month = isset($_GET['month']) ? $_GET['month'] : date('F'); 
                $currentMonth = date('F Y'); 
            ?>

            <div class="row justify-content-end">
                <div class="col-md-6 text-end">
                    <h5 style="margin: 0; font-size:18px;">
                    <span style="font-weight: bold;">Month:</span>
                        <?= date('M - Y', strtotime($month)); ?></h5>
                </div>
            </div>

                <tr>
                <th width="5%"  style='text-align:center; font-size:18px;'>S.No</th>
                <th width="10%" style='text-align:center; font-size:18px;'>Date</th> 
                <th width="10%" style='text-align:center; font-size:18px;'>Vendor</th> 
                <th width="10%" style='text-align:center; font-size:18px;'>Start Time</th> 
                <th width="10%" style='text-align:center; font-size:18px;'>End Time</th>
                <th width="10%" style='text-align:center; font-size:18px;'>Number Of Tickets</th> 
                <th width="15%" style='text-align:center; font-size:18px;'>Net Weight(Tons)</th>                   
                </tr>
            </thead>   
        <tbody>
<br>
        
<?php 
$servername = "zigmaglobal.in"; 
$username = "zigmaglobal_new_user";
$password = "Bq3[1PYLs6q2";
$dbname = "zigmaglo_erp";

// Create connection
$conn_zigma = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn_zigma) {
 die("Connection failed: " . mysqli_connect_error());
}

$org_status = $_GET['unique_id'];
$month = $_GET['month'];    

$sql = "SELECT Date ,MIN(STR_TO_DATE(Time, '%h:%i:%s %p')) AS start_time,
MAX(STR_TO_DATE(Time, '%h:%i:%s %p')) AS end_time,count(TicketNumber) as num_ticket,sum(NetWeight)as netweight,SupplierName as vendor FROM bsf_reject_transaction 
     WHERE site='BSF Brahmapuram' AND closed='1' AND DATE_FORMAT(date, '%Y-%m')='$month' group by Date";

$result = mysqli_query($conn_zigma, $sql);
//  print_r($sql);
if ($result === false) {
 die("Query failed: " . mysqli_error($conn_zigma));
}

if (mysqli_num_rows($result) == 0) {
$table_data .= "<tr><td colspan='10' style='text-align:center'>NO DATA FOUND</td></tr>";
} else {
$serialNo = 1;
while ($value = mysqli_fetch_assoc($result)){
    $table_data .= "<tr>";
    $table_data .= "<td style='text-align:center; font-size:17px;'>" .$serialNo. "</td>"; 
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['Date']) . "</td>";                      
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['vendor']) . "</td>"; 
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['start_time']) . "</td>"; 
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['end_time']) . "</td>"; 
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars($value['num_ticket']) . "</td>"; 
    $table_data .= "<td style='text-align:center; font-size:17px;'>" . htmlspecialchars(round(round($value['netweight']) / 1000)) . "</td>";

    $table_data .= "</tr>";                 
    $totalWeight += $value['netweight']/1000; 
    $serialNo++;
}
}

$table_data .= "<tr><td></td><td></td><td></td><td></td><td colspan='2' style='text-align:right; font-size:15; font-weight:bold'>Total</td><td style='text-align:center; font-size:17px;'>" . htmlspecialchars(round($totalWeight)) . "</td></tr>";

// echo "<table border='1'>";
echo $table_data;
echo "</table>";

// Close the connection
mysqli_close($conn_zigma);
    ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    </body>
    </html>
    <?php

    }

// ---------------------------------------
            ?>