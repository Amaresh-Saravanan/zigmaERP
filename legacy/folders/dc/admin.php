<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Delivery Challan – BSF/LAR/24-25/063</title>

  <style>
    body {
      background: #e8ede8;
      font-size: 13px;
    }
    .challan-wrapper {
      background: #fff;
      max-width: 820px;
      margin: 32px auto;
      padding: 36px 44px 44px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      border-radius: 4px;
      position: relative;
    }
    .challan-wrapper::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: linear-gradient(90deg, #1a7a3c, #4caf73);
      border-radius: 4px 4px 0 0;
    }

    /* Logo */
    .logo-img {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }
    .company-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .company-address {
      font-size: 11.5px;
      color: #555;
      line-height: 1.75;
    }
    .gstin-badge {
      display: inline-block;
      font-size: 10.5px;
      font-weight: 600;
      background: #eaf5ee;
      color: #1a7a3c;
      border: 1px solid #b2dfc0;
      border-radius: 3px;
      padding: 2px 8px;
      letter-spacing: 0.04em;
      margin-top: 4px;
    }

    /* Title */
    .doc-title {
      font-size: 24px;
      font-weight: 800;
      color: #1a7a3c;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-align: right;
    }
    .doc-challan-no {
      font-size: 12px;
      color: #666;
      text-align: right;
      margin-top: 2px;
    }

    /* Meta bar */
    .meta-bar {
      border-top: 2px solid #1a7a3c;
      border-bottom: 2px solid #1a7a3c;
      padding: 7px 0;
      margin-top: 18px;
    }
    .meta-label {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1a7a3c;
    }
    .meta-value {
      font-size: 12px;
      font-weight: 600;
      color: #222;
      margin-top: 1px;
    }

    /* Section titles */
    .section-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #888;
      margin-bottom: 4px;
    }

    /* Bill To */
    .bill-name {
      font-size: 13.5px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .bill-addr {
      font-size: 11.5px;
      color: #555;
      line-height: 1.75;
    }

    /* Challan detail table */
    .detail-table td {
      padding: 2px 6px;
      font-size: 11.5px;
      color: #333;
      vertical-align: top;
    }
    .detail-table td:first-child {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
      padding-right: 14px;
    }

    /* Items table */
    .items-table {
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 8px rgba(26,122,60,0.10);
    }
    .items-table thead tr th {
      background: linear-gradient(135deg, #1a7a3c 0%, #25a355 100%);
      color: #fff !important;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      padding: 11px 12px;
      border: none !important;
      border-right: 1px solid rgba(255,255,255,0.15) !important;
      white-space: nowrap;
      vertical-align: middle;
    }
    .items-table thead tr th:last-child {
      border-right: none !important;
    }
    .items-table thead tr th .th-icon {
      display: block;
      font-size: 14px;
      margin-bottom: 2px;
      opacity: 0.85;
    }
    .items-table tbody td {
      font-size: 12px;
      padding: 10px 12px;
      border: none;
      border-bottom: 1px solid #e2ede7;
      border-right: 1px solid #e8f0eb;
      color: #333;
      vertical-align: middle;
    }
    .items-table tbody td:last-child {
      border-right: none;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .items-table tbody tr:nth-child(odd) {
      background-color: #ffffff;
    }
    .items-table tbody tr:nth-child(even) {
      background-color: #f4faf7;
    }
    .items-table tbody tr:hover {
      background-color: #e8f5ee !important;
      transition: background 0.15s;
    }
    .items-table tfoot tr td {
      background: #f0f8f4;
      font-size: 11.5px;
      font-weight: 600;
      color: #1a7a3c;
      padding: 9px 12px;
      border-top: 2px solid #1a7a3c;
      border-bottom: none;
      border-right: 1px solid #e2ede7;
    }
    .items-table tfoot tr td:last-child {
      border-right: none;
    }

    /* Totals */
    .totals-table td {
      padding: 4px 8px;
      font-size: 12px;
      color: #444;
    }
    .totals-table td:first-child {
      text-align: right;
      color: #666;
      padding-right: 20px;
    }
    .totals-table td:last-child {
      text-align: right;
      font-weight: 600;
      min-width: 90px;
    }
    .totals-table tr.grand-total td {
      font-size: 14px;
      font-weight: 700;
      color: #1a7a3c;
      border-top: 2px solid #1a7a3c;
      padding-top: 8px;
    }

    /* Amount words */
    .amount-words-box {
      background: #eaf5ee;
      border: 1px solid #b2dfc0;
      border-radius: 4px;
      padding: 9px 14px;
      font-size: 12px;
      color: #1a7a3c;
    }
    .amount-words-box span {
      font-weight: 600;
    }

    /* Footer */
    .sig-line {
      border-top: 1.5px solid #aaa;
      width: 180px;
      margin: 0 auto 5px;
    }
    .bottom-rule {
      border: none;
      border-top: 2px solid #1a7a3c;
      margin-top: 32px;
    }

    @media print {
      body { background: white; }
      .challan-wrapper { box-shadow: none; margin: 0; border-radius: 0; }
    }
  </style>
</head>
<body>
<div class="challan-wrapper">

  <!-- ── TOP HEADER ── -->
  <div class="row align-items-start mb-0">
    <!-- Logo + Company -->
    <div class="col-7 d-flex align-items-start gap-3">
<img src="https://zigma.in/img/logo.png"  class="logo-img" alt="Zigma Logo">

 <div>
        <div class="company-name">Zigma Global Environ Solutions Pvt. Ltd.</div>
        <div class="company-address mt-1">
          Door No. 178, Indu Nagar, Perundurai Road,<br>
          Palayapalayam, Erode – 638 011<br>
          B.O: 1/7A, Brahmapuram Waste Treatment Plant,<br>
          Brahmapuram, Kakkanad, Ernakulam, Kerala – 682 030
        </div>
        <div class="gstin-badge">GSTIN: 32AAACZ8255D1ZF</div>
      </div>
    </div>
    <!-- Title -->
    <div class="col-5">
      <div class="doc-title">Delivery Challan</div>
      <div class="doc-challan-no">Delivery Challan# &nbsp;–&nbsp; BSF/LAR/24-25/063</div>
    </div>
  </div>

  <!-- ── META BAR ── -->
  <div class="meta-bar row mt-3">
    <div class="col-4">
      <div class="meta-label">Delivery Challan #</div>
      <div class="meta-value">BSF/LAR/24-25/063</div>
    </div>
    <div class="col-4 text-center">
      <div class="meta-label">PO Date</div>
      <div class="meta-value">26/11/2024</div>
    </div>
    <div class="col-4 text-end">
      <div class="meta-label">Dispatch Date</div>
      <div class="meta-value">29/03/2025</div>
    </div>
  </div>

  <!-- ── BILL TO + CHALLAN DETAILS ── -->
  <div class="row mt-4">
    <div class="col-6">
      <div class="section-label">Bill To</div>
      <div class="bill-name">VAM Associate Pvt. Ltd.</div>
      <div class="bill-addr mt-1">
        Muvattupuzha, Ernakulam DK,<br>
        Kerala – 686 670, India<br>
        Phone: +91 94473 30213<br>
        Place of Supply: Kerala (32)
      </div>
    </div>
    <div class="col-6">
      <table class="detail-table w-100">
        <tr><td>Challan Date #</td><td>29/03/2025</td></tr>
        <tr><td>PO Ref #</td><td>PO 02</td></tr>
        <tr><td>Challan Type</td><td>Supply of Goods</td></tr>
        <tr><td>GSTIN</td><td>32AAACZ8255D1ZF</td></tr>
      </table>
    </div>
  </div>

  <!-- ── ITEMS TABLE ── -->
  <div class="table-responsive mt-4">
    <table class="table items-table mb-0">
      <thead>
        <tr>
          <th class="text-center" style="width:46px">
            <span class="th-icon">#</span>
            SR No.
          </th>
          <th>
          
            Item Description
          </th>
          <th class="text-center">
        
            HSN/SAC
          </th>
          <th class="text-center">
        
            Qty
          </th>
          <th class="text-center">
          
            Unit
          </th>
          <th class="text-end">
        
            Rate (₹)
          </th>
          <th class="text-end">
      
            Amount (₹)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center fw-semibold">1</td>
          <td><strong>-4mm Manure</strong></td>
          <td class="text-center">
            <span style="background:#eaf5ee;color:#1a7a3c;font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid #b2dfc0;">3101</span>
          </td>
          <td class="text-center fw-semibold">840</td>
          <td class="text-center">
            <span style="background:#f0f0f0;color:#555;font-size:10.5px;padding:2px 8px;border-radius:20px;">Kgs</span>
          </td>
          <td class="text-end">4.00</td>
          <td class="text-end fw-bold" style="color:#1a7a3c;">3,360.00</td>
        </tr>
        <tr style="height:28px"><td colspan="7" style="border-right:none;"></td></tr>
        <tr style="height:28px"><td colspan="7" style="border-right:none;"></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="text-end" style="color:#666;font-weight:500;">Sub Total</td>
          <td colspan="2" class="text-end fw-bold" style="color:#1a7a3c;">₹ 3,360.00</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ── TOTALS ── -->
  <div class="row mt-3">
    <div class="col-6 d-flex align-items-end">
      <!-- Amount in words -->
      <div class="amount-words-box w-100">
        <span class="text-muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;">Amount in Words</span><br>
        <span>Three Thousand Three Hundred and Sixty Rupees Only</span>
      </div>
    </div>
    <div class="col-6">
      <table class="totals-table w-100">
        <tr>
          <td>Sub Total:</td>
          <td>3,360.00</td>
        </tr>
        <tr>
          <td>Total Tax:</td>
          <td>0.00</td>
        </tr>
        <tr>
          <td>Rounded Off:</td>
          <td>0.00</td>
        </tr>
        <tr class="grand-total">
          <td>Grand Total:</td>
          <td>₹ 3,360.00</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- ── NOTES ── -->
  <div class="mt-4" style="font-size:12px; color:#555;">
    <strong style="color:#333;">Notes:</strong>
    <div class="mt-1" style="min-height:32px;"></div>
  </div>

  <!-- ── SIGNATURE ── -->
  <div class="row mt-4">
    <div class="col-12 d-flex justify-content-end">
      <div class="text-center">
        <div style="height:44px;"></div>
        <div class="sig-line"></div>
        <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#555;">Authorised Signatory</div>
        <div style="font-size:11px;color:#333;margin-top:2px;">Zigma Global Environ Solutions Pvt. Ltd.</div>
      </div>
    </div>
  </div>

  <hr class="bottom-rule">

</div>


</body>
</html>