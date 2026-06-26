<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$host = "192.168.1.200";
$username = "my_root";
$password = "my@123456";
$databasename = "zigfly_erp";
$current_month = date('Y-m');
$month = isset($_POST['month']) && $_POST['month'] != '' ? $_POST['month'] : $current_month;

$response = [
    'kpi' => [],
    'overall' => [],
    'pit_chart' => [],
    'tray_status' => [],
    'unutilized_trays' => 0
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$databasename", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $table_sub1 = "pit_status";
    $table_sub2 = "egg_process";
    $table_sub3 = "pit_status";
    $table_tray_creation = "tray_creation";

    $columns1 = [
        "sum(feed_qty)  as organic_waste",
        "sum(larvae_qty)  as larvae_qty",
        "sum(qty_rejets) as qty_rejets", 
        "sum(qty_manure_1 + qty_manure_2) as total_qty_manure" ,
        "sum(larvae_qty_in)  as egg_hatching"
    ];
    $columns2 = [" sum(tot_qty) as total_egg_qty"];

    $columns3 = [
        "pc.pit_name",
        "(SELECT SUM(feed_qty) from pit_status where is_delete = 0  AND form_batch_id = recent_batch.recent_batch_id) as total_feed_qty",
        "(SELECT min(entry_date) from pit_status where  org_status= 1 and is_delete = 0  AND form_batch_id = recent_batch.recent_batch_id) as first_entry_date",
        "(SELECT max(entry_date) from pit_status where  org_status= 1 and  is_delete = 0  AND form_batch_id = recent_batch.recent_batch_id) as last_entry_date",
        "(SELECT max(harvest_comp) from pit_status where is_delete = 0 AND form_batch_id = recent_batch.recent_batch_id) as harvest_comp",
        "( SELECT DATEDIFF(CURDATE(), MIN(entry_date)) FROM pit_status WHERE is_delete = 0 AND form_batch_id = recent_batch.recent_batch_id and feed_count=1 )as batch_age",
        "recent_batch.recent_batch_id",
        "(SELECT SUM(larvae_qty_in) from pit_status where is_delete = 0 AND form_batch_id = recent_batch.recent_batch_id) as larvae_qty_in",
        "IF(larvae_data.org_status = 2, DATEDIFF(CURDATE(), larvae_data.larvae_entry_date) + 1, 0) AS days_since_larvae_entry"
    ];

    $join3 = "
        JOIN pit_creation pc ON pc.unique_id = ps.pit_id
        LEFT JOIN (
            SELECT pit_id, MAX(form_batch_id) AS recent_batch_id
            FROM pit_status where is_delete=0
            GROUP BY pit_id
        ) recent_batch ON recent_batch.pit_id = ps.pit_id 
        LEFT JOIN (
            SELECT pit_id, form_batch_id,larvae_qty_in, entry_date AS larvae_entry_date, org_status
            FROM pit_status
            WHERE org_status = 2
        ) larvae_data ON larvae_data.pit_id = ps.pit_id AND larvae_data.form_batch_id = recent_batch.recent_batch_id
    ";
    
    $where3 = " ps.is_delete = 0 and DATE_FORMAT(ps.entry_date,'%Y-%m')='$month' GROUP BY ps.pit_id";
    $where3_overall = " ps.is_delete = 0 GROUP BY ps.pit_id";
    
    $query1 = "SELECT " . implode(", ", $columns1) . " FROM $table_sub1 WHERE is_delete = 0 and DATE_FORMAT(entry_date,'%Y-%m')='$month'";
    $query2 = "SELECT " . implode(", ", $columns2) . " FROM $table_sub2 WHERE is_delete = 0 and DATE_FORMAT(entry_date,'%Y-%m')='$month'";
    $query1_overall = "SELECT " . implode(", ", $columns1) . " FROM $table_sub1 WHERE is_delete = 0 ";
    $query2_overall = "SELECT " . implode(", ", $columns2) . " FROM $table_sub2 WHERE is_delete = 0 ";
    
    $query3 = "SELECT " . implode(", ", $columns3) . " FROM $table_sub3 ps $join3 WHERE $where3";
    $query4 = "SELECT entry_date, SUM(tray_utilized) tray_utilized FROM $table_sub2 WHERE batch_status=0 and is_delete = 0 GROUP BY entry_date";
    $query5 = "SELECT COUNT(unique_id) AS unutilized_trays FROM $table_tray_creation WHERE tray_status = 0 AND is_active = 1 AND is_delete = 0 AND bin_name not LIKE'%TEST%'";

    $stmt1 = $pdo->query($query1);
    $result_values1 = $stmt1->fetch(PDO::FETCH_ASSOC);

    $stmt2 = $pdo->query($query2);
    $result_values2 = $stmt2->fetch(PDO::FETCH_ASSOC);

    $stmt3 = $pdo->query($query3);
    $result_values3 = $stmt3->fetchAll(PDO::FETCH_ASSOC);

    $stmt1_overall = $pdo->query($query1_overall);
    $result_values1_overall = $stmt1_overall->fetch(PDO::FETCH_ASSOC);

    $stmt2_overall = $pdo->query($query2_overall);
    $result_values2_overall = $stmt2_overall->fetch(PDO::FETCH_ASSOC);

    $stmt4 = $pdo->query($query4);
    $result_values4 = $stmt4->fetchAll(PDO::FETCH_ASSOC);

    $stmt5 = $pdo->query($query5);
    $result_values5 = $stmt5->fetch(PDO::FETCH_ASSOC);

    if ($result_values1) {
        $organic_waste = $result_values1["organic_waste"] ?? 0;
        $larvae_qty = ($result_values1["larvae_qty"] ?? 0) / 1000;
        $qty_rejects = ($result_values1["qty_rejets"] ?? 0) / 1000;
        $total_qty_manure = ($result_values1["total_qty_manure"] ?? 0) / 1000; 
        $egg_hatching = $result_values1["egg_hatching"] ?? 0;
    } else {
        $organic_waste = $larvae_qty = $qty_rejects = $total_qty_manure = $egg_hatching = 0;
    }
    $total_egg_qty = $result_values2 ? ($result_values2["total_egg_qty"] ?? 0) : 0;

    $combined_data = [];
    foreach ($result_values3 as $row) {
        $batch_age = (int)$row['batch_age'];
        
        $date1 = !empty($row['first_entry_date']) ? new DateTime($row['first_entry_date']) : new DateTime();
        $date2 = (!empty($row['last_entry_date']) && ($row['harvest_comp'] == '2')) ? new DateTime($row['last_entry_date']) : new DateTime();
        $daysDifference = $date1->diff($date2)->days;

        if (!empty($row['last_entry_date'] == $row['first_entry_date']) && $row['days_since_larvae_entry'] != 0) {
            $batch_age += 1;
        } elseif(($row['harvest_comp'] != '2') && ($row['days_since_larvae_entry'] != 0)){  
            $batch_age = $daysDifference + 1;
        } else {
            $batch_age = 0;
        }

        $combined_data[] = [
            'category' => $row['pit_name'],
            'data' => $batch_age,
            'feed_qty' => (int)$row['total_feed_qty'],
            'batch_id' => $row['recent_batch_id']
        ];
    }

    usort($combined_data, function ($a, $b) {
        return strcmp($b['category'], $a['category']);
    });

    $response['pit_chart'] = [
        'categories' => array_column($combined_data, 'category'),
        'data' => array_column($combined_data, 'data'),
        'feed_qty' => array_column($combined_data, 'feed_qty'),
        'batch_ids' => array_column($combined_data, 'batch_id'),
    ];

    if ($result_values1_overall) {
        $organic_waste_overall = $result_values1_overall["organic_waste"] ?? 0;
        $larvae_qty_overall = ($result_values1_overall["larvae_qty"] ?? 0) / 1000;
        $qty_rejects_overall = ($result_values1_overall["qty_rejets"] ?? 0) / 1000;
        $total_qty_manure_overall = ($result_values1_overall["total_qty_manure"] ?? 0) / 1000; 
        $egg_hatching_overall = $result_values1_overall["egg_hatching"] ?? 0;
    } else {
        $organic_waste_overall = $larvae_qty_overall = $qty_rejects_overall = $total_qty_manure_overall = $egg_hatching_overall = 0;
    }
    $total_egg_qty_overall = $result_values2_overall ? ($result_values2_overall["total_egg_qty"] ?? 0) : 0;

    $tray_status = [];
    $above_five_days = 0;
    for ($i = 0; $i < 5; $i++) {
        $tray_status[$i] = ['tray_age' => $i + 1, 'tray_utilized' => 0];
    }
    if ($result_values4) {
        foreach ($result_values4 as $row) {
            $tray_age = (new DateTime())->diff(new DateTime($row['entry_date']))->days + 1;
            if ($tray_age <= 5) {
                $tray_status[$tray_age - 1]['tray_utilized'] += $row['tray_utilized'];
            } else {
                $above_five_days += $row['tray_utilized'];
            }
        }
    }
    $tray_status[] = ['tray_age' => 'Above 5 Days', 'tray_utilized' => $above_five_days];
    $response['tray_status'] = $tray_status;

    $response['unutilized_trays'] = $result_values5 ? ($result_values5["unutilized_trays"] ?? 0) : 0;

    // External DB connection for Inward
    $servername = "zigmaglobal.in"; 
    $ext_username = "zigmaglobal_new_user";
    $ext_password = "Bq3[1PYLs6q2";
    $dbname = "zigmaglo_erp";
    $conn_zigma = mysqli_connect($servername, $ext_username, $ext_password, $dbname);
    
    $count = $count_overall = $count_rejects_m = $count_rejects_o = 0;

    if ($conn_zigma) {
        $sql = "SELECT SUM(NetWeight) AS count FROM bsf_transaction WHERE site='BSF Brahmapuram' and closed='1' and DATE_FORMAT(date,'%Y-%m')='$month'";
        $sql_rejects = "SELECT SUM(NetWeight) AS count_r FROM bsf_reject_transaction WHERE site='BSF Brahmapuram' and closed='1' and DATE_FORMAT(date,'%Y-%m')='$month'";
        $sql_rejects_o = "SELECT SUM(NetWeight) AS count_o FROM bsf_reject_transaction WHERE site='BSF Brahmapuram' and closed='1'";
        $sql_overall = "SELECT SUM(NetWeight) AS count FROM bsf_transaction WHERE site='BSF Brahmapuram' and closed='1'";
        
        $res = mysqli_query($conn_zigma, $sql);
        if ($res && $r = mysqli_fetch_assoc($res)) $count = $r['count'] / 1000;
        
        $res = mysqli_query($conn_zigma, $sql_overall);
        if ($res && $r = mysqli_fetch_assoc($res)) $count_overall = $r['count'] / 1000;

        $res = mysqli_query($conn_zigma, $sql_rejects);
        if ($res && $r = mysqli_fetch_assoc($res)) $count_rejects_m = $r['count_r'] / 1000;

        $res = mysqli_query($conn_zigma, $sql_rejects_o);
        if ($res && $r = mysqli_fetch_assoc($res)) $count_rejects_o = $r['count_o'] / 1000;
        
        mysqli_close($conn_zigma);
    }

    $response['kpi'] = [
        'inward' => floor($count * 10) / 10,
        'inward_rejects' => floor($count_rejects_m * 10) / 10,
        'organic_waste' => floor($organic_waste * 10) / 10,
        'egg_purchasing' => floor(($total_egg_qty / 1000) * 10) / 10,
        'egg_hatching' => floor($egg_hatching * 10) / 10,
        'larvae_harvested' => floor($larvae_qty * 10) / 10,
        'manure' => floor($total_qty_manure * 10) / 10,
        'processing_rejects' => floor($qty_rejects * 10) / 10
    ];

    $response['overall'] = [
        'inward' => floor($count_overall * 10) / 10,
        'inward_rejects' => floor($count_rejects_o * 10) / 10,
        'organic_waste' => floor($organic_waste_overall * 10) / 10,
        'egg_purchasing' => floor(($total_egg_qty_overall / 1000) * 10) / 10,
        'egg_hatching' => floor($egg_hatching_overall * 10) / 10,
        'larvae_harvested' => floor($larvae_qty_overall * 10) / 10,
        'manure' => floor($total_qty_manure_overall * 10) / 10,
        'processing_rejects' => floor($qty_rejects_overall * 10) / 10
    ];

    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
