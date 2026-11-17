package com.pioneer.pioneer_app.access;

import com.pioneer.pioneer_app.common.ApiResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

/**
 * 동아리 공용 입장 비밀번호.
 * 개인 계정 없이, 비밀번호를 아는 사람만 사이트를 쓸 수 있게 한다 (오픈채팅 입장 방식).
 * 비밀번호가 맞으면 세션에 입장 표시만 남긴다.
 */
@RestController
@RequestMapping("/api/access")
public class AccessController {

    public static final String SESSION_KEY = "CLUB_ACCESS";

    private final byte[] clubPassword;

    public AccessController(@Value("${app.club-password}") String clubPassword) {
        this.clubPassword = clubPassword.getBytes(StandardCharsets.UTF_8);
    }

    // 입장 여부 확인
    @GetMapping
    public ApiResponse<Map<String, Boolean>> status(HttpSession session) {
        boolean granted = Boolean.TRUE.equals(session.getAttribute(SESSION_KEY));
        return ApiResponse.success("입장 상태", Map.of("granted", granted));
    }

    // 입장: 비밀번호 확인
    @PostMapping
    public ApiResponse<Void> enter(@RequestBody Map<String, String> body, HttpSession session) {
        String input = body.getOrDefault("password", "");
        // 타이밍 공격을 피하기 위해 고정 시간 비교
        if (!MessageDigest.isEqual(clubPassword, input.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다.");
        }
        session.setAttribute(SESSION_KEY, true);
        return ApiResponse.success("입장 완료");
    }

    // 나가기
    @PostMapping("/leave")
    public ApiResponse<Void> leave(HttpSession session) {
        session.invalidate();
        return ApiResponse.success("나가기 완료");
    }
}
