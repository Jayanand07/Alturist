-- Migration V7: Create patient_testimonials table
CREATE TABLE IF NOT EXISTS patient_testimonials (
    id UUID PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    review_text TEXT NOT NULL,
    rating INTEGER,
    tag VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
