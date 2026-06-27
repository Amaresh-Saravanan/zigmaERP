// ponytail: API-level login — sets PHP session cookie for subsequent requests
Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/folders/login/crud.php',
    form: true,
    body: { action: 'login', user_name: username, password },
  }).then((res) => {
    expect(res.body.msg).to.eq('success_login');
  });
});

Cypress.Commands.add('loginByUI', (username, password) => {
  cy.visit('/login');
  cy.get('#user_name').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});
