
package com.attendance;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public class Dashboard extends JFrame {

    private final StudentDAO studentDAO = new StudentDAO();
    private final AttendanceDAO attendanceDAO = new AttendanceDAO();

    private final JTextField rollField = new JTextField(12);
    private final JTextField nameField = new JTextField(12);
    private final JTextField departmentField = new JTextField(12);
    private final JTextField semesterField = new JTextField(5);

    private final JTextField attendanceRollField = new JTextField(10);
    private final JTextField dateField =
            new JTextField(LocalDate.now().toString(), 10);

    private final JComboBox<String> statusBox =
            new JComboBox<>(new String[]{"Present", "Absent"});

    private final DefaultTableModel studentModel =
            new DefaultTableModel(
                    new String[]{"Roll No", "Name", "Department", "Semester"}, 0) {
                @Override
                public boolean isCellEditable(int row, int column) {
                    return false;
                }
            };

    private final DefaultTableModel reportModel =
            new DefaultTableModel(
                    new String[]{"Roll No", "Name", "Total Days",
                            "Present Days", "Attendance %"}, 0) {
                @Override
                public boolean isCellEditable(int row, int column) {
                    return false;
                }
            };

    public Dashboard() {
        setTitle("Student Attendance Management System");
        setSize(900, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("Student Management", createStudentPanel());
        tabs.addTab("Attendance & Reports", createAttendancePanel());

        add(tabs);
        refreshStudents();
        refreshReport();
    }

    private JPanel createStudentPanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        JPanel form = new JPanel(new GridLayout(5, 2, 8, 8));
        form.setBorder(BorderFactory.createTitledBorder("Add Student"));

        form.add(new JLabel("Roll Number:"));
        form.add(rollField);
        form.add(new JLabel("Student Name:"));
        form.add(nameField);
        form.add(new JLabel("Department:"));
        form.add(departmentField);
        form.add(new JLabel("Semester:"));
        form.add(semesterField);

        JButton addButton = new JButton("Add Student");
        JButton refreshButton = new JButton("Refresh Students");

        form.add(addButton);
        form.add(refreshButton);

        JTable table = new JTable(studentModel);
        table.setRowHeight(24);

        panel.add(form, BorderLayout.NORTH);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);

        addButton.addActionListener(e -> addStudent());
        refreshButton.addActionListener(e -> refreshStudents());

        return panel;
    }

    private JPanel createAttendancePanel() {
        JPanel panel = new JPanel(new BorderLayout(10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(15, 15, 15, 15));

        JPanel form = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        form.setBorder(BorderFactory.createTitledBorder("Mark Attendance"));

        form.add(new JLabel("Roll Number:"));
        form.add(attendanceRollField);
        form.add(new JLabel("Date (YYYY-MM-DD):"));
        form.add(dateField);
        form.add(new JLabel("Status:"));
        form.add(statusBox);

        JButton markButton = new JButton("Mark Attendance");
        JButton reportButton = new JButton("Refresh Report");

        form.add(markButton);
        form.add(reportButton);

        JTable table = new JTable(reportModel);
        table.setRowHeight(24);

        panel.add(form, BorderLayout.NORTH);
        panel.add(new JScrollPane(table), BorderLayout.CENTER);

        markButton.addActionListener(e -> markAttendance());
        reportButton.addActionListener(e -> refreshReport());

        return panel;
    }

    private void addStudent() {
        try {
            String roll = rollField.getText().trim();
            String name = nameField.getText().trim();
            String department = departmentField.getText().trim();
            String semesterText = semesterField.getText().trim();

            if (roll.isEmpty() || name.isEmpty()
                    || department.isEmpty() || semesterText.isEmpty()) {
                JOptionPane.showMessageDialog(this,
                        "Please fill in all student fields.");
                return;
            }

            int semester = Integer.parseInt(semesterText);

            if (semester < 1 || semester > 12) {
                JOptionPane.showMessageDialog(this,
                        "Semester must be between 1 and 12.");
                return;
            }

            studentDAO.addStudent(roll, name, department, semester);

            JOptionPane.showMessageDialog(this,
                    "Student added successfully!");

            rollField.setText("");
            nameField.setText("");
            departmentField.setText("");
            semesterField.setText("");

            refreshStudents();
            refreshReport();

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this,
                    "Semester must be a valid number.");
        } catch (Exception ex) {
            showError(ex);
        }
    }

    private void markAttendance() {
        try {
            String roll = attendanceRollField.getText().trim();
            String dateText = dateField.getText().trim();
            String status = (String) statusBox.getSelectedItem();

            if (roll.isEmpty() || dateText.isEmpty()) {
                JOptionPane.showMessageDialog(this,
                        "Enter the roll number and date.");
                return;
            }

            LocalDate localDate = LocalDate.parse(dateText);

            attendanceDAO.markAttendance(
                    roll, Date.valueOf(localDate), status);

            JOptionPane.showMessageDialog(this,
                    "Attendance marked successfully!");

            refreshReport();

        } catch (java.time.format.DateTimeParseException ex) {
            JOptionPane.showMessageDialog(this,
                    "Enter the date in YYYY-MM-DD format.");
        } catch (Exception ex) {
            showError(ex);
        }
    }

    private void refreshStudents() {
        try {
            studentModel.setRowCount(0);

            List<Student> students = studentDAO.getAllStudents();

            for (Student s : students) {
                studentModel.addRow(new Object[]{
                        s.getRollNo(),
                        s.getName(),
                        s.getDepartment(),
                        s.getSemester()
                });
            }
        } catch (Exception ex) {
            showError(ex);
        }
    }

    private void refreshReport() {
        try {
            reportModel.setRowCount(0);

            for (Object[] row : attendanceDAO.getAttendanceReport()) {
                reportModel.addRow(row);
            }
        } catch (Exception ex) {
            showError(ex);
        }
    }

    private void showError(Exception ex) {
        JOptionPane.showMessageDialog(this,
                ex.getMessage(),
                "Error",
                JOptionPane.ERROR_MESSAGE);
    }
}
