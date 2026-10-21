package com.attendance.dto;

import java.util.List;

public class SaveAttendanceRequest {
    private String date;
    private List<AttendanceItemDto> records;

    public SaveAttendanceRequest() {
    }

    public SaveAttendanceRequest(String date, List<AttendanceItemDto> records) {
        this.date = date;
        this.records = records;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<AttendanceItemDto> getRecords() {
        return records;
    }

    public void setRecords(List<AttendanceItemDto> records) {
        this.records = records;
    }
}
