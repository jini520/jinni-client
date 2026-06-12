import { useState, useEffect } from 'react';

export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // 뷰포트 상단 25%~하단 35% 사이 밴드에 걸친 섹션을 활성으로 판정
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        // 여러 섹션이 겹치면 문서 순서상 가장 위 섹션을 활성으로
        const first = ids.find((id) => visible.has(id));
        setActiveId(first ?? null);
      },
      { rootMargin: '-25% 0px -35% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return activeId;
}
