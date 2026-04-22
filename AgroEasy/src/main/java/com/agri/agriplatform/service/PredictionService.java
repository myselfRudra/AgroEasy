package com.agri.agriplatform.service;

import com.agri.agriplatform.entity.CropPrice;
import com.agri.agriplatform.repository.CropPriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PredictionService {

    @Autowired
    private CropPriceRepository repo;

    public String predictPrice(String cropName) {

        List<CropPrice> prices = repo.findByCropName(cropName);

        List<Double> lastPrices = prices.stream()
                .sorted(Comparator.comparing(CropPrice::getDate).reversed())
                .limit(5)
                .map(CropPrice::getPrice)
                .collect(Collectors.toList());

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> request = new HashMap<>();
        request.put("prices", lastPrices);

        String response = restTemplate.postForObject(
                "http://localhost:5000/predict",
                request,
                String.class);

        return response;
    }
}