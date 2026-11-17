package com.pioneer.pioneer_app.assignments;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record AssignmentRequest(
        @NotBlank String title,
        @Size(max = 2000) String description,
        @NotNull Assignment.Type type,
        LocalDate deadline
) {}
