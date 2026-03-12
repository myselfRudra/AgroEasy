package com.agri.agriplatform.controller;

import com.agri.agriplatform.entity.FarmLog;
import com.agri.agriplatform.service.FarmLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farm")
public class FarmLogController {

    @Autowired
    private FarmLogService service;

    @PostMapping("/add")
    public FarmLog add(@RequestBody FarmLog log) {
        return service.addLog(log);
    }

    @GetMapping("/logs/{userId}")
    public List<FarmLog> getLogs(@PathVariable Long userId) {
        return service.getLogs(userId);
    }
}