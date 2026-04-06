package com.altruist.service;

import com.altruist.exception.StorageUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String uploadFile(String bucket, String filePath, byte[] fileBytes, String contentType) {
        // Prevent path traversal
        if (filePath.contains("..") || filePath.contains("\\")) {
            throw new StorageUploadException("Invalid file path");
        }

        try {
            // URL: {supabaseUrl}/storage/v1/object/{bucket}/{filePath}
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, filePath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + serviceKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                // Public URL: {supabaseUrl}/storage/v1/object/public/{bucket}/{filePath}
                return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucket, filePath);
            } else {
                throw new StorageUploadException("Failed to upload file to storage");
            }
        } catch (StorageUploadException e) {
            throw e;
        } catch (Exception e) {
            throw new StorageUploadException("Error communicating with storage service", e);
        }
    }
}
