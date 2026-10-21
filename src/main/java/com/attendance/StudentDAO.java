package com.attendance;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO {

    public void addStudent(String rollNo, String name,
                           String department, int semester)
            throws SQLException {
        createStudent(rollNo, name, department, semester);
    }

    public Student createStudent(String rollNo, String name,
                                 String department, int semester)
            throws SQLException {

        String sql = """
            INSERT INTO students
                (roll_no, name, department, semester)
            VALUES (?, ?, ?, ?)
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, rollNo);
            ps.setString(2, name);
            ps.setString(3, department);
            ps.setInt(4, semester);

            ps.executeUpdate();

            int generatedId = 0;
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    generatedId = rs.getInt(1);
                }
            }

            return new Student(generatedId, rollNo, name, department, semester);
        }
    }

    public boolean existsByRollNo(String rollNo) throws SQLException {
        String sql = "SELECT 1 FROM students WHERE LOWER(roll_no) = LOWER(?) LIMIT 1";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, rollNo);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public Student getStudentById(int id) throws SQLException {
        String sql = """
            SELECT student_id, roll_no, name, department, semester
            FROM students
            WHERE student_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Student(
                        rs.getInt("student_id"),
                        rs.getString("roll_no"),
                        rs.getString("name"),
                        rs.getString("department"),
                        rs.getInt("semester")
                    );
                }
            }
        }
        return null;
    }

    public List<Student> getAllStudents() throws SQLException {
        List<Student> students = new ArrayList<>();

        String sql = """
            SELECT student_id, roll_no, name, department, semester
            FROM students
            ORDER BY roll_no
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Student student = new Student(
                    rs.getInt("student_id"),
                    rs.getString("roll_no"),
                    rs.getString("name"),
                    rs.getString("department"),
                    rs.getInt("semester")
                );

                students.add(student);
            }
        }

        return students;
    }
}
