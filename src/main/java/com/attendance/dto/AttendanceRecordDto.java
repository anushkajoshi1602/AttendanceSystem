package com.attendance.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttendanceRecordDto {
    private int attendanceId;
    private int studentId;
    private String attendanceDate;
    private String status;
    private StudentSummaryDto student;

    public AttendanceRecordDto() {
    }

    public AttendanceRecordDto(int attendanceId, int studentId, String attendanceDate, String status) {
        this.attendanceId = attendanceId;
        this.studentId = studentId;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public AttendanceRecordDto(int attendanceId, int studentId, String attendanceDate, String status, StudentSummaryDto student) {
        this.attendanceId = attendanceId;
        this.studentId = studentId;
        this.attendanceDate = attendanceDate;
        this.status = status;
        this.student = student;
    }

    public int getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(int attendanceId) {
        this.attendanceId = attendanceId;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(String attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public StudentSummaryDto getStudent() {
        return student;
    }

    public void setStudent(StudentSummaryDto student) {
        this.student = student;
    }
}
