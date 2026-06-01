import { useState, useEffect, useRef } from "react";
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
import { educationsApi, educationApi } from "../api/educations";
import type { EducationDto, EducationRequestDto } from "../@types";
import "./Educations.css";

// 드래그 가능한 교육 아이템 컴포넌트
interface SortableEducationItemProps {
  education: EducationDto;
  onEdit: (education: EducationDto) => void;
  onDelete: (id: string) => void;
  formatPeriod: (startDate?: string, endDate?: string) => string;
}

const SortableEducationItem = ({
  education,
  onEdit,
  onDelete,
  formatPeriod,
}: SortableEducationItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: education.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`education-card ${isDragging ? "dragging" : ""}`}
    >
      <div className="education-card-header">
        <div className="education-main-info" {...attributes} {...listeners}>
          <span className="drag-handle">⋮⋮</span>
          <h3 className="education-name">{education.education}</h3>
          <span className="period">
            {formatPeriod(education.startDate, education.endDate)}
          </span>
        </div>
        <div className="education-actions">
          <button
            className="btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(education);
            }}
          >
            수정
          </button>
          <button
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(education.id);
            }}
          >
            삭제
          </button>
        </div>
      </div>

      <div className="education-card-body">
        <div className="education-meta">
          {education.status && (
            <span className="meta-item">
              <strong>상태:</strong> {education.status}
            </span>
          )}
        </div>

        {education.description && (
          <div className="education-description">
            <strong>설명:</strong>
            <p>{education.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Educations = () => {
  const [educationList, setEducationList] = useState<EducationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationDto | null>(
    null
  );

  // 폼 상태
  const [educationForm, setEducationForm] = useState<EducationRequestDto>({
    education: "",
    startDate: "",
    endDate: "",
    status: "",
    description: "",
    orderIndex: 0,
  });

  // 입력 필드 ref (자동 포커스용)
  const educationInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 교육명 입력 필드에 포커스
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => {
        educationInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await educationsApi.getAllEducations();
      const educations = response.data.data || [];
      // orderIndex로 정렬
      const sorted = [...educations].sort((a, b) => {
        const aOrder = a.orderIndex ?? 0;
        const bOrder = b.orderIndex ?? 0;
        return aOrder - bOrder;
      });
      setEducationList(sorted);
    } catch (err) {
      setError("데이터를 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Education CRUD
  const handleAddEducation = () => {
    setEditingEducation(null);
    setEducationForm({
      education: "",
      startDate: "",
      endDate: "",
      status: "",
      description: "",
      orderIndex: educationList.length,
    });
    setIsModalOpen(true);
  };

  const handleEditEducation = (education: EducationDto) => {
    setEditingEducation(education);
    setEducationForm({
      education: education.education || "",
      startDate: education.startDate || "",
      endDate: education.endDate || "",
      status: education.status || "",
      description: education.description || "",
      orderIndex: 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveEducation = async () => {
    try {
      if (editingEducation) {
        await educationApi.updateEducation(editingEducation.id, educationForm);
      } else {
        await educationApi.createEducation(educationForm);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError("저장에 실패했습니다.");
      console.error(err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await educationApi.deleteEducation(id);
      loadData();
    } catch (err) {
      setError("삭제에 실패했습니다.");
      console.error(err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEducation(null);
  };

  // 날짜 포맷팅 (YY.MM. 형식)
  const formatPeriod = (startDate?: string, endDate?: string) => {
    if (!startDate) return "-";
    const end = endDate || "현재";
    return `${startDate} ~ ${end}`;
  };

  // 날짜 입력 핸들러 (YY.MM. 형식 자동 포맷팅)
  const handleDateInput = (value: string, maxLength = 6) => {
    // 숫자와 점만 허용
    let cleaned = value.replace(/[^\d.]/g, "");

    // 자동으로 점 추가 (2자리 입력 후, 4자리 입력 후)
    const digits = cleaned.replace(/\./g, "");
    if (digits.length >= 4) {
      cleaned = digits.substring(0, 2) + "." + digits.substring(2, 4) + ".";
    } else if (digits.length >= 2) {
      cleaned = digits.substring(0, 2) + "." + digits.substring(2);
    } else {
      cleaned = digits;
    }

    // 최대 길이 제한 (YY.MM. = 6자)
    return cleaned.substring(0, maxLength);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = educationList.findIndex((item) => item.id === active.id);
    const newIndex = educationList.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 순서 변경
    const reorderedEducations = arrayMove(educationList, oldIndex, newIndex);

    // 변경 범위 내의 항목들만 업데이트 (최소한의 API 호출)
    const startIdx = Math.min(oldIndex, newIndex);
    const endIdx = Math.max(oldIndex, newIndex);
    const itemsToUpdate = reorderedEducations.slice(startIdx, endIdx + 1);

    // 새로운 orderIndex 값 할당 및 API 호출
    const updatePromises = itemsToUpdate.map((education, relativeIndex) => {
      const newOrderIndex = startIdx + relativeIndex;
      const oldOrderIndex = educationList.findIndex(
        (e) => e.id === education.id
      );

      // 순서가 실제로 변경된 경우만 업데이트
      if (oldOrderIndex !== newOrderIndex) {
        return educationApi.updateEducation(education.id, {
          education: education.education,
          startDate: education.startDate,
          endDate: education.endDate,
          status: education.status,
          description: education.description,
          orderIndex: newOrderIndex,
        });
      }
      return Promise.resolve();
    });

    // 낙관적 업데이트 (UI 먼저 변경)
    setEducationList(
      reorderedEducations.map((edu, index) => ({
        ...edu,
        orderIndex: index,
      }))
    );

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      setError("순서 변경에 실패했습니다.");
      console.error(err);
      loadData(); // 실패 시 데이터 다시 로드
    }
  };

  return (
    <div className="educations-container">
      <header className="educations-header">
        <h1>Education 관리</h1>
        <p className="subtitle">교육 이력을 관리합니다</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>로딩중...</p>
        </div>
      ) : (
        <div className="content">
          <div className="educations-section">
            <div className="section-header">
              <h2>교육 이력 목록</h2>
              <button className="btn-primary" onClick={handleAddEducation}>
                + 교육 추가
              </button>
            </div>

            {educationList.length === 0 ? (
              <div className="empty-state">
                <p>등록된 교육 이력이 없습니다.</p>
                <button className="btn-primary" onClick={handleAddEducation}>
                  첫 교육 추가하기
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={educationList.map((edu) => edu.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="education-list">
                    {educationList.map((education) => (
                      <SortableEducationItem
                        key={education.id}
                        education={education}
                        onEdit={handleEditEducation}
                        onDelete={handleDeleteEducation}
                        formatPeriod={formatPeriod}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEducation ? "교육 수정" : "교육 추가"}</h2>
              <button className="btn-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEducation();
                }}
              >
                <div className="form-group">
                  <label>교육명 *</label>
                  <input
                    ref={educationInputRef}
                    type="text"
                    value={educationForm.education}
                    onChange={(e) =>
                      setEducationForm({
                        ...educationForm,
                        education: e.target.value,
                      })
                    }
                    placeholder="교육명 입력"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>시작일 * (YY.MM.)</label>
                    <input
                      type="text"
                      value={educationForm.startDate}
                      onChange={(e) =>
                        setEducationForm({
                          ...educationForm,
                          startDate: handleDateInput(e.target.value),
                        })
                      }
                      placeholder="24.01."
                      pattern="\d{2}\.\d{2}\."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>종료일 (YY.MM.)</label>
                    <input
                      type="text"
                      value={educationForm.endDate}
                      onChange={(e) =>
                        setEducationForm({
                          ...educationForm,
                          endDate: handleDateInput(e.target.value),
                        })
                      }
                      placeholder="24.12. (비워두면 현재)"
                      pattern="\d{2}\.\d{2}\."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>상태 *</label>
                  <input
                    type="text"
                    value={educationForm.status}
                    onChange={(e) =>
                      setEducationForm({
                        ...educationForm,
                        status: e.target.value,
                      })
                    }
                    placeholder="예: 재학중, 졸업, 수료 등"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    value={educationForm.description}
                    onChange={(e) =>
                      setEducationForm({
                        ...educationForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="교육에 대한 설명을 입력하세요"
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeModal}
                  >
                    취소
                  </button>
                  <button type="submit" className="btn-primary">
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Educations;
