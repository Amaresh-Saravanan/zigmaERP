describe('E2E: Network Error Recovery', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
    });
  });

  it('shows Error toast when crud.php returns msg:"error"', () => {
    cy.intercept('POST', '**/folders/item_creation/crud.php', {
      statusCode: 200,
      body: { status: 0, msg: 'error' },
    }).as('failedRequest');

    cy.visit('/item_creation/list');
    cy.wait('@failedRequest');
    cy.get('.swal2-title').should('contain', 'Error');
  });

  it('redirects to /login when PHP returns HTML (session expired)', () => {
    cy.intercept('POST', '**/folders/item_creation/crud.php', {
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: '<html><body>Login form</body></html>',
    });

    cy.visit('/item_creation/list');
    cy.url().should('include', '/login');
  });
});
