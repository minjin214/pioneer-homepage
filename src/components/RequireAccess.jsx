import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import API from "../api";

// 입장 비밀번호를 통과한 세션만 하위 페이지를 볼 수 있게 하는 가드
function RequireAccess() {
  const [state, setState] = useState("checking"); // checking | granted | denied

  useEffect(() => {
    let cancelled = false;
    API.get("/api/access")
      .then((res) => {
        if (!cancelled) setState(res.data.data?.granted ? "granted" : "denied");
      })
      .catch(() => {
        if (!cancelled) setState("denied");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") return <p className="muted" style={{ padding: 32 }}>불러오는 중...</p>;
  if (state === "denied") return <Navigate to="/enter" replace />;
  return <Outlet />;
}

export default RequireAccess;
