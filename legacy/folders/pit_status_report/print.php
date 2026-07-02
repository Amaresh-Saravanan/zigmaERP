<?php

include '../../config/dbconfig.php';
// $pit_id = $_GET['pit_id'];

if(!empty($_GET['unique_id'])){
    $unique_id_qr = $_GET['unique_id'];
    $table_main = "pit_status";

    $columns_list = [          
        "max(form_batch_id) as form_batch_id"         
    ];
    
    $table_details_list = [
        $table_main ,
        $columns_list
    ];
    
    $where_list = "pit_id = '$unique_id_qr' and is_delete=0";
    $result = $pdo->select($table_details_list, $where_list);
    // print_r($result);
        if ($result->status) {
            $res_array = $result->data;
            $table_data = "";
            if (count($res_array) != 0) {            
                foreach ($res_array as $key => $row) {
               
                
                $pit_id_in      = $row["form_batch_id"];
                
    
            }
        } else {
            echo "No results found for the given unique_id.";
        }
    } else {
        echo "Error: " . $sql . "<br>" . mysqli_error($conn);
    }
    
}else{
    $pit_id_in = $_GET['pit_id'];
}
// $pit_id='PIT-01-00001';
$table_main = "pit_status";
$curr_day=date("Y-m-d");


$columns_list = [   
    "min(entry_date)as entry_date",
    "(select entry_date from pit_status where form_batch_id='$pit_id_in' and is_delete=0 and harvest_comp=2 limit 1)as end_date ",
    "pit_id",
    "(SELECT batch_id FROM `pit_status` WHERE `batch_id` IS NOT NULL AND `batch_id` != '' and is_delete=0 and form_batch_id='$pit_id_in' limit 1)as batch_id", 
    "form_batch_id",   
    "sum(larvae_qty_in)as larvae_qty_in",
    "max(harvest_comp)as harvest_comp",
    "sum(feed_qty) as total_feed ",
    "sum(larvae_qty) as total_live_larvea ",
    "sum(qty_rejets) as total_rejects ",
    "sum(qty_manure_1) as total_manure1 ",
    "sum(qty_manure_2) as total_manure2 ",
    "(avg(temp_start + temp_mid + temp_end) / 3) as temperature",
    "avg(humidity_start +humidity_mid+humidity_end) / 3 as humidity"
    
];

$table_details_list = [
    $table_main ,
    $columns_list
];

$where_list = "form_batch_id = '$pit_id_in' and is_delete=0";
$result = $pdo->select($table_details_list, $where_list,$limit, $start ,$order_by);
// print_r($result);
    if ($result->status) {
        $res_array = $result->data;
        $table_data = "";
        if (count($res_array) != 0) {            
            foreach ($res_array as $key => $row) {
            $entry_date    =  disdate($row['entry_date']);
            if(!empty($row['end_date'])){
                $end_date=disdate($row['end_date']);
            }else{
                $end_date="In progress";
            }
            
            $curr_day1    =  disdate($curr_day);

           

            if(!empty($row['end_date'])){

                $date1 = new DateTime($entry_date);
                $date2 = new DateTime($end_date);
                $interval = $date1->diff($date2);
                $age_days = $interval->days;
              
            }else{
                $date1 = new DateTime($entry_date);
                $date2 = new DateTime($curr_day1);
                $interval = $date1->diff($date2);
                $age_days = $interval->days;
            }
           
            $pit_id        =disname(pit_name($row['pit_id'])[0]['pit_name']);
            
            // $batch_id      =disname(batch_name($row['batch_id'])[0]['batch_id']);
            $batch_id      =disname(batch_name($row['batch_id'])[0]['batch_id']);
           
            $pit_batch_id      = $row["form_batch_id"];
            $org_status        = $row["org_status"];
            $tray_no           = $row["tray_no"];
            $larvae_qty_in     = $row["larvae_qty_in"];
            
            $total_feed     = $row["total_feed"];
            if($row["harvest_comp"]=='2'){
                $harvest_comp = "Completed";
            }else{
                $harvest_comp = "Progressing";
            }

            $average_temperature = $row['temperature'];
            $average_humidity    = $row['humidity'];

        }
    } else {
        echo "No results found for the given unique_id.";
    }
} else {
    echo "Error: " . $sql . "<br>" . mysqli_error($conn);
}



?>

<style>
.pit_ow {
    text-align: center;
    
    padding: 10px;
    border-radius: 10px;
    font-weight: 700;
}
.address p {
    font-size: 10px;
    font-weight: 500;
 
}
body { 
    font-family: "Poppins", sans-serif !important;
}
.qr_content {
    border-radius: 20px 20px 0px 0px; 
    background-color: #fff;
}
.head_zigma {
    color: #fff;
    font-weight: 700;
    font-size: 0.7rem;
}
.pit_name {
    font-size: 1.2rem;
    padding: 6px 0px;
    font-weight: 700;
    color: #2caa4f;
    background-color: #eeeeee;
}
.entry_name {
    font-size: 12px;
    font-weight: 500;
}
.bggreen {
    background-color: rgb(102, 102, 102) !important;
}
.compl_print h1 {
    font-weight: 700;
    font-size: 14px;
    margin-bottom: 6px;
    text-decoration: underline;    color: #229843;
}
.compl_print  {
   font-size: 14px;
}
.compl_print span {
    font-weight: 600;
}
.zone_boxbor label {
    margin-bottom: 0px;
    margin-top: 7px;
    font-size: 11.5px;
}
.zone_boxbor span {
    font-size: 11.5px;
}
h2.org_head {
    margin-top: 16px;
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 0px;    color: #229843;
}
table.flytable tr th {
    font-size: 0.6rem!important;
    padding: 3px 6px!important;
    vertical-align: middle;    white-space: nowrap;
}
table.flytable tr td {
    font-size: 0.6rem!important;
    padding: 3px 6px!important;
    vertical-align: middle;    white-space: nowrap;   
}
.zone_boxbor {
    background-color: #f1f1f1;
    padding: 10px;
}
</style>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Print.php</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css" />
    <link href="../css/app.min.css" rel="stylesheet" type="text/css" />
</head>
<body>

    <div class="card h-md-100 ecommerce-card-min-width">
        <div class="card-body d-flex flex-column justify-content-end pt-1 ">
            <div class="container">
                <div class="row mt-2 mb-2">
                   
                    <div class="col-3 text-center mb-0 mt-2">
                        <img src="../zig-fly-logo.png" alt="" height="" width="100%">
                    </div>
                    <div class="col-9">
                        <div class="address">
                            <p class="mb-0"><b>H.O :</b> 178, Indu Nagar, Palayapalayam, Perundurai Road,<br/> Erode - 638 012.</p>
                            <p class="mb-0">0424-222 5157 &nbsp;&nbsp;|&nbsp;&nbsp; connect@zigma.in &nbsp;&nbsp; | &nbsp;&nbsp; www.zigma.in</p>
                            <p class="mb-2">Near Brahmapuram Waste to Energy Plant, Brahmapuram, Kakkanad, Kochi - 682 030.</p>
                        </div>
                    </div>
                   
                  
                </div>
                <div class="row">
                    <div class="container" style="background-color:#fff;">
                        <div class="compl_print">
                            <div class="zone_boxbor">
                                <div class="row">
                                    <div class="col-md-12 text-center">
                                        <h1><strong>PIT STATUS REPORT</strong></h1>
                                    </div>
                                </div>
                                <div class="row">
                                 <div class="col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Number  </b></label>
                                            
                                            <span class="pit_no"><?php echo $pit_id; ?></span>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Batch ID  </b></label>
                                           
                                            <span class=""><?php echo $pit_batch_id; ?></span>
                                        </div>
                                    </div>
</div>
                                <div class="row">
                                    <div class="col-6 re_print">
                                        <div class="">
                                            <label class="col-12"><b>Batch Start Date  </b></label>
                                            
                                            <span class=""><?php echo $entry_date; ?></span>
                                        </div>
                                    </div>

                                    
                                    <div class="col-6 re_print">
                                        <div class="">
                                        <label class="col-12"><b>Total Oraganic Feed (Tons) </b></label>
                                        <span class="bd_la"><?php echo $total_feed; ?></span>
                                        </div>
                                    </div>
                                   

                                    </div>  

                                    <div class="row">
                                    <div class="col-6 re_print">
                                        <div class="">
                                            <label class="col-12"><b>Batch End Date </b></label>
                                           
                                            <span class=""><?php echo $end_date;?></span>
                                        </div>
                                    </div>

                                    <div class="col-6">
                                        <div class="">
                                        <label class="col-12"><b>Baby Larvea Added in Pit  </b></label>
                                           
                                            <span class="bd_la"><?php echo  $larvae_qty_in," (Kg)"; ?></span>

                                        </div>
                                    </div>
                                
                            
</div>
                        <div class="row">
                            
                        <div class="col-6">
                                        <div class="">
                                        <label class="col-12"><b>Egg Batch ID </b></label>
                                         
                                            <span class=""><?php echo $batch_id; ?></span>

                                        </div>
                                    </div>
                                    
                                

                                    
                                <div class="col-6">
                                        <div class="">
                                        <label class="col-12"><b>Pit Ageing Days  </b></label>
                                           
                                            <span class="col-12"><?php echo $age_days+1 ." days"; ?></span>
                                        </div>
                                    </div>
                                </div>

                                    
                       
                    </div>
                </div>
            </div>
    


<!-- --------------------------------------------------------start -->
<h2 class="org_head"> Organic Waste  Details </h2>
    <div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable"  width="100%" style="display:block;overflow:scroll;">
                <thead class="bg-light" style="font-weight: 600;">
                    <tr>
                    <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th>  
                        <th width="10%">Feeding Count</th>                                               
                       
                        <th width="10%">Feeding <br>Qty(Tons)</th>
                       
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>
               
            
      <tbody>
    <?php
    // $pit_id = $_GET['pit_id'];
    $start = 0;
    $table_main = "pit_status"; 
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "feed_count",        
        "feed_qty",      
        "notes",  
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    $order_by = "entry_date ASC";
    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status=1";
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
                
                if(!empty($value['feed_qty'])){
                    $value['feed_qty']=$value['feed_qty'];
                }else{
                    $value['feed_qty']= "-";
                }    
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
                            $feed_count = "sixth Feeding";
                            break;
                    default:
                        $feed_count = "-"; // or another default value
                        break;
                }
                
                $table_data .= "<tr>";
                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                $table_data .= "<td >" . $value['entry_date'] . "</td>";
                $table_data .= "<td style='text-align:left'>" . $feed_count . "</td>";              
                $table_data .= "<td style='text-align:left'>" . $value['feed_qty'] . "</td>";  
               $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";
                   
                    $table_data .= "</tr>";
                    
                }   
                $Total .= "<td colspan='3' style='text-align:right;font-weight:bold'>" . "Total" . "</td>";    
                $Total .= "<td style='text-align:left;font-weight:bold'>" . $row['total_feed'] . "</td>"; 
                $Total .= "<td style='text-align:left;font-weight:bold'>" .  $row['total_live_larvea1'] . "</td>";
        }
    }    
    echo $table_data;
    
    echo $Total;
    ?>
     
</tbody>
                              
                    </div>
                </div>
            </div>

<!-- ---------------------------------------------------------- -->

<!-- Tippi -->

<div class="container-fluid">
    <div class="box mt-2">
        <div class="gridtable">
            <table class="table table-bordered table-striped flytable" width="100%" style="display:block;overflow:scroll;">
                <thead class="bg-light" style="font-weight: 600;">
                    <h2 class="org_head"> Tippi Details </h2>
                    <tr>
                        <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th>                                               
                        <th width="10%">Egg Batch ID</th>                        
                        <th width="10%">Tippi Qty <br> (kg)</th>                      
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $start = 0;
                    $table_main = "pit_status"; 
                    $columns_list = [
                        "@a:=@a+1 s_no", 
                        "entry_date",
                        "batch_id",       
                        "tippi_qty", 
                        "notes"
                    ];

                    $table_details_list = [
                        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
                        $columns_list
                    ];
                    
                    $order_by = "entry_date ASC";
                    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status=7";
                    $result = $pdo->select($table_details_list, $where_list, $limit, $start, $order_by);
                    
                    $total_tippi_qty = 0;  // Initialize sum variable
                    $table_data = "";
                    
                    if ($result->status) {
                        $res_array = $result->data;

                        if (count($res_array) == 0) {            
                            $table_data .= "<tr>";
                            $table_data .= "<td colspan=10 style='text-align:center'>NO DATA FOUND</td>";
                            $table_data .= "</tr>";
                        } else {            
                            foreach ($res_array as $key => $value) {
                                $value['entry_date'] = disdate($value['entry_date']);
                                $batch_id_display = !empty($value['batch_id']) ? disname(batch_name($value['batch_id'])[0]['batch_id']) : '-';
                                
                                // Summing up total Tippi Qty
                                $total_tippi_qty += (float) $value['tippi_qty'];

                                $table_data .= "<tr>";
                                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                                $table_data .= "<td>" . $value['entry_date'] . "</td>";
                                $table_data .= "<td>" . $batch_id_display . "</td>";                
                                $table_data .= "<td style='text-align:left'>" . $value['tippi_qty'] . "</td>";
                                $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";        
                                $table_data .= "</tr>";
                            } 

                            // Display total sum row
                            $table_data .= "<tr style='font-weight:bold; background:#f8f9fa;'>";
                            $table_data .= "<td colspan='3' style='text-align:right;'>Total</td>";    
                            $table_data .= "<td style='text-align:left;'>" . number_format($total_tippi_qty) . "</td>";      
                            $table_data .= "<td></td>";  // Empty column for remarks
                            $table_data .= "</tr>";
                        }
                    }    
                    
                    echo $table_data;
                    ?>
                </tbody>
            </table>
        </div>
    </div>
</div>



            <!-- --------------------------------------------- -->


    <div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable"  width="100%" style="display:block;overflow:scroll;">
                <thead class="bg-light" style="font-weight: 600;">
                <h2 class="org_head"> Baby Larvae  Details </h2>
                    <tr>
                    <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th> 
                                                                       
                        <th width="10%">Egg Batch id</th>                        
                       <th width="10%">Baby Larvae <br> (k.g)</th>
                         <th width="10%">Tray Count</th>                       
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>
               
            
      <tbody>
    <?php
    // $pit_id = $_GET['pit_id'];
    $start = 0;
    $table_main = "pit_status"; 
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "batch_id" ,       
        "larvae_qty_in", 
        // "count(tray_no)as tray_count",
        "''as tray_count",
        "notes",
        "tray_no"
        
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    $order_by = "entry_date ASC";
    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status=2";
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

                if ($value['tray_no']) {
                    $exp_site = explode(',', $value['tray_no']);
                    $unique_bin_names = []; 
                    foreach ($exp_site as $tray_no) {
                        $bin_name = tray($tray_no);            
                        if ($bin_name) {
                            $tray_id = $bin_name[0]['bin_name'];
                            if (!in_array($tray_id, $unique_bin_names)) {
                                $unique_bin_names[] = $tray_id;
                            }
                        }
                    }
                    
                    $value['tray_count'] = count($unique_bin_names);
                }

                $value['entry_date'] = disdate($value['entry_date']);

                // $batch_id      =disname(batch_name($value['batch_id'])[0]['batch_id']);

                $value['batch_id']          = $value['batch_id1'] ? disname(batch_name($value['batch_id1'])[0]['batch_id']) : '-';
                                        
                $table_data .= "<tr>";
                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                $table_data .= "<td >" . $value['entry_date'] . "</td>";
                $table_data .= "<td >" . $batch_id. "</td>";                
                $table_data .= "<td style='text-align:left'>" . $value['larvae_qty_in'] . "</td>";
                $table_data .= "<td style='text-align:left; font-size:17px;'>" . $value['tray_count'] . "</td>";
                $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";        
                $table_data .= "</tr>";
                    
                }      
        }
    }    
    echo $table_data;
    
    // echo $Total;
    ?>
     
</tbody>
                              
                    </div>
                </div>
            </div>


<div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable"  width="100%" style="display:block;overflow:scroll;">
                <thead class="bg-light" style="font-weight: 600;">
                <h2 class="org_head"> Areation  Details </h2>
                    <tr>
                    <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th>                                                
                        <th width="10%">Method</th>                       
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>
               
            
      <tbody>
    <?php
    // $pit_id = $_GET['pit_id'];
    $start = 0;
    $table_main = "pit_status"; 
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "notes",
        "method"             
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    $order_by = "entry_date ASC";
    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status= 3";
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
                
               
                switch ($value['method']) {
                    case 1:
                        $methode = "Machine";
                        break;
                    case 2:
                        $methode = "Manual";
                        break;
                    default:
                        $methode = "-"; // or another default value
                        break;
                }             
                $table_data .= "<tr>";
                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                $table_data .= "<td >" . $value['entry_date'] . "</td>";
                $table_data .= "<td >" .  $methode. "</td>";                               
                $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";        
                    $table_data .= "</tr>";       
                }
        }
    }    
    echo $table_data;
    
    // echo $Total;
    ?>
     
</tbody>
                              
                    </div>
                </div>
            </div>
<!-- ---------------------------------------------------------- -->
<div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <table  class="table table-bordered table-striped flytable"  width="100%" style="display:block;overflow:scroll;" >
                <thead class="bg-light" style="font-weight: 600;">
                <h2 class="org_head"> Measurement Details</h2>
                    <tr>
                    <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th> 
                        <th width="10%">Temperature(°c)<br>start / mid / end </th>
                        <th width="10%">Humidity(%)<br>start / mid / end </th>                                                                    
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>    
      <tbody>
    <?php
    // $pit_id = $_GET['pit_id'];
    $start = 0;
    $table_main = "pit_status"; 
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",
        "temp_start ",
        "temp_mid",
        "temp_end",
        "humidity_start",
        "humidity_mid",
        "humidity_end",
        "notes"       
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    $order_by = "entry_date ASC";
    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status=4";
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
                $table_data .= "<tr>";
                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                $table_data .= "<td >" . $value['entry_date'] . "</td>";
                $table_data .= "<td >" . $value['temp_start'] . " / " . $value['temp_mid'] ." / " . $value['temp_end']. "</td>";
                $table_data .= "<td style='text-wrap: nowrap;'>" . $value['humidity_start'] .  " / " . $value['humidity_mid'] ." / " . $value['humidity_end']."</td>";                                 
                $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";        
                    $table_data .= "</tr>"; 
        }}
        $Totalm .= "<td colspan='2' style='text-align:right;font-weight:bold'>" . "Average" . "</td>";    
        $Totalm .= "<td style='text-align:left;font-weight:bold'>" . round($row['temperature'] ,1) . "</td>";
        $Totalm .= "<td style='text-align:left;font-weight:bold'>" . round($row['humidity'],1) . "</td>";
        $Totalm .= "<td style='text-align:left;font-weight:bold'>" . $row['humidity1'] . "</td>";
    }    
    echo $table_data;
    
    echo $Totalm;
    ?>
     
</tbody>
                              
                    </div>
                </div>
            </div>

<div class="container-fluid">
        <div class="box mt-2">
        <div class="gridtable">
            <div class="table-responsive">
            <table  class="table table-bordered table-striped flytable" width="100%" style="display:block;overflow:scroll;" >
                <thead class="bg-light" style="font-weight: 600;">
                <h2 class="org_head mb-1"> Harvest  Details </h2>
                    <tr>
                    <th width="5%">S.No</th>
                        <th width="10%">Entry Date</th>     
                        <th width="10%">Live Larvea <br>(kg)</th>               
                        <th width="10%">Manure(-4mm)<br>(kg)</th>          
                        <th width="10%">Manure(+4mm)<br>(kg)</th> 
                        <th width="10%">Rejects<br>(kg)</th>                        
                        <th width="15%">Remarks</th>
                    </tr>
                </thead>
               
            
      <tbody>
    <?php
    // $pit_id = $_GET['pit_id'];
    $start = 0;
    $table_main = "pit_status"; 
    $columns_list = [
        "@a:=@a+1 s_no", 
        "entry_date",        
        "larvae_qty",
        "qty_manure_1",
        "qty_manure_2",
        "qty_rejets",      
        "notes",        
    ];

    $table_details_list = [
        $table_main . ", (SELECT @a:= " . $start . ") AS a ",
        $columns_list
    ];
    $order_by = "entry_date ASC";
    $where_list = "form_batch_id ='$pit_id_in' and is_delete=0 and org_status in(5,6)";
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
                $table_data .= "<tr>";
                $table_data .= "<td>" . $value['s_no'] . "</td>"; 
                $table_data .= "<td >" . $value['entry_date'] . "</td>";  
                $table_data .= "<td >" . $value['larvae_qty'] . "</td>"; 
             
                $table_data .= "<td >" . $value['qty_manure_1'] . "</td>";  
                $table_data .= "<td >" . $value['qty_manure_2'] . "</td>"; 
                $table_data .= "<td >" . $value['qty_rejets'] . "</td>";            
                $table_data .= "<td style='text-align:left'>" . $value['notes'] . "</td>";        
                    $table_data .= "</tr>"; 
                    
            }
              
                          
        } $Total1 .= "<td colspan='2' style='text-align:right;font-weight:bold'>" . "Total" . "</td>";    
        $Total1 .= "<td style='text-align:left;font-weight:bold'>" . $row['total_live_larvea'] . "</td>"; 
        $Total1 .= "<td style='text-align:left;font-weight:bold'>" . $row['total_manure1'] . "</td>";
        $Total1 .= "<td style='text-align:left;font-weight:bold'>" . $row['total_manure2'] . "</td>";
        $Total1 .= "<td style='text-align:left;font-weight:bold'>" . $row['total_rejects'] . "</td>";
        $Total1 .= "<td style='text-align:left;font-weight:bold'>" . $row['humidity1'] . "</td>";
        
        
    }    
    echo $table_data;
    echo $Total1;
    
    ?>
     
</tbody>
</table>
                              
                    </div>
                </div>
            </div>
            </div>
            </div>
        </div>
    </div>
</div>
</div>

    </div>
   

</body>
</html>