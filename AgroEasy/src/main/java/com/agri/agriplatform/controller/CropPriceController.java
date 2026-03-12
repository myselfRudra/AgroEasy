package com.agri.agriplatform.controller;

import com.agri.agriplatform.entity.CropPrice;
import com.agri.agriplatform.service.CropPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
public class CropPriceController {

    @Autowired
    private CropPriceService service;

    @PostMapping("/add")
    public CropPrice add(@RequestBody CropPrice price) {
        return service.addPrice(price);
    }

    @GetMapping("/today")
    public List<CropPrice> today() {
        return service.todayPrices();
    }

    @GetMapping("/{crop}")
    public List<CropPrice> history(@PathVariable String crop) {
        return service.cropHistory(crop);
    }
}