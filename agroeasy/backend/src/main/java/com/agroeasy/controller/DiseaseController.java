package com.agroeasy.controller;

import com.agroeasy.dto.AiTextResponse;
import com.agroeasy.dto.DiseaseScanRequest;
import com.agroeasy.model.ScanHistory;
import com.agroeasy.model.User;
import com.agroeasy.repository.ScanHistoryRepository;
import com.agroeasy.service.AiService;
import com.agroeasy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disease")
public class DiseaseController {

    private final AiService aiService;
    private final UserService userService;
    private final ScanHistoryRepository scanHistoryRepository;

    public DiseaseController(AiService aiService, UserService userService, ScanHistoryRepository scanHistoryRepository) {
        this.aiService = aiService;
        this.userService = userService;
        this.scanHistoryRepository = scanHistoryRepository;
    }

    @PostMapping("/scan")
    public AiTextResponse scan(@Valid @RequestBody DiseaseScanRequest req, Authentication auth) {
        String answer = aiService.diagnoseCropImage(req.getImageBase64(), req.getMediaType(), req.getLanguage());

        if (auth != null) {
            User user = userService.getByEmail((String) auth.getPrincipal());
            ScanHistory scan = new ScanHistory();
            scan.setUser(user);
            scan.setDiagnosisSummary(answer.length() > 500 ? answer.substring(0, 500) : answer);
            scanHistoryRepository.save(scan);
        }
        return new AiTextResponse(answer);
    }
}
