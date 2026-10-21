package com.attendance.dto;

public class AttendanceItemDto {
    private int studentId;
    private String status;

    public AttendanceItemDto() {
    }

    public AttendanceItemDto(int studentId, String status) {
        this.studentId = studentId;
        this.status = status;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
