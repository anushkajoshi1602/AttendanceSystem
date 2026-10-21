package com.attendance.dto;

public class TrendItemDto {
    private String date;
    private int present;
    private int absent;
    private int percentage;

    public TrendItemDto() {
    }

    public TrendItemDto(String date, int present, int absent, int percentage) {
        this.date = date;
        this.present = present;
        this.absent = absent;
        this.percentage = percentage;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getPresent() {
        return present;
    }

    public void setPresent(int present) {
        this.present = present;
    }

    public int getAbsent() {
        return absent;
    }

    public void setAbsent(int absent) {
        this.absent = absent;
    }

    public int getPercentage() {
        return percentage;
    }

    public void setPercentage(int percentage) {
        this.percentage = percentage;
    }
}
