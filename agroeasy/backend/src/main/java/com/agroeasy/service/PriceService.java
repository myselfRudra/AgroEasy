package com.agroeasy.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PriceService {

    @Value("${app.datagovin.api-key}")
    private String apiKey;

    @Value("${app.datagovin.price-resource}")
    private String resourceId;

    private final RestClient restClient = RestClient.create();

    /**
     * Proxies the data.gov.in mandi price API so the API key never reaches the browser.
     * state/commodity may be null to fetch an unfiltered ticker feed.
     */
    public String getPrices(String state, String commodity, int limit) {
        StringBuilder url = new StringBuilder("https://api.data.gov.in/resource/" + resourceId)
                .append("?api-key=").append(apiKey)
                .append("&format=json&limit=").append(limit);
        if (state != null && !state.isBlank()) {
            url.append("&filters[state]=").append(state.replace(" ", "%20"));
        }
        if (commodity != null && !commodity.isBlank()) {
            url.append("&filters[commodity]=").append(commodity.replace(" ", "%20"));
        }
        return restClient.get().uri(url.toString()).retrieve().body(String.class);
    }
}
