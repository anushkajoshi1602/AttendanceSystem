package com.attendance.dto;

import java.util.List;

public class DashboardSummaryDto {
    private int totalStudents;
    private String referenceDate;
    private boolean isToday;
    private int present;
    private int absent;
    private double percentage;
    private List<TrendItemDto> trend;
    private List<AttendanceRecordDto> recent;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(int totalStudents, String referenceDate, boolean isToday,
                               int present, int absent, double percentage,
                               List<TrendItemDto> trend, List<AttendanceRecordDto> recent) {
        this.totalStudents = totalStudents;
        this.referenceDate = referenceDate;
        this.isToday = isToday;
        this.present = present;
        this.absent = absent;
        this.percentage = percentage;
        this.trend = trend;
        this.recent = recent;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public String getReferenceDate() {
        return referenceDate;
    }

    public void setReferenceDate(String referenceDate) {
        this.referenceDate = referenceDate;
    }

    public boolean isIsToday() {
        return isToday;
    }

    public void setIsToday(boolean today) {
        isToday = today;
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

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public List<TrendItemDto> getTrend() {
        return trend;
    }

    public void setTrend(List<TrendItemDto> trend) {
        this.trend = trend;
    }

    public List<AttendanceRecordDto> getRecent() {
        return recent;
    }

    public void setRecent(List<AttendanceRecordDto> recent) {
        this.recent = recent;
    }
}
