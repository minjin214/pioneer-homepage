import React, { useCallback, useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import API, { errorMessage } from "../api";
import PersonFields, { loadPerson, savePerson, useMembers } from "../components/PersonFields";
import { formatDate, parseYmd, toYmd } from "../utils/date";

function StatusToggle({ value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label="참석 여부">
      <button type="button" className={value === "ATTEND" ? "on-attend" : ""} onClick={() => onChange("ATTEND")}>
        참석
      </button>
      <button type="button" className={value === "ABSENT" ? "on-absent" : ""} onClick={() => onChange("ABSENT")}>
        불참
      </button>
    </div>
  );
}

function AttendancePage() {
  const members = useMembers();
  const [selected, setSelected] = useState(toYmd(new Date()));
  const [records, setRecords] = useState([]);
  const [person, setPerson] = useState(loadPerson);
  const [status, setStatus] = useState("ATTEND");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await API.get("/api/attendances");
      setRecords(res.data.data || []);
    } catch (err) {
      setError(errorMessage(err, "출석 기록을 불러오지 못했어요."));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const datesWithRecords = useMemo(() => new Set(records.map((r) => r.date)), [records]);
  const dayRecords = records.filter((r) => r.date === selected);
  const attendCount = dayRecords.filter((r) => r.status === "ATTEND").length;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!person.studentNumber.trim() || !person.name.trim()) return setError("학번과 이름을 입력하세요.");
    setSaving(true);
    try {
      await API.post("/api/attendances", {
        studentNumber: person.studentNumber,
        name: person.name,
        date: selected,
        status,
        reason: status === "ABSENT" ? reason : null,
      });
      savePerson(person);
      setReason("");
      await load();
    } catch (err) {
      setError(errorMessage(err, "출석을 저장하지 못했어요."));
    } finally {
      setSaving(false);
    }
  };

  const patch = async (id, body) => {
    try {
      await API.patch(`/api/attendances/${id}`, body);
      await load();
    } catch (err) {
      alert(errorMessage(err, "수정하지 못했어요."));
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`${r.name}(${r.studentNumber})의 ${formatDate(r.date)} 기록을 삭제할까요?`)) return;
    try {
      await API.delete(`/api/attendances/${r.attendanceId}`);
      await load();
    } catch (err) {
      alert(errorMessage(err, "삭제하지 못했어요."));
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>출석</h1>
          <p>날짜를 고르고 학번과 이름으로 참석 여부를 남겨요.</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <Calendar
            value={parseYmd(selected)}
            onChange={(d) => setSelected(toYmd(d))}
            calendarType="gregory"
            formatDay={(_, d) => d.getDate()}
            tileContent={({ date, view }) =>
              view === "month" && datesWithRecords.has(toYmd(date)) ? <span className="cal-dot" /> : null
            }
          />
        </section>

        <div>
          <form className="card stack" onSubmit={submit}>
            <div className="card-title" style={{ marginBottom: 0 }}>{formatDate(selected)} 출석 체크</div>
            <PersonFields value={person} onChange={setPerson} members={members} idPrefix="attendance" />
            <div className="row">
              <StatusToggle value={status} onChange={setStatus} />
              {status === "ABSENT" && (
                <input
                  className="input grow"
                  placeholder="불참 사유 (선택)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              )}
            </div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="small muted">같은 날 다시 등록하면 기존 기록이 바뀌어요.</span>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
            {error && <div className="notice notice-error">{error}</div>}
          </form>

          <section className="card">
            <div className="card-title">
              참석 현황
              <span className="row" style={{ gap: 6 }}>
                <span className="badge badge-success">참석 {attendCount}</span>
                <span className="badge badge-danger">불참 {dayRecords.length - attendCount}</span>
              </span>
            </div>
            {dayRecords.length === 0 ? (
              <div className="empty">이 날의 출석 기록이 없어요.</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>학번</th>
                      <th>참석 여부</th>
                      <th>불참 사유</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {dayRecords.map((r) => (
                      <tr key={r.attendanceId}>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td className="muted">{r.studentNumber}</td>
                        <td>
                          <StatusToggle value={r.status} onChange={(s) => s !== r.status && patch(r.attendanceId, { status: s })} />
                        </td>
                        <td>
                          {r.status === "ABSENT" ? (
                            <input
                              key={`${r.attendanceId}-${r.reason ?? ""}`}
                              className="input"
                              style={{ minWidth: 120 }}
                              defaultValue={r.reason ?? ""}
                              placeholder="사유"
                              onBlur={(e) =>
                                e.target.value !== (r.reason ?? "") && patch(r.attendanceId, { reason: e.target.value })
                              }
                            />
                          ) : (
                            <span className="muted">-</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-danger-text btn-sm" onClick={() => remove(r)}>삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default AttendancePage;
