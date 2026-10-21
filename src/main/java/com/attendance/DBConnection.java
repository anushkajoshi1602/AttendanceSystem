package com.attendance;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {

    private static final String DEFAULT_URL =
            "jdbc:mysql://localhost:3306/attendance_db";
    private static final String DEFAULT_USER = "root";

    public static String getUrl() {
        String url = System.getenv("DB_URL");
        if (url != null && !url.isBlank()) {
            return url;
        }
        return System.getProperty("DB_URL", DEFAULT_URL);
    }

    public static String getUser() {
        String user = System.getenv("DB_USER");
        if (user != null && !user.isBlank()) {
            return user;
        }
        return System.getProperty("DB_USER", DEFAULT_USER);
    }

    public static String getPassword() {
        String password = System.getenv("DB_PASSWORD");
        if (password != null) {
            return password;
        }
        return System.getProperty("DB_PASSWORD", "");
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(getUrl(), getUser(), getPassword());
    }
}
