package com.attendance;

import com.attendance.dto.AttendanceItemDto;
import com.attendance.dto.AttendanceRecordDto;
import com.attendance.dto.DashboardSummaryDto;
import com.attendance.dto.StudentSummaryDto;
import com.attendance.dto.TrendItemDto;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class AttendanceDAO {

    public void markAttendance(String rollNo, Date date, String status)
            throws SQLException {

        String sql = """
            INSERT INTO attendance
                (student_id, attendance_date, status)
            SELECT student_id, ?, ?
            FROM students
            WHERE roll_no = ?
            ON DUPLICATE KEY UPDATE status = VALUES(status)
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setDate(1, date);
            ps.setString(2, status);
            ps.setString(3, rollNo);

            int rows = ps.executeUpdate();

            if (rows == 0) {
                throw new SQLException("Student roll number not found.");
            }
        }
    }

    public List<Object[]> getAttendanceReport() throws SQLException {
        List<Object[]> report = new ArrayList<>();

        String sql = """
            SELECT s.roll_no, s.name,
                   COUNT(a.attendance_id) AS total_days,
                   COALESCE(SUM(a.status = 'Present'), 0) AS present_days,
                   COALESCE(
                       ROUND(
                           100.0 * SUM(a.status = 'Present')
                           / NULLIF(COUNT(a.attendance_id), 0), 2
                       ), 0
                    ) AS percentage
            FROM students s
            LEFT JOIN attendance a
                ON s.student_id = a.student_id
            GROUP BY s.student_id, s.roll_no, s.name
            ORDER BY s.roll_no
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                report.add(new Object[]{
                    rs.getString("roll_no"),
                    rs.getString("name"),
                    rs.getInt("total_days"),
                    rs.getInt("present_days"),
                    rs.getDouble("percentage")
                });
            }
        }

        return report;
    }

    public List<AttendanceRecordDto> getAttendanceByDate(Date date) throws SQLException {
        List<AttendanceRecordDto> list = new ArrayList<>();
        String sql = """
            SELECT attendance_id, student_id, attendance_date, status
            FROM attendance
            WHERE attendance_date = ?
            ORDER BY student_id
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setDate(1, date);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new AttendanceRecordDto(
                        rs.getInt("attendance_id"),
                        rs.getInt("student_id"),
                        rs.getDate("attendance_date").toString(),
                        rs.getString("status")
                    ));
                }
            }
        }

        return list;
    }

    public int saveAttendanceBatch(Date date, List<AttendanceItemDto> records) throws SQLException {
        if (records == null || records.isEmpty()) {
            return 0;
        }

        String sql = """
            INSERT INTO attendance (student_id, attendance_date, status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE status = VALUES(status)
            """;

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement(sql)) {
                for (AttendanceItemDto item : records) {
                    ps.setInt(1, item.getStudentId());
                    ps.setDate(2, date);
                    ps.setString(3, item.getStatus());
                    ps.addBatch();
                }

                ps.executeBatch();
                con.commit();
                return records.size();
            } catch (SQLException ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public List<AttendanceRecordDto> getAttendanceRange(Date from, Date to) throws SQLException {
        List<AttendanceRecordDto> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
            SELECT attendance_id, student_id, attendance_date, status
            FROM attendance
            WHERE 1=1
            """);

        if (from != null) {
            sql.append(" AND attendance_date >= ?");
        }
        if (to != null) {
            sql.append(" AND attendance_date <= ?");
        }
        sql.append(" ORDER BY attendance_date DESC, student_id ASC");

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql.toString())) {

            int paramIndex = 1;
            if (from != null) {
                ps.setDate(paramIndex++, from);
            }
            if (to != null) {
                ps.setDate(paramIndex++, to);
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(new AttendanceRecordDto(
                        rs.getInt("attendance_id"),
                        rs.getInt("student_id"),
                        rs.getDate("attendance_date").toString(),
                        rs.getString("status")
                    ));
                }
            }
        }

        return list;
    }

    public DashboardSummaryDto getDashboardSummary() throws SQLException {
        int totalStudents = 0;
        String countSql = "SELECT COUNT(*) FROM students";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(countSql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                totalStudents = rs.getInt(1);
            }
        }

        List<String> distinctDates = new ArrayList<>();
        String datesSql = "SELECT DISTINCT attendance_date FROM attendance ORDER BY attendance_date ASC";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(datesSql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                distinctDates.add(rs.getDate(1).toString());
            }
        }

        String today = LocalDate.now().toString();
        String refDate = null;
        if (!distinctDates.isEmpty()) {
            if (distinctDates.contains(today)) {
                refDate = today;
            } else {
                refDate = distinctDates.get(distinctDates.size() - 1);
            }
        } else {
            refDate = today;
        }

        boolean isToday = today.equals(refDate);

        int present = 0;
        int absent = 0;
        if (refDate != null) {
            String daySql = """
                SELECT status, COUNT(*)
                FROM attendance
                WHERE attendance_date = ?
                GROUP BY status
                """;
            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(daySql)) {
                ps.setDate(1, Date.valueOf(refDate));
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        String st = rs.getString(1);
                        int count = rs.getInt(2);
                        if ("Present".equalsIgnoreCase(st)) {
                            present = count;
                        } else if ("Absent".equalsIgnoreCase(st)) {
                            absent = count;
                        }
                    }
                }
            }
        }

        int totalDay = present + absent;
        double percentage = totalDay > 0
            ? Math.round((present * 1000.0 / totalDay)) / 10.0
            : 0.0;

        // Daily trend over recent dates (up to 14)
        List<TrendItemDto> trend = new ArrayList<>();
        int startIndex = Math.max(0, distinctDates.size() - 14);
        List<String> recentDates = distinctDates.subList(startIndex, distinctDates.size());

        for (String d : recentDates) {
            String trendSql = """
                SELECT
                    COALESCE(SUM(status = 'Present'), 0) AS p,
                    COALESCE(SUM(status = 'Absent'), 0) AS a
                FROM attendance
                WHERE attendance_date = ?
                """;
            try (Connection con = DBConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(trendSql)) {
                ps.setDate(1, Date.valueOf(d));
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        int p = rs.getInt("p");
                        int a = rs.getInt("a");
                        int tot = p + a;
                        int pct = tot > 0 ? (int) Math.round((p * 100.0) / tot) : 0;
                        trend.add(new TrendItemDto(d, p, a, pct));
                    }
                }
            }
        }

        // Recent activity (latest 8 attendance records with student name & rollNo)
        List<AttendanceRecordDto> recent = new ArrayList<>();
        String recentSql = """
            SELECT a.attendance_id, a.student_id, a.attendance_date, a.status,
                   s.name, s.roll_no
            FROM attendance a
            LEFT JOIN students s ON a.student_id = s.student_id
            ORDER BY a.attendance_date DESC, a.attendance_id DESC
            LIMIT 8
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(recentSql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                StudentSummaryDto studentSummary = new StudentSummaryDto(
                    rs.getInt("student_id"),
                    rs.getString("name"),
                    rs.getString("roll_no")
                );
                recent.add(new AttendanceRecordDto(
                    rs.getInt("attendance_id"),
                    rs.getInt("student_id"),
                    rs.getDate("attendance_date").toString(),
                    rs.getString("status"),
                    studentSummary
                ));
            }
        }

        return new DashboardSummaryDto(
            totalStudents,
            refDate,
            isToday,
            present,
            absent,
            percentage,
            trend,
            recent
        );
    }
}
