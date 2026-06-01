import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { projectsApi } from "../api/projects";
import axiosInstance from "../api/axios-instance";
import type {
  ProjectDetailDto,
  ProjectRequestDto,
  ProjectFeature,
  ProjectLink,
  ProjectStatus,
} from "../@types";
import "./Projects.css";
import "@uiw/react-md-editor/markdown-editor.css";

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: "진행 중",
  LIVE: "운영 중",
  COMPLETED: "완료",
};

const STATUS_CLASS: Record<string, string> = {
  IN_PROGRESS: "in-progress",
  LIVE: "live",
  COMPLETED: "completed",
};

const formatDate = (d?: string) => (d ? d.slice(0, 7).replace("-", ".") : null);

type ModalType = "project" | null;

interface SortableSkillTagProps {
  id: number;
  skill: string;
  onRemove: () => void;
}

const SortableSkillTag = ({ id, skill, onRemove }: SortableSkillTagProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={`skill-tag-edit ${isDragging ? "dragging" : ""}`}
    >
      <span className="drag-handle-small" {...attributes} {...listeners}>
        ⋮⋮
      </span>
      {skill}
      <button type="button" className="skill-remove" onClick={onRemove}>
        ×
      </button>
    </span>
  );
};

const emptyForm = (): ProjectRequestDto => ({
  title: "",
  description: "",
  skills: [],
  participants: "",
  startedAt: "",
  endedAt: "",
  status: undefined,
  company: "",
  overview: "",
  highlights: [],
  responsibilities: [],
  features: [],
  links: [],
  order: 0,
  contents: "",
  contentImageUrls: [],
});

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [projectForm, setProjectForm] = useState<ProjectRequestDto>(emptyForm());

  const [skillInput, setSkillInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [featureInput, setFeatureInput] = useState({ name: "", note: "" });
  const [linkInput, setLinkInput] = useState({ label: "", href: "" });

  const [imageUploading, setImageUploading] = useState(false);
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (modalType === "project") {
      const timer = setTimeout(() => { titleInputRef.current?.focus(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalType]);

  const loadProjectDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getProjectDetail(id);
      setProject(res.data.data);
    } catch (err) {
      setError("프로젝트 상세를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectDetail();
  }, [id]);

  const handleEditProject = () => {
    if (!project) return;
    setProjectForm({
      title: project.title,
      description: project.description || "",
      skills: project.skills || [],
      participants: project.participants || "",
      startedAt: project.startedAt || "",
      endedAt: project.endedAt || "",
      status: project.status,
      company: project.company || "",
      overview: project.overview || "",
      highlights: project.highlights || [],
      responsibilities: project.responsibilities || [],
      features: project.features || [],
      links: project.links || [],
      order: project.order ?? 0,
      contents: project.contents || "",
      contentImageUrls: project.contentImageUrls || [],
    });
    setSkillInput("");
    setHighlightInput("");
    setResponsibilityInput("");
    setFeatureInput({ name: "", note: "" });
    setLinkInput({ label: "", href: "" });
    setModalType("project");
  };

  const getFullImageUrl = (url: string): string => {
    if (!url) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = axiosInstance.defaults.baseURL || "";
    return base.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project?.id) return;
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setImageUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await projectsApi.uploadProjectImage(project.id, formData);
      const updated = res.data.data;
      setProject(updated);
      setProjectForm((prev) => ({ ...prev, contentImageUrls: updated.contentImageUrls || [] }));
    } catch (err) {
      setError("이미지 업로드에 실패했습니다.");
      console.error(err);
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const getFileIdFromImageUrl = (url: string): string | null => {
    if (!url) return null;
    const parts = url.split("/");
    const imagesIndex = parts.indexOf("images");
    if (imagesIndex === -1 || imagesIndex === parts.length - 1) return null;
    return parts[imagesIndex + 1] || null;
  };

  const handleDeleteImage = async (url: string) => {
    const fileId = getFileIdFromImageUrl(url);
    if (!project?.id || !fileId) {
      setError("이미지 정보를 확인할 수 없습니다.");
      return;
    }
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
    setError(null);
    try {
      const res = await projectsApi.deleteProjectImage(project.id, fileId);
      const updated = res.data.data;
      setProject(updated);
      setProjectForm((prev) => ({ ...prev, contentImageUrls: updated.contentImageUrls || [] }));
    } catch (err) {
      setError("이미지 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  const copyImageUrl = async (url: string, index: number) => {
    const full = getFullImageUrl(url);
    try {
      await navigator.clipboard.writeText(full);
      setCopiedUrlIndex(index);
      setTimeout(() => setCopiedUrlIndex(null), 1500);
    } catch {
      setError("URL 복사에 실패했습니다.");
    }
  };

  const handleSaveProject = async () => {
    if (!project) return;
    try {
      await projectsApi.updateProject(project.id, projectForm);
      closeModal();
      loadProjectDetail();
    } catch (err) {
      setError("프로젝트 저장에 실패했습니다.");
      console.error(err);
    }
  };

  // Skills
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !projectForm.skills?.includes(trimmed)) {
      setProjectForm({ ...projectForm, skills: [...(projectForm.skills || []), trimmed] });
      setSkillInput("");
    }
  };
  const removeSkill = (index: number) => {
    setProjectForm({ ...projectForm, skills: projectForm.skills?.filter((_, i) => i !== index) || [] });
  };
  const handleSkillsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const reordered = arrayMove(projectForm.skills || [], Number(active.id), Number(over.id));
    setProjectForm({ ...projectForm, skills: reordered });
  };

  // Highlights
  const addHighlight = () => {
    const trimmed = highlightInput.trim();
    if (trimmed) {
      setProjectForm({ ...projectForm, highlights: [...(projectForm.highlights || []), trimmed] });
      setHighlightInput("");
    }
  };
  const removeHighlight = (idx: number) => {
    setProjectForm({ ...projectForm, highlights: projectForm.highlights?.filter((_, i) => i !== idx) });
  };

  // Responsibilities
  const addResponsibility = () => {
    const trimmed = responsibilityInput.trim();
    if (trimmed) {
      setProjectForm({ ...projectForm, responsibilities: [...(projectForm.responsibilities || []), trimmed] });
      setResponsibilityInput("");
    }
  };
  const removeResponsibility = (idx: number) => {
    setProjectForm({ ...projectForm, responsibilities: projectForm.responsibilities?.filter((_, i) => i !== idx) });
  };

  // Features
  const addFeature = () => {
    if (featureInput.name.trim()) {
      const newFeature: ProjectFeature = {
        name: featureInput.name.trim(),
        note: featureInput.note.trim() || undefined,
      };
      setProjectForm({ ...projectForm, features: [...(projectForm.features || []), newFeature] });
      setFeatureInput({ name: "", note: "" });
    }
  };
  const removeFeature = (idx: number) => {
    setProjectForm({ ...projectForm, features: projectForm.features?.filter((_, i) => i !== idx) });
  };

  // Links
  const addLink = () => {
    if (linkInput.label.trim() && linkInput.href.trim()) {
      const newLink: ProjectLink = { label: linkInput.label.trim(), href: linkInput.href.trim() };
      setProjectForm({ ...projectForm, links: [...(projectForm.links || []), newLink] });
      setLinkInput({ label: "", href: "" });
    }
  };
  const removeLink = (idx: number) => {
    setProjectForm({ ...projectForm, links: projectForm.links?.filter((_, i) => i !== idx) });
  };

  const closeModal = () => setModalType(null);

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm(`"${project.title}" 프로젝트를 삭제하시겠습니까?\n삭제된 프로젝트와 관련 이미지는 복구할 수 없습니다.`)) return;
    setError(null);
    try {
      await projectsApi.deleteProject(project.id);
      navigate("/projects");
    } catch (err) {
      setError("프로젝트 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>로딩중...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="projects-container">
        <div className="error-banner">프로젝트를 찾을 수 없습니다.</div>
        <button className="btn-back" onClick={() => navigate("/projects")}>← 목록으로</button>
      </div>
    );
  }

  const start = formatDate(project.startedAt);
  const end = formatDate(project.endedAt);
  const period = start ? `${start} ~ ${end ?? ""}` : null;

  return (
    <div className="projects-container">
      <header className="projects-header">
        <h1>Projects 관리</h1>
        <p className="subtitle">프로젝트 상세 내용을 관리합니다</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="project-detail-view">
        <button className="btn-back" onClick={() => navigate("/projects")}>← 목록으로</button>

        <div className="project-detail-header">
          <div className="detail-header-top">
            <h2>{project.title}</h2>
            <div className="detail-header-actions">
              <button className="btn-edit" onClick={handleEditProject}>프로젝트 수정</button>
              <button type="button" className="btn-delete-project" onClick={handleDeleteProject}>프로젝트 삭제</button>
            </div>
          </div>
          {project.description && <p className="detail-description">{project.description}</p>}
          <div className="detail-meta">
            {project.order !== undefined && <span className="meta-item">🔢 순서: {project.order}</span>}
            {period && <span className="meta-item">📅 {period}</span>}
            {project.status && (
              <span className={`status-badge ${STATUS_CLASS[project.status] ?? ""}`}>
                {STATUS_LABELS[project.status]}
              </span>
            )}
            {project.participants && <span className="meta-item">👥 {project.participants}</span>}
            {project.company && <span className="meta-item">🏢 {project.company}</span>}
          </div>
          {project.skills && project.skills.length > 0 && (
            <div className="detail-skills">
              {project.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">{skill}</span>
              ))}
            </div>
          )}
        </div>

        {project.overview && (
          <div className="detail-section">
            <h3>개요</h3>
            <p style={{ color: "#ccc", lineHeight: 1.7, margin: 0 }}>{project.overview}</p>
          </div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <div className="detail-section">
            <h3>주요 성과</h3>
            <ul className="detail-list">
              {project.highlights.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
        )}

        {project.responsibilities && project.responsibilities.length > 0 && (
          <div className="detail-section">
            <h3>담당 역할</h3>
            <ul className="detail-list">
              {project.responsibilities.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
        )}

        {project.features && project.features.length > 0 && (
          <div className="detail-section">
            <h3>주요 기능</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {project.features.map((f, idx) => (
                <div key={idx} className="detail-feature-item">
                  <div className="detail-feature-name">{f.name}</div>
                  {f.note && <div className="detail-feature-note">{f.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {project.links && project.links.length > 0 && (
          <div className="detail-section">
            <h3>링크</h3>
            <div className="detail-links">
              {project.links.map((l, idx) => (
                <a key={idx} href={l.href} target="_blank" rel="noopener noreferrer" className="detail-link">
                  🔗 {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="contents-section">
          <div className="section-header">
            <h3>프로젝트 콘텐츠</h3>
          </div>

          {!project.contents || project.contents.trim() === "" ? (
            <div className="empty-state">
              <p>등록된 콘텐츠가 없습니다.</p>
              <p className="empty-hint">프로젝트 수정 버튼을 눌러 콘텐츠를 추가하세요.</p>
            </div>
          ) : (
            <div className="content-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string; children?: React.ReactNode }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return !isInline && match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div">
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>{children}</code>
                    );
                  },
                }}
              >
                {project.contents}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {modalType === "project" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>프로젝트 수정</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProject(); }}>
                <div className="form-group">
                  <label>제목</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="프로젝트 제목"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="프로젝트 설명"
                    rows={2}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>시작일</label>
                    <input
                      type="date"
                      value={projectForm.startedAt || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, startedAt: e.target.value || undefined })}
                    />
                  </div>
                  <div className="form-group">
                    <label>종료일</label>
                    <input
                      type="date"
                      value={projectForm.endedAt || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, endedAt: e.target.value || undefined })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>상태</label>
                    <select
                      value={projectForm.status || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, status: (e.target.value as ProjectStatus) || undefined })}
                    >
                      <option value="">선택 안함</option>
                      <option value="IN_PROGRESS">진행 중</option>
                      <option value="LIVE">운영 중</option>
                      <option value="COMPLETED">완료</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>참여 인원</label>
                    <input
                      type="text"
                      value={projectForm.participants || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, participants: e.target.value || undefined })}
                      placeholder="예: 3명, 1인 개인 프로젝트"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>회사 / 소속</label>
                  <input
                    type="text"
                    value={projectForm.company || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, company: e.target.value || undefined })}
                    placeholder="회사 또는 소속 (선택)"
                  />
                </div>
                <div className="form-group">
                  <label>개요</label>
                  <textarea
                    value={projectForm.overview || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, overview: e.target.value || undefined })}
                    placeholder="프로젝트 개요"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>주요 성과 / 하이라이트</label>
                  <div className="skill-input-wrapper">
                    <input
                      type="text"
                      value={highlightInput}
                      onChange={(e) => setHighlightInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHighlight(); }}}
                      placeholder="항목 입력 후 Enter"
                    />
                    <button type="button" className="btn-add-skill" onClick={addHighlight}>추가</button>
                  </div>
                  {(projectForm.highlights?.length ?? 0) > 0 && (
                    <ul className="array-item-list">
                      {projectForm.highlights!.map((item, idx) => (
                        <li key={idx} className="array-item">
                          <span>{item}</span>
                          <button type="button" className="skill-remove" onClick={() => removeHighlight(idx)}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>담당 역할</label>
                  <div className="skill-input-wrapper">
                    <input
                      type="text"
                      value={responsibilityInput}
                      onChange={(e) => setResponsibilityInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResponsibility(); }}}
                      placeholder="항목 입력 후 Enter"
                    />
                    <button type="button" className="btn-add-skill" onClick={addResponsibility}>추가</button>
                  </div>
                  {(projectForm.responsibilities?.length ?? 0) > 0 && (
                    <ul className="array-item-list">
                      {projectForm.responsibilities!.map((item, idx) => (
                        <li key={idx} className="array-item">
                          <span>{item}</span>
                          <button type="button" className="skill-remove" onClick={() => removeResponsibility(idx)}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>주요 기능</label>
                  <div className="form-row">
                    <input
                      type="text"
                      value={featureInput.name}
                      onChange={(e) => setFeatureInput({ ...featureInput, name: e.target.value })}
                      placeholder="기능명"
                    />
                    <input
                      type="text"
                      value={featureInput.note}
                      onChange={(e) => setFeatureInput({ ...featureInput, note: e.target.value })}
                      placeholder="설명 (선택)"
                    />
                  </div>
                  <button type="button" className="btn-add-skill" style={{ marginTop: "0.5rem" }} onClick={addFeature}>기능 추가</button>
                  {(projectForm.features?.length ?? 0) > 0 && (
                    <ul className="array-item-list" style={{ marginTop: "0.5rem" }}>
                      {projectForm.features!.map((f, idx) => (
                        <li key={idx} className="array-item">
                          <span><strong>{f.name}</strong>{f.note && ` — ${f.note}`}</span>
                          <button type="button" className="skill-remove" onClick={() => removeFeature(idx)}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>링크</label>
                  <div className="form-row">
                    <input
                      type="text"
                      value={linkInput.label}
                      onChange={(e) => setLinkInput({ ...linkInput, label: e.target.value })}
                      placeholder="링크 라벨 (예: GitHub)"
                    />
                    <input
                      type="text"
                      value={linkInput.href}
                      onChange={(e) => setLinkInput({ ...linkInput, href: e.target.value })}
                      placeholder="URL"
                    />
                  </div>
                  <button type="button" className="btn-add-skill" style={{ marginTop: "0.5rem" }} onClick={addLink}>링크 추가</button>
                  {(projectForm.links?.length ?? 0) > 0 && (
                    <ul className="array-item-list" style={{ marginTop: "0.5rem" }}>
                      {projectForm.links!.map((l, idx) => (
                        <li key={idx} className="array-item">
                          <span>{l.label} — {l.href}</span>
                          <button type="button" className="skill-remove" onClick={() => removeLink(idx)}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="form-group">
                  <label>기술 스택</label>
                  <div className="skill-input-wrapper">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); }}}
                      placeholder="스킬 입력 후 Enter"
                    />
                    <button type="button" className="btn-add-skill" onClick={addSkill}>추가</button>
                  </div>
                  {projectForm.skills && projectForm.skills.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSkillsDragEnd}>
                      <SortableContext items={projectForm.skills.map((_, index) => index)} strategy={verticalListSortingStrategy}>
                        <div className="skill-tags-edit">
                          {projectForm.skills.map((skill, idx) => (
                            <SortableSkillTag key={idx} id={idx} skill={skill} onRemove={() => removeSkill(idx)} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="skill-tags-edit"></div>
                  )}
                </div>
                <div className="form-group">
                  <label>표시 순서</label>
                  <input
                    type="number"
                    min="0"
                    value={projectForm.order ?? 0}
                    onChange={(e) => setProjectForm({ ...projectForm, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>콘텐츠 이미지</label>
                  <div className="project-images-section">
                    <div className="project-images-actions">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ display: "none" }}
                        disabled={imageUploading}
                      />
                      <button
                        type="button"
                        className="btn-add-image"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={imageUploading}
                      >
                        {imageUploading ? "업로드 중…" : "🖼️ 이미지 추가"}
                      </button>
                    </div>
                    {projectForm.contentImageUrls && projectForm.contentImageUrls.length > 0 && (
                      <ul className="project-image-url-list">
                        {projectForm.contentImageUrls.map((url, idx) => (
                          <li key={idx} className="project-image-url-item">
                            <span className="project-image-url-text" title={getFullImageUrl(url)}>
                              {getFullImageUrl(url)}
                            </span>
                            <div className="project-image-url-actions">
                              <button type="button" className="btn-copy-url" onClick={() => copyImageUrl(url, idx)}>
                                {copiedUrlIndex === idx ? "복사됨!" : "URL 복사"}
                              </button>
                              <button type="button" className="btn-delete-image" onClick={() => handleDeleteImage(url)}>
                                삭제
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>내용 (Markdown)</label>
                  <div data-color-mode="dark" className="md-editor-wrapper" style={{ color: "#fff" }}>
                    <style>{`
                      .md-editor-wrapper textarea,
                      .md-editor-wrapper .w-md-editor textarea,
                      .md-editor-wrapper .w-md-editor-text textarea,
                      .md-editor-wrapper .w-md-editor-text-textarea textarea,
                      .md-editor-wrapper textarea[class*="w-md"],
                      .md-editor-wrapper textarea[class*="editor"] {
                        color: #ffffff !important;
                        background-color: #1a1a2e !important;
                        caret-color: #ffffff !important;
                        -webkit-text-fill-color: #ffffff !important;
                      }
                      .md-editor-wrapper textarea::placeholder {
                        color: #888888 !important;
                        opacity: 1 !important;
                      }
                    `}</style>
                    <MDEditor
                      value={projectForm.contents || ""}
                      onChange={(value) => setProjectForm({ ...projectForm, contents: value || "" })}
                      preview="edit"
                      hideToolbar={false}
                      visibleDragbar={false}
                      height={400}
                    />
                  </div>
                  <p className="form-hint">Markdown 문법을 사용하여 작성할 수 있습니다. (예: # 제목, **굵게**, `코드`)</p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>취소</button>
                  <button type="submit" className="btn-primary">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
