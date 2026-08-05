package com.agroeasy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    private String languageName(String lang) {
        return switch (lang == null ? "en" : lang) {
            case "hi" -> "Hindi";
            case "bn" -> "Bengali";
            default -> "English";
        };
    }

    public String diagnoseCropImage(String imageBase64, String mediaType, String language) {
        String system = "You are an agricultural plant pathologist helping Indian farmers. Look at the "
                + "crop/leaf photo and identify the likely disease, pest damage, or nutrient deficiency. "
                + "Respond in " + languageName(language) + ". Keep it practical and structured with short "
                + "headings: Diagnosis, Confidence (low/medium/high), Likely cause, Treatment (organic and "
                + "chemical options with generic pesticide/fungicide names), Prevention. Keep the whole answer "
                + "under 220 words. If the photo is unclear or not a plant, say so plainly.";

        Map<String, Object> imagePart = Map.of(
                "inline_data", Map.of("mime_type", mediaType, "data", imageBase64));
        Map<String, Object> textPart = Map.of("text", "Diagnose this crop photo.");

        List<Map<String, Object>> parts = List.of(imagePart, textPart);
        return callGemini(system, parts);
    }

    public String answerGuideQuestion(String question, String language) {
        String system = "You are an agricultural extension advisor for Indian farmers. Answer in "
                + languageName(language) + ", in plain practical language with short sections (headings "
                + "allowed): growing steps/timeline, or pesticide/fungicide name with dosage and safety "
                + "interval, as relevant to the question. Mention both organic and chemical options where "
                + "relevant. Keep under 250 words.";

        List<Map<String, Object>> parts = List.of(Map.of("text", question));
        return callGemini(system, parts);
    }

    private String callGemini(String systemInstruction, List<Map<String, Object>> parts) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model
                + ":generateContent?key=" + apiKey;

        Map<String, Object> content = Map.of("role", "user", "parts", parts);

        Map<String, Object> body = new LinkedHashMap<>();

        String plainTextRule = " Do not use markdown formatting - no #, ##, **, or _. "
                + "Write plain text. For lists, start each line with a dash and a space.";

        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction + plainTextRule))));
        body.put("contents", List.of(content));
        body.put("generationConfig", Map.of(
                "maxOutputTokens", 2048,
                "thinkingConfig", Map.of("thinkingLevel", "minimal")));

        String raw = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = mapper.readTree(raw);
            StringBuilder sb = new StringBuilder();
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode textParts = candidates.get(0).path("content").path("parts");
                if (textParts.isArray()) {
                    for (JsonNode p : textParts) {
                        if (p.has("text")) {
                            sb.append(p.path("text").asText());
                        }
                    }
                }
            }
            if (sb.length() == 0) {
                JsonNode error = root.path("error");
                if (!error.isMissingNode()) {
                    return "AI request failed: " + error.path("message").asText();
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "Could not parse AI response.";
        }
    }
}