describe('E2E A11y: Page-Level WCAG 2.1 AA', () => {
  it('Login page has no WCAG violations', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y(null, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
    });
  });

  it('Item Creation list page has no WCAG violations', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
      cy.visit('/item_creation/list');
      cy.injectAxe();
      cy.checkA11y(null, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
    });
  });

  it('Dashboard has no WCAG violations', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
      cy.visit('/');
      cy.injectAxe();
      cy.checkA11y(null, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
    });
  });

  it('Sidebar navigation has no WCAG violations', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
      cy.visit('/');
      cy.injectAxe();
      cy.checkA11y('#navbar-nav', {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      });
    });
  });
});
