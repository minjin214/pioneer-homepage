package com.pioneer.pioneer_app.attendance;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDateOrderByStudentNumberAsc(LocalDate date);
    List<Attendance> findAllByOrderByDateDescStudentNumberAsc();
    Optional<Attendance> findByStudentNumberAndDate(String studentNumber, LocalDate date);
}
