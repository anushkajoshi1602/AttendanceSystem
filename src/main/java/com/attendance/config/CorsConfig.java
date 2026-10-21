package com.attendance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.ArrayList;
import java.util.List;

/**
 * Centralized CORS Configuration for AttendEase REST API.
 * Uses a servlet-level CorsFilter to intercept and handle all preflight OPTIONS
 * and cross-origin requests for /api/** endpoints before DispatcherServlet execution.
 */
@Configuration
public class CorsConfig {

    private static final List<String> DEFAULT_ALLOWED_ORIGINS = List.of(
            "https://attendance-system-r12uqtzgu-anushkajoshi1602-5279s-projects.vercel.app",
            "https://attendance-system-fuhbffo5y-anushkajoshi1602-5279s-projects.vercel.app",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174"
    );

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials (cookies, auth headers) with explicit non-wildcard origins
        config.setAllowCredentials(true);

        // Exact production Vercel origins + local development origins
        for (String origin : resolveAllowedOrigins()) {
            config.addAllowedOrigin(origin);
        }

        // Support preview deployments on Vercel while preserving strict origin checks
        config.addAllowedOriginPattern("https://*-anushkajoshi1602-5279s-projects.vercel.app");
        config.addAllowedOriginPattern("https://*.vercel.app");

        // Allow GET, POST, PUT, PATCH, DELETE, and OPTIONS methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow standard and custom headers including Content-Type and Authorization
        config.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "Accept",
                "Origin",
                "X-Requested-With",
                "*"
        ));

        // Expose headers for client access
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));

        // Cache preflight OPTIONS responses for 1 hour (3600 seconds)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }

    private List<String> resolveAllowedOrigins() {
        List<String> origins = new ArrayList<>(DEFAULT_ALLOWED_ORIGINS);
        String envOrigins = System.getenv("ALLOWED_ORIGINS");
        if (envOrigins != null && !envOrigins.isBlank()) {
            for (String origin : envOrigins.split(",")) {
                String cleanOrigin = origin.trim().replaceAll("/+$", "");
                if (!cleanOrigin.isEmpty() && !origins.contains(cleanOrigin)) {
                    origins.add(cleanOrigin);
                }
            }
        }
        return origins;
    }
}
