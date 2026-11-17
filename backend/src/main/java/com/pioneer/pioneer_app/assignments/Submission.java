package com.pioneer.pioneer_app.assignments;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 과제 제출. 학번 + 이름으로 누가 냈는지 기록하고,
 * 제출물은 링크(git 등)와 첨부 파일 중 하나 이상을 가진다.
 * 같은 과제에 같은 학번이 다시 제출하면 기존 제출을 덮어쓴다.
 */
@Entity
@Table(name = "submissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_number"}))
@Getter @Setter @NoArgsConstructor
public class Submission {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long submissionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @Column(name = "student_number", nullable = false)
    private String studentNumber;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String link;

    private String originalFileName; // 사용자가 올린 파일 이름 (다운로드 시 표시)

    private String storedFileName;   // 서버에 저장된 파일 이름 (UUID 기반)

    private LocalDateTime submittedAt = LocalDateTime.now();
}
