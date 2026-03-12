package com.agri.agriplatform.repository;

import com.agri.agriplatform.entity.FarmLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmLogRepository extends JpaRepository<FarmLog, Long> {
    List<FarmLog> findByUserId(Long userId);
}