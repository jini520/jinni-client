import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">관리할 항목을 선택하세요</p>
      </header>

      <div className="menu-grid">
        <Link to="/skills" className="menu-card skills-card">
          <div className="card-icon">🛠️</div>
          <h2>Skills</h2>
          <p>기술 스택 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/projects" className="menu-card projects-card">
          <div className="card-icon">📁</div>
          <h2>Projects</h2>
          <p>프로젝트 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/careers" className="menu-card careers-card">
          <div className="card-icon">💼</div>
          <h2>Careers</h2>
          <p>경력 정보 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/certifications" className="menu-card certifications-card">
          <div className="card-icon">🏆</div>
          <h2>Certifications</h2>
          <p>자격증 및 수상 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/educations" className="menu-card educations-card">
          <div className="card-icon">🎓</div>
          <h2>Educations</h2>
          <p>교육 이력 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/resumes" className="menu-card resumes-card">
          <div className="card-icon">📄</div>
          <h2>Resumes</h2>
          <p>이력서 파일 관리</p>
          <span className="card-arrow">→</span>
        </Link>

        <Link to="/portfolios" className="menu-card portfolios-card">
          <div className="card-icon">📁</div>
          <h2>Portfolios</h2>
          <p>포트폴리오 파일 관리</p>
          <span className="card-arrow">→</span>
        </Link>
      </div>

      <footer className="home-footer">
        <p>jejinni Admin Panel</p>
      </footer>
    </div>
  );
};

export default Home;

