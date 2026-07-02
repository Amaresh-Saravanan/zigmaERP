<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet">
<style>

:root {
    --primary-color: #6366f1;
    /* Indigo */
    --primary-light: #818cf8;
    --primary-dark: #4f46e5;
    --secondary-color: #ec4899;
    /* Pink gradient accent */
    --accent-color: #10b981;
    /* Emerald for success */
    --warning-color: #f59e0b;
    /* Amber */
    --bg-main: #f3f4f6;
    --card-bg: rgba(255, 255, 255, 0.85);
    --text-dark: #1e293b;
    --text-muted: #64748b;
    --border-color: rgba(226, 232, 240, 0.8);
    --glass-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    --glass-border: 1px solid rgba(255, 255, 255, 0.5);
}

body {
    background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
    background-attachment: fixed;
    color: var(--text-dark);
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
}

/* Background decorative blobs */
.bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    z-index: -1;
    opacity: 0.5;
    animation: float 10s infinite ease-in-out;
}

.blob-1 {
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: rgba(236, 72, 153, 0.2);
}

.blob-2 {
    bottom: -150px;
    left: -100px;
    width: 500px;
    height: 500px;
    background: rgba(99, 102, 241, 0.2);
    animation-delay: -5s;
}

@keyframes float {
    0% {
        transform: translateY(0) scale(1);
    }

    50% {
        transform: translateY(30px) scale(1.05);
    }

    100% {
        transform: translateY(0) scale(1);
    }
}

/* App Header */
.app-header {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: var(--glass-border);
    padding: 15px 30px;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.brand-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.brand-logo i {
    font-size: 22px;
    color: var(--primary-color);
    -webkit-text-fill-color: initial;
}

/* Page Header */
.page-header {
    padding: 25px 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.page-title {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.page-subtitle {
    color: var(--text-muted);
    font-size: 14px;
    margin-top: 5px;
}

/* Cards */
.card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    border: var(--glass-border);
    border-radius: 16px;
    box-shadow: var(--glass-shadow);
    margin-bottom: 24px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-header {
    background: rgba(255, 255, 255, 0.4);
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    padding: 16px 20px;
    font-weight: 700;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 16px 16px 0 0 !important;
}

.card-body {
    padding: 20px;
}

/* Stat Grid */
.stat-box {
    padding: 16px;
    border-right: 1px dashed var(--border-color);
    border-bottom: 1px dashed var(--border-color);
    position: relative;
}

.stat-box:nth-child(3n) {
    border-right: none;
}

.stat-box.no-bottom-border {
    border-bottom: none;
}

.stat-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.stat-value {
    font-size: 22px;
    font-weight: 800;
    color: var(--text-dark);
}

.stat-value.highlight {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Info Groups */
.info-group {
    background: rgba(248, 250, 252, 0.5);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid rgba(255, 255, 255, 0.6);
}

.info-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 2px;
}

.info-value {
    font-size: 14px;
    color: var(--text-dark);
    font-weight: 600;
}

/* Tables */
.table {
    margin-bottom: 0;
    color: var(--text-dark);
}

.table th {
    background: rgba(248, 250, 252, 0.7);
    border-bottom: 1px solid var(--border-color);
    border-top: none;
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 12px 16px;
}

.table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    vertical-align: middle;
    font-size: 13px;
    font-weight: 500;
}

/* Badges & Buttons */
.badge-soft {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.2));
    color: var(--primary-dark);
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 30px;
    font-size: 12px;
}

.badge-step {
    background: var(--primary-color);
    color: white;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
}

.btn {
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    border: none;
    color: white;
}

.btn-print {
    background: linear-gradient(135deg, #10b981, #059669);
    /* Beautiful Emerald Green */
    border: none;
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-print:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    color: white;
}

/* Sections */
.section-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-dark);
    margin: 30px 0 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title::before {
    content: '';
    display: block;
    width: 4px;
    height: 20px;
    background: linear-gradient(to bottom, var(--primary-color), var(--secondary-color));
    border-radius: 10px;
}

.bg-light-gray {
    background: rgba(248, 250, 252, 0.5) !important;
}

.border-color {
    border-color: var(--border-color) !important;
}

/* 
===========================================
PRINT STYLES FOR PERFECT A4 PDF/PAPER EXPORT 
===========================================
*/
@media print {
    @page {
        size: A4 portrait;
        margin: 10mm;
    }

    body {
        background: #ffffff !important;
        font-size: 10pt !important;
        color: #000 !important;
    }

    .bg-blob,
    .app-header,
    .btn,
    .d-print-none {
        display: none !important;
    }

    .container-fluid {
        padding: 0 !important;
        max-width: 100% !important;
    }

    .page-header {
        padding: 0 0 15px 0 !important;
        border-bottom: 2px solid #000 !important;
        margin-bottom: 15px;
    }

    .page-title {
        font-size: 18pt !important;
        color: #000 !important;
    }

    .card {
        background: transparent !important;
        border: 1px solid #ddd !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        margin-bottom: 15px !important;
        page-break-inside: avoid;
    }

    .card-header {
        background: #f5f5f5 !important;
        color: #000 !important;
        border-bottom: 1px solid #ddd !important;
        padding: 8px 12px !important;
        font-size: 11pt !important;
        border-radius: 0 !important;
    }

    .card-body {
        padding: 10px !important;
    }

    .info-group {
        border: none !important;
        background: transparent !important;
        padding: 0 0 5px 0 !important;
        margin-bottom: 5px !important;
    }

    .info-label {
        font-size: 9pt !important;
        color: #555 !important;
    }

    .info-value {
        font-size: 10pt !important;
        color: #000 !important;
    }

    .stat-box {
        padding: 8px !important;
        border-color: #eee !important;
    }

    .stat-label {
        font-size: 8pt !important;
        color: #555 !important;
    }

    .stat-value {
        font-size: 14pt !important;
        color: #000 !important;
        -webkit-text-fill-color: #000 !important;
        background: none !important;
    }

    .table {
        border-collapse: collapse !important;
        width: 100% !important;
    }

    .table th,
    .table td {
        border: 1px solid #ddd !important;
        padding: 6px 8px !important;
        font-size: 9pt !important;
        color: #000 !important;
        background: transparent !important;
    }

    .table th {
        background: #f8f9fa !important;
        -webkit-print-color-adjust: exact;
        font-weight: bold !important;
    }

    .section-title {
        font-size: 14pt !important;
        color: #000 !important;
        margin: 20px 0 10px !important;
        page-break-after: avoid;
    }

    .section-title::before {
        background: #000 !important;
        width: 3px !important;
        height: 15px !important;
    }

    .badge-step {
        background: #eee !important;
        color: #000 !important;
        border: 1px solid #ccc !important;
    }

    /* Force background colors to show in print (Chrome/Edge) */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
</style>
<body>

    <!-- Background Decor -->
    <div class="bg-blob blob-1"></div>
    <div class="bg-blob blob-2"></div>


    <div class="container-fluid px-4 pb-5" style="max-width: 1400px; position: relative; z-index: 10;">

        <!-- Page Header with Print Button -->
        <div class="page-header d-flex flex-wrap gap-3">
            <div>
                <h1 class="page-title">Daily Operations Report</h1>
                <p class="page-subtitle">Complete daily log for plant operations, production, and resources.</p>
            </div>
            <!--  <div class="d-flex gap-2">
                <button class="btn btn-print shadow-sm" onclick="window.print()">
                    <i class="fa-solid fa-print fs-5"></i> Print Entire Report
                </button>
                <button class="btn btn-primary shadow-sm d-print-none">
                    <i class="fa-solid fa-cloud-arrow-up"></i> Save Draft
                </button>
            </div>-->
        </div>

        <!-- Section 1: Top Metrics -->
        <div class="row g-4 mb-4" style="page-break-inside: avoid;">
            <!-- General Info -->
            <div class="col-xl-4 col-lg-5">
                <div class="card h-100 mb-0">
                    <div class="card-header">
                        <i class="fa-regular fa-id-badge text-primary" style="font-size: 18px;"></i>
                        <span>Shift Details</span>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-6">
                                <div class="info-group">
                                    <div class="info-label"><i class="fa-regular fa-clock me-1"></i> Shift</div>
                                    <div class="info-value">Night Shift</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="info-group">
                                    <div class="info-label"><i class="fa-solid fa-hourglass-half me-1"></i> Duration
                                    </div>
                                    <div class="info-value">12 hrs</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="info-group mb-0">
                                    <div class="info-label"><i class="fa-solid fa-droplet text-info me-1"></i> Moisture
                                    </div>
                                    <div class="info-value text-muted">Not Set</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="info-group mb-0">
                                    <div class="info-label"><i class="fa-solid fa-seedling text-success me-1"></i> Feed
                                        Mat.</div>
                                    <div class="info-value text-muted">Awaiting</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="col-xl-8 col-lg-7">
                <div class="card h-100 mb-0">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fa-solid fa-chart-pie text-secondary" style="font-size: 18px;"></i>
                            <span>Performance Board</span>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="row g-0 h-100 align-content-center">
                            <div class="col-md-4 col-6 stat-box text-center">
                                <div class="stat-label">Plant Runtime</div>
                                <div class="stat-value highlight justify-content-center">12.00<span
                                        class="fs-6 fw-normal text-muted">h</span></div>
                            </div>
                            <div class="col-md-4 col-6 stat-box text-center">
                                <div class="stat-label">Processed</div>
                                <div class="stat-value justify-content-center">0.00<span
                                        class="fs-6 fw-normal text-muted">T</span></div>
                            </div>
                            <div class="col-md-4 col-6 stat-box text-center">
                                <div class="stat-label" style="color:var(--warning-color);">Rejects</div>
                                <div class="stat-value justify-content-center" style="color:var(--warning-color);">
                                    0.00<span class="fs-6 fw-normal">T</span></div>
                            </div>
                            <div class="col-md-4 col-6 stat-box no-bottom-border text-center">
                                <div class="stat-label">Old Materials</div>
                                <div class="stat-value justify-content-center">0.00<span
                                        class="fs-6 fw-normal text-muted">T</span></div>
                            </div>
                            <div class="col-md-4 col-6 stat-box no-bottom-border text-center">
                                <div class="stat-label">Inward</div>
                                <div class="stat-value justify-content-center">0.00<span
                                        class="fs-6 fw-normal text-muted">T</span></div>
                            </div>
                            <div class="col-md-4 col-6 stat-box no-bottom-border text-center">
                                <div class="stat-label">Tons / Hour</div>
                                <div class="stat-value justify-content-center text-success">0.00</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 2: Equipment & Disposal -->
        <div class="row g-4 mb-4" style="page-break-inside: avoid;">
            <div class="col-lg-7">
                <div class="card h-100 mb-0">
                    <div class="card-header">
                        <i class="fa-solid fa-truck text-muted"></i> Equipment & Diesel Log
                    </div>
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>Vehicle Reg.</th>
                                    <th>Work Nature</th>
                                    <th>Runtime</th>
                                    <th class="text-end">Issued(L)</th>
                                    <th class="text-end">Cons.(L)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="fw-bold"><i class="fa-solid fa-tractor me-2 text-muted"></i>JCB-KL 04
                                        S1415</td>
                                    <td>Running</td>
                                    <td>0:00:00</td>
                                    <td class="text-end fw-bold">0.00</td>
                                    <td class="text-end fw-bold text-danger">0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-body bg-light-gray border-top mt-auto py-2">
                        <div class="d-flex justify-content-around">
                            <div class="text-center">
                                <div class="stat-label mb-0">Diesel In</div>
                                <div class="fs-5 fw-bold text-success">0.00 L</div>
                            </div>
                            <div class="text-center">
                                <div class="stat-label mb-0">Diesel Out</div>
                                <div class="fs-5 fw-bold text-danger">0.00 L</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-5">
                <div class="card h-100 mb-0">
                    <div class="card-header">
                        <i class="fa-solid fa-boxes-packing text-muted"></i> Disposal Queue
                    </div>
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>Material Type</th>
                                    <th class="text-end">Qty (MT)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="fw-bold">Manure (-4mm) <span class="d-block fw-normal text-muted"
                                            style="font-size: 11px;">Unassigned</span></td>
                                    <td class="text-end fs-5 fw-bold text-dark align-middle">0.00</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">Manure (+4mm) <span class="d-block fw-normal text-muted"
                                            style="font-size: 11px;">Unassigned</span></td>
                                    <td class="text-end fs-5 fw-bold text-dark align-middle">0.00</td>
                                </tr>
                                <tr>
                                    <td class="fw-bold">Live/Dry Larvae <span class="d-block fw-normal text-muted"
                                            style="font-size: 11px;">Combined Total</span></td>
                                    <td class="text-end fs-5 fw-bold text-dark align-middle">0.00</td>
                                </tr>
                            </tbody>
                            <tfoot class="border-top" style="background: rgba(0,0,0,0.02);">
                                <tr>
                                    <td class="py-2 text-muted fw-bold text-uppercase" style="font-size: 12px;">Total
                                        Load</td>
                                    <td class="text-end py-2 fs-5 fw-bold highlight">0.00 MT</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section 3: Operations Pipeline (No accordion, fully visible for print) -->
        <div class="section-title mt-5">Operations Pipeline</div>

        <!-- Stage 1 -->
        <div class="card mb-4" style="page-break-inside: avoid;">
            <div class="card-header border-bottom">
                <div class="badge-step me-2">01</div> Hatching & Stock Details
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th width="25%">Section</th>
                            <th width="20%">Batch ID</th>
                            <th class="text-end">Recv. Qty (g)</th>
                            <th class="text-end">Open Batch</th>
                            <th class="text-end">Close Batch</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="fw-bold">Egg Hatching</td>
                            <td class="text-muted">-</td>
                            <td class="text-end fw-bold">0.00</td>
                            <td class="text-end text-muted">-</td>
                            <td class="text-end text-muted">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Stage 2 -->
        <div class="card mb-4" style="page-break-inside: avoid;">
            <div class="card-header border-bottom">
                <div class="badge-step me-2" style="background:var(--secondary-color);">02</div> Waste Addition &
                Deployment
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th width="20%">Pit No</th>
                            <th class="text-end">Waste Added (Tons)</th>
                            <th class="text-end">Baby Larvae Deployed</th>
                            <th class="text-end">Admixtures (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="fw-bold">PT-01</td>
                            <td class="text-end fw-bold">0.00</td>
                            <td class="text-end fw-bold text-success">-</td>
                            <td class="text-end fw-bold text-muted">0.00</td>
                        </tr>
                        <tr>
                            <td class="fw-bold">PT-02</td>
                            <td class="text-end fw-bold">0.00</td>
                            <td class="text-end fw-bold text-success">-</td>
                            <td class="text-end fw-bold text-muted">0.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Stage 3 -->
        <div class="card mb-4" style="page-break-inside: avoid;">
            <div class="card-header border-bottom">
                <div class="badge-step me-2" style="background:var(--accent-color);">03</div> Harvesting & Screening
                Output
            </div>
            <div class="table-responsive">
                <table class="table text-center">
                    <thead>
                        <tr>
                            <th class="text-start">Pit Source</th>
                            <th>Collection (kg)</th>
                            <th class="border-start">Screening (-4mm)</th>
                            <th>Post Processing Rejects</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-start fw-bold">PT-01</td>
                            <td class="fw-medium text-muted">0.00</td>
                            <td class="border-start fw-bold text-dark fs-5">0.00</td>
                            <td class="fw-bold text-danger">0.00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Stage 4 -->
        <div class="card mb-4" style="page-break-inside: avoid;">
            <div class="card-header border-bottom">
                <div class="badge-step me-2" style="background:#f59e0b;">04</div> Live Larvae Drying & Culling
            </div>
            <div class="card-body p-0">
                <div class="row g-0">
                    <div class="col-md-7 border-end border-color p-3">
                        <h6 class="fw-bold text-muted text-uppercase mb-3 px-2" style="font-size: 12px;"><i
                                class="fa-solid fa-fire text-danger me-1"></i> Culling Stats (LPG)</h6>
                        <table class="table table-borderless table-sm mb-0">
                            <thead>
                                <tr class="text-muted" style="font-size: 11px;">
                                    <th>Opening</th>
                                    <th>Closing</th>
                                    <th class="text-end">Consumed (kg)</th>
                                    <th class="text-end">Output (kg)</th>
                                    <th class="text-end">Loss %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="fw-bold">0.00</td>
                                    <td class="fw-bold">0.00</td>
                                    <td class="text-end fw-bold text-danger">0.00</td>
                                    <td class="text-end fs-5 fw-bold">0.00</td>
                                    <td class="text-end fw-bold text-muted">0%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="col-md-5 p-3">
                        <h6 class="fw-bold text-muted text-uppercase mb-3 px-2" style="font-size: 12px;"><i
                                class="fa-solid fa-sun text-warning me-1"></i> Drying Stats</h6>
                        <div class="d-flex justify-content-between align-items-center px-2 mb-2">
                            <span class="text-muted" style="font-size: 13px;">Machine Op. Hrs</span>
                            <span class="fw-bold">0.00</span>
                        </div>
                        <div
                            class="d-flex justify-content-between align-items-center px-2 mt-3 pt-2 border-top border-color">
                            <span class="fw-bold text-success">Dried Output</span>
                            <span class="fs-4 fw-bold text-success">0.00 <span class="fs-6 fw-normal">kg</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-title mt-5">Utilities & Resources</div>

        <div class="row g-4 mb-4" style="page-break-inside: avoid;">
            <!-- Resource Planning summary -->
            <div class="col-lg-5">
                <div class="card h-100 mb-0">
                    <div class="card-header"><i class="fa-solid fa-users-gear text-primary"></i> Resource Planning</div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="stat-label">Filter Location</div>
                            <div class="fw-bold">Filter 1</div>
                        </div>
                        <table class="table table-sm mt-3">
                            <tbody>
                                <tr>
                                    <td class="text-muted border-0 ps-0">Flip Flow Machine Staff</td>
                                    <td class="fw-bold text-end border-0 pe-0">6</td>
                                </tr>
                                <tr>
                                    <td class="text-muted border-0 ps-0">Other Areas</td>
                                    <td class="fw-bold text-end border-0 pe-0">1</td>
                                </tr>
                            </tbody>
                            <tfoot class="border-top border-color">
                                <tr>
                                    <td class="fw-bold text-primary py-2 ps-0">TOTAL SHIFT STAFF</td>
                                    <td class="fs-4 fw-bold text-primary text-end py-2 pe-0">7</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Power Grid -->
            <div class="col-lg-7">
                <div class="card h-100 mb-0">
                    <div class="card-header"><i class="fa-solid fa-bolt text-warning"></i> Grid & Generator Log</div>
                    <div class="card-body p-0">
                        <div class="row g-0 h-100">
                            <div
                                class="col-6 border-end border-color p-3 text-center d-flex flex-column justify-content-center">
                                <h6 class="fw-bold text-muted mb-3">EB POWER (KWH)</h6>
                                <div class="d-flex justify-content-between mb-1 px-3 text-start"><span
                                        class="text-muted">Op:</span> <span class="fw-bold">0.00</span></div>
                                <div class="d-flex justify-content-between mb-1 px-3 text-start"><span
                                        class="text-muted">Cl:</span> <span class="fw-bold">0.00</span></div>
                                <div class="mt-2 pt-2 border-top border-color">
                                    <div class="fs-3 fw-bold highlight">0.00</div>
                                </div>
                            </div>
                            <div class="col-6 p-3 text-center d-flex flex-column justify-content-center">
                                <h6 class="fw-bold text-muted mb-3">GENSET (KWH)</h6>
                                <div class="d-flex justify-content-between mb-1 px-3 text-start"><span
                                        class="text-muted">Op:</span> <span class="fw-bold">0.00</span></div>
                                <div class="d-flex justify-content-between mb-1 px-3 text-start"><span
                                        class="text-muted">Cl:</span> <span class="fw-bold">0.00</span></div>
                                <div class="mt-2 pt-2 border-top border-color">
                                    <div class="fs-3 fw-bold text-dark">0.00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shredder details -->
            <div class="col-12">
                <div class="card mb-0">
                    <div class="table-responsive">
                        <table class="table mb-0 text-center">
                            <thead>
                                <tr>
                                    <th class="text-start">Equipment (Shredders)</th>
                                    <th>Opening</th>
                                    <th>Closing</th>
                                    <th>Run Hrs</th>
                                    <th class="bg-light-gray">Total KWH</th>
                                    <th class="bg-light-gray">KWH/Tons</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-start fw-bold">Shredder 1</td>
                                    <td>0.00</td>
                                    <td>0.00</td>
                                    <td>0.00</td>
                                    <td class="fw-bold bg-light-gray">0.00</td>
                                    <td class="fw-bold text-muted bg-light-gray">0.00</td>
                                </tr>
                                <tr>
                                    <td class="text-start fw-bold">Shredder 2</td>
                                    <td>0.00</td>
                                    <td>0.00</td>
                                    <td>0.00</td>
                                    <td class="fw-bold bg-light-gray">0.00</td>
                                    <td class="fw-bold text-muted bg-light-gray">0.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    </div>

