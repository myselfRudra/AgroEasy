package com.agri.agriplatform.repository;

import com.agri.agriplatform.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(String status);
}
