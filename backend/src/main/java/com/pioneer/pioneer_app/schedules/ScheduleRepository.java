package com.pioneer.pioneer_app.schedules;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findAllByOrderByDateAsc();
    List<Schedule> findByDateOrderByScheduleIdAsc(LocalDate date);
}
