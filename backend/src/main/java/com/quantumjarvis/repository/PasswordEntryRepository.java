package com.quantumjarvis.repository;

import com.quantumjarvis.model.PasswordEntry;
import com.quantumjarvis.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PasswordEntryRepository extends JpaRepository<PasswordEntry, Long> {
    List<PasswordEntry> findByUser(User user);
}
