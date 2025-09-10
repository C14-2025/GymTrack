import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';

describe('Accordion', () => {
  it('deve abrir e fechar item ao clicar', () => {
    render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Conteúdo</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText('Trigger');
    fireEvent.click(trigger);
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('deve renderizar conteúdo apenas quando aberto', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Conteúdo</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Trigger'));
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
  });

  it('deve aplicar classe de estado aberto', () => {
    render(
      <Accordion type="single" defaultValue="item1">
        <AccordionItem value="item1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Conteúdo</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    const trigger = screen.getByText('Trigger');
    expect(trigger.className).toMatch(/open|data-state=open/);
  });
});
