'use client';

import { useState, useRef, useEffect } from 'react';

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const pRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!pRef.current) return;

    const lineHeight = parseFloat(
      getComputedStyle(pRef.current).lineHeight
    );

    const maxLines = 3;
    const maxHeight = lineHeight * maxLines;

    // Altezza reale del testo senza clamp
    const fullHeight = pRef.current.scrollHeight;

    // Altezza con clamp (quando expanded = false)
    const clampedHeight = maxHeight;

    // Se l'altezza reale è maggiore di quella di due linee, mostra il bottone
    setShowButton(fullHeight > clampedHeight);
  }, [text]);

  return (
    <div className="text-sm md:w-[40rem]">
      <p
        ref={pRef}
        className={expanded ? '' : 'line-clamp-3'}
        style={{ overflow: 'hidden' }}
      >
        {text}
      </p>

      {showButton && (
        <button
          className="text-stone-400 hover:underline mt-1"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Leggi meno' : 'Leggi tutto'}
        </button>
      )}
    </div>
  );
}
