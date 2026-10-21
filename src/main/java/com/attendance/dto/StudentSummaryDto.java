package com.attendance.dto;

public class StudentSummaryDto {
    private int studentId;
    private String name;
    private String rollNo;

    public StudentSummaryDto() {
    }

    public StudentSummaryDto(int studentId, String name, String rollNo) {
        this.studentId = studentId;
        this.name = name;
        this.rollNo = rollNo;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }
}
