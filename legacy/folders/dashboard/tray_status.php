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

$data = $_GET['data'];
if($data =='day1'){ 
?>

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

    .bold{
        font-size: 33px;
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
    <center><h2 class="bold"> Day 1 Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
    
                        <tr>
                            <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                            <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                            <th width="10%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                            <th width="10%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                            <th width="8%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                        </tr>
                    </thead>   
                <tbody>
    <br>
        <?php
        $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
        // $start = 0;
        $start      = $_POST['start'];
        $date = date('Y-m-d', strtotime('-0 days'));
        $columns_list = [    
            "@a:=@a+1 s_no",
            "eps.entry_date",
            "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
            "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
            "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
            "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
            "eps.tot_qty",  
        ];
    
        $table_details_list = [
            $table_main,
            $columns_list
        ];
        $order_by = "";
        // $where_list = "eps.is_delete=0 and epa.is_delete=0 group by batch_id";
        $where_list = "eps.is_delete=0 AND epa.is_delete=0 AND  eps.entry_date = '$date' GROUP BY batch_id";
        $result = $pdo->select($table_details_list, $where_list, $order_by);
        // print_r($result);
        $s_no = 1;
        if ($result->status) {
            $res_array = $result->data;
            $s_no = $start + 1;
            $table_data = "";
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {
                    $value['entry_date'] = disdate($value['entry_date']);
                    
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                    $s_no++;
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                    $table_data .= "</tr>";                 
                    } 
                    // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                }
            }    
            echo $table_data;
            // echo $Total;
            
        ?>  
    </tbody>                    
    </div>
    </div>
    </div>
    </div>
    
    </body>
    </html>



<?php

} elseif($data =='day2'){ 
    ?>
    
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
    
        .bold{
            font-size: 33px;
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
        <center><h2 class="bold"> Day 2 Report </h2></center>
            <div class="container-fluid">
                <div class="box mt-2">
                <div class="gridtable">
                    <table  class="table table-bordered table-striped flytable" >
                    <thead class="bg-light table-header">
        
                            <tr>
                                <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                                <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                                <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                                <th width="25%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                                <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                                <th width="10%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                                <th width="8%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                            </tr>
                        </thead>   
                    <tbody>
        <br>
            <?php
            $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
            $start      = $_POST['start'];
            $date = date('Y-m-d', strtotime('-1 days'));
            $columns_list = [    
                "eps.entry_date",
                "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
                "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
                "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
                "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
                "eps.tot_qty",  
            ];
        
            $table_details_list = [
                $table_main,
                $columns_list
            ];
            $order_by = "";
            $where_list = "eps.is_delete=0 AND epa.is_delete=0 AND  eps.entry_date = '$date' GROUP BY batch_id";
            $result = $pdo->select($table_details_list, $where_list, $order_by);
            // print_r($result);
            
            $s_no = 1;
            if ($result->status) {
            $res_array = $result->data;
            $s_no = $start + 1;
            $table_data = "";
                if (count($res_array) == 0) {            
                    $table_data .= "<tr>";
                    $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                    $table_data .= "</tr>";
                } else {            
                    foreach ($res_array as $key => $value) {
                    
                        $value['entry_date'] = disdate($value['entry_date']);
                        
                        $table_data .= "<tr>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                        $s_no++;
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                        $table_data .= "</tr>";                 
                        } 
                        // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                    }
                }    
                echo $table_data;
                // echo $Total;
                
            ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        
        </body>
        </html>
    
    
    
    <?php
    
    } elseif($data =='day3'){ 
        ?>
        
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
        
            .bold{
                font-size: 33px;
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
            <center><h2 class="bold"> Day 3 Report </h2></center>
                <div class="container-fluid">
                    <div class="box mt-2">
                    <div class="gridtable">
                        <table  class="table table-bordered table-striped flytable" >
                        <thead class="bg-light table-header">
            
                                <tr>
                                    <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                                    <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                                    <th width="20%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                                    <th width="8%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                                </tr>
                            </thead>   
                        <tbody>
            <br>
                <?php
                $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
                $start      = $_POST['start'];
                $date = date('Y-m-d', strtotime('-2 days'));
                $columns_list = [    
                    "eps.id",
                    "eps.entry_date",
                    "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
                    "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
                    "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
                    "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
                    "eps.tot_qty",  
                ];
            
                $table_details_list = [
                    $table_main,
                    $columns_list
                ];
                $order_by = "";
                $where_list = "eps.is_delete=0 AND epa.is_delete=0 AND eps.entry_date = '$date' GROUP BY batch_id";
                $result = $pdo->select($table_details_list, $where_list, $order_by);
                // print_r($result);

                $s_no = 1;
            if ($result->status) {
                $res_array = $result->data;
                $s_no = $start + 1;
                $table_data = "";
                if (count($res_array) == 0) {            
                    $table_data .= "<tr>";
                    $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                    $table_data .= "</tr>";
                } else {            
                    foreach ($res_array as $key => $value) {
                  
                    $value['entry_date'] = disdate($value['entry_date']);
                    $table_data .= "<tr>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                    $s_no++;
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                    $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                    $table_data .= "</tr>";                 
                    } 
                    // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                }
            }    
            echo $table_data;
                    // echo $Total;
                    
            ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        
        </body>
        </html>
    
    
    
    <?php
    
    } elseif($data =='day4'){ 
        ?>
        
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
        
            .bold{
                font-size: 33px;
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
            <center><h2 class="bold"> Day 4 Report </h2></center>
                <div class="container-fluid">
                    <div class="box mt-2">
                    <div class="gridtable">
                        <table  class="table table-bordered table-striped flytable" >
                        <thead class="bg-light table-header">
            
                                <tr>
                                    <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                                    <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                                    <th width="20%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                                    <th width="8%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                                </tr>
                            </thead>   
                        <tbody>
            <br>
                <?php
                $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
                $start      = $_POST['start'];
                $date = date('Y-m-d', strtotime('-3 days'));
                $columns_list = [    
                    "eps.id",
                    "eps.entry_date",
                    "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
                    "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
                    "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
                    "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
                    "eps.tot_qty",  
                ];
            
                $table_details_list = [
                    $table_main,
                    $columns_list
                ];
                $order_by = "";
                $where_list = "eps.is_delete=0 AND epa.is_delete=0 AND eps.entry_date = '$date' GROUP BY batch_id";
                $result = $pdo->select($table_details_list, $where_list, $order_by);
                // print_r($result);

                $s_no = 1;
                if ($result->status) {
                    $res_array = $result->data;
                    $s_no = $start + 1;
                    $table_data = "";
                    if (count($res_array) == 0) {            
                        $table_data .= "<tr>";
                        $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                        $table_data .= "</tr>";
                    } else {            
                        foreach ($res_array as $key => $value) {
                  
                        $value['entry_date'] = disdate($value['entry_date']);
                        $table_data .= "<tr>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                        $s_no++;
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                        $table_data .= "</tr>";                 
                        } 
                    // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                }
            }    
            echo $table_data;
                    // echo $Total;
                    
            ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        
        </body>
        </html>
    
    
    
    <?php
    
    } elseif($data =='day5'){ 
        ?>
        
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
        
            .bold{
                font-size: 33px;
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
            <center><h2 class="bold"> Day 5 Report </h2></center>
                <div class="container-fluid">
                    <div class="box mt-2">
                    <div class="gridtable">
                        <table  class="table table-bordered table-striped flytable" >
                        <thead class="bg-light table-header">
            
                                <tr>
                                    <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                                    <th width="10%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                                    <th width="20%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                                    <th width="8%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                                </tr>
                            </thead>   
                        <tbody>
            <br>
                <?php
                $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
                $start      = $_POST['start'];
                $date = date('Y-m-d', strtotime('-4 days'));
                $columns_list = [    
                    "eps.entry_date",
                    "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
                    "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
                    "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
                    "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
                    "eps.tot_qty",  
                ];
            
                $table_details_list = [
                    $table_main,
                    $columns_list
                ];
                $order_by = "";
                $where_list = "eps.is_delete=0 AND epa.is_delete=0 AND eps.entry_date = '$date' GROUP BY batch_id";
                $result = $pdo->select($table_details_list, $where_list, $order_by);
                // print_r($result);

                $s_no = 1;
                if ($result->status) {
                    $res_array = $result->data;
                    $s_no = $start + 1;
                    $table_data = "";
                    if (count($res_array) == 0) {            
                        $table_data .= "<tr>";
                        $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                        $table_data .= "</tr>";
                    } else {            
                        foreach ($res_array as $key => $value) {
                  
                        $value['entry_date'] = disdate($value['entry_date']);
                        $table_data .= "<tr>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                        $s_no++;
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                        $table_data .= "</tr>";                 
                        } 
                    // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                }
            }    
            echo $table_data;
                    // echo $Total;
                    
            ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        
        </body>
        </html>
    
    
    
    <?php
    
    } elseif($data =='above5days'){ 
        ?>
        
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
        
            .bold{
                font-size: 33px;
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
            <center><h2 class="bold"> Above 5 Days Report </h2></center>
                <div class="container-fluid">
                    <div class="box mt-2">
                    <div class="gridtable">
                        <table  class="table table-bordered table-striped flytable" >
                        <thead class="bg-light table-header">
            
                                <tr>
                                    <th width="3%" style='text-align:center; font-size:18px;'>S No</th>
                                    <th width="8%" style='text-align:center; font-size:18px;'>Entry Date</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Batch Id</th>  
                                    <th width="25%" style='text-align:center; font-size:18px;'>Tray Unique Id</th> 
                                    <th width="10%" style='text-align:center; font-size:18px;'>Item Name</th> 
                                    <th width="8%" style='text-align:center; font-size:18px;'>Item Qty</th>                                                                  
                                    <th width="5%" style='text-align:center; font-size:18px;'>Total Qty</th>                     
                                </tr>
                            </thead>   
                        <tbody>
            <br>
                <?php
                $table_main = "egg_process_addon epa join egg_process_sublist eps on epa.screen_unique_id = eps.screen_unique_id";
                $start      = $_POST['start'];
                $start_date = date('Y-m-d', strtotime('-5 days'));

                $columns_list = [    
                    "eps.entry_date",
                    "(select batch_id from material_received where material_received.unique_id = eps.batch_id) as batch_id",
                    "GROUP_CONCAT(DISTINCT(select bin_name from tray_creation where tray_creation.unique_id = eps.tray_unique_id) SEPARATOR ', ') as tray_unique_id",
                    "GROUP_CONCAT(DISTINCT(select item_name from item_creation where item_creation.unique_id = epa.item_name) SEPARATOR ', ') as item_name",            
                    "GROUP_CONCAT(DISTINCT(epa.item_qty )SEPARATOR ', ') as item_qty",
                    "eps.tot_qty",  
                    "eps.tray_status"
                ];
            
                $table_details_list = [
                    $table_main,
                    $columns_list
                ];
                $order_by = "";
                $where_list = "eps.is_delete=0 AND epa.is_delete=0 and eps.tray_status=0 AND eps.entry_date <= '$start_date' GROUP BY batch_id ";

                $result = $pdo->select($table_details_list, $where_list, $order_by);
                // print_r($result);

                $s_no = 1;
                if ($result->status) {
                    $res_array = $result->data;
                    $s_no = $start + 1;
                    $table_data = "";
                    if (count($res_array) == 0) {            
                        $table_data .= "<tr>";
                        $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                        $table_data .= "</tr>";
                    } else {            
                        foreach ($res_array as $key => $value) {
                  
                        $value['entry_date'] = disdate($value['entry_date']);
                        $table_data .= "<tr>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                        $s_no++;
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['entry_date'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['batch_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tray_unique_id'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_name'] . "</td>";
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['item_qty'] . "</td>"; 
                        $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['tot_qty'] . "</td>";          
                        $table_data .= "</tr>";                 
                        } 
                    // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
                }
            }    
            echo $table_data;
                    // echo $Total;
                    
            ?>  
        </tbody>                    
        </div>
        </div>
        </div>
        </div>
        
        </body>
        </html>
    
    
    
    <?php
    
    } elseif($data =='unutilized-trays'){ 
    ?>
        
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

    .bold{
        font-size: 33px;
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
    <center><h2 class="bold"> Unutilized Trays Report </h2></center>
        <div class="container-fluid">
            <div class="box mt-2">
            <div class="gridtable">
                <table  class="table table-bordered table-striped flytable" >
                <thead class="bg-light table-header">
    
                        <tr>
                            <th width="5%" style='text-align:center; font-size:18px;'>S No</th>
                            <th width="25%" style='text-align:center; font-size:18px;'>Tray Name</th> 
                        </tr>
                    </thead>   
                <tbody>
    <br>
        <?php
        $table_main = "tray_creation";
        $start      = $_POST['start'];

        $columns_list = [    
            "bin_name",
        ];
    
        $table_details_list = [
            $table_main,
            $columns_list
        ];
        $order_by = "";
        $where_list = "is_delete=0 and tray_status=0    AND bin_name NOT LIKE '%TEST%'";

        $result = $pdo->select($table_details_list, $where_list, $order_by);
        // print_r($result);

        $s_no = 1;
        if ($result->status) {
            $res_array = $result->data;
            $s_no = $start + 1;
            $table_data = "";
            if (count($res_array) == 0) {            
                $table_data .= "<tr>";
                $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                $table_data .= "</tr>";
            } else {            
                foreach ($res_array as $key => $value) {

                $table_data .= "<tr>";
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $s_no . "</td>";
                $s_no++;
                // if($value['bin_name'] == "TEST"){
                //     $value['bin_name'] = $value['bin_name'];
                // } else {
                //     $value['bin_name'] = "";
                // }

                // if (strpos($value['bin_name'], "TEST") === 0) {  
                //     $value['bin_name'] = ""; 
                // } else {
                    // $value['bin_name'] = $value['bin_name']; 
                // }
                
                $table_data .= "<td style='text-align:center; font-size:17px;'>" . $value['bin_name'] . "</td>";           
                $table_data .= "</tr>";                 
                } 
            // $Total .= "<td colspan='5' style='text-align:right; font-size:15; font-weight:bold'>" . "Total" . "</td>";    
        }
    }    
    echo $table_data;
            // echo $Total;
            
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

?>