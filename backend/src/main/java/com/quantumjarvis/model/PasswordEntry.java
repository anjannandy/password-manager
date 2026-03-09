package com.quantumjarvis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "password_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String siteName;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String accountId;

    @Column(nullable = false, length = 1000)
    private String encryptedPassword;

    private LocalDate resetDate;

    private String phoneNumber;

    private String emailAddress;
}
