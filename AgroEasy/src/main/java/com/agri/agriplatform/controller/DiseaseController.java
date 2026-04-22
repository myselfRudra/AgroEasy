package com.agri.agriplatform.controller;

import com.agri.agriplatform.service.DiseaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/disease")
public class DiseaseController {

    @Autowired
    private DiseaseService service;

    @PostMapping("/detect")
    public String detect(@RequestParam("file") MultipartFile file) {
        return service.detectDisease(file);
    }
}