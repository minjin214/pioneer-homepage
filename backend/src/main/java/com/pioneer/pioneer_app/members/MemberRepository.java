package com.pioneer.pioneer_app.members;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByStudentNumber(String studentNumber);
}
