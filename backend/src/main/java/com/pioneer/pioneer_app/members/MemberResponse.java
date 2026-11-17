package com.pioneer.pioneer_app.members;

public record MemberResponse(
        Long memberId,
        String name,
        String studentNumber,
        String department,
        Integer grade,
        String position // 한글 표시 (학부/석박사/기타)
) {
    public MemberResponse(Member m) {
        this(m.getMemberId(), m.getName(), m.getStudentNumber(), m.getDepartment(),
                m.getGrade(), m.getPosition().getDisplayName());
    }
}
