import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import ItemCreationForm from '../../../../src/pages/ItemCreation/ItemCreationForm';
import client from '../../../../src/api/client';

expect.extend(toHaveNoViolations);

// ponytail: stub form.php response so axe doesn't race with a network fetch
beforeAll(() => {
  vi.spyOn(client, 'get').mockResolvedValue({
    data: `<html><body>
      <input id="item_code" value="IT-001" />
      <input id="item_name" value="" />
      <select id="unit"><option value="kg">kg</option></select>
      <select id="active_status"><option value="1">Active</option></select>
    </body></html>`
  });
});

const renderForm = () => render(
  <BrowserRouter>
    <ItemCreationForm />
  </BrowserRouter>
);

describe('A11y: Item Creation Form', () => {
  test('has no WCAG violations', async () => {
    const { container } = renderForm();
    await screen.findByRole('button', { name: /save/i });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('all visible form fields have labels', async () => {
    renderForm();
    await screen.findByRole('button', { name: /save/i });
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select');
    inputs.forEach(input => {
      // Must have a <label for="id"> or aria-label or aria-labelledby
      const id = input.id;
      const hasLabel = (id && document.querySelector(`label[for="${id}"]`))
        || input.getAttribute('aria-label')
        || input.getAttribute('aria-labelledby');
      expect(hasLabel).toBeTruthy();
    });
  });

  test('required fields have required attribute', async () => {
    renderForm();
    await screen.findByRole('button', { name: /save/i });
    const requiredInputs = document.querySelectorAll('[required]');
    expect(requiredInputs.length).toBeGreaterThan(0);
  });

  test('save and cancel buttons are present', async () => {
    renderForm();
    expect(await screen.findByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
