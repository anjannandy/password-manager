package com.quantumjarvis.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Setting {
    @Id
    private String key;

    @Column(nullable = false)
    private String value;
}
