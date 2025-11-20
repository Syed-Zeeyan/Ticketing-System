package com.ticketing.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class V2__seed_admin_user extends BaseJavaMigration {
    @Override
    public void migrate(Context context) throws Exception {
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode("AdminPass123!");

        try (Connection connection = context.getConnection()) {
            String sql = "INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                    "ON CONFLICT (email) DO NOTHING";
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setString(1, "admin@ticketing.com");
                statement.setString(2, hashedPassword);
                statement.setString(3, "System Administrator");
                statement.setString(4, "ADMIN");
                statement.executeUpdate();
            }
        }
    }
}

