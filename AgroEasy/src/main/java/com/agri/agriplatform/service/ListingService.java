package com.agri.agriplatform.service;

import com.agri.agriplatform.entity.Listing;
import com.agri.agriplatform.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ListingService {

    @Autowired
    private ListingRepository repo;

    public Listing addListing(Listing listing) {
        return repo.save(listing);

    }

    public List<Listing> availableListings() {
        return repo.findByStatus("AVAILABLE");
    }
}
