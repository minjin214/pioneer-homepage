import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import API from "../api";
import logo from "../assets/pioneer-intro.png";
import { useDialog } from "./Dialog";

const LINKS = [
  { to: "/", label: "홈", end: true },
  { to: "/schedule", label: "일정" },
  { to: "/members", label: "부원" },
  { to: "/attendance", label: "출석" },
  { to: "/assignments", label: "과제" },
];

function Layout() {
  const navigate = useNavigate();
  const { confirm } = useDialog();

  const leave = async () => {
    if (!(await confirm("나가면 다시 입장 비밀번호를 입력해야 해요. 나갈까요?", { confirmLabel: "나가기" }))) return;
    try {
      await API.post("/api/access/leave");
    } finally {
      navigate("/enter", { replace: true });
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <img src={logo} alt="" />
            <span>PIONEER</span>
          </NavLink>
          <nav className="nav">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <button className="btn btn-ghost btn-sm" onClick={leave}>
            나가기
          </button>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
