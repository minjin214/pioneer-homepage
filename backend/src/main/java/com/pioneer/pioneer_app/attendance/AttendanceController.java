package com.pioneer.pioneer_app.attendance;

import com.pioneer.pioneer_app.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {

    private final AttendanceRepository repo;

    public AttendanceController(AttendanceRepository repo) {
        this.repo = repo;
    }

    // 출석 조회: date가 있으면 그 날짜만, 없으면 전체 (최신 날짜 순)
    @GetMapping
    public ApiResponse<List<AttendanceResponse>> list(@RequestParam(required = false) LocalDate date) {
        var rows = (date != null)
                ? repo.findByDateOrderByStudentNumberAsc(date)
                : repo.findAllByOrderByDateDescStudentNumberAsc();
        return ApiResponse.success("출석 조회 성공", rows.stream().map(AttendanceResponse::new).toList());
    }

    // 출석 등록: 같은 학번·같은 날짜가 이미 있으면 그 기록을 수정
    @PostMapping
    public ApiResponse<AttendanceResponse> upsert(@Valid @RequestBody AttendanceRequest req) {
        String studentNumber = req.studentNumber().trim();
        Attendance a = repo.findByStudentNumberAndDate(studentNumber, req.date())
                .orElseGet(Attendance::new);
        a.setStudentNumber(studentNumber);
        a.setName(req.name().trim());
        a.setDate(req.date());
        a.setStatus(req.status());
        a.setReason(req.status() == Attendance.Status.ABSENT ? blankToNull(req.reason()) : null);
        return ApiResponse.success("출석 저장 완료", new AttendanceResponse(repo.save(a)));
    }

    // 상태/사유 수정
    @PatchMapping("/{id}")
    public ApiResponse<AttendanceResponse> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Attendance a = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "출석 기록이 없습니다."));
        if (body.containsKey("status")) {
            try {
                a.setStatus(Attendance.Status.valueOf(body.get("status")));
            } catch (IllegalArgumentException | NullPointerException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "상태는 ATTEND 또는 ABSENT만 가능합니다.");
            }
        }
        if (body.containsKey("reason")) a.setReason(blankToNull(body.get("reason")));
        if (a.getStatus() == Attendance.Status.ATTEND) a.setReason(null);
        return ApiResponse.success("출석 수정 완료", new AttendanceResponse(repo.save(a)));
    }

    // 잘못 등록한 기록 삭제
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "출석 기록이 없습니다.");
        }
        repo.deleteById(id);
        return ApiResponse.success("출석 삭제 완료");
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
