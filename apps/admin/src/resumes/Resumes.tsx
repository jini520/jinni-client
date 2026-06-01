import { useState, useEffect, useRef } from "react";
import { resumesApi } from "../api/resumes";
import type { FileDto } from "../@types";
import "./Resumes.css";

const Resumes = () => {
  const [files, setFiles] = useState<FileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 페이지네이션
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 파일 목록 로드
  const loadFiles = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumesApi.getResumeList(pageNum);
      const data = res.data.data;
      setFiles(data.items || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError("이력서 목록을 불러오는데 실패했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(0);
  }, []);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 파일명 가져오기
  const getFileName = (file: FileDto): string => {
    return file.originalFileName || "이력서";
  };

  // 파일 타입 아이콘
  const getFileIcon = (file: FileDto): string => {
    if (file.contentType) {
      if (file.contentType.includes("pdf")) return "📄";
      if (file.contentType.includes("word") || file.contentType.includes("document")) return "📝";
    }
    if (file.originalFileName) {
      const ext = file.originalFileName.toLowerCase();
      if (ext.endsWith(".pdf")) return "📄";
      if (ext.endsWith(".doc") || ext.endsWith(".docx")) return "📝";
    }
    return "📄";
  };

  // 파일 업로드
  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await resumesApi.uploadResume(formData);
      
      if (res.data.data) {
        await loadFiles(page);
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "이력서 업로드에 실패했습니다.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 파일 삭제
  const handleDeleteFile = async (file: FileDto) => {
    const fileName = getFileName(file);
    if (!confirm(`정말 "${fileName}" 이력서를 삭제하시겠습니까?`)) return;
    
    if (!file.id) {
      setError("파일 정보가 올바르지 않습니다.");
      return;
    }
    
    try {
      await resumesApi.deleteResume(file.id);
      await loadFiles(page);
    } catch (err) {
      setError("이력서 삭제에 실패했습니다.");
      console.error(err);
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      loadFiles(newPage);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // 파일 다운로드
  const handleDownload = (file: FileDto) => {
    if (!file.id) {
      setError("파일 정보가 올바르지 않습니다.");
      return;
    }
    
    const downloadUrl = resumesApi.getDownloadUrl(file.id);
    window.open(downloadUrl, "_blank");
  };

  // 최신 이력서 다운로드
  const handleDownloadLatest = () => {
    const downloadUrl = resumesApi.getLatestDownloadUrl();
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="resumes-container">
      <header className="resumes-header">
        <h1>이력서 관리</h1>
        <p className="subtitle">이력서 파일을 관리합니다</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {/* 파일 업로드 영역 */}
      <div className="upload-section">
        <div
          className={`upload-area ${isDragging ? "dragging" : ""} ${uploading ? "uploading" : ""}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="resume-upload"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={uploading}
          />
          <div className="upload-content">
            {uploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>업로드 중... {uploadProgress > 0 && `${uploadProgress}%`}</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📄</div>
                <p className="upload-text">
                  이력서 파일을 드래그하여 여기에 놓거나 클릭하여 선택하세요
                </p>
                <button
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  이력서 선택
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 파일 목록 */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>로딩중...</p>
        </div>
      ) : (
        <div className="files-section">
          <div className="section-header">
            <h2>이력서 목록 ({totalElements})</h2>
            <div className="header-actions">
              {totalElements > 0 && (
                <button
                  className="btn-secondary"
                  onClick={handleDownloadLatest}
                  title="최신 이력서 다운로드"
                >
                  ⬇️ 최신 이력서 다운로드
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                + 이력서 업로드
              </button>
            </div>
          </div>

          {files.length === 0 ? (
            <div className="empty-state">
              <p>등록된 이력서가 없습니다.</p>
              <p className="empty-hint">
                위의 업로드 영역을 사용하여 이력서를 추가하세요.
              </p>
            </div>
          ) : (
            <>
              <div className="files-list">
                {files.map((file) => (
                  <div key={file.id} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">{getFileIcon(file)}</span>
                      <div className="file-details">
                        <div className="file-name">{getFileName(file)}</div>
                        <div className="file-meta">
                          {file.fileSize && (
                            <>
                              <span className="file-size">{formatFileSize(file.fileSize)}</span>
                              <span className="file-separator">•</span>
                            </>
                          )}
                          {file.updatedAt && (
                            <>
                              <span className="file-date">{formatDate(file.updatedAt)}</span>
                              <span className="file-separator">•</span>
                            </>
                          )}
                          {file.contentType && (
                            <span className="file-type">{file.contentType}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        className="btn-download"
                        onClick={() => handleDownload(file)}
                        title="다운로드"
                        disabled={!file.exists}
                      >
                        ⬇️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteFile(file)}
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(0)}
                    disabled={page === 0}
                  >
                    ««
                  </button>
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    «
                  </button>
                  <span className="page-info">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages - 1}
                  >
                    »
                  </button>
                  <button
                    className="btn-page"
                    onClick={() => handlePageChange(totalPages - 1)}
                    disabled={page === totalPages - 1}
                  >
                    »»
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Resumes;
