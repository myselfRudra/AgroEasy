package com.agroeasy.controller;

import com.agroeasy.dto.AiTextResponse;
import com.agroeasy.dto.GuideRequest;
import com.agroeasy.service.AiService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guide")
public class GuideController {

    private final AiService aiService;

    public GuideController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/ask")
    public AiTextResponse ask(@Valid @RequestBody GuideRequest req) {
        String answer = aiService.answerGuideQuestion(req.getQuestion(), req.getLanguage());
        return new AiTextResponse(answer);
    }
}
