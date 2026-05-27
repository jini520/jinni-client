'use client';

import { useState, useEffect } from 'react';
import type { PortfolioData } from '@jejinni/types';
import { AuroraVariant, ScrollProgress } from '@jejinni/ui';

interface Props {
  data: PortfolioData;
}

const PROGRESS_ACCENT = 'linear-gradient(90deg, oklch(78% 0.16 320), oklch(82% 0.14 200), oklch(82% 0.13 38))';

export function PortfolioClient({ data }: Props) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem('aurora-theme') === 'light') setDark(false);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('aurora-theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <>
      <ScrollProgress accent={PROGRESS_ACCENT} />
      <AuroraVariant data={data} dark={dark} onToggleTheme={() => setDark((d) => !d)} />
    </>
  );
}
