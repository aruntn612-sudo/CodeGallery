package com.tutorials.codegallery.model;

public enum AppUserRole {
    ADMIN,
    CO_USER,
    END_USER;

    public static AppUserRole fromInput(String value) {
        if (value == null || value.trim().isEmpty()) {
            return END_USER;
        }

        String normalized = value.trim();
        if (normalized.equalsIgnoreCase("END_USER") || normalized.equalsIgnoreCase("End User") || normalized.equalsIgnoreCase("End-User") || normalized.equalsIgnoreCase("ENDUSER")) {
            return END_USER;
        }
        if (normalized.equalsIgnoreCase("CO_USER") || normalized.equalsIgnoreCase("Co-User") || normalized.equalsIgnoreCase("Co User") || normalized.equalsIgnoreCase("COUSER")) {
            return CO_USER;
        }
        if (normalized.equalsIgnoreCase("ADMIN") || normalized.equalsIgnoreCase("Admin")) {
            return ADMIN;
        }

        return END_USER;
    }
}
