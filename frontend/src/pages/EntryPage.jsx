import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { errorMessage } from "../api";
import logo from "../assets/pioneer-intro.png";
import "./EntryPage.css";

function EntryPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 이미 입장한 상태면 바로 홈으로
  useEffect(() => {
    API.get("/api/access")
      .then((res) => {
        if (res.data.data?.granted) navigate("/", { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  const enter = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      await API.post("/api/access", { password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "서버에 연결할 수 없어요."));
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="entry">
      <form className="entry-card" onSubmit={enter}>
        <img className="entry-logo" src={logo} alt="PIONEER 로고" />
        <h1>PIONEER</h1>
        <p className="muted">부원 전용 공간이에요. 동아리 비밀번호를 입력하세요.</p>

        <input
          className="input entry-input"
          type="password"
          placeholder="입장 비밀번호"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="notice notice-error">{error}</div>}
        <button className="btn btn-primary btn-block" type="submit" disabled={loading || !password}>
          {loading ? "확인 중..." : "입장하기"}
        </button>
      </form>
    </div>
  );
}

export default EntryPage;
