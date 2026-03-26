package com.example.trainy.model;

public class StationInfo {
    private String code;
    private String name;
    private boolean selectable;

    public StationInfo(String code, String name, boolean selectable) {
        this.code = code;
        this.name = name;
        this.selectable = selectable;
    }

    public String getCode() { return code; }
    public String getName() { return name; }
    public boolean isSelectable() { return selectable; }
}
