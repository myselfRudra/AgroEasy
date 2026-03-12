package com.agri.agriplatform.service;

import com.agri.agriplatform.entity.FarmLog;
import com.agri.agriplatform.repository.FarmLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FarmLogService {

    @Autowired
    private FarmLogRepository repo;

    public FarmLog addLog(FarmLog log) {
        return repo.save(log);
    }

    public List<FarmLog> getLogs(Long userId) {
        return repo.findByUserId(userId);
    }
}