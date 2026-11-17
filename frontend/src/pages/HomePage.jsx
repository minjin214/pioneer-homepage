import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { dday, formatDate, todayYmd } from "../utils/date";
import "./HomePage.css";

function HomePage() {
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [memberCount, setMemberCount] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      API.get("/api/schedules"),
      API.get("/api/assignments"),
      API.get("/api/members"),
    ]).then(([s, a, m]) => {
      if (s.status === "fulfilled") setSchedules(s.value.data.data || []);
      if (a.status === "fulfilled") setAssignments(a.value.data.data || []);
      if (m.status === "fulfilled") setMemberCount((m.value.data.data || []).length);
    });
  }, []);

  const today = todayYmd();
  const upcoming = schedules.filter((s) => s.date >= today).slice(0, 4);
  const openAssignments = assignments.filter((a) => !a.deadline || a.deadline >= today).slice(0, 4);

  return (
    <>
      <section className="hero">
        <div>
          <p className="hero-date">{formatDate(today)}</p>
          <h1>PIONEER 부원 공간</h1>
          <p className="hero-sub">일정 확인, 출석 체크, 과제 제출을 한곳에서.</p>
        </div>
        <div className="hero-stats">
          <Stat label="다가오는 일정" value={upcoming.length} />
          <Stat label="진행 중 과제" value={openAssignments.length} />
          <Stat label="부원" value={memberCount ?? "-"} />
        </div>
      </section>

      <div className="home-grid">
        <section className="card">
          <div className="card-title">
            다가오는 일정
            <Link className="link small" to="/schedule">전체 보기</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty">예정된 일정이 없어요.</div>
          ) : (
            <div className="list">
              {upcoming.map((s) => (
                <div className="item" key={s.scheduleId}>
                  <div className="item-title">
                    {s.title}
                    {s.important && <span className="badge badge-danger">중요</span>}
                  </div>
                  <div className="meta">
                    <span>{formatDate(s.date)}</span>
                    {s.location && <span>{s.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-title">
            진행 중인 과제
            <Link className="link small" to="/assignments">전체 보기</Link>
          </div>
          {openAssignments.length === 0 ? (
            <div className="empty">진행 중인 과제가 없어요.</div>
          ) : (
            <div className="list">
              {openAssignments.map((a) => (
                <div className="item" key={a.assignmentId}>
                  <div className="item-head">
                    <div className="item-title">
                      {a.title}
                      <span className="badge">{a.typeDisplay}</span>
                    </div>
                    {a.deadline && <span className="badge badge-brand">{dday(a.deadline).label}</span>}
                  </div>
                  <div className="meta">
                    {a.deadline && <span>마감 {formatDate(a.deadline)}</span>}
                    <span>제출 {a.submissions.length}명</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

export default HomePage;
