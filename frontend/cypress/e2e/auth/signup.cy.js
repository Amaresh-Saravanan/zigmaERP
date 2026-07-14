describe('E2E: Signup', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('creates a pending account and redirects to login', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 201,
      body: { status: 1, msg: 'signup_pending', data: { user_name: 'e2enewuser' }, error: '' },
    }).as('signup');

    cy.get('#su_user').type('e2enewuser');
    cy.get('#su_email').type('e2enewuser@example.com');
    cy.get('#su_first').type('E2E');
    cy.get('#su_last').type('User');
    cy.get('#su_pass').type('Str0ng!Pass');
    cy.get('#su_confirm').type('Str0ng!Pass');
    cy.contains('button', 'Sign Up').click();

    cy.wait('@signup');
    cy.get('.swal2-title').should('contain', 'Account created');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/login');
  });

  it('shows an error when the username is already taken', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 400,
      body: { status: 0, msg: 'error', data: null, error: 'This username is already taken.' },
    }).as('signupDuplicate');

    cy.get('#su_user').type('admin');
    cy.get('#su_email').type('admin2@example.com');
    cy.get('#su_first').type('Admin');
    cy.get('#su_last').type('Two');
    cy.get('#su_pass').type('Str0ng!Pass');
    cy.get('#su_confirm').type('Str0ng!Pass');
    cy.contains('button', 'Sign Up').click();

    cy.wait('@signupDuplicate');
    cy.get('.swal2-title').should('contain', 'Signup failed');
    cy.url().should('include', '/signup');
  });

  it('does not submit when the password is too weak', () => {
    cy.get('#su_user').type('weakpassuser');
    cy.get('#su_email').type('weak@example.com');
    cy.get('#su_first').type('Weak');
    cy.get('#su_last').type('Pass');
    cy.get('#su_pass').type('weakpass');
    cy.get('#su_confirm').type('weakpass');
    cy.contains('button', 'Sign Up').click();

    cy.contains('Min 8 characters with uppercase, lowercase, number').should('be.visible');
  });
});
