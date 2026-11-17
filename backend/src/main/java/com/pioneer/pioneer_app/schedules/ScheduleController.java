package com.pioneer.pioneer_app.schedules;

import com.pioneer.pioneer_app.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService service;

    public ScheduleController(ScheduleService service) {
        this.service = service;
    }

    // 일정 목록 (date가 있으면 그 날짜만)
    @GetMapping
    public ApiResponse<List<ScheduleResponse>> list(@RequestParam(required = false) LocalDate date) {
        var items = (date != null) ? service.findByDate(date) : service.findAll();
        return ApiResponse.success("일정 조회 성공", items);
    }

    // 일정 등록 (부원 누구나)
    @PostMapping
    public ApiResponse<ScheduleResponse> create(@Valid @RequestBody ScheduleRequest req) {
        return ApiResponse.success("일정 등록 성공", service.create(req));
    }

    // 일정 수정
    @PutMapping("/{id}")
    public ApiResponse<ScheduleResponse> update(@PathVariable Long id, @Valid @RequestBody ScheduleRequest req) {
        return ApiResponse.success("일정 수정 성공", service.update(id, req));
    }

    // 일정 삭제
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("일정 삭제 성공");
    }
}
