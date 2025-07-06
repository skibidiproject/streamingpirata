'use client';
import { useState, useRef, useEffect } from 'react';

export default function ExpandableText({
  text,
  lines,
}: {
  text: string;
  lines: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const pRef = useRef<HTMLParagraphElement>(null);

  const checkOverflow = () => {
    if (!pRef.current) return;
    
    // Temporaneamente rimuovi la limitazione per misurare l'altezza completa
    const element = pRef.current;
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    
    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight) || 20;
    const maxHeight = lineHeight * lines;
    const fullHeight = element.scrollHeight;
    
    // Ripristina gli stili originali
    element.style.maxHeight = originalMaxHeight;
    element.style.overflow = originalOverflow;
    
    setShowButton(fullHeight > maxHeight + 2); // +2 per tolleranza
  };

  useEffect(() => {
    // Usa un timeout per evitare misurazioni durante il rendering
    const timeoutId = setTimeout(() => {
      checkOverflow();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [text, lines]);

  // Calcola maxHeight dinamicamente - versione più robusta
  const maxHeight = expanded ? '1000px' : `${lines * 1.5}em`;

  return (
    <div className="text-sm transition-all duration-650 ease-in-out">
      <p
        ref={pRef}
        className="transition-all duration-650 ease-in-out"
        style={{ 
          maxHeight,
          overflow: 'hidden',
          lineHeight: '1.5em'
        }}
      >
        {text}
      </p>
      {showButton && (
        <button
          className="text-stone-400 hover:underline mt-1 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Leggi meno' : 'Leggi tutto'}
        </button>
      )}
    </div>
  );
}