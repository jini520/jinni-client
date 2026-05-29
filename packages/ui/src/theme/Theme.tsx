'use client';

import { useEffect } from 'react';

import { LINKS, PROFILE } from '../data/profile';
import { getSkillIcon } from '../variants/aurora/SkillIcons';

import type { PortfolioData } from '@jinni/types';
import { useMouse } from '../hooks/useMouse';
import { useReveal } from '../hooks/useReveal';
import { Nav } from '../organisms/Nav';
import { ProgressBar } from '../organisms/ProgressBar';
import styles from './theme.module.scss';

const CARD_ACCENTS = ['#ff3d9a', '#9b5cff', '#3dd0ff', '#ffb84d'];

const TECH_GROUPS_KO: Record<string, string> = {
  언어: '언어',
  프론트엔드: '프론트엔드',
  라이브러리: '라이브러리',
  빌드: '빌드',
  도구: '도구',
};

const QA_BLOCKS = [
  {
    q: (<>어떤 <span className="hl">개발자</span>인가요?</>),
    a: (<>사용자 경험을 코드로 설계하는 <span className="hl">프론트엔드 개발자</span>입니다. React와 TypeScript를 주력으로 웹 · 모바일 영역 모두에서 일해왔고, 디자이너의 의도를 한 픽셀까지 살리는 것에 집착합니다.</>),
    tags: ['React · TypeScript', 'Web · Mobile', '5+ years'],
  },
  {
    q: (<><span className="hl">무엇</span>을 즐기나요?</>),
    a: (<><span className="hl">디자인 시스템</span>을 처음부터 구축하고, 컴포넌트 API를 다듬는 일을 가장 좋아합니다. 마이크로 인터랙션이 제품의 신뢰감을 만든다고 믿고, 그 디테일을 챙기는 일에서 보람을 느낍니다.</>),
    tags: ['Design Systems', 'Micro-interaction', 'Performance'],
  },
  {
    q: (<><span className="hl">어떻게</span> 일하나요?</>),
    a: (<>디자이너와 <span className="hl">가깝게 일하는 것</span>을 선호합니다. Figma 핸드오프 단계에서 인터랙션을 함께 리뷰하고, 컴포넌트 단계부터 의도를 맞추는 협업이 결과적으로 더 빠르고 정확한 제품을 만든다고 믿습니다.</>),
    tags: ['Designer-friendly', 'Component-first', 'Remote OK'],
  },
];

export interface ThemeProps {
  data: PortfolioData;
  dark: boolean;
  onToggleTheme: () => void;
  onProjectClick: (id: string, accent: string, idx: string) => void;
  renderLink?: (href: string, children: React.ReactNode) => React.ReactNode;
}

export function Theme({ data, dark, onToggleTheme, onProjectClick, renderLink }: ThemeProps) {
  useReveal();
  const m = useMouse();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const { skills, careers, projects, posts } = data;

  const sortedCategories = [...skills.categories].sort((a, b) => a.order - b.order);

  const careerList = careers.businesses.map((b, i) => ({
    year: `${b.startDate} — ${b.endDate}`,
    company: b.company,
    role: b.position,
    note: b.details?.[0] ?? b.department,
    isCurrent: i === 0,
  }));

  const navLinks = [
    { label: 'About',   href: '#about' },
    { label: 'Stack',   href: '#stack' },
    { label: 'Work',    href: '#work' },
    { label: 'Career',  href: '#career' },
    { label: 'Writing', href: '#writing' },
    { label: 'Contact', href: '#contact' },
  ];

  const navBrand = (
    <>
      <span className={styles.dot} />
      <span>{PROFILE.nameKo}</span>
      <span className={styles.brandEn}>{PROFILE.site}</span>
    </>
  );

  const navCta = (
    <button className={styles.navCta}>↓ Resume</button>
  );

  return (
    <div className={styles.theme} data-theme={dark ? 'dark' : 'light'} data-density="regular">
      {/* Background */}
      <div className={styles.bg}>
        <div className={`${styles.blob} ${styles.b1}`} />
        <div className={`${styles.blob} ${styles.b2}`} />
      </div>
      <div className={styles.grid} />
      <div className={styles.noise} />
      <div
        className={styles.cursor}
        style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
      />

      {/* Progress Bar */}
      <ProgressBar accent="var(--a1)" />

      {/* NAV */}
      <Nav
        links={navLinks}
        brand={navBrand}
        cta={navCta}
        theme={dark ? 'dark' : 'light'}
        onToggleTheme={onToggleTheme}
        renderLink={renderLink}
        className={styles.nav}
      />

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div>
            <div className={styles.eyebrow} data-reveal>
              <span className={styles.pulse} />
              Available · 2026
            </div>
            <h1 className={styles.h1}>
              <span className={styles.ln1} data-reveal data-delay="1">안녕하세요,</span>
              <span className={styles.ln2} data-reveal data-delay="2">프론트엔드 개발자</span>
              <span className={styles.ln3} data-reveal data-delay="3">
                <span className={styles.name}>{PROFILE.nameKo}</span>입니다.
              </span>
              <span className={styles.h1En} data-reveal data-delay="4">
                {PROFILE.nameEn},
              </span>
            </h1>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className={styles.section}>
          <div className={styles.shead}>
            <div data-reveal>
              <div className={styles.sheadTag}>/ 01 · About</div>
              <div className={styles.sheadTitle}>코드로 그리는 <em>인터페이스</em></div>
            </div>
            <p className={styles.sheadSub} data-reveal data-delay="1">
              디자인 시스템과 성능, 사용자 경험 사이의 균형 — 그 사이에서 길을 만듭니다.
            </p>
          </div>

          <div className={styles.aboutQa}>
            {QA_BLOCKS.map((b, i) => (
              <div key={i} className={styles.qaBlock} data-reveal data-delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}>
                <span className={styles.qaNum}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.qaQuestion}>{b.q}</h3>
                <div className={styles.qaAnswerWrap}>
                  <p className={styles.qaAnswer}>{b.a}</p>
                  <div className={styles.qaTags}>
                    {b.tags.map((t) => <span key={t} className={styles.qaTag}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TECH */}
        <section id="stack" className={styles.section}>
          <div className={styles.shead}>
            <div data-reveal>
              <div className={styles.sheadTag}>/ 02 · Stack</div>
              <div className={styles.sheadTitle}>기술 스택</div>
            </div>
            <p className={styles.sheadSub} data-reveal data-delay="1">
              실무에서 일상적으로 사용하는 도구들.
            </p>
          </div>

          <div className={styles.tech}>
            {sortedCategories.map((cat, gi) => {
              const catSkills = skills.skills
                .filter((s) => s.categoryId === cat.id)
                .sort((a, b) => a.order - b.order);

              return (
                <div
                  key={cat.id}
                  className={styles.techRow}
                  data-reveal
                  data-delay={Math.min(gi + 1, 4) as 1 | 2 | 3 | 4}
                >
                  <div className={styles.techRowLabel}>
                    <span className={styles.ko}>{TECH_GROUPS_KO[cat.name] ?? cat.name}</span>
                    <span className={styles.en}>— {cat.name}</span>
                  </div>
                  <div className={styles.techChips}>
                    {catSkills.map((skill, si) => {
                      const hue = (si * 37 + gi * 73) % 360;
                      return (
                        <span
                          key={skill.id}
                          className={styles.techChip}
                          style={{ ['--chip-accent' as string]: `oklch(72% 0.16 ${hue})` }}
                        >
                          <span className={styles.sq}>
                            {(() => {
                              const Icon = getSkillIcon(skill.name);
                              return Icon
                                ? <Icon width={16} height={16} />
                                : skill.name.slice(0, 2).toUpperCase();
                            })()}
                          </span>
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PROJECTS */}
        <section id="work" className={styles.section}>
          <div className={styles.shead}>
            <div data-reveal>
              <div className={styles.sheadTag}>/ 03 · Selected Work</div>
              <div className={styles.sheadTitle}><em>프로젝트</em></div>
            </div>
            <p className={styles.sheadSub} data-reveal data-delay="1">
              임팩트 중심으로 선별한 작업물.
            </p>
          </div>

          <div className={styles.projects}>
            {projects.map((p, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              const idx = String(i + 1).padStart(2, '0');
              const MAX = 3;
              const showAll = p.skills.length <= MAX + 1;
              return (
                <article
                  key={p.id}
                  className={`${styles.projectCard} ${styles.projectCardClickable}`}
                  data-reveal
                  data-delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}
                  style={{ ['--c' as string]: accent }}
                  onClick={() => onProjectClick(p.id, accent, idx)}
                >
                  <div>
                    <div className={styles.num}>{idx}</div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                    <p className={styles.desc}>{p.description}</p>
                  </div>
                  <div className={styles.foot}>
                    <div className={styles.stack}>
                      {showAll
                        ? p.skills.map((s) => <span key={s}>{s}</span>)
                        : (
                          <>
                            {p.skills.slice(0, MAX).map((s) => <span key={s}>{s}</span>)}
                            <span className={styles.more} title={p.skills.slice(MAX).join(', ')}>
                              +{p.skills.length - MAX}
                            </span>
                          </>
                        )
                      }
                    </div>
                    <span className={styles.projCardArrow}>→</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CAREER */}
        <section id="career" className={styles.section}>
          <div className={styles.shead}>
            <div data-reveal>
              <div className={styles.sheadTag}>/ 04 · Timeline</div>
              <div className={styles.sheadTitle}>커리어</div>
            </div>
          </div>

          <div className={styles.career}>
            {careerList.map((c, i) => (
              <div key={i} className={styles.careerItem} data-reveal data-delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}>
                <div className={styles.careerYear}>{c.year}</div>
                <div className={styles.careerBody}>
                  <div className={styles.company}>{c.company}</div>
                  <div className={styles.careerRole}>{c.role}</div>
                  <div className={styles.note}>{c.note}</div>
                </div>
                <div className={`${styles.careerBadge} ${c.isCurrent ? styles.current : ''}`}>
                  {c.isCurrent ? 'Now' : 'Past'}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WRITING */}
        {posts.length > 0 && (
          <section id="writing" className={styles.section}>
            <div className={styles.shead}>
              <div data-reveal>
                <div className={styles.sheadTag}>/ 05 · Writing</div>
                <div className={styles.sheadTitle}>최근 <em>글</em></div>
              </div>
            </div>

            <div className={styles.posts}>
              {posts.map((p, i) => (
                <a
                  key={i}
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.postRow}
                  data-reveal
                  data-delay={Math.min(i + 1, 4) as 1 | 2 | 3 | 4}
                >
                  <span className={styles.date}>{p.pubDate}</span>
                  <span className={styles.ptitle}>{p.title}</span>
                  <span className={styles.ptag}>Velog</span>
                  <span className={styles.pread}>읽기 →</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT */}
        <section id="contact" className={styles.section}>
          <div className={styles.contact} data-reveal>
            <div className={styles.contactInner}>
              <div>
                <h2>같이 <span className={styles.em}>만들어볼까요</span>?</h2>
                <p>
                  새로운 프로젝트, 협업, 또는 그냥 인사 — 무엇이든 환영합니다.
                  보통 24시간 안에 답변드립니다.
                </p>
              </div>
              <div className={styles.contactLinks}>
                {LINKS.map((l) => (
                  <a key={l.label} href={l.href} className={styles.contactLink} target="_blank" rel="noopener noreferrer">
                    <span className={styles.lbl}>{l.label}</span>
                    <span className={styles.hdl}>{l.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className={styles.foot}>
          <span>© 2026 {PROFILE.nameKo} · {PROFILE.site}</span>
          <span>Designed & coded with care.</span>
        </footer>
      </main>
    </div>
  );
}
