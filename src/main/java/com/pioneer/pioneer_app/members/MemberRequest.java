package com.pioneer.pioneer_app.members;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MemberRequest(
        @NotBlank String name,
        @NotBlank String studentNumber,
        @NotBlank String department,
        @Min(1) @Max(6) Integer grade,
        @NotNull Member.Position position
) {}
