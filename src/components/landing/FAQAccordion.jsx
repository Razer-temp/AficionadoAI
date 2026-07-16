/**
 * FAQAccordion — Expandable FAQ section for the landing page.
 * @module FAQAccordion
 */

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ_ITEMS } from './landingData';

/**
 * FAQ accordion with expand/collapse toggle.
 * @param {{ sectionRef: import('react').RefObject }} props
 * @returns {JSX.Element}
 */
function FAQAccordion({ sectionRef }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <section className="landing-section" ref={sectionRef} id="faq">
      <div className="landing-section-header">
        <div className="landing-section-badge">
          <HelpCircle size={13} />
          <span>FAQ & Architecture</span>
        </div>
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-desc">
          Everything you need to know about Aficionado AI&apos;s zero-app design, venue grounding,
          and security compliance.
        </p>
      </div>

      <div className="landing-faq-accordion">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className={`landing-faq-item ${isOpen ? 'landing-faq-item--open' : ''}`}
            >
              <button
                className="landing-faq-question"
                onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <ChevronUp size={20} className="text-cyan" />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {isOpen && (
                <div className="landing-faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQAccordion;
