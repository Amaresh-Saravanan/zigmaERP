describe('E2E: Network Error Recovery', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
    });
  });

  it('shows Error toast when API returns msg:"error"', () => {
    cy.intercept('GET', '**/api/items*', {
      statusCode: 200,
      body: { status: 0, msg: 'error' },
    }).as('failedRequest');

    cy.visit('/item_creation/list');
    cy.wait('@failedRequest');
    cy.get('.swal2-title').should('contain', 'Error Occured');
  });

  it('shows Network Error when server is unreachable', () => {
    cy.intercept('GET', '**/api/items*', {
      forceNetworkError: true
    }).as('networkError');

    cy.visit('/item_creation/list');
    cy.wait('@networkError');
    cy.get('.swal2-title').should('contain', 'Network Error');
  });
});
