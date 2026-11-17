package com.pioneer.pioneer_app.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AttendanceRequest(
        @NotBlank String studentNumber,
        @NotBlank String name,
        @NotNull LocalDate date,
        @NotNull Attendance.Status status,
        String reason
) {}
