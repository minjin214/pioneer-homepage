package com.pioneer.pioneer_app.schedules;

import java.time.LocalDate;

public record ScheduleResponse(
        Long scheduleId,
        String title,
        LocalDate date,
        String location,
        String locationUrl,
        String description,
        boolean important
) {
    public ScheduleResponse(Schedule s) {
        this(s.getScheduleId(), s.getTitle(), s.getDate(), s.getLocation(),
                s.getLocationUrl(), s.getDescription(), s.isImportant());
    }
}
