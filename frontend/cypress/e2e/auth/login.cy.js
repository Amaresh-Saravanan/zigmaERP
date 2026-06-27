describe('E2E: Login User Journey', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs in and lands on dashboard', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.get('#user_name').type(admin.username);
      cy.get('#password').type(admin.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
      cy.contains('Dashboards').should('exist');
    });
  });

  it('shows SweetAlert Incorrect on wrong credentials', () => {
    cy.get('#user_name').type('wronguser');
    cy.get('#password').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.get('.swal2-title').should('contain', 'Incorrect');
    cy.url().should('include', '/login');
  });

  it('submits on Enter key', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.get('#user_name').type(admin.username);
      cy.get('#password').type(`${admin.password}{enter}`);
      cy.url().should('not.include', '/login');
    });
  });

  it('redirects to /password when default password is used', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.get('#user_name').type(admin.username);
      cy.get('#password').type('password');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/password');
    });
  });
});
