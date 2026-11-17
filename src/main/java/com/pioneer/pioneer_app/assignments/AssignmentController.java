package com.pioneer.pioneer_app.assignments;

import com.pioneer.pioneer_app.assignments.AssignmentResponse.SubmissionResponse;
import com.pioneer.pioneer_app.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AssignmentController {

    private final AssignmentRepository assignments;
    private final SubmissionRepository submissions;
    private final FileStorage files;

    public AssignmentController(AssignmentRepository assignments, SubmissionRepository submissions, FileStorage files) {
        this.assignments = assignments;
        this.submissions = submissions;
        this.files = files;
    }

    // ── 과제 ────────────────────────────────────────────

    // 과제 목록 (각 과제의 제출 목록 포함). type으로 필터 가능
    @GetMapping("/assignments")
    @Transactional(readOnly = true)
    public ApiResponse<List<AssignmentResponse>> list(@RequestParam(required = false) String type) {
        List<Assignment> rows;
        if (type == null || type.isBlank()) {
            rows = assignments.findAllByOrderByCreatedAtDesc();
        } else {
            rows = assignments.findByTypeOrderByCreatedAtDesc(parseType(type));
        }
        var items = rows.stream().map(this::toResponse).toList();
        return ApiResponse.success("과제 목록 조회 성공", items);
    }

    // 과제 등록 (부원 누구나)
    @PostMapping("/assignments")
    public ApiResponse<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest req) {
        Assignment a = new Assignment();
        a.setTitle(req.title().trim());
        a.setDescription(blankToNull(req.description()));
        a.setType(req.type());
        a.setDeadline(req.deadline());
        return ApiResponse.success("과제 등록 완료", new AssignmentResponse(assignments.save(a), List.of()));
    }

    // 과제 삭제 (제출물과 첨부 파일도 함께 삭제)
    @DeleteMapping("/assignments/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Assignment a = assignments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "과제가 없습니다."));
        var subs = submissions.findByAssignmentAssignmentIdOrderBySubmittedAtAsc(id);
        subs.forEach(s -> files.delete(s.getStoredFileName()));
        submissions.deleteAll(subs);
        assignments.delete(a);
        return ApiResponse.success("과제 삭제 완료");
    }

    // ── 제출 ────────────────────────────────────────────

    // 과제 제출: 링크(git 등)와 파일 중 하나 이상. 같은 학번이 다시 내면 덮어씀
    @PostMapping(value = "/assignments/{id}/submissions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ApiResponse<SubmissionResponse> submit(@PathVariable Long id,
                                                  @RequestParam String studentNumber,
                                                  @RequestParam String name,
                                                  @RequestParam(required = false) String link,
                                                  @RequestPart(required = false) MultipartFile file) {
        Assignment a = assignments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "과제가 없습니다."));

        String sn = studentNumber.trim();
        String nm = name.trim();
        String url = blankToNull(link);
        boolean hasFile = file != null && !file.isEmpty();

        if (sn.isEmpty() || nm.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "학번과 이름을 입력하세요.");
        }
        if (url == null && !hasFile) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "제출 링크나 파일 중 하나는 필요합니다.");
        }
        if (url != null && !url.matches("^https?://.+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "링크는 http:// 또는 https:// 로 시작해야 합니다.");
        }

        Submission s = submissions.findByAssignmentAssignmentIdAndStudentNumber(id, sn).orElseGet(Submission::new);
        s.setAssignment(a);
        s.setStudentNumber(sn);
        s.setName(nm);
        s.setLink(url);
        if (hasFile) {
            files.delete(s.getStoredFileName()); // 다시 제출하면 이전 파일 정리
            s.setStoredFileName(files.save(file));
            s.setOriginalFileName(file.getOriginalFilename());
        }
        s.setSubmittedAt(LocalDateTime.now());
        return ApiResponse.success("과제 제출 완료", new SubmissionResponse(submissions.save(s)));
    }

    // 첨부 파일 다운로드
    @GetMapping("/submissions/{id}/file")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Submission s = submissions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "제출 기록이 없습니다."));
        if (s.getStoredFileName() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "첨부 파일이 없습니다.");
        }
        Resource body = files.load(s.getStoredFileName());
        String filename = s.getOriginalFileName() == null ? "submission" : s.getOriginalFileName();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build().toString())
                .body(body);
    }

    // 제출 취소
    @DeleteMapping("/submissions/{id}")
    public ApiResponse<Void> deleteSubmission(@PathVariable Long id) {
        Submission s = submissions.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "제출 기록이 없습니다."));
        files.delete(s.getStoredFileName());
        submissions.delete(s);
        return ApiResponse.success("제출 취소 완료");
    }

    // ── helpers ────────────────────────────────────────

    private AssignmentResponse toResponse(Assignment a) {
        var subs = submissions.findByAssignmentAssignmentIdOrderBySubmittedAtAsc(a.getAssignmentId()).stream()
                .map(SubmissionResponse::new)
                .toList();
        return new AssignmentResponse(a, subs);
    }

    private static Assignment.Type parseType(String type) {
        try {
            return Assignment.Type.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 과제 유형입니다.");
        }
    }

    private static String blankToNull(String v) {
        return (v == null || v.isBlank()) ? null : v.trim();
    }
}
