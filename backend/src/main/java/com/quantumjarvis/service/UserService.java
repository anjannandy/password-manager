package com.quantumjarvis.service;

import com.quantumjarvis.model.User;
import com.quantumjarvis.model.Setting;
import com.quantumjarvis.repository.UserRepository;
import com.quantumjarvis.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final SettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String REGISTRATION_ENABLED_KEY = "REGISTRATION_ENABLED";

    @Transactional
    public User register(String username, String password) {
        if (isRegistrationDisabled() && userRepository.count() > 0) {
            throw new RuntimeException("Registration is currently disabled.");
        }

        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists.");
        }

        boolean isFirstUser = userRepository.count() == 0;
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .isAdmin(isFirstUser)
                .build();

        User savedUser = userRepository.save(user);

        // If it was the first user, ensure registration is enabled by default
        if (isFirstUser) {
            setRegistrationEnabled(true);
        }

        return savedUser;
    }

    public boolean isRegistrationDisabled() {
        return settingRepository.findById(REGISTRATION_ENABLED_KEY)
                .map(s -> "false".equalsIgnoreCase(s.getValue()))
                .orElse(false);
    }

    public void setRegistrationEnabled(boolean enabled) {
        settingRepository.save(new Setting(REGISTRATION_ENABLED_KEY, String.valueOf(enabled)));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
