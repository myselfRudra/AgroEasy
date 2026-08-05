package com.agroeasy.dto;

public class AiTextResponse {
    private String answer;

    public AiTextResponse() {}
    public AiTextResponse(String answer) { this.answer = answer; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
}
