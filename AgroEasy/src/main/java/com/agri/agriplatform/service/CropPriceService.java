package com.agri.agriplatform.service;

import com.agri.agriplatform.entity.CropPrice;
import com.agri.agriplatform.repository.CropPriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class CropPriceService {

    @Autowired
    private CropPriceRepository repo;

    public CropPrice addPrice(CropPrice price) {
        return repo.save(price);
    }

    public List<CropPrice> todayPrices() {
        return repo.findByDate(LocalDate.now());
    }

    public List<CropPrice> cropHistory(String crop) {
        return repo.findByCropName(crop);
    }
}