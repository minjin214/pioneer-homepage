import React, { useEffect, useState } from "react";
import API from "../api";

const STORAGE_KEY = "pioneer.person";

// 이 브라우저에서 마지막으로 입력한 학번/이름 (편의 기능, 실패해도 무시)
export function loadPerson() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved.studentNumber === "string" && typeof saved.name === "string") return saved;
  } catch {
    /* 저장소를 쓸 수 없는 환경 */
  }
  return { studentNumber: "", name: "" };
}

export function savePerson(person) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(person));
  } catch {
    /* 무시 */
  }
}

// 부원 명단 (학번 자동완성용)
export function useMembers() {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    API.get("/api/members")
      .then((res) => setMembers(res.data.data || []))
      .catch(() => setMembers([]));
  }, []);
  return members;
}

/**
 * 학번 + 이름 입력칸. 부원 명단에 있는 학번을 고르면 이름이 자동으로 채워진다.
 */
function PersonFields({ value, onChange, members, idPrefix }) {
  const listId = `${idPrefix}-members`;

  const changeStudentNumber = (studentNumber) => {
    const match = members.find((m) => m.studentNumber === studentNumber.trim());
    onChange({ studentNumber, name: match ? match.name : value.name });
  };

  return (
    <div className="row">
      <label className="field grow">
        <span>학번</span>
        <input
          className="input"
          list={listId}
          inputMode="numeric"
          placeholder="예: 20230001"
          value={value.studentNumber}
          onChange={(e) => changeStudentNumber(e.target.value)}
        />
        <datalist id={listId}>
          {members.map((m) => (
            <option key={m.memberId} value={m.studentNumber}>
              {m.name}
            </option>
          ))}
        </datalist>
      </label>
      <label className="field grow">
        <span>이름</span>
        <input
          className="input"
          placeholder="이름"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </label>
    </div>
  );
}

export default PersonFields;
