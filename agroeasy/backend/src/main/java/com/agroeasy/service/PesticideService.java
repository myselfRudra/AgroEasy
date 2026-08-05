package com.agroeasy.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class PesticideService {

    // Indicative reference data - no free public API exists for retail agrochemical
    // prices in India. Replace with a live feed / your own pricing DB if you have one.
    public List<Map<String, String>> getReference() {
        return List.of(
            Map.of("name", "Imidacloprid 17.8% SL", "use", "Sucking pests, aphids, whitefly", "price", "Rs 380-450 / 250ml"),
            Map.of("name", "Chlorpyrifos 20% EC", "use", "Termites, stem borer, soil pests", "price", "Rs 280-340 / litre"),
            Map.of("name", "Mancozeb 75% WP", "use", "Fungal blights, leaf spot", "price", "Rs 220-260 / kg"),
            Map.of("name", "Carbendazim 50% WP", "use", "Fungal disease, seed treatment", "price", "Rs 250-310 / kg"),
            Map.of("name", "Copper Oxychloride 50% WP", "use", "Bacterial blight, downy mildew", "price", "Rs 190-230 / kg"),
            Map.of("name", "Neem oil 1500 ppm", "use", "Organic pest repellent, safe pre-harvest", "price", "Rs 300-380 / litre")
        );
    }
}
