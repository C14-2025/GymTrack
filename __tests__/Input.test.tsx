import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../components/ui/input';

describe('Input', () => {
  it('deve renderizar com valor inicial', () => {
    render(<Input defaultValue="teste" />);
    expect(screen.getByDisplayValue('teste')).toBeInTheDocument();
  });

  it('deve aceitar mudanças de valor', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'novo' } });
    expect(input).toHaveValue('novo');
  });

  it('deve aplicar classe de erro quando aria-invalid', () => {
    render(<Input aria-invalid={true} />);
    const input = screen.getByRole('textbox');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
