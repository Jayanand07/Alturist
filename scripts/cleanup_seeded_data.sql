-- Manual Cleanup Script for Seeded Demo Data
-- This script deletes all demo records inserted by the DatabaseSeeder.
-- WRAPPED IN A TRANSACTION WITH ROLLBACK.
-- Change ROLLBACK; to COMMIT; at the end of the file to persist changes after reviewing.

BEGIN;

-- 1. Delete vlogs authored by seeded doctors
DELETE FROM vlogs 
WHERE author_doctor_id IN (
    SELECT d.id FROM doctors d 
    JOIN users u ON d.user_id = u.id 
    WHERE u.firebase_uid LIKE 'seeder-uid-%' OR u.email LIKE '%@altruistwellness.com'
);

-- 2. Delete doctors seeded by DatabaseSeeder
DELETE FROM doctors 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE firebase_uid LIKE 'seeder-uid-%' OR email LIKE '%@altruistwellness.com'
);

-- 3. Delete users seeded by DatabaseSeeder
DELETE FROM users 
WHERE firebase_uid LIKE 'seeder-uid-%' OR email LIKE '%@altruistwellness.com';

-- 4. Delete seeded lab packages by exact name matching
DELETE FROM lab_packages 
WHERE name IN ('Full Body Active Health Package', 'Advanced Diabetes Care Package');

-- 5. Delete seeded lab tests by exact name matching
DELETE FROM lab_tests 
WHERE name IN ('Complete Blood Count (CBC)', 'HbA1c (Glycated Haemoglobin)', 'Lipid Profile');

-- 6. Delete seeded medicines by exact name matching
DELETE FROM medicines 
WHERE name IN (
    'Dolo 650 Tablet',
    'Crocin Pain Relief',
    'Augmentin 625 Duo',
    'Limcee Vitamin C Chewable',
    'Becosules Capsules',
    'Evion 400 Vitamin E',
    'Glycomet GP 1 Tablet',
    'Telma 40 Heart Tablet',
    'Cetaphil Gentle Skin Cleanser',
    'Dettol Antiseptic Liquid'
);

-- Rollback by default to allow safe manual testing/dry-run.
-- Replace with COMMIT; when you are ready to execute permanently.
ROLLBACK;
