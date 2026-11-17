package com.pioneer.pioneer_app.schedules;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter @Setter @NoArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate date;

    private String location;     // 장소 이름 (예: 공학관 302호, 디스코드)

    @Column(length = 1000)
    private String locationUrl;  // 장소 링크 (지도, 줌/디스코드 초대 링크 등)

    @Column(length = 2000)
    private String description;

    private boolean important = false;
}
