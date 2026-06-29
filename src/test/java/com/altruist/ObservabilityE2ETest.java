package com.altruist;

import com.altruist.dto.*;
import com.altruist.model.*;
import com.altruist.repository.*;
import com.altruist.controller.AdminController;
import com.altruist.service.EmailService;
import com.altruist.service.SupabaseStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.*;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class ObservabilityE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FirebaseAuth firebaseAuth;

    @MockBean
    private SupabaseStorageService supabaseStorageService;

    @MockBean
    private EmailService emailService;

    @SpyBean
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    @Autowired
    private LabTestRepository labTestRepository;

    @Autowired
    private LabPackageRepository labPackageRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private LabBookingRepository labBookingRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    private static final List<TestResult> results = new ArrayList<>();

    private static final String PATIENT_UID = "test-uid-patient";
    private static final String DOCTOR_UID = "seeder-uid-sarah-jenkins";
    private static final String ADMIN_UID = "test-uid-admin";
    private static final String SUPER_ADMIN_UID = "test-uid-super-admin";

    private static final String PATIENT_TOKEN = "patient-token";
    private static final String DOCTOR_TOKEN = "doctor-token";
    private static final String ADMIN_TOKEN = "admin-token";
    private static final String SUPER_ADMIN_TOKEN = "super-admin-token";

    private User patientUser;
    private User doctorUser;
    private User adminUser;
    private User superAdminUser;
    private Doctor doctorProfile;
    private Medicine testMedicine;
    private LabTest testLabTest;
    private SubscriptionPlan testPlan;

    private static class TestResult {
        String endpoint;
        String role;
        String expected;
        String actualStatus;
        String passFail;
        String errorBody;

        TestResult(String endpoint, String role, String expected, String actualStatus, String passFail, String errorBody) {
            this.endpoint = endpoint;
            this.role = role;
            this.expected = expected;
            this.actualStatus = actualStatus;
            this.passFail = passFail;
            this.errorBody = errorBody;
        }
    }

    @BeforeAll
    public static void loadEnv() {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }

    @BeforeEach
    public void setup() throws Exception {
        setupMockToken(PATIENT_TOKEN, PATIENT_UID, "patient@test.com");
        setupMockToken(DOCTOR_TOKEN, DOCTOR_UID, "sarah.jenkins@altruistwellness.com");
        setupMockToken(ADMIN_TOKEN, ADMIN_UID, "admin@test.com");
        setupMockToken(SUPER_ADMIN_TOKEN, SUPER_ADMIN_UID, "super_admin@test.com");

        Mockito.when(supabaseStorageService.uploadFile(Mockito.anyString(), Mockito.anyString(), Mockito.any(byte[].class), Mockito.anyString()))
                .thenReturn("http://mocked-supabase-url/prescriptions/file.pdf");

        // Clean up previous run's test data to ensure clean state
        cleanupTestData();

        // Create mock Super Admin user object (to bypass DB check constraint on SUPER_ADMIN)
        superAdminUser = new User();
        superAdminUser.setId(UUID.randomUUID());
        superAdminUser.setFirebaseUid(SUPER_ADMIN_UID);
        superAdminUser.setEmail("super_admin@test.com");
        superAdminUser.setUserType(UserType.SUPER_ADMIN);
        superAdminUser.setFullName("Test Super Admin");
        superAdminUser.setWelcomeEmailSent(true); // Prevent welcome email DB save attempt which violates SUPER_ADMIN constraint

        // Stub UserRepository calls for SUPER_ADMIN
        Mockito.doReturn(Optional.of(superAdminUser))
                .when(userRepository).findByFirebaseUid(SUPER_ADMIN_UID);
        Mockito.doReturn(Optional.of(superAdminUser))
                .when(userRepository).findById(superAdminUser.getId());

        // Create other test users in DB (PATIENT and ADMIN roles are allowed by DB check constraint)
        patientUser = createUser(PATIENT_UID, "patient@test.com", UserType.PATIENT, "Test Patient");
        adminUser = createUser(ADMIN_UID, "admin@test.com", UserType.ADMIN, "Test Admin");

        // Find seeded Doctor (Sarah Jenkins)
        doctorUser = userRepository.findByEmail("sarah.jenkins@altruistwellness.com")
                .orElseThrow(() -> new RuntimeException("Seeded doctor user not found in database."));
        doctorProfile = doctorRepository.findByUserId(doctorUser.getId())
                .orElseThrow(() -> new RuntimeException("Seeded doctor Sarah Jenkins not found in database. Make sure seeder ran."));
        
        // Reset doctor availability to true for testing
        doctorProfile.setIsAvailable(true);
        doctorRepository.save(doctorProfile);

        // Find seeded Medicine
        testMedicine = medicineRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No medicines found in database."));

        // Find seeded Lab Test
        testLabTest = labTestRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Seeded lab test not found in database."));

        // Seed a subscription plan if it doesn't exist
        testPlan = subscriptionPlanRepository.save(new SubscriptionPlan(
                null, "Test Plan", "Priority medical care", BigDecimal.valueOf(299),
                BigDecimal.valueOf(2999), 3, true, 10, true, 10, true, true, null
        ));
    }

    @AfterEach
    public void cleanup() {
        cleanupTestData();
    }

    private void cleanupTestData() {
        if (userSubscriptionRepository != null) {
            userRepository.findByFirebaseUid(PATIENT_UID).ifPresent(patient -> {
                userSubscriptionRepository.deleteAll(userSubscriptionRepository.findByUserOrderByCreatedAtDesc(patient));
            });
            userRepository.findByFirebaseUid("test-uid-cache-bug").ifPresent(patient -> {
                userSubscriptionRepository.deleteAll(userSubscriptionRepository.findByUserOrderByCreatedAtDesc(patient));
            });
        }

        if (testPlan != null && testPlan.getId() != null) {
            if (userSubscriptionRepository != null) {
                userSubscriptionRepository.deleteAll(userSubscriptionRepository.findAll().stream()
                        .filter(s -> s.getPlan().getId().equals(testPlan.getId()))
                        .toList());
            }
            subscriptionPlanRepository.deleteById(testPlan.getId());
        }

        userRepository.findByFirebaseUid(PATIENT_UID).ifPresent(patient -> {
            if (prescriptionRepository != null) {
                prescriptionRepository.deleteAll(prescriptionRepository.findAll().stream()
                        .filter(p -> p.getPatient().getId().equals(patient.getId()))
                        .toList());
            }
            orderRepository.deleteAll(orderRepository.findAll().stream()
                    .filter(o -> o.getPatient().getId().equals(patient.getId()))
                    .toList());
            labBookingRepository.deleteAll(labBookingRepository.findAll().stream()
                    .filter(b -> b.getPatient().getId().equals(patient.getId()))
                    .toList());
            supportTicketRepository.deleteAll(supportTicketRepository.findAll().stream()
                    .filter(t -> t.getPatient().getId().equals(patient.getId()))
                    .toList());
            consultationRepository.deleteAll(consultationRepository.findAll().stream()
                    .filter(c -> c.getPatient().getId().equals(patient.getId()))
                    .toList());
        });

        userRepository.findByFirebaseUid("test-uid-cache-bug").ifPresent(patient -> {
            doctorRepository.findByUserId(patient.getId()).ifPresent(doctorRepository::delete);
            if (prescriptionRepository != null) {
                prescriptionRepository.deleteAll(prescriptionRepository.findAll().stream()
                        .filter(p -> p.getPatient().getId().equals(patient.getId()))
                        .toList());
            }
            consultationRepository.deleteAll(consultationRepository.findAll().stream()
                    .filter(c -> c.getPatient().getId().equals(patient.getId()))
                    .toList());
            supportTicketRepository.deleteAll(supportTicketRepository.findAll().stream()
                    .filter(t -> t.getPatient().getId().equals(patient.getId()))
                    .toList());
        });

        userRepository.findByFirebaseUid(PATIENT_UID).ifPresent(userRepository::delete);
        userRepository.findByFirebaseUid(ADMIN_UID).ifPresent(userRepository::delete);
        userRepository.findByFirebaseUid("test-uid-cache-bug").ifPresent(userRepository::delete);
    }

    private User createUser(String uid, String email, UserType type, String name) {
        User u = new User();
        u.setFirebaseUid(uid);
        u.setEmail(email);
        u.setUserType(type);
        u.setFullName(name);
        return userRepository.save(u);
    }

    private void setupMockToken(String token, String uid, String email) throws Exception {
        FirebaseToken mockToken = Mockito.mock(FirebaseToken.class);
        Mockito.when(mockToken.getUid()).thenReturn(uid);
        Mockito.when(mockToken.getEmail()).thenReturn(email);
        Mockito.when(firebaseAuth.verifyIdToken(token)).thenReturn(mockToken);
    }

    private void runGet(String endpoint, String token, String role, int expectedStatus) {
        try {
            var request = get(endpoint);
            if (token != null) {
                request.header("Authorization", "Bearer " + token);
            }
            MvcResult result = mockMvc.perform(request).andReturn();
            int actual = result.getResponse().getStatus();
            String errorBody = "";
            if (actual >= 400) {
                errorBody = result.getResponse().getContentAsString();
                if (errorBody.length() > 100) errorBody = errorBody.substring(0, 100) + "...";
            }
            String passFail = (actual == expectedStatus) ? "PASS" : "FAIL";
            results.add(new TestResult(endpoint, role, String.valueOf(expectedStatus), String.valueOf(actual), passFail, errorBody));
        } catch (Exception e) {
            results.add(new TestResult(endpoint, role, String.valueOf(expectedStatus), "CRASH", "FAIL", e.getMessage()));
        }
    }

    @Test
    public void testAllEndpoints() throws Exception {
        // Public endpoints (no auth)
        runGet("/api/doctors/available", null, "ANONYMOUS", 200);
        runGet("/api/medicines", null, "ANONYMOUS", 200);
        runGet("/api/vlogs", null, "ANONYMOUS", 200);
        runGet("/api/testimonials", null, "ANONYMOUS", 200);
        runGet("/api/subscriptions/plans", null, "ANONYMOUS", 200);
        runGet("/api/lab-tests/featured", null, "ANONYMOUS", 200);
        runGet("/api/lab-packages", null, "ANONYMOUS", 200);

        // Role-based auth endpoints (Authorized matches)
        runGet("/api/patients/dashboard", PATIENT_TOKEN, "PATIENT", 200);
        runGet("/api/doctors/dashboard", DOCTOR_TOKEN, "DOCTOR", 200);
        runGet("/api/admin/dashboard", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/dashboard", SUPER_ADMIN_TOKEN, "SUPER_ADMIN", 200);
        runGet("/api/notifications", PATIENT_TOKEN, "PATIENT", 200);
        runGet("/api/orders/my", PATIENT_TOKEN, "PATIENT", 200);

        runGet("/api/admin/doctors", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/patients", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/consultations", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/orders", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/medicines", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/lab-bookings", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/lab-tests", ADMIN_TOKEN, "ADMIN", 200);
        runGet("/api/admin/lab-packages", ADMIN_TOKEN, "ADMIN", 200);

        runGet("/api/admin/subscriptions", SUPER_ADMIN_TOKEN, "SUPER_ADMIN", 200);
        runGet("/api/admin/subscriptions/plans", SUPER_ADMIN_TOKEN, "SUPER_ADMIN", 200);
        runGet("/api/admin/support/tickets", DOCTOR_TOKEN, "DOCTOR", 200);

        // Negative authorization checks (Expected 403 Forbidden)
        runGet("/api/admin/dashboard", PATIENT_TOKEN, "PATIENT (Unauthorized)", 403);
        runGet("/api/admin/dashboard", DOCTOR_TOKEN, "DOCTOR (Unauthorized)", 403);
        runGet("/api/doctors/dashboard", PATIENT_TOKEN, "PATIENT (Unauthorized)", 403);
        runGet("/api/admin/subscriptions/plans", ADMIN_TOKEN, "ADMIN (Unauthorized)", 403);

        // Write Flows
        testWriteFlows();

        // Role Cache Bug Test
        testRoleCacheBug();

        // Write markdown table to artifact directory
        writeReport();
    }

    private void testWriteFlows() throws Exception {
        // Write Flow 1: Consultation lifecycle
        // 1. Patient requests instant consultation
        InstantBookingRequestDTO bookingReq = new InstantBookingRequestDTO();
        bookingReq.setDoctorId(doctorProfile.getId());
        bookingReq.setConsultationType("INSTANT");
        bookingReq.setChiefComplaint("Fever and cold");
        
        MvcResult bookRes = mockMvc.perform(post("/api/consultations/instant")
                .header("Authorization", "Bearer " + PATIENT_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingReq)))
                .andReturn();
        
        int statusBook = bookRes.getResponse().getStatus();
        String bodyBook = bookRes.getResponse().getContentAsString();
        results.add(new TestResult("POST /api/consultations/instant", "PATIENT", "201", String.valueOf(statusBook), (statusBook == 201) ? "PASS" : "FAIL", statusBook >= 400 ? bodyBook : ""));
        
        if (statusBook < 300) {
            ConsultationResponseDTO consultation = objectMapper.readValue(bodyBook, ConsultationResponseDTO.class);
            UUID consultationId = consultation.getConsultationId();
            
            // 2. Doctor accepts the instant consultation
            MvcResult acceptRes = mockMvc.perform(post("/api/doctors/accept-instant/" + consultationId)
                    .header("Authorization", "Bearer " + DOCTOR_TOKEN))
                    .andReturn();
            int statusAccept = acceptRes.getResponse().getStatus();
            results.add(new TestResult("POST /api/doctors/accept-instant/{id}", "DOCTOR", "200", String.valueOf(statusAccept), (statusAccept == 200) ? "PASS" : "FAIL", statusAccept >= 400 ? acceptRes.getResponse().getContentAsString() : ""));
            
            // 3. Doctor completes it with a prescription (generates PDF)
            PrescriptionRequestDTO prescription = new PrescriptionRequestDTO();
            prescription.setConsultationId(consultationId);
            prescription.setDiagnosis("Common Flu");
            prescription.setValidUntil(LocalDate.now().plusDays(10));
            prescription.setFollowUpDate(LocalDate.now().plusDays(5));
            
            PrescriptionRequestDTO.MedicineDTO item = new PrescriptionRequestDTO.MedicineDTO();
            item.setName("Paracetamol 650mg");
            item.setDosage("650mg");
            item.setFrequency("1-0-1");
            item.setDuration("3 days");
            item.setInstructions("Post meals");
            prescription.setMedicines(Collections.singletonList(item));

            MvcResult completeRes = mockMvc.perform(post("/api/prescriptions")
                    .header("Authorization", "Bearer " + DOCTOR_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(prescription)))
                    .andReturn();
            int statusComplete = completeRes.getResponse().getStatus();
            results.add(new TestResult("POST /api/prescriptions", "DOCTOR", "200", String.valueOf(statusComplete), (statusComplete == 200) ? "PASS" : "FAIL", statusComplete >= 400 ? completeRes.getResponse().getContentAsString() : ""));
        }

        // Write Flow 2: Patient places medicine order
        OrderRequestDTO orderReq = new OrderRequestDTO();
        orderReq.setDeliveryAddress("123 Main St, Amritsar");
        orderReq.setPaymentMethod("COD");
        orderReq.setTotalAmount(BigDecimal.valueOf(48));
        
        OrderItemDTO orderItem = new OrderItemDTO();
        orderItem.setId(testMedicine.getId().toString());
        orderItem.setName(testMedicine.getName());
        orderItem.setManufacturer(testMedicine.getManufacturer());
        orderItem.setPrice(testMedicine.getPrice());
        orderItem.setDiscountedPrice(testMedicine.getDiscountedPrice());
        orderItem.setQuantity(2);
        orderItem.setSubtotal(testMedicine.getDiscountedPrice().multiply(BigDecimal.valueOf(2)));
        orderReq.setItems(Collections.singletonList(orderItem));

        MvcResult orderRes = mockMvc.perform(post("/api/orders")
                .header("Authorization", "Bearer " + PATIENT_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderReq)))
                .andReturn();
        int statusOrder = orderRes.getResponse().getStatus();
        String passFailOrder = (statusOrder == 200 || statusOrder == 201) ? "PASS" : "FAIL";
        results.add(new TestResult("POST /api/orders", "PATIENT", "201", String.valueOf(statusOrder), passFailOrder, statusOrder >= 400 ? orderRes.getResponse().getContentAsString() : ""));

        // Write Flow 3: Patient books lab test
        LabBookingRequestDTO labReq = new LabBookingRequestDTO();
        labReq.setLabTestId(testLabTest.getId());
        labReq.setPreferredDate(LocalDate.now().plusDays(1));
        labReq.setPreferredTimeSlot("10:00 AM");
        labReq.setAddress("45 Mall Road, Amritsar");
        labReq.setPhone("+919876543210");

        MvcResult labRes = mockMvc.perform(post("/api/lab-bookings")
                .header("Authorization", "Bearer " + PATIENT_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(labReq)))
                .andReturn();
        int statusLab = labRes.getResponse().getStatus();
        String passFailLab = (statusLab == 200 || statusLab == 201) ? "PASS" : "FAIL";
        results.add(new TestResult("POST /api/lab-bookings", "PATIENT", "201", String.valueOf(statusLab), passFailLab, statusLab >= 400 ? labRes.getResponse().getContentAsString() : ""));

        // Write Flow 4: Patient creates support ticket & message
        SupportTicketRequestDTO ticketReq = new SupportTicketRequestDTO();
        ticketReq.setSubject("Refund query");
        ticketReq.setCategory("Billing");
        ticketReq.setPriority("HIGH");
        ticketReq.setFirstMessage("Double charge on order");

        MvcResult ticketRes = mockMvc.perform(post("/api/support/tickets")
                .header("Authorization", "Bearer " + PATIENT_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ticketReq)))
                .andReturn();
        int statusTicket = ticketRes.getResponse().getStatus();
        String bodyTicket = ticketRes.getResponse().getContentAsString();
        results.add(new TestResult("POST /api/support/tickets", "PATIENT", "200", String.valueOf(statusTicket), (statusTicket == 200) ? "PASS" : "FAIL", statusTicket >= 400 ? bodyTicket : ""));

        if (statusTicket < 300) {
            SupportTicketDTO ticket = objectMapper.readValue(bodyTicket, SupportTicketDTO.class);
            SupportMessageDTO msgReq = new SupportMessageDTO();
            msgReq.setMessage("Still waiting for update");

            MvcResult msgRes = mockMvc.perform(post("/api/support/tickets/" + ticket.getId() + "/messages")
                    .header("Authorization", "Bearer " + PATIENT_TOKEN)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(msgReq)))
                    .andReturn();
            int statusMsg = msgRes.getResponse().getStatus();
            results.add(new TestResult("POST /api/support/tickets/{id}/messages", "PATIENT", "200", String.valueOf(statusMsg), (statusMsg == 200) ? "PASS" : "FAIL", statusMsg >= 400 ? msgRes.getResponse().getContentAsString() : ""));
        }

        // Write Flow 5: Patient subscribes to plan
        Map<String, Object> subReq = new HashMap<>();
        subReq.put("planId", testPlan.getId().toString());
        subReq.put("billingCycle", "MONTHLY");

        MvcResult subRes = mockMvc.perform(post("/api/subscriptions/subscribe")
                .header("Authorization", "Bearer " + PATIENT_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(subReq)))
                .andReturn();
        int statusSub = subRes.getResponse().getStatus();
        results.add(new TestResult("POST /api/subscriptions/subscribe", "PATIENT", "200", String.valueOf(statusSub), (statusSub == 200) ? "PASS" : "FAIL", statusSub >= 400 ? subRes.getResponse().getContentAsString() : ""));
    }

    private void testRoleCacheBug() throws Exception {
        String testUserUid = "test-uid-cache-bug";
        String testUserEmail = "cache_patient@test.com";
        User cacheUser = createUser(testUserUid, testUserEmail, UserType.PATIENT, "Cache Bug Patient");

        setupMockToken("cache-bug-token", testUserUid, testUserEmail);

        // 1. Call GET /api/notifications to populate FirebaseAuthFilter role cache with role: PATIENT
        mockMvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer cache-bug-token"))
                .andReturn();

        // 2. Super admin promotes this user to DOCTOR in DB (including doctor profile creation)
        AdminPromoteDoctorRequestDTO promoteDto = AdminPromoteDoctorRequestDTO.builder()
                .specialization("General Physician")
                .qualification("MBBS")
                .experienceYears(10)
                .consultationFee(new BigDecimal("500.0"))
                .city("Amritsar")
                .build();

        MvcResult promoteResult = mockMvc.perform(post("/api/admin/patients/" + cacheUser.getId() + "/promote-to-doctor")
                .header("Authorization", "Bearer " + SUPER_ADMIN_TOKEN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(promoteDto)))
                .andReturn();

        int promoteStatus = promoteResult.getResponse().getStatus();
        org.junit.jupiter.api.Assertions.assertEquals(200, promoteStatus, "Promotion request failed with status: " + promoteStatus + ". Body: " + promoteResult.getResponse().getContentAsString());

        // 3. IMMEDIATELY call a doctor-only endpoint as that user
        MvcResult result = mockMvc.perform(get("/api/doctors/dashboard")
                .header("Authorization", "Bearer cache-bug-token"))
                .andReturn();

        int actualStatus = result.getResponse().getStatus();
        String errorBody = result.getResponse().getContentAsString();
        
        org.junit.jupiter.api.Assertions.assertEquals(200, actualStatus, "Stale cache bug: request returned " + actualStatus + " instead of 200. Body: " + errorBody);
        
        // Expected status is 200 OK because the stale cache is immediately evicted!
        String passFail = (actualStatus == 200) ? "PASS" : "FAIL";
        
        results.add(new TestResult("Role Cache Bug Test (Immediate doctor call after promotion)", "PROMOTED_DOCTOR", "200", String.valueOf(actualStatus), passFail, errorBody));
    }

    private void writeReport() {
        String filepath = "C:\\Users\\anand\\.gemini\\antigravity-ide\\brain\\c648cea2-81ce-45d3-a7a3-a58d5fd48059\\test_results.md";
        
        File file = new File(filepath);
        if (file.getParentFile() != null) {
            file.getParentFile().mkdirs();
        }

        try (PrintWriter writer = new PrintWriter(new FileWriter(filepath))) {
            writer.println("# Observability E2E Test Report");
            writer.println();
            writer.println("This report was generated automatically by the `ObservabilityE2ETest` suite.");
            writer.println();
            writer.println("## Endpoints Test Results Table");
            writer.println();
            writer.println("| Endpoint | Role / Context | Expected Status | Actual Status | PASS/FAIL | Error Body (if failed) |");
            writer.println("| :--- | :--- | :--- | :--- | :--- | :--- |");
            for (TestResult r : results) {
                String errorEscaped = r.errorBody.replace("|", "\\|").replace("\n", " ").trim();
                writer.printf("| %s | %s | %s | %s | %s | %s |%n", 
                        r.endpoint, r.role, r.expected, r.actualStatus, r.passFail, errorEscaped);
            }
            writer.println();
            writer.println("## Stale Cache Bug Test Status");
            writer.println();
            writer.println("The user role cache bug was explicitly tested during this test run:");
            writer.println("1. A new user was registered and authenticated with the `PATIENT` role.");
            writer.println("2. The user requested `/api/notifications` to cache their authentication context.");
            writer.println("3. The super admin promoted the user to `DOCTOR` in the database and created their doctor profile.");
            writer.println("4. The user made a request to the doctor-only endpoint `/api/doctors/dashboard` immediately.");
            writer.println("5. **Outcome**: The request returned `200 OK` immediately after promotion. This confirms that the role cache was successfully evicted and new permissions are applied instantly.");
        } catch (Exception e) {
            System.err.println("Failed to write test results markdown: " + e.getMessage());
        }
    }
}
