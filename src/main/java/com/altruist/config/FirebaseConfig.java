package com.altruist.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    /**
     * No default value — Spring will throw a BeanCreationException at startup
     * if FIREBASE_CREDENTIALS_PATH is not set. This is intentional: the app
     * cannot function without Firebase Auth, so a missing env var is fatal.
     */
    @Value("${firebase.credentials.path}")
    private String credentialsPath;

    /**
     * Validates the Firebase credentials configuration at startup, before any
     * beans that depend on FirebaseAuth are wired.
     *
     * Fails fast with a clear, actionable error message rather than allowing the
     * app to start in a broken state where every authenticated request returns 500.
     *
     * @throws IllegalStateException if the path is blank or the file does not exist.
     */
    @PostConstruct
    public void validateConfig() {
        if (credentialsPath == null || credentialsPath.isBlank()) {
            throw new IllegalStateException(
                    "FIREBASE_CREDENTIALS_PATH environment variable is required but not set. " +
                    "Set it to the absolute path of your Firebase service account JSON file.");
        }

        File credFile = new File(credentialsPath);
        if (!credFile.exists()) {
            throw new IllegalStateException(
                    "Firebase credentials file not found at: \"" + credentialsPath + "\". " +
                    "Download the service account JSON from the Firebase Console → " +
                    "Project Settings → Service Accounts → Generate New Private Key.");
        }

        if (!credFile.isFile() || !credFile.canRead()) {
            throw new IllegalStateException(
                    "Firebase credentials path exists but is not a readable file: \"" + credentialsPath + "\".");
        }

        logger.info("Firebase credentials file validated at: {}", credentialsPath);
    }

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseAuth.getInstance();
        }

        // credentialsPath is guaranteed non-null, non-blank, and file-exists
        // by @PostConstruct above — no defensive null-check needed here.
        try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            logger.info("Firebase App initialized successfully.");
            return FirebaseAuth.getInstance();
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase App with credentials at: {}", credentialsPath, e);
            throw e;
        }
    }
}
