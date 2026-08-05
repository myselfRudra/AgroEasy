package com.agroeasy.controller;

import com.agroeasy.service.PesticideService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pesticides")
public class PesticideController {

    private final PesticideService pesticideService;

    public PesticideController(PesticideService pesticideService) {
        this.pesticideService = pesticideService;
    }

    @GetMapping
    public List<Map<String, String>> getReference() {
        return pesticideService.getReference();
    }
}
