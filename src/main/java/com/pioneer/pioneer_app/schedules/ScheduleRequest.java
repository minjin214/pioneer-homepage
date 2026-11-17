package com.pioneer.pioneer_app.schedules;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ScheduleRequest(
        @NotBlank String title,
        @NotNull LocalDate date,
        String location,
        // http(s) 링크만 허용 (javascript: 같은 링크 방지)
        @Size(max = 1000)
        @Pattern(regexp = "^$|^https?://.+", message = "장소 링크는 http:// 또는 https:// 로 시작해야 합니다.")
        String locationUrl,
        @Size(max = 2000) String description,
        boolean important
) {}
