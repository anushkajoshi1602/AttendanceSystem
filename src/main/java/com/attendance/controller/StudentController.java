package com.attendance.controller;

import com.attendance.Student;
import com.attendance.StudentDAO;
import com.attendance.dto.StudentRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class StudentController {

    private final StudentDAO studentDAO = new StudentDAO();

    @GetMapping
    public ResponseEntity<List<Student>> getStudents() throws SQLException {
        List<Student> students = studentDAO.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody StudentRequest request) throws SQLException {
        if (request == null) {
            throw new GlobalExceptionHandler.BadRequestException("Request body cannot be null.");
        }

        String rollNo = request.getRollNo() != null ? request.getRollNo().trim() : "";
        String name = request.getName() != null ? request.getName().trim() : "";
        String department = request.getDepartment() != null ? request.getDepartment().trim() : "";
        Integer semester = request.getSemester();

        if (rollNo.isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("Roll number is required.");
        }
        if (name.isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("Student name is required.");
        }
        if (department.isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("Department is required.");
        }
        if (semester == null || semester < 1 || semester > 12) {
            throw new GlobalExceptionHandler.BadRequestException("Semester must be between 1 and 12.");
        }

        if (studentDAO.existsByRollNo(rollNo)) {
            throw new GlobalExceptionHandler.ConflictException("Roll number " + rollNo + " already exists.");
        }

        Student created = studentDAO.createStudent(rollNo, name, department, semester);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
