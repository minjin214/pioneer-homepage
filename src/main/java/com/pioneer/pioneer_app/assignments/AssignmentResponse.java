package com.pioneer.pioneer_app.assignments;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AssignmentResponse(
        Long assignmentId,
        String title,
        String description,
        String type,        // STUDY / PROGRAMMING / PROJECT
        String typeDisplay, // 스터디 / 프로그래밍 / 프로젝트
        LocalDate deadline,
        List<SubmissionResponse> submissions
) {
    public AssignmentResponse(Assignment a, List<SubmissionResponse> submissions) {
        this(a.getAssignmentId(), a.getTitle(), a.getDescription(), a.getType().name(),
                a.getType().getDisplay(), a.getDeadline(), submissions);
    }

    public record SubmissionResponse(
            Long submissionId,
            String studentNumber,
            String name,
            String link,
            String fileName, // 첨부 파일이 없으면 null
            LocalDateTime submittedAt
    ) {
        public SubmissionResponse(Submission s) {
            this(s.getSubmissionId(), s.getStudentNumber(), s.getName(), s.getLink(),
                    s.getOriginalFileName(), s.getSubmittedAt());
        }
    }
}
