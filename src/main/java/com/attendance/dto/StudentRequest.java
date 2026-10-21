package com.attendance.dto;

public class StudentRequest {
    private String rollNo;
    private String name;
    private String department;
    private Integer semester;

    public StudentRequest() {
    }

    public StudentRequest(String rollNo, String name, String department, Integer semester) {
        this.rollNo = rollNo;
        this.name = name;
        this.department = department;
        this.semester = semester;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }
}
