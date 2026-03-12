package com.agri.agriplatform.controller;

import com.agri.agriplatform.entity.Listing;
import com.agri.agriplatform.service.ListingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService service;

    @PostMapping("/add")
    public Listing add(@RequestBody Listing listing) {
        return service.addListing(listing);
    }

    @GetMapping("/available")
    public List<Listing> available() {
        return service.availableListings();
    }
}