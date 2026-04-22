package com.agri.agriplatform.controller;

import com.agri.agriplatform.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/predict")
public class PredictionController {

    @Autowired
    private PredictionService service;

    @GetMapping("/{crop}")
    public String predict(@PathVariable String crop) {
        return service.predictPrice(crop);
    }
}