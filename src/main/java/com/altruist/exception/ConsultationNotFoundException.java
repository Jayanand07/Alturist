package com.altruist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ConsultationNotFoundException extends RuntimeException {

    public ConsultationNotFoundException(UUID id) {
        super("Consultation not found with id: " + id);
    }

    public ConsultationNotFoundException(String message) {
        super(message);
    }
}
