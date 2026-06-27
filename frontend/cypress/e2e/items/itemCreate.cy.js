describe('E2E: Item Creation', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
    });
    cy.visit('/item_creation/list');
  });

  it('creates a new item end-to-end', () => {
    cy.contains('button', 'New').click();
    cy.get('#item_name').type('New Test Item');
    cy.get('#unit').select(1); // select first unit option
    cy.get('#active_status').select('Active');
    cy.contains('button', 'Save').click();
    cy.get('.swal2-title').should('contain', 'Successfully Saved');
    cy.contains('New Test Item').should('exist');
  });

  it('shows Already Exist warning on duplicate item name', () => {
    cy.contains('button', 'New').click();
    cy.get('#item_name').type('Item A');
    cy.contains('button', 'Save').click();
    cy.get('.swal2-title').should('contain', 'Already Exist');
  });

  it('does not save when required fields are empty', () => {
    cy.contains('button', 'New').click();
    cy.contains('button', 'Save').click();
    // Browser validation prevents submit — no swal with "Successfully Saved"
    cy.get('.swal2-title').should('not.contain', 'Successfully Saved');
  });
});
