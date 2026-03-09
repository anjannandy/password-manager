package com.quantumjarvis.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PasswordEntryDto {
    private Long id;
    private String siteName;
    private String url;
    private String accountId;
    private String password; // Plain text for input/output, encrypted in DB
    private LocalDate resetDate;
    private String phoneNumber;
    private String emailAddress;
}
