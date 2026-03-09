package com.quantumjarvis.repository;

import com.quantumjarvis.model.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, String> {
}
