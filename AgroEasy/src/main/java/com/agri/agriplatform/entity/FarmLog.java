package com.agri.agriplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "farm_logs")
public class FarmLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // farmer id
    private String cropName; // rice, wheat etc
    private String activity; // watering, fertilizer etc
    private String note; // optional details
    private LocalDate date;
}