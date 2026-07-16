import React, { useEffect } from 'react';
import './LogsheetList.css';

export default function LogsheetList() {
  // We use dangerouslySetInnerHTML to render the exact static template
  // without risking JSX conversion errors on 900 lines of complex HTML.
  const htmlContent = `

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

`;
  
  return (
    <div className="logsheet-container bg-white">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" rel="stylesheet" />
      <div dangerouslySetInnerHTML={{__html: htmlContent}} />
    </div>
  );
}
