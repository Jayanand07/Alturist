# Tech Debt & Known Risks - Altruist Medical Platform

## 1. Race Condition in Doctor Availability
**Location:** `ConsultationService.bookInstantConsultation()`

**Description:**
The availability check and update are currently two separate operations:
```java
// Check
if (!doctor.getIsAvailable()) throw...
// Update
doctor.setIsAvailable(false);
doctorRepository.save(doctor);
```
In high-concurrency scenarios, two patients might both pass the `getIsAvailable()` check before the first one completes the `save()`. This could lead to a doctor being booked by two patients at the same instant.

**Mitigation Strategies:**
- **JPA Optimistic Locking:** Add a `Long version` field with `@Version` to the `Doctor` entity.
- **Atomic Update Query:** Use a native or JPQL update that checks the condition in the `WHERE` clause:
  `UPDATE Doctor d SET d.isAvailable = false WHERE d.id = :id AND d.isAvailable = true`
  Then check the affected row count.
- **Pessimistic Locking:** Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the repository find method.

**Current Status:** Acceptable for early development; must fix before scaling.

---

## 2. Prescription Storage (Simulated)
**Location:** `ConsultationService.completeConsultation()`

**Description:**
Currently storing prescription data as a JSON string within the `diagnosis` field.

**Future Task:**
Integrate Supabase Storage via an external service to generate PDFs from the raw data and store the signed public URLs.

---

## 3. Firebase Credentials Path (Hardcoded Fallback)
**Location:** `src/main/resources/application.yml`

**Description:**
Current config has hardcoded fallback path:
`${FIREBASE_CREDENTIALS_PATH:c:/Users/anand/Desktop/medical pr/firebase-service-account.json}`
This will fail on any other machine or deployment.

**Fix before deployment:**
Remove the fallback default entirely.
Set `FIREBASE_CREDENTIALS_PATH` as required environment variable in Vercel/Railway.
Throw `IllegalStateException` if missing.

**Current Status:** Dev only, must fix before deployment.
