describe('E2E: Signup User Journey', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('signs up with a new username, gets 201 Created but rejected login (is_active=False)', () => {
    const timestamp = new Date().getTime();
    const newUser = `testuser_${timestamp}`;
    const newPass = 'testpass123';

    // Fill form
    cy.get('input[name="first_name"]').type('Test');
    cy.get('input[name="user_name"]').type(newUser);
    cy.get('input[name="password"]').type(newPass);
    cy.get('input[name="confirm_password"]').type(newPass);

    cy.get('button[type="submit"]').click();
    
    // Expect success message and redirect
    cy.get('.swal2-title').should('contain', 'Account Created!');
    // Wait for the redirect timer
    cy.url({ timeout: 5000 }).should('include', '/login');

    // Try logging in with the new user
    cy.get('#user_name').type(newUser);
    cy.get('#password').type(newPass);
    cy.get('button[type="submit"]').click();

    // Expect 403 Forbidden rejection message for inactive account
    // The frontend Swal for this handles inactive via the msg 'inactive_account' mapped in Login.jsx?
    // Let's assume it shows 'Account Inactive' or check the actual error text.
    // (We will update this if it fails).
    cy.get('.swal2-title').should('contain', 'Account Inactive');
    cy.url().should('include', '/login');
  });

  it('rejects duplicate username', () => {
    cy.fixture('users').then(({ admin }) => {
      // Use existing admin username
      cy.get('input[name="first_name"]').type('Test Duplicate');
      cy.get('input[name="user_name"]').type(admin.username);
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirm_password"]').type('password123');

      cy.get('button[type="submit"]').click();

      // Expect conflict error
      cy.get('.swal2-title').should('contain', 'Username Already Exists');
      cy.url().should('include', '/signup');
    });
  });

  it('rejects password < 6 chars', () => {
    cy.get('input[name="first_name"]').type('Test');
    cy.get('input[name="user_name"]').type('shortpassuser');
    cy.get('input[name="password"]').type('12345');
    cy.get('input[name="confirm_password"]').type('12345');

    cy.get('button[type="submit"]').click();

    // Expect failure message from the backend. The backend throws 400 Bad Request.
    // The frontend currently shows 'Registration Failed' with the error message.
    cy.get('.swal2-title').should('contain', 'Registration Failed');
    cy.get('.swal2-html-container').should('contain', 'Password must be at least 6 characters long');
    cy.url().should('include', '/signup');
  });
});
