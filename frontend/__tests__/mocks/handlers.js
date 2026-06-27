import { http, HttpResponse } from 'msw';

export const handlers = [
  // Login endpoint
  http.post('*/folders/login/crud.php', async ({ request }) => {
    const body = await request.formData();
    const action = body.get('action');
    
    if (action === 'login') {
      const userName = body.get('user_name');
      const password = body.get('password');
      
      if (userName === 'testuser' && password === 'password123') {
        return HttpResponse.json({
          status: 1,
          data: {
            unique_id: 'uid-admin',
            user_name: 'testuser',
            user_type_unique_id: '5f97fc3257f2525529',
            main_screens: ['ms_inventory', 'ms_process', 'ms_admin'],
            screens: ['item_create', 'item_edit', 'item_delete', 'tray_view', 'user_create']
          },
          error: 0,
          msg: 'success_login'
        });
      }
      
      return HttpResponse.json({
        status: 0,
        data: 1,
        error: 0,
        msg: 'incorrect'
      });
    }
  }),

  // Item Creation CRUD
  http.post('*/folders/item_creation/crud.php', async ({ request }) => {
    const body = await request.formData();
    const action = body.get('action');
    
    switch (action) {
      case 'datatable':
        return HttpResponse.json({
          draw: 1,
          recordsTotal: 3,
          recordsFiltered: 3,
          data: [
            [1, 'IT-001', 'Item A', 'Kg', '<span class="badge bg-success">Active</span>', 'uid-1'],
            [2, 'IT-002', 'Item B', 'Kg', '<span class="badge bg-success">Active</span>', 'uid-2'],
            [3, 'IT-003', 'Item C', 'Kg', '<span class="badge bg-danger">Inactive</span>', 'uid-3'],
          ]
        });
      case 'createupdate':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'create' });
      case 'delete':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'success_delete' });
      default:
        return HttpResponse.json({ status: 0, data: '', error: 'Unknown action', msg: '' });
    }
  }),

  // Item Creation Form (HTML response)
  http.get('*/folders/item_creation/form.php', () => {
    return HttpResponse.text(`
      <form>
        <select name="unit" id="unit">
          <option value="uid-kg">Kg</option>
          <option value="uid-g">Gram</option>
          <option value="uid-l">Liter</option>
        </select>
        <select name="active_status" id="active_status">
            <option value="1">Active</option>
            <option value="0">Inactive</option>
        </select>
      </form>
    `);
  }),

  // Tray Creation CRUD
  http.post('*/folders/tray_creation/crud.php', async ({ request }) => {
    const body = await request.formData();
    const action = body.get('action');
    
    switch (action) {
      case 'datatable':
        return HttpResponse.json({
          draw: 1,
          recordsTotal: 2,
          recordsFiltered: 2,
          data: [
            [1, 'TR-001', 'Tray A', 'Type 1', 1, 'uid-tray-1'],
            [2, 'TR-002', 'Tray B', 'Type 2', 1, 'uid-tray-2'],
          ]
        });
      case 'createupdate':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'create' });
      case 'delete':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'success_delete' });
      default:
        return HttpResponse.json({ status: 0, data: '', error: 'Unknown action', msg: '' });
    }
  }),

  // User CRUD
  http.post('*/folders/user/crud.php', async ({ request }) => {
    const body = await request.formData();
    const action = body.get('action');
    
    switch (action) {
      case 'datatable':
        return HttpResponse.json({
          draw: 1,
          recordsTotal: 2,
          recordsFiltered: 2,
          data: [
            [1, 'Admin User', 'admin', 'Admin', 1, 'uid-user-1'],
            [2, 'Limited User', 'limited', 'Worker', 1, 'uid-user-2'],
          ]
        });
      case 'createupdate':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'create' });
      case 'delete':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'success_delete' });
      default:
        return HttpResponse.json({ status: 0, data: '', error: 'Unknown action', msg: '' });
    }
  }),
];
