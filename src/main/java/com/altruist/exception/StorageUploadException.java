package com.altruist.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class StorageUploadException extends RuntimeException {
    public StorageUploadException(String message) {
        super(message);
    }

    public StorageUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
