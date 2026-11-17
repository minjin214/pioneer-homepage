package com.pioneer.pioneer_app.members;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 동아리 부원. 로그인 계정이 아니라 명단(사용자 목록)용 정보만 가진다.
 */
@Entity
@Table(name = "members")
@Getter @Setter @NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String studentNumber;

    private String department;

    private Integer grade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Position position;

    public enum Position {
        UNDERGRADUATE("학부"),
        MASTER("석박사"),
        OTHER("기타");

        private final String displayName;

        Position(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
