package com.altruist;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.FileInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

/**
 * Utility to generate real Firebase ID Tokens for local integration testing.
 * Exchanges custom tokens for Google ID Tokens using the Web API Key.
 */
public class TokenGeneratorRunner {

    private static final String API_KEY = "AIzaSyAO5d9Ggafi_KMWrVn_jwd49VKUUPsUuaw";
    private static final String CREDENTIALS_PATH = "c:/Users/anand/Desktop/medical pr/firebase-service-account.json";

    public static void main(String[] args) {
        try {
            System.out.println("Initializing Firebase...");
            FileInputStream serviceAccount = new FileInputStream(CREDENTIALS_PATH);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            System.out.println("Firebase initialized successfully.");

            String patientUid = "xFxAygEK7IZabbX7tfJmIJQB0h43";
            String adminUid = "tPQELreoGMNVltqqUMQyojM4I2j2";

            System.out.println("\nGenerating tokens...");
            String patientIdToken = exchangeCustomToken(patientUid);
            String adminIdToken = exchangeCustomToken(adminUid);

            System.out.println("\n==================================================");
            System.out.println("PATIENT TOKEN (Anand Jay):");
            System.out.println(patientIdToken);
            System.out.println("==================================================");
            System.out.println("ADMIN TOKEN (Jay Anand):");
            System.out.println(adminIdToken);
            System.out.println("==================================================\n");

            System.exit(0);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static String exchangeCustomToken(String uid) throws Exception {
        String customToken = FirebaseAuth.getInstance().createCustomToken(uid);
        
        HttpClient client = HttpClient.newHttpClient();
        String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=" + API_KEY;
        
        Map<String, Object> payload = Map.of(
                "token", customToken,
                "returnSecureToken", true
        );
        String body = new ObjectMapper().writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to exchange custom token: " + response.body());
        }

        Map<?, ?> responseMap = new ObjectMapper().readValue(response.body(), Map.class);
        return (String) responseMap.get("idToken");
    }
}
