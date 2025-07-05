'use client';

import { useState } from 'react';

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="text-sm md:w-[40rem]">
      <p className={expanded ? '' : 'line-clamp-3'}>
        {text}
      </p>
      <button
        className="text-stone-400 hover:underline mt-1"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Leggi meno' : 'Leggi tutto'}
      </button>
    </div>
  );
}