package com.altruist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * SECURITY: Global exception handler.
 * 
 * Critical rules:
 * 1. NEVER return exception.getMessage() to the client — it may contain
 *    SQL fragments, stack frames, internal class names, or user data.
 * 2. Log the full exception server-side for debugging.
 * 3. Return only generic, user-facing messages in the HTTP response.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Not Found ────────────────────────────────────────────────────

    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleDoctorNotFound(DoctorNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", "The requested resource was not found.");
    }

    @ExceptionHandler(ConsultationNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleConsultationNotFound(ConsultationNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, "Not Found", "The requested resource was not found.");
    }

    // ── 403 Forbidden ────────────────────────────────────────────────────

    @ExceptionHandler(UnauthorizedConsultationAccessException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedAccess(UnauthorizedConsultationAccessException ex) {
        log.warn("Unauthorized access attempt: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to perform this action.");
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        log.warn("Unauthorized action: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to perform this action.");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to perform this action.");
    }

    // ── 409 Conflict ─────────────────────────────────────────────────────

    @ExceptionHandler(DoctorNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleDoctorNotAvailable(DoctorNotAvailableException ex) {
        log.warn("Conflict: {}", ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, "Conflict", "The requested action cannot be completed at this time.");
    }

    // ── 400 Bad Request / Validation ─────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Validation error: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad Request", "The request contains invalid data.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        // Field-level validation messages are safe to return — they come from @Valid annotations, not internals.
        long fieldCount = ex.getBindingResult().getFieldErrorCount();
        log.warn("Validation failed on {} field(s)", fieldCount);
        return buildResponse(HttpStatus.BAD_REQUEST, "Validation Failed",
                "Please check your input. " + fieldCount + " field(s) have validation errors.");
    }

    // ── 500 Catch-all ────────────────────────────────────────────────────

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        // SECURITY: Log the FULL stack trace server-side for debugging.
        log.error("Unhandled runtime exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // SECURITY: Catch-all for any exception type not explicitly handled above.
        log.error("Unhandled exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred. Please try again later.");
    }

    // ── Helper ────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
