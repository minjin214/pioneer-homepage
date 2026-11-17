import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import API, { errorMessage } from "../api";
import { useDialog } from "../components/Dialog";
import { formatDate, parseYmd, toYmd } from "../utils/date";

const EMPTY_FORM = { title: "", location: "", locationUrl: "", description: "", important: false };
const isHttpUrl = (v) => /^https?:\/\/.+/i.test(v);

function SchedulePage() {
  const { confirm, notify } = useDialog();
  const [selected, setSelected] = useState(toYmd(new Date()));
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await API.get("/api/schedules");
      setSchedules(res.data.data || []);
    } catch (err) {
      setError(errorMessage(err, "일정을 불러오지 못했어요."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // 날짜별로 묶어서 달력 표시와 목록에 사용
  const byDate = useMemo(() => {
    const map = {};
    schedules.forEach((s) => {
      (map[s.date] = map[s.date] || []).push(s);
    });
    return map;
  }, [schedules]);

  const dayEvents = byDate[selected] || [];

  const update = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const add = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("제목을 입력하세요.");
    if (form.locationUrl && !isHttpUrl(form.locationUrl.trim())) {
      return setError("장소 링크는 http:// 또는 https:// 로 시작해야 해요.");
    }
    setSaving(true);
    try {
      await API.post("/api/schedules", { ...form, date: selected });
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(errorMessage(err, "일정을 등록하지 못했어요."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!(await confirm(`'${s.title}' 일정을 삭제할까요?`, { confirmLabel: "삭제", danger: true }))) return;
    try {
      await API.delete(`/api/schedules/${s.scheduleId}`);
      await load();
    } catch (err) {
      await notify(errorMessage(err, "삭제하지 못했어요."));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>일정</h1>
          <p>모임, 스터디, 행사 일정을 함께 관리해요.</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <Calendar
            value={parseYmd(selected)}
            onChange={(d) => setSelected(toYmd(d))}
            calendarType="gregory"
            formatDay={(_, d) => d.getDate()}
            tileContent={({ date, view }) => {
              if (view !== "month") return null;
              const events = byDate[toYmd(date)];
              if (!events) return null;
              return <span className={`cal-dot ${events.some((s) => s.important) ? "important" : ""}`} />;
            }}
          />
          <div className="row small muted" style={{ marginTop: 12, gap: 16 }}>
            <span className="row" style={{ gap: 6 }}><span className="cal-dot" style={{ position: "static", transform: "none" }} /> 일정</span>
            <span className="row" style={{ gap: 6 }}><span className="cal-dot important" style={{ position: "static", transform: "none" }} /> 중요 일정</span>
          </div>
        </section>

        <div>
          <section className="card">
            <div className="card-title">{formatDate(selected)}</div>
            {dayEvents.length === 0 ? (
              <div className="empty">이 날은 일정이 없어요.</div>
            ) : (
              <div className="list">
                {dayEvents.map((s) => (
                  <div className="item" key={s.scheduleId}>
                    <div className="item-head">
                      <div className="item-title">
                        {s.title}
                        {s.important && <span className="badge badge-danger">중요</span>}
                      </div>
                      <button className="btn btn-danger-text btn-sm" onClick={() => remove(s)}>삭제</button>
                    </div>
                    {(s.location || s.locationUrl) && (
                      <div className="meta">
                        <span>
                          장소{" "}
                          {s.locationUrl ? (
                            <a className="link" href={s.locationUrl} target="_blank" rel="noopener noreferrer">
                              {s.location || s.locationUrl} ↗
                            </a>
                          ) : (
                            s.location
                          )}
                        </span>
                      </div>
                    )}
                    {s.description && <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{s.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <form className="card stack" onSubmit={add}>
            <div className="card-title" style={{ marginBottom: 0 }}>일정 추가 · {formatDate(selected)}</div>
            <label className="field">
              <span>제목</span>
              <input className="input" value={form.title} onChange={update("title")} placeholder="예: 정기 모임" />
            </label>
            <div className="row">
              <label className="field grow">
                <span>장소</span>
                <input className="input" value={form.location} onChange={update("location")} placeholder="예: 공학관 302호" />
              </label>
              <label className="field grow">
                <span>장소 링크 (선택)</span>
                <input
                  className="input"
                  type="url"
                  value={form.locationUrl}
                  onChange={update("locationUrl")}
                  placeholder="지도·줌·디스코드 링크"
                />
              </label>
            </div>
            <label className="field">
              <span>내용</span>
              <textarea className="textarea" value={form.description} onChange={update("description")} placeholder="준비물, 안내 사항 등" />
            </label>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <label className="check">
                <input type="checkbox" checked={form.important} onChange={update("important")} />
                중요 일정
              </label>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "등록 중..." : "등록"}
              </button>
            </div>
            {error && <div className="notice notice-error">{error}</div>}
          </form>
        </div>
      </div>
    </>
  );
}

export default SchedulePage;
