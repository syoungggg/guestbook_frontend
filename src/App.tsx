import { useState, useEffect } from "react";

interface Entry {
  id: number;
  name: string;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// 빈 데이터로 시작
let mockEntries: Entry[] = [];

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // 검색 + 페이지네이션
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [totalPages, setTotalPages] = useState(1);

  // 목록 불러오기
  const loadEntries = () => {
    let filtered = mockEntries
      .filter(
        e =>
          (isAdmin || e.status === "APPROVED") &&
          e.message.includes(search)
      )
      // 최신순 정렬 (createdAt 내림차순)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
    const start = (page - 1) * pageSize;
    setEntries(filtered.slice(start, start + pageSize));
  };

  useEffect(() => {
    loadEntries();
  }, [isAdmin, page, search]);

  // 글 작성
  const handleSubmit = () => {
    if (!name || !message) return alert("이름과 메시지를 입력하세요.");
    if (name.length > 30) return alert("이름은 30자 이하만 가능합니다.");
    if (message.length > 500) return alert("메시지는 500자 이하만 가능합니다.");

    const newEntry: Entry = {
      id: mockEntries.length + 1,
      name,
      message,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    mockEntries.push(newEntry);
    setName("");
    setMessage("");
    alert("글이 등록되었습니다. 관리자 승인을 기다려주세요.");
    loadEntries();
  };

  // 관리자 액션
  const handleApprove = (id: number) => {
    const entry = mockEntries.find(e => e.id === id);
    if (entry) entry.status = "APPROVED";
    loadEntries();
  };
  const handleReject = (id: number) => {
    const entry = mockEntries.find(e => e.id === id);
    if (entry) entry.status = "REJECTED";
    loadEntries();
  };
  const handleDelete = (id: number) => {
    mockEntries = mockEntries.filter(e => e.id !== id);
    loadEntries();
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* 헤더 */}
        <div className="app-header">
          <h1 className="app-title">방명록</h1>
          <label className="admin-toggle">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={e => {
                setIsAdmin(e.target.checked);
                setPage(1);
              }}
              className="admin-checkbox"
            />
            <span className="admin-label">관리자 모드</span>
          </label>
        </div>

        {/* 글 작성 카드 */}
        {!isAdmin && (
          <div className="write-card">
            <h2 className="write-title">글 작성</h2>
            <div className="write-form">
              <input
                placeholder="이름"
                value={name}
                onChange={e => setName(e.target.value)}
                className="form-input"
              />
              <div className="textarea-container">
                <textarea
                  placeholder="방명록 작성"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="form-textarea"
                />
                <div className="char-counter">
                  <small>{message.length} / 500</small>
                </div>
              </div>
              <button onClick={handleSubmit} className="submit-btn">
                작성
              </button>
            </div>
          </div>
        )}

        {/* 목록 섹션 */}
        <div className="list-section">
          <div className="list-header">
            <h2 className="list-title">
              {isAdmin ? "관리자: PENDING 글 목록" : "공개 목록"}
            </h2>
            
            {/* 검색 */}
            {!isAdmin && (
              <div className="search-container">
                <input
                  placeholder="메시지 검색..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="search-input"
                />
              </div>
            )}
          </div>

          {/* 글 목록 */}
          {entries.length === 0 ? (
            <div className="empty-card">
              <p className="empty-text">글이 없습니다.</p>
            </div>
          ) : (
            <div className="entries-list">
              {entries.map(e => (
                <div key={e.id} className="entry-card">
                  <div className="entry-header">
                    <div className="entry-info">
                      <span className="entry-name">{e.name}</span>
                      {isAdmin && (
                        <span className={`status-badge status-${e.status.toLowerCase()}`}>
                          {e.status}
                        </span>
                      )}
                    </div>
                    <span className="entry-date">
                      {new Date(e.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  
                  <p className="entry-message">{e.message}</p>
                  
                  {isAdmin && e.status === "PENDING" && (
                    <div className="admin-actions">
                      <button onClick={() => handleApprove(e.id)} className="action-btn approve-btn">
                        승인
                      </button>
                      <button onClick={() => handleReject(e.id)} className="action-btn reject-btn">
                        거절
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="action-btn delete-btn">
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                className="pagination-btn"
              >
                ◀
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`page-btn ${page === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="pagination-btn"
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}