package com.pioneer.pioneer_app.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * 출석 기록. 계정 대신 학번 + 이름으로 누구인지 기록한다.
 * 같은 학번은 날짜마다 한 건만 가진다 (다시 등록하면 수정됨).
 */
@Entity
@Table(name = "attendance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_number", "date"}))
@Getter @Setter @NoArgsConstructor
public class Attendance {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    @Column(name = "student_number", nullable = false)
    private String studentNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    private String reason; // 불참 사유

    public enum Status {
        ATTEND("참석"),
        ABSENT("불참");

        private final String display;
        Status(String display) { this.display = display; }
        public String getDisplay() { return display; }
    }
}
