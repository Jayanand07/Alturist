package com.altruist.service;

import com.altruist.exception.StorageUploadException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.Set;

@Service
public class SupabaseStorageService {

    // ── Size limits ──────────────────────────────────────────────────────────
    private static final long MAX_IMAGE_SIZE_BYTES = 5L  * 1024 * 1024;  // 5 MB
    private static final long MAX_PDF_SIZE_BYTES   = 20L * 1024 * 1024;  // 20 MB

    /**
     * Allowed MIME types → permitted file extensions.
     *
     * Adding a new type here is the single change needed to expand the allowlist.
     * Both the extension check and the size limit use this map.
     */
    private static final Map<String, Set<String>> ALLOWED_TYPES = Map.of(
            "image/jpeg",      Set.of(".jpg", ".jpeg"),
            "image/png",       Set.of(".png"),
            "image/webp",      Set.of(".webp"),
            "application/pdf", Set.of(".pdf")
    );

    /** Per-MIME size caps. Types not listed here fall through to a conservative default. */
    private static final Map<String, Long> SIZE_LIMIT_BY_TYPE = Map.of(
            "image/jpeg",      MAX_IMAGE_SIZE_BYTES,
            "image/png",       MAX_IMAGE_SIZE_BYTES,
            "image/webp",      MAX_IMAGE_SIZE_BYTES,
            "application/pdf", MAX_PDF_SIZE_BYTES
    );

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String serviceKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(5))
            .build();

    public String uploadFile(String bucket, String filePath, byte[] fileBytes, String contentType) {
        // ── 1. Path traversal guard ──────────────────────────────────────────
        if (filePath.contains("..") || filePath.contains("\\")) {
            throw new StorageUploadException("Invalid file path");
        }

        // ── 2. Empty file guard ──────────────────────────────────────────────
        if (fileBytes == null || fileBytes.length == 0) {
            throw new StorageUploadException("File is empty");
        }

        // ── 3. MIME type allowlist ───────────────────────────────────────────
        String normalizedType = contentType == null ? "" : contentType.toLowerCase().trim();
        Set<String> allowedExtensions = ALLOWED_TYPES.get(normalizedType);
        if (allowedExtensions == null) {
            throw new StorageUploadException(
                    "File type not permitted. Allowed types: JPEG, PNG, WebP, PDF");
        }

        // ── 4. Extension ↔ MIME consistency check ───────────────────────────
        String lowerPath = filePath.toLowerCase();
        boolean extensionMatches = allowedExtensions.stream().anyMatch(lowerPath::endsWith);
        if (!extensionMatches) {
            throw new StorageUploadException(
                    "File extension does not match declared content type");
        }

        // ── 5. Per-type size cap ─────────────────────────────────────────────
        long sizeLimit = SIZE_LIMIT_BY_TYPE.getOrDefault(normalizedType, MAX_IMAGE_SIZE_BYTES);
        if (fileBytes.length > sizeLimit) {
            long limitMb = sizeLimit / (1024 * 1024);
            throw new StorageUploadException(
                    "File exceeds the maximum allowed size of " + limitMb + " MB for type " + normalizedType);
        }

        // ── 6. Upload to Supabase Storage ────────────────────────────────────
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucket, filePath);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + serviceKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .timeout(java.time.Duration.ofSeconds(120)) // 120s timeout to allow large 20MB uploads on slower speeds
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
