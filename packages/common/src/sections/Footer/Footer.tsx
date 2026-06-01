import { PROFILE } from '../../data/profile';
import styles from '../../styles/sections.module.scss';

export function Footer() {
  return (
    <footer className={styles.foot}>
      <span>© 2026 {PROFILE.nameKo} · {PROFILE.site}</span>
      <span>Designed & coded with care.</span>
    </footer>
  );
}
