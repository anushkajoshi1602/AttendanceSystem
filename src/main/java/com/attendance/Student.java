package com.attendance;

public class Student {
    private final int id;
    private final String rollNo;
    private final String name;
    private final String department;
    private final int semester;

    public Student(int id, String rollNo, String name,
                   String department, int semester) {
        this.id = id;
        this.rollNo = rollNo;
        this.name = name;
        this.department = department;
        this.semester = semester;
    }

    public int getId() {
        return id;
    }

    // Alias for REST API JSON serialization matching frontend expectations
    public int getStudentId() {
        return id;
    }

    public String getRollNo() {
        return rollNo;
    }

    public String getName() {
        return name;
    }

    public String getDepartment() {
        return department;
    }

    public int getSemester() {
        return semester;
    }
}
