'use client';

import { useState } from 'react';

interface FaqItemProps {
  question: string;
  answer: string;
}

export function FaqAccordionItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-accordion-item${open ? ' open' : ''}`}>
      <button className="faq-accordion-header" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <i className="bi bi-chevron-down faq-accordion-arrow" />
      </button>
      <div className="faq-accordion-body">
        <div className="faq-accordion-content" dangerouslySetInnerHTML={{ __html: answer }} />
      </div>
    </div>
  );
}
