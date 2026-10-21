package com.attendance.controller;

import com.attendance.AttendanceDAO;
import com.attendance.StudentDAO;
import com.attendance.dto.AttendanceItemDto;
import com.attendance.dto.AttendanceRecordDto;
import com.attendance.dto.DashboardSummaryDto;
import com.attendance.dto.SaveAttendanceRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class AttendanceController {

    private final AttendanceDAO attendanceDAO = new AttendanceDAO();
    private final StudentDAO studentDAO = new StudentDAO();

    @GetMapping("/api/attendance")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByDate(
            @RequestParam(name = "date") String dateStr) throws SQLException {

        if (dateStr == null || dateStr.trim().isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("Date parameter is required.");
        }

        try {
            LocalDate localDate = LocalDate.parse(dateStr.trim());
            List<AttendanceRecordDto> records = attendanceDAO.getAttendanceByDate(Date.valueOf(localDate));
            return ResponseEntity.ok(records);
        } catch (DateTimeParseException ex) {
            throw new GlobalExceptionHandler.BadRequestException("Invalid date format. Expected YYYY-MM-DD.");
        }
    }

    @PostMapping("/api/attendance")
    public ResponseEntity<Map<String, Object>> saveAttendance(
            @RequestBody SaveAttendanceRequest request) throws SQLException {

        if (request == null || request.getDate() == null || request.getDate().trim().isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("Session date is required.");
        }

        if (request.getRecords() == null || request.getRecords().isEmpty()) {
            throw new GlobalExceptionHandler.BadRequestException("At least one attendance record is required.");
        }

        LocalDate localDate;
        try {
            localDate = LocalDate.parse(request.getDate().trim());
        } catch (DateTimeParseException ex) {
            throw new GlobalExceptionHandler.BadRequestException("Invalid date format. Expected YYYY-MM-DD.");
        }

        if (localDate.isAfter(LocalDate.now())) {
            throw new GlobalExceptionHandler.BadRequestException("Attendance cannot be recorded for a future calendar date.");
        }

        // Validate each record
        for (AttendanceItemDto item : request.getRecords()) {
            if (item.getStatus() == null || (!item.getStatus().equalsIgnoreCase("Present") && !item.getStatus().equalsIgnoreCase("Absent"))) {
                throw new GlobalExceptionHandler.BadRequestException("Status must be either 'Present' or 'Absent'.");
            }
            if (studentDAO.getStudentById(item.getStudentId()) == null) {
                throw new GlobalExceptionHandler.NotFoundException("Student ID " + item.getStudentId() + " not found.");
            }
        }

        int savedCount = attendanceDAO.saveAttendanceBatch(Date.valueOf(localDate), request.getRecords());

        Map<String, Object> response = new HashMap<>();
        response.put("date", request.getDate().trim());
        response.put("saved", savedCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/attendance/range")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceRange(
            @RequestParam(name = "from", required = false) String fromStr,
            @RequestParam(name = "to", required = false) String toStr) throws SQLException {

        Date fromDate = null;
        Date toDate = null;

        try {
            if (fromStr != null && !fromStr.trim().isEmpty()) {
                fromDate = Date.valueOf(LocalDate.parse(fromStr.trim()));
            }
            if (toStr != null && !toStr.trim().isEmpty()) {
                toDate = Date.valueOf(LocalDate.parse(toStr.trim()));
            }
        } catch (DateTimeParseException ex) {
            throw new GlobalExceptionHandler.BadRequestException("Invalid date format. Expected YYYY-MM-DD.");
        }

        List<AttendanceRecordDto> records = attendanceDAO.getAttendanceRange(fromDate, toDate);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/api/dashboard/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() throws SQLException {
        DashboardSummaryDto summary = attendanceDAO.getDashboardSummary();
        return ResponseEntity.ok(summary);
    }
}
