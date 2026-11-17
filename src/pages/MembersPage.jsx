import React, { useCallback, useEffect, useState } from "react";
import API, { errorMessage } from "../api";
import defaultImg from "../assets/pioneer-intro.png";
import "./MembersPage.css";

const EMPTY_MEMBER = { name: "", studentNumber: "", department: "", grade: "", position: "UNDERGRADUATE" };

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [form, setForm] = useState(EMPTY_MEMBER);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/api/members");
      setMembers(res.data.data || []);
    } catch (err) {
      console.error("부원 목록 불러오기 실패:", err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const close = () => {
    setShowPopup(false);
    setForm(EMPTY_MEMBER);
    setError("");
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.studentNumber.trim() || !form.department.trim()) {
      return setError("이름, 학번, 학과를 입력하세요.");
    }
    setSaving(true);
    setError("");
    try {
      await API.post("/api/members", { ...form, grade: form.grade ? Number(form.grade) : null });
      await load();
      close();
    } catch (err) {
      setError(errorMessage(err, "부원을 추가하지 못했어요."));
    } finally {
      setSaving(false);
    }
  };

  const q = query.trim();
  const shown = q
    ? members.filter((m) => m.name.includes(q) || m.studentNumber.includes(q) || (m.department || "").includes(q))
    : members;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>부원</h1>
          <p>PIONEER 부원 {members.length}명</p>
        </div>
        <div className="row">
          <input
            className="input"
            style={{ width: 200 }}
            placeholder="이름·학번·학과 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setShowPopup(true)}>
            + 부원 추가
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="empty">{members.length === 0 ? "아직 등록된 부원이 없어요." : "검색 결과가 없어요."}</div>
      ) : (
        <div className="members-list">
          {shown.map((m) => (
            <div className="member-card" key={m.memberId}>
              <img src={defaultImg} alt="" />
              <h4>{m.name}</h4>
              <p>{m.studentNumber}</p>
              <p>{m.department}</p>
              <span className="badge">
                {m.position}
                {m.grade ? ` · ${m.grade}학년` : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {showPopup && (
        <div className="modal-backdrop" onClick={close}>
          <form className="modal stack" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>새 부원 추가</h2>
            <div className="row">
              <label className="field grow">
                <span>이름</span>
                <input className="input" autoFocus value={form.name} onChange={update("name")} />
              </label>
              <label className="field grow">
                <span>학번</span>
                <input className="input" inputMode="numeric" value={form.studentNumber} onChange={update("studentNumber")} />
              </label>
            </div>
            <label className="field">
              <span>학과</span>
              <input className="input" value={form.department} onChange={update("department")} />
            </label>
            <div className="row">
              <label className="field grow">
                <span>구분</span>
                <select className="select" value={form.position} onChange={update("position")}>
                  <option value="UNDERGRADUATE">학부</option>
                  <option value="MASTER">석박사</option>
                  <option value="OTHER">기타</option>
                </select>
              </label>
              <label className="field grow">
                <span>학년 (선택)</span>
                <select className="select" value={form.grade} onChange={update("grade")}>
                  <option value="">-</option>
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>{g}학년</option>
                  ))}
                </select>
              </label>
            </div>
            {error && <div className="notice notice-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={close}>취소</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default MembersPage;
