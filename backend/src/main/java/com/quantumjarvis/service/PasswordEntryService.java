package com.quantumjarvis.service;

import com.quantumjarvis.dto.PasswordEntryDto;
import com.quantumjarvis.model.PasswordEntry;
import com.quantumjarvis.model.User;
import com.quantumjarvis.repository.PasswordEntryRepository;
import com.quantumjarvis.repository.UserRepository;
import com.quantumjarvis.util.EncryptionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PasswordEntryService {
    private final PasswordEntryRepository passwordEntryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<PasswordEntryDto> getAllPasswords(User user, String masterPassword) {
        return passwordEntryRepository.findByUser(user).stream()
                .map(entry -> convertToDto(entry, masterPassword))
                .collect(Collectors.toList());
    }

    @Transactional
    public PasswordEntryDto addPassword(User user, PasswordEntryDto dto, String masterPassword) {
        PasswordEntry entry = convertToEntity(dto, user, masterPassword);
        PasswordEntry saved = passwordEntryRepository.save(entry);
        return convertToDto(saved, masterPassword);
    }

    @Transactional
    public PasswordEntryDto updatePassword(User user, Long id, PasswordEntryDto dto, String masterPassword) {
        PasswordEntry entry = passwordEntryRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Password entry not found"));

        entry.setSiteName(dto.getSiteName());
        entry.setUrl(dto.getUrl());
        entry.setAccountId(dto.getAccountId());
        try {
            entry.setEncryptedPassword(EncryptionUtils.encrypt(dto.getPassword(), masterPassword));
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
        entry.setResetDate(dto.getResetDate());
        entry.setPhoneNumber(dto.getPhoneNumber());
        entry.setEmailAddress(dto.getEmailAddress());

        PasswordEntry saved = passwordEntryRepository.save(entry);
        return convertToDto(saved, masterPassword);
    }

    @Transactional
    public void deletePassword(User user, Long id) {
        PasswordEntry entry = passwordEntryRepository.findById(id)
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Password entry not found"));
        passwordEntryRepository.delete(entry);
    }

    @Transactional
    public void bulkUpdatePasswords(User user, List<Long> ids, String newPassword, String masterPassword) {
        List<PasswordEntry> entries = passwordEntryRepository.findAllById(ids).stream()
                .filter(e -> e.getUser().getId().equals(user.getId()))
                .collect(Collectors.toList());

        for (PasswordEntry entry : entries) {
            try {
                entry.setEncryptedPassword(EncryptionUtils.encrypt(newPassword, masterPassword));
            } catch (Exception e) {
                throw new RuntimeException("Encryption failed during bulk update", e);
            }
        }
        passwordEntryRepository.saveAll(entries);
    }

    @Transactional
    public void changeMasterPassword(User user, String oldMasterPassword, String newMasterPassword) {
        if (!passwordEncoder.matches(oldMasterPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect old password");
        }

        List<PasswordEntry> entries = passwordEntryRepository.findByUser(user);
        for (PasswordEntry entry : entries) {
            try {
                String decrypted = EncryptionUtils.decrypt(entry.getEncryptedPassword(), oldMasterPassword);
                String reEncrypted = EncryptionUtils.encrypt(decrypted, newMasterPassword);
                entry.setEncryptedPassword(reEncrypted);
            } catch (Exception e) {
                throw new RuntimeException("Re-encryption failed for entry: " + entry.getId(), e);
            }
        }
        
        user.setPassword(passwordEncoder.encode(newMasterPassword));
        userRepository.save(user);
        passwordEntryRepository.saveAll(entries);
    }

    private PasswordEntryDto convertToDto(PasswordEntry entry, String masterPassword) {
        PasswordEntryDto dto = new PasswordEntryDto();
        dto.setId(entry.getId());
        dto.setSiteName(entry.getSiteName());
        dto.setUrl(entry.getUrl());
        dto.setAccountId(entry.getAccountId());
        try {
            dto.setPassword(EncryptionUtils.decrypt(entry.getEncryptedPassword(), masterPassword));
        } catch (Exception e) {
            dto.setPassword("DECRYPTION_FAILED");
        }
        dto.setResetDate(entry.getResetDate());
        dto.setPhoneNumber(entry.getPhoneNumber());
        dto.setEmailAddress(entry.getEmailAddress());
        return dto;
    }

    private PasswordEntry convertToEntity(PasswordEntryDto dto, User user, String masterPassword) {
        try {
            return PasswordEntry.builder()
                    .user(user)
                    .siteName(dto.getSiteName())
                    .url(dto.getUrl())
                    .accountId(dto.getAccountId())
                    .encryptedPassword(EncryptionUtils.encrypt(dto.getPassword(), masterPassword))
                    .resetDate(dto.getResetDate())
                    .phoneNumber(dto.getPhoneNumber())
                    .emailAddress(dto.getEmailAddress())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed during entity conversion", e);
        }
    }
}
