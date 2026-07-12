'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
}

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-number">
      {value.startsWith('<') || value.startsWith('>') || /^\d+-\d+[a-z]*$/.test(value) ? (
        <AnimatedText target={value} started={started} />
      ) : value.includes('%') ? (
        <AnimatedPercent target={value} started={started} />
      ) : (
        <AnimatedCount target={value} started={started} />
      )}
    </div>
  );
}

function AnimatedCount({ target, started }: { target: string; started: boolean }) {
  // e.g. "100+" or "50M+"
  const numPart = parseFloat(target.replace(/[^0-9.]/g, ''));
  const suffix = target.replace(/[0-9.]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 40;
    const inc = numPart / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCount(Math.min(Math.round(inc * step), numPart));
      if (step >= steps) {
        setCount(numPart);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, numPart]);

  return <>{count}{suffix}</>;
}

function AnimatedPercent({ target, started }: { target: string; started: boolean }) {
  const numPart = parseFloat(target);
  const suffix = target.replace(/[0-9.]/g, '');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const steps = 50;
    const inc = numPart / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const val = Math.min(inc * step, numPart);
      setCount(Math.round(val * 100) / 100);
      if (step >= steps) {
        setCount(numPart);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, numPart]);

  return <>{count}{suffix}</>;
}

function AnimatedText({ target, started }: { target: string; started: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (started) {
      const t = setTimeout(() => setVisible(true), 200);
      return () => clearTimeout(t);
    }
  }, [started]);
  return (
    <span style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
      display: 'inline-block',
    }}>
      {target}
    </span>
  );
}
