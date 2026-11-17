package com.pioneer.pioneer_app.attendance;

import java.time.LocalDate;

public record AttendanceResponse(
        Long attendanceId,
        String studentNumber,
        String name,
        LocalDate date,
        String status,        // ATTEND / ABSENT
        String statusDisplay, // 참석 / 불참
        String reason
) {
    public AttendanceResponse(Attendance a) {
        this(a.getAttendanceId(), a.getStudentNumber(), a.getName(), a.getDate(),
                a.getStatus().name(), a.getStatus().getDisplay(), a.getReason());
    }
}
