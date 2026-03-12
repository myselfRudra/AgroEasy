package com.agri.agriplatform.repository;

import com.agri.agriplatform.entity.CropPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.JpaRepositoryConfigExtension;

import java.time.LocalDate;
import java.util.List;

public interface CropPriceRepository extends JpaRepository<CropPrice, Long> {
    List<CropPrice> findByDate(LocalDate date);

    List<CropPrice> findByCropName(String cropName);

}
