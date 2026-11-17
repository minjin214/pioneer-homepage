package com.pioneer.pioneer_app.assignments;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Getter @Setter @NoArgsConstructor
public class Assignment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentId;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    private LocalDate deadline;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type {
        STUDY("스터디"), PROGRAMMING("프로그래밍"), PROJECT("프로젝트");

        private final String display;
        Type(String display) { this.display = display; }
        public String getDisplay() { return display; }
    }
}
