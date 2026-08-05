package com.agroeasy.dto;

import jakarta.validation.constraints.NotBlank;

public class DiseaseScanRequest {
    @NotBlank
    private String imageBase64; // raw base64, no data: prefix
    private String mediaType = "image/jpeg";
    private String language = "en";

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }
    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
