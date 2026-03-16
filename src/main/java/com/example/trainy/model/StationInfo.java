package com.example.trainy.model;

public class StationInfo {
    private String code;
    private String name;

    public StationInfo(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
}
