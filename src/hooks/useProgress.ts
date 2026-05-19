import { useState, useCallback } from 'react';

const STORAGE_KEY = 'em_progress';

export function useProgress(moduleId: string, total: number) {
  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return new Set<string>(saved[moduleId] || []);
    } catch {
      return new Set<string>();
    }
  });

  const toggle = useCallback(
    (lessonId: string) => {
      setDone(prev => {
        const next = new Set(prev);
        if (next.has(lessonId)) next.delete(lessonId);
        else next.add(lessonId);
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          saved[moduleId] = [...next];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [moduleId]
  );

  const pct = total > 0 ? Math.round((done.size / total) * 100) : 0;
  return { done, toggle, count: done.size, pct };
}

export function getAllProgress(modules: Array<{ id: string; total: number }>) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return modules.map(m => {
      const done = (saved[m.id] || []).length;
      const pct = m.total > 0 ? Math.round((done / m.total) * 100) : 0;
      return { id: m.id, done, pct };
    });
  } catch {
    return modules.map(m => ({ id: m.id, done: 0, pct: 0 }));
  }
}
