package com.altruist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DoctorNotAvailableException extends RuntimeException {

    public DoctorNotAvailableException(String doctorName) {
        super("Dr. " + doctorName + " is currently unavailable for consultation");
    }

    public DoctorNotAvailableException() {
        super("The requested doctor is currently unavailable");
    }
}
