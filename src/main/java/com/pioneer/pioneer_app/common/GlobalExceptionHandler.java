package com.pioneer.pioneer_app.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // 예외 발생시 변경 컨트롤러, 전역 예외를 모두 처리해 통일된 포맷으로 반환

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 컨트롤러에서 던진 ResponseStatusException을 포맷에 맞춰 반환
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse<Void>> handleRse(ResponseStatusException e) {
        HttpStatus code = HttpStatus.valueOf(e.getStatusCode().value());
        return ResponseEntity.status(code).body(ApiResponse.fail(e.getReason() == null ? code.getReasonPhrase() : e.getReason()));
    }

    // @Valid 검증 실패: 첫 번째 필드 오류를 알려줌
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleInvalid(MethodArgumentNotValidException e) {
        var err = e.getBindingResult().getFieldError();
        String msg = (err == null) ? "입력값을 확인하세요." : err.getField() + ": " + err.getDefaultMessage();
        return ResponseEntity.badRequest().body(ApiResponse.fail(msg));
    }

    // 잘못된 JSON, 누락/형식 오류 파라미터
    @ExceptionHandler({HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(Exception e) {
        return ResponseEntity.badRequest().body(ApiResponse.fail("입력값 형식이 올바르지 않습니다."));
    }

    // 첨부 파일 용량 초과
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleTooLarge(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(ApiResponse.fail("파일은 20MB까지 올릴 수 있습니다."));
    }

    // 중복 데이터 (같은 학번 등)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail("이미 같은 데이터가 있습니다."));
    }

    // 그 외 모든 오류도 동일 포맷팅
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleEtc(Exception e) {
        log.error("처리되지 않은 오류", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("서버 오류가 발생했습니다."));
    }
}
