package com.altruist.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseAuth.getInstance();
        }

        if (credentialsPath == null || credentialsPath.isEmpty()) {
            logger.warn("FIREBASE_CREDENTIALS_PATH environment variable is not set. Firebase Auth cannot be initialized for protected endpoints.");
            // We shouldn't crash the entire app if the user hasn't set this up yet, 
            // but any request to a protected endpoint will fail.
            return null;
        }

        try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            logger.info("Firebase App initialized successfully.");
            return FirebaseAuth.getInstance();
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase App with credentials at: " + credentialsPath, e);
            throw e;
        }
    }
}
