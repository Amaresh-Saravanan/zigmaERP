<div class="row g-3 mb-3">
  <div class="col-md-12 col-xxl-12">
    <div class="card h-md-100 ecommerce-card-min-width">
      <div class="card-header pt-3 pb-2">
        <div class="row flex-between-end">
          <div class="col-auto align-self-center">
            <h5 class="d-flex align-items-center">User Type List</h5>
          </div>
          <div class="col-auto ms-auto">
            <?php echo btn_add($btn_add); ?>
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column justify-content-end">
        <!-- <div id="tableExample2" data-list='{"valueNames":["name","email","age"],"page":5,"pagination":true}'> -->
        <div class="table-responsive scrollbar">
          <table class="table table-bordered table-striped flytable" id="main_screen_datatable">
            <thead class="bg-200">
              <tr>
                <th>#</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody class="list">
            </tbody>
          </table>
          <!-- </div> -->
        </div>
      </div>
    </div>
  </div>
</div>