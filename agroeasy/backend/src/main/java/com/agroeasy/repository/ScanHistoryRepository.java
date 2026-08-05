package com.agroeasy.repository;

import com.agroeasy.model.ScanHistory;
import com.agroeasy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Long> {
    List<ScanHistory> findTop10ByUserOrderByCreatedAtDesc(User user);
}
