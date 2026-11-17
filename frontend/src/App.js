import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RequireAccess from "./components/RequireAccess";
import Layout from "./components/Layout";
import EntryPage from "./pages/EntryPage";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import MembersPage from "./pages/MembersPage";
import AttendancePage from "./pages/AttendancePage";
import AssignmentPage from "./pages/AssignmentPage";

function App() {
  return (
    <Routes>
      {/* 입장 비밀번호 화면 */}
      <Route path="/enter" element={<EntryPage />} />

      {/* 입장한 사람만 */}
      <Route element={<RequireAccess />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/assignments" element={<AssignmentPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
