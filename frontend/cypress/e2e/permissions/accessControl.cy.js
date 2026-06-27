describe('E2E: Permission-Based Access Control', () => {
  it('hides sidebar items limited user lacks access to', () => {
    cy.fixture('users').then(({ limited }) => {
      cy.login(limited.username, limited.password);
      cy.visit('/');
      // Worker role sees only their screens — no Admin section
      cy.get('#navbar-nav').should('not.contain', 'Admin');
      // Worker role does not see Dashboard (Sidebar.jsx hides it for worker userType)
      cy.get('#navbar-nav').should('not.contain', 'Dashboards');
    });
  });

  it('redirects to home on accessing restricted route directly', () => {
    cy.fixture('users').then(({ limited }) => {
      cy.login(limited.username, limited.password);
      cy.visit('/user/list', { failOnStatusCode: false });
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    });
  });

  it('hides Delete button for users without delete permission', () => {
    cy.fixture('users').then(({ limited }) => {
      cy.login(limited.username, limited.password);
      cy.visit('/item_creation/list');
      cy.get('table tbody tr').first().within(() => {
        cy.get('[data-action="delete"], a[onclick*="delete"]').should('not.exist');
      });
    });
  });
});
