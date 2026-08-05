package com.agroeasy.controller;

import com.agroeasy.service.PriceService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getPrices(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String commodity,
            @RequestParam(defaultValue = "40") int limit) {
        return ResponseEntity.ok(priceService.getPrices(state, commodity, limit));
    }

    @GetMapping(value = "/ticker", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getTicker() {
        return ResponseEntity.ok(priceService.getPrices(null, null, 15));
    }
}
