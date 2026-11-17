import React, { useCallback, useEffect, useState } from "react";
import API, { errorMessage, fileUrl } from "../api";
import { useDialog } from "../components/Dialog";
import PersonFields, { loadPerson, savePerson, useMembers } from "../components/PersonFields";
import { dday, formatDate, formatDateTime } from "../utils/date";
import "./AssignmentPage.css";

const TYPES = [
  { value: "", label: "전체" },
  { value: "STUDY", label: "스터디" },
  { value: "PROGRAMMING", label: "프로그래밍" },
  { value: "PROJECT", label: "프로젝트" },
];
const EMPTY_ASSIGNMENT = { title: "", description: "", type: "STUDY", deadline: "" };
const MAX_FILE_MB = 20;
const isHttpUrl = (v) => /^https?:\/\/.+/i.test(v);

function AssignmentPage() {
  const members = useMembers();
  const [filter, setFilter] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_ASSIGNMENT);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/api/assignments", { params: filter ? { type: filter } : {} });
      setAssignments(res.data.data || []);
    } catch (err) {
      setError(errorMessage(err, "과제를 불러오지 못했어요."));
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("과제 제목을 입력하세요.");
    setSaving(true);
    try {
      await API.post("/api/assignments", { ...form, deadline: form.deadline || null });
      setForm(EMPTY_ASSIGNMENT);
      setShowCreate(false);
      await load();
    } catch (err) {
      setError(errorMessage(err, "과제를 등록하지 못했어요."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>과제</h1>
          <p>과제를 올리고, 각 과제 아래에서 바로 제출해요.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "닫기" : "+ 과제 등록"}
        </button>
      </div>

      {showCreate && (
        <form className="card stack" onSubmit={create} style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>새 과제</div>
          <label className="field">
            <span>제목</span>
            <input className="input" autoFocus value={form.title} onChange={update("title")} placeholder="예: React 컴포넌트 실습" />
          </label>
          <label className="field">
            <span>설명</span>
            <textarea className="textarea" value={form.description} onChange={update("description")} placeholder="과제 내용, 제출 방법 등" />
          </label>
          <div className="row">
            <label className="field grow">
              <span>유형</span>
              <select className="select" value={form.type} onChange={update("type")}>
                {TYPES.filter((t) => t.value).map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="field grow">
              <span>마감일 (선택)</span>
              <input className="input" type="date" value={form.deadline} onChange={update("deadline")} />
            </label>
          </div>
          {error && <div className="notice notice-error">{error}</div>}
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      )}

      <div className="tabs" style={{ marginBottom: 16 }}>
        {TYPES.map((t) => (
          <button key={t.value} className={filter === t.value ? "active" : ""} onClick={() => setFilter(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {!showCreate && error && <div className="notice notice-error" style={{ marginBottom: 16 }}>{error}</div>}

      {assignments.length === 0 ? (
        <div className="empty">등록된 과제가 없어요.</div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {assignments.map((a) => (
            <AssignmentCard key={a.assignmentId} assignment={a} members={members} onChanged={load} />
          ))}
        </div>
      )}
    </>
  );
}

function AssignmentCard({ assignment: a, members, onChanged }) {
  const { confirm, notify } = useDialog();
  const [person, setPerson] = useState(loadPerson);
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // 제출 후 파일 입력칸 초기화용
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const due = a.deadline ? dday(a.deadline) : null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!person.studentNumber.trim() || !person.name.trim()) return setError("학번과 이름을 입력하세요.");
    if (!link.trim() && !file) return setError("제출 링크나 파일 중 하나는 필요해요.");
    if (link.trim() && !isHttpUrl(link.trim())) return setError("링크는 http:// 또는 https:// 로 시작해야 해요.");
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) return setError(`파일은 ${MAX_FILE_MB}MB까지 올릴 수 있어요.`);

    const data = new FormData();
    data.append("studentNumber", person.studentNumber);
    data.append("name", person.name);
    if (link.trim()) data.append("link", link.trim());
    if (file) data.append("file", file);

    setSending(true);
    try {
      await API.post(`/api/assignments/${a.assignmentId}/submissions`, data);
      savePerson(person);
      setLink("");
      setFile(null);
      setFileKey((k) => k + 1);
      await onChanged();
    } catch (err) {
      setError(errorMessage(err, "제출하지 못했어요."));
    } finally {
      setSending(false);
    }
  };

  const cancelSubmission = async (s) => {
    const msg = `${s.name}(${s.studentNumber})의 제출을 취소할까요?\n첨부 파일도 함께 삭제돼요.`;
    if (!(await confirm(msg, { confirmLabel: "제출 취소", danger: true }))) return;
    try {
      await API.delete(`/api/submissions/${s.submissionId}`);
      await onChanged();
    } catch (err) {
      await notify(errorMessage(err, "취소하지 못했어요."));
    }
  };

  const removeAssignment = async () => {
    const msg = `'${a.title}' 과제를 삭제할까요?\n제출된 ${a.submissions.length}건과 첨부 파일도 함께 삭제돼요.`;
    if (!(await confirm(msg, { confirmLabel: "삭제", danger: true }))) return;
    try {
      await API.delete(`/api/assignments/${a.assignmentId}`);
      await onChanged();
    } catch (err) {
      await notify(errorMessage(err, "삭제하지 못했어요."));
    }
  };

  return (
    <article className="card assignment">
      <div className="item-head">
        <div className="item-title" style={{ fontSize: 17 }}>
          {a.title}
          <span className="badge">{a.typeDisplay}</span>
          {due && <span className={`badge ${due.over ? "" : "badge-brand"}`}>{due.label}</span>}
        </div>
        <button className="btn btn-danger-text btn-sm" onClick={removeAssignment}>과제 삭제</button>
      </div>
      <div className="meta">
        {a.deadline ? <span>마감 {formatDate(a.deadline)}</span> : <span>마감일 없음</span>}
        <span>제출 {a.submissions.length}명</span>
      </div>
      {a.description && <p className="assignment-desc">{a.description}</p>}

      <div className="submissions">
        <h3>제출 현황</h3>
        {a.submissions.length === 0 ? (
          <p className="small muted">아직 제출한 사람이 없어요.</p>
        ) : (
          <ul>
            {a.submissions.map((s) => (
              <li key={s.submissionId}>
                <div className="sub-who">
                  <strong>{s.name}</strong>
                  <span className="muted small">{s.studentNumber}</span>
                </div>
                <div className="sub-what">
                  {s.link && (
                    <a className="link" href={s.link} target="_blank" rel="noopener noreferrer">
                      {s.link.replace(/^https?:\/\//, "")} ↗
                    </a>
                  )}
                  {s.fileName && (
                    <a className="link" href={fileUrl(s.submissionId)}>
                      📎 {s.fileName}
                    </a>
                  )}
                </div>
                <span className="muted small">{formatDateTime(s.submittedAt)}</span>
                <button className="btn btn-danger-text btn-sm" onClick={() => cancelSubmission(s)}>취소</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="submit-form stack" onSubmit={submit}>
        <h3>과제 제출</h3>
        <PersonFields value={person} onChange={setPerson} members={members} idPrefix={`assignment-${a.assignmentId}`} />
        <div className="row">
          <label className="field grow">
            <span>제출 링크 (GitHub 등)</span>
            <input
              className="input"
              type="url"
              placeholder="https://github.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </label>
          <label className="field grow">
            <span>파일 첨부 (최대 {MAX_FILE_MB}MB)</span>
            <input key={fileKey} className="input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small muted">링크와 파일 중 하나 이상. 다시 제출하면 이전 제출을 덮어써요.</span>
          <button className="btn btn-brand" type="submit" disabled={sending}>
            {sending ? "제출 중..." : "제출"}
          </button>
        </div>
        {error && <div className="notice notice-error">{error}</div>}
      </form>
    </article>
  );
}

export default AssignmentPage;
