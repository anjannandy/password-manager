package com.quantumjarvis.controller;

import com.quantumjarvis.dto.LoginRequest;
import com.quantumjarvis.model.User;
import com.quantumjarvis.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody LoginRequest registrationRequest) {
        try {
            userService.register(registrationRequest.getUsername(), registrationRequest.getPassword());
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        System.out.println("[DEBUG_LOG] Login attempt for user: " + loginRequest.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            
            // Critical fix for Spring Security 6+ session persistence
            SecurityContextHolder.getContext().setAuthentication(authentication);
            jakarta.servlet.http.HttpSession session = request.getSession(true);
            session.setAttribute("MASTER_PASSWORD", loginRequest.getPassword());
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            System.out.println("[DEBUG_LOG] Authentication successful and context saved for: " + loginRequest.getUsername());
            System.out.println("[DEBUG_LOG] Session ID: " + session.getId());

            return ResponseEntity.ok("Logged in successfully");
        } catch (Exception e) {
            System.out.println("[DEBUG_LOG] Authentication failed: " + e.getMessage());
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication, HttpServletRequest request) {
        if (authentication == null) {
            System.out.println("[DEBUG_LOG] /me called with NULL authentication");
            return ResponseEntity.status(401).build();
        }
        System.out.println("[DEBUG_LOG] /me called for: " + authentication.getName());
        HttpSession session = request.getSession(false);
        if (session != null) {
            System.out.println("[DEBUG_LOG] Session found for /me, ID: " + session.getId());
            if (session.getAttribute("MASTER_PASSWORD") == null) {
                System.out.println("[DEBUG_LOG] MASTER_PASSWORD missing in session!");
            }
        } else {
            System.out.println("[DEBUG_LOG] No session found for /me");
        }
        return ResponseEntity.ok(userService.findByUsername(authentication.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/registration-disabled")
    public ResponseEntity<Boolean> isRegistrationDisabled() {
        return ResponseEntity.ok(userService.isRegistrationDisabled());
    }

    @PostMapping("/registration-toggle")
    public ResponseEntity<?> toggleRegistration(@RequestParam boolean enabled, Authentication authentication) {
        User user = userService.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.isAdmin()) {
            return ResponseEntity.status(403).body("Only admins can toggle registration");
        }
        userService.setRegistrationEnabled(enabled);
        return ResponseEntity.ok("Registration " + (enabled ? "enabled" : "disabled"));
    }
}
