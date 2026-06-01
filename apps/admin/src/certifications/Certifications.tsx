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
import {
  certificationsApi,
  certificationApi,
  awardApi,
} from "../api/certifications";
import type {
  CertificationDto,
  AwardDto,
  CertificationRequestDto,
  AwardRequestDto,
} from "../@types";
import "./Certifications.css";

// 드래그 가능한 자격증 아이템 컴포넌트
interface SortableCertificationItemProps {
  certification: CertificationDto;
  onEdit: (certification: CertificationDto) => void;
  onDelete: (id: string) => void;
}

const SortableCertificationItem = ({
  certification,
  onEdit,
  onDelete,
}: SortableCertificationItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certification.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`certification-card ${isDragging ? "dragging" : ""}`}
    >
      <div className="certification-card-header">
        <div className="certification-main-info" {...attributes} {...listeners}>
          <span className="drag-handle">⋮⋮</span>
          <h3 className="certification-name">{certification.name}</h3>
          {certification.date && (
            <span className="date">{certification.date}</span>
          )}
        </div>
        <div className="certification-actions">
          <button
            className="btn-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(certification);
            }}
          >
            수정
          </button>
          <button
            className="btn-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(certification.id);
            }}
          >
            삭제
          </button>
        </div>
      </div>

      <div className="certification-card-body">
        <div className="certification-meta">
          {certification.organization && (
            <span className="meta-item">
              <strong>발급 기관:</strong> {certification.organization}
            </span>
          )}
          {certification.tier && (
            <span className="meta-item">
              <strong>등급:</strong> {certification.tier}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 드래그 가능한 수상 아이템 컴포넌트
interface SortableAwardItemProps {
  award: AwardDto;
  onEdit: (award: AwardDto) => void;
  onDelete: (id: string) => void;
}

const SortableAwardItem = ({
  award,
  onEdit,
  onDelete,
}: SortableAwardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: award.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`certification-card ${isDragging ? "dragging" : ""}`}
    >
      <div className="certification-card-header">
        <div className="certification-main-info" {...attributes} {...listeners}>
          <span className="drag-handle">⋮⋮</span>
          <h3 className="certification-name">{award.name}</h3>
          {award.date && <span className="date">{award.date}</span>}
        </div>
        <div className="certification-actions">
          <button className="btn-edit" onClick={(e) => {
            e.stopPropagation();
            onEdit(award);
          }}>
            수정
          </button>
          <button className="btn-delete" onClick={(e) => {
            e.stopPropagation();
            onDelete(award.id);
          }}>
            삭제
          </button>
        </div>
      </div>

      <div className="certification-card-body">
        <div className="certification-meta">
          {award.organization && (
            <span className="meta-item">
              <strong>주최 기관:</strong> {award.organization}
            </span>
          )}
          {award.tier && (
            <span className="meta-item">
              <strong>등급:</strong> {award.tier}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

type TabType = "certifications" | "awards";
type ModalType = "certification" | "award" | null;

const Certifications = () => {
  const [certificationList, setCertificationList] = useState<
    CertificationDto[]
  >([]);
  const [awardList, setAwardList] = useState<AwardDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>("certifications");

  // 모달 상태
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingCertification, setEditingCertification] =
    useState<CertificationDto | null>(null);
  const [editingAward, setEditingAward] = useState<AwardDto | null>(null);

  // 폼 상태
  const [certificationForm, setCertificationForm] =
    useState<CertificationRequestDto>({
      name: "",
      date: "",
      organization: "",
      tier: "",
      orderIndex: 0,
    });

  const [awardForm, setAwardForm] = useState<AwardRequestDto>({
    name: "",
    date: "",
    organization: "",
    tier: "",
    orderIndex: 0,
  });

  // 입력 필드 ref (자동 포커스용)
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 이름 입력 필드에 포커스
  useEffect(() => {
    if (modalType) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalType]);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await certificationsApi.getAllCertifications();
      const certifications = response.data.data.certifications || [];
      const awards = response.data.data.awards || [];
      // orderIndex로 정렬
      const sortedCertifications = [...certifications].sort((a, b) => {
        const aOrder = a.orderIndex ?? 0;
        const bOrder = b.orderIndex ?? 0;
        return aOrder - bOrder;
      });
      const sortedAwards = [...awards].sort((a, b) => {
        const aOrder = a.orderIndex ?? 0;
        const bOrder = b.orderIndex ?? 0;
        return aOrder - bOrder;
      });
      setCertificationList(sortedCertifications);
      setAwardList(sortedAwards);
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

  // Certification CRUD
  const handleAddCertification = () => {
    setEditingCertification(null);
    setCertificationForm({
      name: "",
      date: "",
      organization: "",
      tier: "",
      orderIndex: certificationList.length,
    });
    setModalType("certification");
  };

  const handleEditCertification = (certification: CertificationDto) => {
    setEditingCertification(certification);
    setCertificationForm({
      name: certification.name || "",
      date: certification.date || "",
      organization: certification.organization || "",
      tier: certification.tier || "",
      orderIndex: 0,
    });
    setModalType("certification");
  };

  const handleSaveCertification = async () => {
    try {
      if (editingCertification) {
        await certificationApi.updateCertification(
          editingCertification.id,
          certificationForm
        );
      } else {
        await certificationApi.createCertification(certificationForm);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError("저장에 실패했습니다.");
      console.error(err);
    }
  };

  const handleDeleteCertification = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await certificationApi.deleteCertification(id);
      loadData();
    } catch (err) {
      setError("삭제에 실패했습니다.");
      console.error(err);
    }
  };

  // Award CRUD
  const handleAddAward = () => {
    setEditingAward(null);
    setAwardForm({
      name: "",
      date: "",
      organization: "",
      tier: "",
      orderIndex: awardList.length,
    });
    setModalType("award");
  };

  const handleEditAward = (award: AwardDto) => {
    setEditingAward(award);
    setAwardForm({
      name: award.name || "",
      date: award.date || "",
      organization: award.organization || "",
      tier: award.tier || "",
      orderIndex: 0,
    });
    setModalType("award");
  };

  const handleSaveAward = async () => {
    try {
      if (editingAward) {
        await awardApi.updateAward(editingAward.id, awardForm);
      } else {
        await awardApi.createAward(awardForm);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError("저장에 실패했습니다.");
      console.error(err);
    }
  };

  const handleDeleteAward = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await awardApi.deleteAward(id);
      loadData();
    } catch (err) {
      setError("삭제에 실패했습니다.");
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingCertification(null);
    setEditingAward(null);
  };

  // 자격증 드래그 종료 핸들러
  const handleCertificationDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = certificationList.findIndex((item) => item.id === active.id);
    const newIndex = certificationList.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(certificationList, oldIndex, newIndex);

    // 변경 범위 내의 항목들만 업데이트 (최소한의 API 호출)
    const startIdx = Math.min(oldIndex, newIndex);
    const endIdx = Math.max(oldIndex, newIndex);
    const itemsToUpdate = reordered.slice(startIdx, endIdx + 1);

    const updatePromises = itemsToUpdate.map((certification, relativeIndex) => {
      const newOrderIndex = startIdx + relativeIndex;
      const oldOrderIndex = certificationList.findIndex((c) => c.id === certification.id);
      
      // 순서가 실제로 변경된 경우만 업데이트
      if (oldOrderIndex !== newOrderIndex) {
        return certificationApi.updateCertification(certification.id, {
          name: certification.name,
          date: certification.date,
          organization: certification.organization,
          tier: certification.tier,
          orderIndex: newOrderIndex,
        });
      }
      return Promise.resolve();
    });

    setCertificationList(reordered.map((cert, index) => ({
      ...cert,
      orderIndex: index,
    })));

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      setError("순서 변경에 실패했습니다.");
      console.error(err);
      loadData();
    }
  };

  // 수상 드래그 종료 핸들러
  const handleAwardDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = awardList.findIndex((item) => item.id === active.id);
    const newIndex = awardList.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(awardList, oldIndex, newIndex);

    // 변경 범위 내의 항목들만 업데이트 (최소한의 API 호출)
    const startIdx = Math.min(oldIndex, newIndex);
    const endIdx = Math.max(oldIndex, newIndex);
    const itemsToUpdate = reordered.slice(startIdx, endIdx + 1);

    const updatePromises = itemsToUpdate.map((award, relativeIndex) => {
      const newOrderIndex = startIdx + relativeIndex;
      const oldOrderIndex = awardList.findIndex((a) => a.id === award.id);
      
      // 순서가 실제로 변경된 경우만 업데이트
      if (oldOrderIndex !== newOrderIndex) {
        return awardApi.updateAward(award.id, {
          name: award.name,
          date: award.date,
          organization: award.organization,
          tier: award.tier,
          orderIndex: newOrderIndex,
        });
      }
      return Promise.resolve();
    });

    setAwardList(reordered.map((award, index) => ({
      ...award,
      orderIndex: index,
    })));

    try {
      await Promise.all(updatePromises);
    } catch (err) {
      setError("순서 변경에 실패했습니다.");
      console.error(err);
      loadData();
    }
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

  return (
    <div className="certifications-container">
      <header className="certifications-header">
        <h1>Certifications 관리</h1>
        <p className="subtitle">자격증과 수상 내역을 관리합니다</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* 탭 */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "certifications" ? "active" : ""}`}
          onClick={() => setActiveTab("certifications")}
        >
          자격증 ({certificationList.length})
        </button>
        <button
          className={`tab ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setActiveTab("awards")}
        >
          수상 내역 ({awardList.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>로딩중...</p>
        </div>
      ) : (
        <div className="content">
          {/* Certifications 탭 */}
          {activeTab === "certifications" && (
            <div className="certifications-section">
              <div className="section-header">
                <h2>자격증 목록</h2>
                <button
                  className="btn-primary"
                  onClick={handleAddCertification}
                >
                  + 자격증 추가
                </button>
              </div>

              {certificationList.length === 0 ? (
                <div className="empty-state">
                  <p>등록된 자격증이 없습니다.</p>
                  <button
                    className="btn-primary"
                    onClick={handleAddCertification}
                  >
                    첫 자격증 추가하기
                  </button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleCertificationDragEnd}
                >
                  <SortableContext
                    items={certificationList.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                <div className="certification-list">
                  {certificationList.map((certification) => (
                        <SortableCertificationItem
                          key={certification.id}
                          certification={certification}
                          onEdit={handleEditCertification}
                          onDelete={handleDeleteCertification}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}

          {/* Awards 탭 */}
          {activeTab === "awards" && (
            <div className="certifications-section">
              <div className="section-header">
                <h2>수상 내역 목록</h2>
                <button className="btn-primary" onClick={handleAddAward}>
                  + 수상 내역 추가
                </button>
              </div>

              {awardList.length === 0 ? (
                <div className="empty-state">
                  <p>등록된 수상 내역이 없습니다.</p>
                  <button className="btn-primary" onClick={handleAddAward}>
                    첫 수상 내역 추가하기
                  </button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleAwardDragEnd}
                >
                  <SortableContext
                    items={awardList.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                <div className="certification-list">
                  {awardList.map((award) => (
                        <SortableAwardItem
                          key={award.id}
                          award={award}
                          onEdit={handleEditAward}
                          onDelete={handleDeleteAward}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      )}

      {/* 모달 */}
      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === "certification"
                  ? editingCertification
                    ? "자격증 수정"
                    : "자격증 추가"
                  : editingAward
                  ? "수상 내역 수정"
                  : "수상 내역 추가"}
              </h2>
              <button className="btn-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalType === "certification" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCertification();
                  }}
                >
                  <div className="form-group">
                    <label>자격증명 *</label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={certificationForm.name}
                      onChange={(e) =>
                        setCertificationForm({
                          ...certificationForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="자격증명 입력"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>취득일 * (YY.MM.)</label>
                      <input
                        type="text"
                        value={certificationForm.date}
                        onChange={(e) =>
                          setCertificationForm({
                            ...certificationForm,
                            date: handleDateInput(e.target.value),
                          })
                        }
                        placeholder="24.01."
                        pattern="\d{2}\.\d{2}\."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>등급</label>
                      <input
                        type="text"
                        value={certificationForm.tier}
                        onChange={(e) =>
                          setCertificationForm({
                            ...certificationForm,
                            tier: e.target.value,
                          })
                        }
                        placeholder="1급, 2급 등"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>발급 기관</label>
                    <input
                      type="text"
                      value={certificationForm.organization}
                      onChange={(e) =>
                        setCertificationForm({
                          ...certificationForm,
                          organization: e.target.value,
                        })
                      }
                      placeholder="발급 기관명 입력"
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
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveAward();
                  }}
                >
                  <div className="form-group">
                    <label>수상명 *</label>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={awardForm.name}
                      onChange={(e) =>
                        setAwardForm({
                          ...awardForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="수상명 입력"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>수상일 * (YY.MM.)</label>
                      <input
                        type="text"
                        value={awardForm.date}
                        onChange={(e) =>
                          setAwardForm({
                            ...awardForm,
                            date: handleDateInput(e.target.value),
                          })
                        }
                        placeholder="24.01."
                        pattern="\d{2}\.\d{2}\."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>등급</label>
                      <input
                        type="text"
                        value={awardForm.tier}
                        onChange={(e) =>
                          setAwardForm({
                            ...awardForm,
                            tier: e.target.value,
                          })
                        }
                        placeholder="금상, 은상 등"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>주최 기관</label>
                    <input
                      type="text"
                      value={awardForm.organization}
                      onChange={(e) =>
                        setAwardForm({
                          ...awardForm,
                          organization: e.target.value,
                        })
                      }
                      placeholder="주최 기관명 입력"
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certifications;

