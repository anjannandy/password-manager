package com.quantumjarvis.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkUpdateDto {
    private List<Long> ids;
    private String newPassword;
}
