describe('E2E: Item Delete', () => {
  beforeEach(() => {
    cy.fixture('users').then(({ admin }) => {
      cy.login(admin.username, admin.password);
    });
    cy.visit('/item_creation/list');
  });

  it('shows SweetAlert confirm before deleting', () => {
    cy.get('table tbody tr').first().find('[data-action="delete"], button.delete-btn, a[onclick*="delete"]').first().click();
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Are you sure');
  });

  it('soft-deletes after SweetAlert confirm', () => {
    cy.get('table tbody tr').first().find('[data-action="delete"], button.delete-btn, a[onclick*="delete"]').first().click();
    cy.get('.swal2-confirm').click();
    cy.get('.swal2-title').should('contain', 'Deleted');
  });

  it('cancels deletion on Cancel', () => {
    cy.get('table tbody tr').first().find('[data-action="delete"], button.delete-btn, a[onclick*="delete"]').first().click();
    cy.get('.swal2-cancel').click();
    cy.get('.swal2-popup').should('not.exist');
  });
});
