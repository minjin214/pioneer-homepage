package com.pioneer.pioneer_app.schedules;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository schedules;

    public ScheduleService(ScheduleRepository schedules) {
        this.schedules = schedules;
    }

    public List<ScheduleResponse> findAll() {
        return schedules.findAllByOrderByDateAsc().stream().map(ScheduleResponse::new).toList();
    }

    public List<ScheduleResponse> findByDate(LocalDate date) {
        return schedules.findByDateOrderByScheduleIdAsc(date).stream().map(ScheduleResponse::new).toList();
    }

    public ScheduleResponse create(ScheduleRequest req) {
        Schedule s = new Schedule();
        apply(s, req);
        return new ScheduleResponse(schedules.save(s));
    }

    public ScheduleResponse update(Long id, ScheduleRequest req) {
        Schedule s = schedules.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다."));
        apply(s, req);
        return new ScheduleResponse(schedules.save(s));
    }

    public void delete(Long id) {
        if (!schedules.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "일정을 찾을 수 없습니다.");
        }
        schedules.deleteById(id);
    }

    private static void apply(Schedule s, ScheduleRequest req) {
        s.setTitle(req.title().trim());
        s.setDate(req.date());
        s.setLocation(blankToNull(req.location()));
        s.setLocationUrl(blankToNull(req.locationUrl()));
        s.setDescription(blankToNull(req.description()));
        s.setImportant(req.important());
    }

    private static String blankToNull(String v) {
        return (v == null || v.isBlank()) ? null : v.trim();
    }
}
