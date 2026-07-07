// ponytail: API-level login — sets Django token and user profile in localStorage for subsequent requests
Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { user_name: username, password },
  }).then((res) => {
    expect(res.body.status).to.eq(1);
    window.localStorage.setItem('django_token', res.body.data.access_token);
    
    const u = res.body.data.user;
    const mappedUser = {
      userId: u.unique_id,
      userName: u.user_name,
      userType: u.user_type?.unique_id || '',
      mainScreens: u.main_screens || [],
      screens: u.screens || []
    };
    window.localStorage.setItem('auth_user', JSON.stringify(mappedUser));
  });
});

Cypress.Commands.add('loginByUI', (username, password) => {
  cy.visit('/login');
  cy.get('#lp_user').type(username);
  cy.get('#lp_pass').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});
