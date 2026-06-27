describe('E2E: Item Edit', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
    });
    cy.visit('/item_creation/list');
  });

  it('pre-fills form when editing existing item', () => {
    // Click the first edit link in the table
    cy.get('table tbody tr').first().find('a[href*="unique_id"]').first().click();
    // Form should be pre-filled
    cy.get('#item_name').should('not.have.value', '');
  });

  it('shows Updated toast on save after edit', () => {
    cy.get('table tbody tr').first().find('a[href*="unique_id"]').first().click();
    cy.get('#item_name').clear().type('Updated Item Name');
    cy.contains('button', 'Update').click();
    cy.get('.swal2-title').should('contain', 'Successfully Updated');
  });
});
