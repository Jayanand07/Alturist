package com.altruist;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

@SpringBootTest
@ActiveProfiles("dev")
public class DatabaseInspectorTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeAll
    public static void loadEnv() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }

    @Test
    public void inspectDatabase() {
        System.out.println("=== INSPECTING USERS TABLE ===");
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users'"
            );
            for (Map<String, Object> col : columns) {
                System.out.println("Column: " + col.get("column_name") + " | Type: " + col.get("data_type") + " | Nullable: " + col.get("is_nullable"));
            }

            System.out.println("=== INSPECTING CONSTRAINTS ON USERS ===");
            List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
                "SELECT conname, pg_get_constraintdef(c.oid) as condef " +
                "FROM pg_constraint c " +
                "JOIN pg_namespace n ON n.oid = c.connamespace " +
                "WHERE conrelid = 'users'::regclass"
            );
            for (Map<String, Object> con : constraints) {
                System.out.println("Constraint Name: " + con.get("conname") + " | Definition: " + con.get("condef"));
            }

            System.out.println("=== LISTING EXISTING USERS ===");
            List<Map<String, Object>> users = jdbcTemplate.queryForList(
                "SELECT id, email, firebase_uid, user_type, welcome_email_sent FROM users"
            );
            for (Map<String, Object> u : users) {
                System.out.println("User: " + u.get("email") + " | UID: " + u.get("firebase_uid") + " | Role: " + u.get("user_type") + " | welcomeEmailSent: " + u.get("welcome_email_sent"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
