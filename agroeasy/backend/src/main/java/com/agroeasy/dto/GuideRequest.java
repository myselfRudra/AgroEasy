package com.agroeasy.dto;

import jakarta.validation.constraints.NotBlank;

public class GuideRequest {
    @NotBlank
    private String question;
    private String language = "en"; // en | hi | bn

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
