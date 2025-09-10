import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/button';

describe('Button', () => {
  it('deve renderizar com o texto correto', () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('deve aplicar a variante destructive', () => {
    render(<Button variant="destructive">Excluir</Button>);
    const btn = screen.getByText('Excluir');
    expect(btn.className).toMatch(/destructive/);
  });

  it('deve disparar onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Clique</Button>);
    fireEvent.click(screen.getByText('Clique'));
    expect(onClick).toHaveBeenCalled();
  });
});
