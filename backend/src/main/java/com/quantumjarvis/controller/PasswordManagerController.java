package com.quantumjarvis.controller;

import com.quantumjarvis.dto.BulkUpdateDto;
import com.quantumjarvis.dto.ChangePasswordDto;
import com.quantumjarvis.dto.PasswordEntryDto;
import com.quantumjarvis.model.User;
import com.quantumjarvis.service.PasswordEntryService;
import com.quantumjarvis.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passwords")
@RequiredArgsConstructor
public class PasswordManagerController {
    private final PasswordEntryService passwordEntryService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PasswordEntryDto>> getAll(Authentication authentication, HttpSession session) {
        User user = getUser(authentication);
        String masterPassword = (String) session.getAttribute("MASTER_PASSWORD");
        return ResponseEntity.ok(passwordEntryService.getAllPasswords(user, masterPassword));
    }

    @PostMapping
    public ResponseEntity<PasswordEntryDto> add(@RequestBody PasswordEntryDto dto, Authentication authentication, HttpSession session) {
        User user = getUser(authentication);
        String masterPassword = (String) session.getAttribute("MASTER_PASSWORD");
        return ResponseEntity.ok(passwordEntryService.addPassword(user, dto, masterPassword));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PasswordEntryDto> update(@PathVariable Long id, @RequestBody PasswordEntryDto dto, Authentication authentication, HttpSession session) {
        User user = getUser(authentication);
        String masterPassword = (String) session.getAttribute("MASTER_PASSWORD");
        return ResponseEntity.ok(passwordEntryService.updatePassword(user, id, dto, masterPassword));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        passwordEntryService.deletePassword(user, id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bulk-update")
    public ResponseEntity<?> bulkUpdate(@RequestBody BulkUpdateDto dto, Authentication authentication, HttpSession session) {
        User user = getUser(authentication);
        String masterPassword = (String) session.getAttribute("MASTER_PASSWORD");
        passwordEntryService.bulkUpdatePasswords(user, dto.getIds(), dto.getNewPassword(), masterPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-master-password")
    public ResponseEntity<?> changeMasterPassword(@RequestBody ChangePasswordDto dto, Authentication authentication, HttpSession session) {
        User user = getUser(authentication);
        passwordEntryService.changeMasterPassword(user, dto.getOldPassword(), dto.getNewPassword());
        // Update session with new master password
        session.setAttribute("MASTER_PASSWORD", dto.getNewPassword());
        return ResponseEntity.ok("Master password changed successfully and all entries re-encrypted.");
    }

    private User getUser(Authentication authentication) {
        return userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
