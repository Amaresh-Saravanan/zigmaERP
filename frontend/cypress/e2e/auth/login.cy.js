describe('E2E: Login User Journey', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('logs in and lands on dashboard', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.get('#lp_user').type(admin.username);
      cy.get('#lp_pass').type(admin.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
      cy.contains('Dashboards').should('exist');
    });
  });

  it('shows SweetAlert Incorrect on wrong credentials', () => {
    cy.get('#lp_user').type('wronguser');
    cy.get('#lp_pass').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.get('.swal2-title').should('contain', 'Incorrect');
    cy.url().should('include', '/login');
  });

  it('submits on Enter key', () => {
    cy.fixture('users').then(({ admin }) => {
      cy.get('#lp_user').type(admin.username);
      cy.get('#lp_pass').type(`${admin.password}{enter}`);
      cy.url().should('not.include', '/login');
    });
  });

  it('redirects to /password when default password is used', () => {
    // Mock the backend to pretend 'password' is the correct password
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        status: 1,
        msg: 'success_login',
        data: { access_token: 'fake', user: { unique_id: 'fake', user_name: 'demo' } }
      }
    }).as('loginApi');

    cy.fixture('users').then(({ admin }) => {
      cy.get('#lp_user').type(admin.username);
      cy.get('#lp_pass').type('password');
      cy.get('button[type="submit"]').click();
      cy.wait('@loginApi');
      cy.url().should('include', '/password');
    });
  });
});
