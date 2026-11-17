package com.pioneer.pioneer_app.members;

import com.pioneer.pioneer_app.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberRepository repo;

    public MemberController(MemberRepository repo) {
        this.repo = repo;
    }

    // 부원 목록 (학번 순)
    @GetMapping
    public ApiResponse<List<MemberResponse>> list() {
        var items = repo.findAll(Sort.by("studentNumber")).stream()
                .map(MemberResponse::new)
                .toList();
        return ApiResponse.success("부원 목록 조회 성공", items);
    }

    // 부원 추가
    @PostMapping
    public ApiResponse<MemberResponse> create(@Valid @RequestBody MemberRequest req) {
        String studentNumber = req.studentNumber().trim();
        if (repo.existsByStudentNumber(studentNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 등록된 학번입니다.");
        }
        Member m = new Member();
        m.setName(req.name().trim());
        m.setStudentNumber(studentNumber);
        m.setDepartment(req.department().trim());
        m.setGrade(req.grade());
        m.setPosition(req.position());
        return ApiResponse.success("부원 추가 완료", new MemberResponse(repo.save(m)));
    }
}
