package com.pioneer.pioneer_app.assignments;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentAssignmentIdOrderBySubmittedAtAsc(Long assignmentId);
    Optional<Submission> findByAssignmentAssignmentIdAndStudentNumber(Long assignmentId, String studentNumber);
}
