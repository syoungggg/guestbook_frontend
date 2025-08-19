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
    <div style={{ padding: 20 }}>
      <h1>방명록</h1>
      <label>
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={e => {
            setIsAdmin(e.target.checked);
            setPage(1);
          }}
        />{" "}
        관리자 모드
      </label>

      {!isAdmin && (
        <div style={{ marginTop: 20 }}>
          <h2>글 작성</h2>
          <input
            placeholder="이름"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <br />
          <textarea
            placeholder="메시지"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <br />
          {/* 메시지 글자 수 카운터 */}
          <small>{message.length} / 500</small>
          <br />
          <button onClick={handleSubmit}>등록</button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h2>{isAdmin ? "관리자: PENDING 글 목록" : "공개 목록"}</h2>

        {/* 검색 */}
        {!isAdmin && (
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="검색"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        )}

        {entries.length === 0 ? (
          <p>글이 없습니다.</p>
        ) : (
          <ul>
            {entries.map(e => (
              <li key={e.id} style={{ marginBottom: 10 }}>
                <b>{e.name}</b> ({e.status})
                <br />
                {e.message}
                <br />
                {isAdmin && e.status === "PENDING" && (
                  <>
                    <button onClick={() => handleApprove(e.id)}>승인</button>
                    <button onClick={() => handleReject(e.id)}>거절</button>
                    <button onClick={() => handleDelete(e.id)}>삭제</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        <div style={{ marginTop: 10 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              style={{ fontWeight: page === i + 1 ? "bold" : "normal" }}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
