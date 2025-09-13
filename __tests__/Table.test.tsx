import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/table';

describe('Table', () => {
  it('deve renderizar cabeçalho e corpo', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Idade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>João</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  it('deve renderizar múltiplas linhas', () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell>A</TableCell></TableRow>
          <TableRow><TableCell>B</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('deve aplicar classes customizadas', () => {
    render(<Table className="custom" />);
    expect(screen.getByRole('table').className).toMatch(/custom/);
  });
});
