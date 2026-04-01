package com.altruist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedConsultationAccessException extends RuntimeException {

    public UnauthorizedConsultationAccessException() {
        super("You are not authorized to access this consultation");
    }

    public UnauthorizedConsultationAccessException(String message) {
        super(message);
    }
}
