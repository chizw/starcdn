'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export default function Typewriter({
  texts,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  className,
}: TypewriterProps) {
  const [display, setDisplay] = useState('');
  const [cursor, setCursor] = useState(true);
  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // blink cursor
  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(blink);
  }, []);

  // type / delete loop — reset when texts change
  useEffect(() => {
    // reset state on texts change
    textIndex.current = 0;
    charIndex.current = 0;
    isDeleting.current = false;

    const tick = () => {
      const idx = textIndex.current;
      const target = texts[idx];
      if (!target) return;

      if (!isDeleting.current) {
        // typing
        charIndex.current += 1;
        setDisplay(target.slice(0, charIndex.current));

        if (charIndex.current >= target.length) {
          timeoutRef.current = setTimeout(() => {
            isDeleting.current = true;
            tick();
          }, pauseDuration);
          return;
        }
        timeoutRef.current = setTimeout(tick, typingSpeed);
      } else {
        // deleting
        charIndex.current -= 1;
        setDisplay(target.slice(0, Math.max(0, charIndex.current)));

        if (charIndex.current <= 0) {
          isDeleting.current = false;
          textIndex.current = (idx + 1) % texts.length;
          timeoutRef.current = setTimeout(tick, 300);
          return;
        }
        timeoutRef.current = setTimeout(tick, deletingSpeed);
      }
    };

    // Defer initial reset/start so setState is not synchronous in the effect body
    timeoutRef.current = setTimeout(() => {
      setDisplay('');
      tick();
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={className}>
      {display}
      <span
        className="typewriter-cursor"
        style={{
          opacity: cursor ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        |
      </span>
    </span>
  );
}
