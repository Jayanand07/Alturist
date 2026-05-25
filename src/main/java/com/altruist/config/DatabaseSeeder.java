package com.altruist.config;

import com.altruist.model.Medicine;
import com.altruist.model.User;
import com.altruist.model.Doctor;
import com.altruist.model.DoctorVlog;
import com.altruist.model.UserType;
import com.altruist.repository.MedicineRepository;
import com.altruist.repository.UserRepository;
import com.altruist.repository.DoctorRepository;
import com.altruist.repository.DoctorVlogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorVlogRepository doctorVlogRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Medicines
        if (medicineRepository.count() == 0) {
            log.info("Database is empty of medicines. Seeding realistic medicine catalog with verified image URLs...");

            List<Medicine> initialMedicines = Arrays.asList(
                Medicine.builder()
                    .name("Dolo 650 Tablet")
                    .genericName("Paracetamol / Acetaminophen 650mg")
                    .manufacturer("Micro Labs Ltd")
                    .category("Painkillers")
                    .price(new BigDecimal("30.00"))
                    .discountedPrice(new BigDecimal("24.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(500)
                    .description("Highly effective for reducing fever and providing relief from mild to moderate pain.")
                    .imageUrl("https://images.unsplash.com/photo-1584308666744-24d5e1a3bcbe?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Crocin Pain Relief")
                    .genericName("Caffeine 50mg + Paracetamol 650mg")
                    .manufacturer("GlaxoSmithKline")
                    .category("Painkillers")
                    .price(new BigDecimal("45.00"))
                    .discountedPrice(new BigDecimal("38.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(300)
                    .description("Specialized fast-action formula for headaches, migraines, and severe muscle strain.")
                    .imageUrl("https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Augmentin 625 Duo")
                    .genericName("Amoxycillin 500mg + Clavulanic Acid 125mg")
                    .manufacturer("GlaxoSmithKline")
                    .category("Antibiotics")
                    .price(new BigDecimal("201.00"))
                    .discountedPrice(new BigDecimal("179.00"))
                    .requiresPrescription(true)
                    .inStock(true)
                    .stockQuantity(120)
                    .description("Prescribed broad-spectrum antibiotic clinically proven to treat bacterial infections of the lungs, ears, and skin.")
                    .imageUrl("https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Limcee Vitamin C Chewable")
                    .genericName("Vitamin C (Ascorbic Acid) 500mg")
                    .manufacturer("Abbott Laboratories")
                    .category("Vitamins")
                    .price(new BigDecimal("25.00"))
                    .discountedPrice(new BigDecimal("20.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(800)
                    .description("Immunity booster chewable tablet. Prevents scurvy and promotes radiant skin and tissue healing.")
                    .imageUrl("https://images.unsplash.com/photo-1611295742364-927d44fa62d1?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Becosules Capsules")
                    .genericName("Vitamin B-Complex with Vitamin C")
                    .manufacturer("Pfizer Ltd")
                    .category("Vitamins")
                    .price(new BigDecimal("50.00"))
                    .discountedPrice(new BigDecimal("42.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(450)
                    .description("Standard daily supplement containing vital B vitamins to combat fatigue, mouth ulcers, and cell recovery.")
                    .imageUrl("https://images.unsplash.com/photo-1550572017-edb799298379?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Evion 400 Vitamin E")
                    .genericName("Vitamin E (Tocopheryl Acetate) 400mg")
                    .manufacturer("Merck Ltd")
                    .category("Vitamins")
                    .price(new BigDecimal("85.00"))
                    .discountedPrice(new BigDecimal("74.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(350)
                    .description("Deep nourishment capsules for hair growth, skin cell protection, and strong cellular immunity.")
                    .imageUrl("https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Glycomet GP 1 Tablet")
                    .genericName("Glimepiride 1mg + Metformin 500mg")
                    .manufacturer("USV Private Ltd")
                    .category("Diabetes")
                    .price(new BigDecimal("95.00"))
                    .discountedPrice(new BigDecimal("82.00"))
                    .requiresPrescription(true)
                    .inStock(true)
                    .stockQuantity(200)
                    .description("Prescribed anti-diabetic medication used to control type 2 blood sugar levels in adults.")
                    .imageUrl("https://images.unsplash.com/photo-1579684385101-f3d34f634312?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Telma 40 Heart Tablet")
                    .genericName("Telmisartan 40mg")
                    .manufacturer("Glenmark Pharmaceuticals")
                    .category("Cardiac")
                    .price(new BigDecimal("115.00"))
                    .discountedPrice(new BigDecimal("99.00"))
                    .requiresPrescription(true)
                    .inStock(true)
                    .stockQuantity(160)
                    .description("Used for cardiovascular protection, treating hypertension, and reducing risks of strokes and attacks.")
                    .imageUrl("https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Cetaphil Gentle Skin Cleanser")
                    .genericName("Gentle Cleansing Formula")
                    .manufacturer("Galderma Laboratories")
                    .category("Dermatology")
                    .price(new BigDecimal("399.00"))
                    .discountedPrice(new BigDecimal("349.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(150)
                    .description("Fragrance-free, hypoallergenic, non-foaming skin wash clinically recommended for extra sensitive skin.")
                    .imageUrl("https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop&q=80")
                    .build(),

                Medicine.builder()
                    .name("Dettol Antiseptic Liquid")
                    .genericName("Chloroxylenol Antiseptic")
                    .manufacturer("Reckitt Benckiser")
                    .category("Personal Care")
                    .price(new BigDecimal("380.00"))
                    .discountedPrice(new BigDecimal("350.00"))
                    .requiresPrescription(false)
                    .inStock(true)
                    .stockQuantity(400)
                    .description("Highly trusted germ protection liquid used for first aid skin disinfection, bathing, and clean laundry.")
                    .imageUrl("https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&h=400&fit=crop&q=80")
                    .build()
            );

            medicineRepository.saveAll(initialMedicines);
            log.info("Successfully seeded {} medicine products into the catalog database!", initialMedicines.size());
        } else {
            log.info("Medicines are already present in the catalog. Skipping database seeding.");
        }

        // 2. Seed Users & Doctors
        if (doctorRepository.count() == 0) {
            log.info("Database is empty of doctors. Seeding realistic doctor profiles...");

            // Doctor 1 (Sarah Jenkins - Cardiologist in Amritsar)
            seedDoctor(
                "seeder-uid-sarah-jenkins",
                "sarah.jenkins@altruistwellness.com",
                "+919876543210",
                "Sarah Jenkins",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&q=80",
                "Cardiologist",
                "MC-12345",
                "MD - Cardiology, MBBS",
                15,
                new BigDecimal("500.00"),
                4.9,
                120,
                "Amritsar",
                "Altruist Multispecialty Care Center",
                "45 Mall Road, Opp. Rose Garden, Amritsar, Punjab 143001",
                "+911832567890",
                31.6340,
                74.8723,
                "Experienced cardiologist specialized in preventive cardiology, heart failure management, and non-invasive cardiovascular imaging. Committed to evidence-based healthcare."
            );

            // Doctor 2 (Michael Chen - Neurologist in Jalandhar)
            seedDoctor(
                "seeder-uid-michael-chen",
                "michael.chen@altruistwellness.com",
                "+919876543211",
                "Michael Chen",
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&q=80",
                "Neurologist",
                "MC-23456",
                "DM - Neurology, MD, MBBS",
                12,
                new BigDecimal("600.00"),
                4.8,
                95,
                "Jalandhar",
                "Altruist Heart & Skin Care Centre",
                "12 Model Town Main Road, Jalandhar, Punjab 144003",
                "+911812456789",
                31.3260,
                75.5762,
                "Compassionate neurologist specializing in migraine management, neuromuscular disorders, sleep medicine, and stroke prevention. Dedicated to restoring patient nervous system health."
            );

            // Doctor 3 (Emily Roberts - Pediatrician in Gurgaon)
            seedDoctor(
                "seeder-uid-emily-roberts",
                "emily.roberts@altruistwellness.com",
                "+919876543212",
                "Emily Roberts",
                "https://images.unsplash.com/photo-1594824436998-058d0152462e?w=300&h=300&fit=crop&q=80",
                "Pediatrician",
                "MC-34567",
                "MD - Pediatrics, MBBS",
                8,
                new BigDecimal("400.00"),
                4.9,
                210,
                "Gurgaon",
                "Altruist Pediatric & Dental Hospital",
                "78 Sarabha Nagar Extension, Ludhiana, Punjab 141001",
                "+911612789012",
                28.4595,
                77.0266,
                "Dedicated pediatrician focused on early childhood development, pediatric nutrition, adolescent care, and routine immunizations in a welcoming and child-friendly environment."
            );

            // Doctor 4 (Amit Patel - Dermatologist in Ludhiana)
            seedDoctor(
                "seeder-uid-amit-patel",
                "amit.patel@altruistwellness.com",
                "+919876543213",
                "Amit Patel",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop&q=80",
                "Dermatologist",
                "MC-45678",
                "MD - Dermatology, MBBS",
                10,
                new BigDecimal("450.00"),
                4.7,
                80,
                "Ludhiana",
                "Altruist Pediatric & Dental Hospital",
                "78 Sarabha Nagar Extension, Ludhiana, Punjab 141001",
                "+911612789013",
                30.9010,
                75.8573,
                "Expert dermatologist specializing in medical dermatology, acne treatments, skin barrier restoration, and anti-aging therapies. Believes in personalized and holistic skin care routines."
            );

            // Doctor 5 (Lisa Wong - General Physician in Chandigarh)
            seedDoctor(
                "seeder-uid-lisa-wong",
                "lisa.wong@altruistwellness.com",
                "+919876543214",
                "Lisa Wong",
                "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop&q=80",
                "General Physician",
                "MC-56789",
                "MD - General Medicine, MBBS",
                20,
                new BigDecimal("350.00"),
                4.9,
                300,
                "Chandigarh",
                "Altruist Family Clinic & Diagnostics",
                "SCO 112-114, Sector 17-C, Chandigarh 160017",
                "+911722567890",
                30.7333,
                76.7794,
                "Veteran general physician specialized in chronic disease management, metabolic syndrome, diabetic control, and family medicine. Emphasizes healthy lifestyle shifts."
            );

            log.info("Successfully seeded 5 realistic doctor profiles along with their vlogs!");
        } else {
            log.info("Doctors are already present in the catalog. Skipping doctor seeding.");
        }
    }

    private void seedDoctor(
        String firebaseUid, String email, String phone, String fullName, String profilePic,
        String specialization, String license, String qualification, int experience, BigDecimal fee,
        double rating, int consultations, String city, String clinicName, String clinicAddress,
        String clinicPhone, double lat, double lng, String bio
    ) {
        User user = new User();
        user.setFirebaseUid(firebaseUid);
        user.setEmail(email);
        user.setPhone(phone);
        user.setFullName(fullName);
        user.setUserType(UserType.DOCTOR);
        user.setProfilePictureUrl(profilePic);
        user = userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialization(specialization);
        doctor.setMedicalLicense(license);
        doctor.setQualification(qualification);
        doctor.setExperienceYears(experience);
        doctor.setConsultationFee(fee);
        doctor.setRating(rating);
        doctor.setTotalConsultations(consultations);
        doctor.setCity(city);
        doctor.setClinicName(clinicName);
        doctor.setClinicAddress(clinicAddress);
        doctor.setClinicPhone(clinicPhone);
        doctor.setLatitude(lat);
        doctor.setLongitude(lng);
        doctor.setBio(bio);
        doctor.setIsVerified(true);
        doctor.setIsAvailable(true);
        doctor.setLanguages("English, Hindi, Punjabi");
        doctor.setProfilePictureUrl(profilePic);
        doctor = doctorRepository.save(doctor);

        // Seed public vlogs for this doctor
        seedDoctorVlogs(doctor);
    }

    private void seedDoctorVlogs(Doctor doctor) {
        if (doctor.getSpecialization().equals("Cardiologist")) {
            seedVlog(doctor,
                "The Power of a 30-Minute Walk: Cardiovascular Secrets 🚶‍♂️",
                "Walking is the simplest, most underrated medicine. It costs nothing, has zero negative side effects, and reduces the risk of heart failure by 30%. Your heart will thank you for every single step. We discuss proper posture, speed, and standard clinical guidelines.",
                "https://www.youtube.com/watch?v=k-c6wz46Djg",
                "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&q=80",
                "Health Tips",
                1420
            );
        } else if (doctor.getSpecialization().equals("General Physician")) {
            if (doctor.getUser().getFullName().contains("Lisa Wong")) {
                seedVlog(doctor,
                    "Unlocking Gut Health: The Truth About Probiotics & Diet 🥗",
                    "Let food be thy medicine, and medicine thy food. A diverse microbiome is the cornerstone of digestive health, immune function, and mental clarity. Focus on fermented products, prebiotic fibers, and clean leafy greens. I debunk common processed probiotic supplement myths.",
                    "https://www.youtube.com/watch?v=1sIYl9M2Qmc",
                    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop&q=80",
                    "Diet",
                    980
                );
                seedVlog(doctor,
                    "Managing Diabetes: Simple Daily Lifestyle Hacks 🩺",
                    "Small, consistent changes in daily physical activity and carbohydrate timing are infinitely more sustainable and clinically effective than crash diets. Prioritize proteins, walk for 10 minutes right after meals, and monitor your glucose trends regularly.",
                    "https://www.youtube.com/watch?v=k2Z6aA4CjEg",
                    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&h=400&fit=crop&q=80",
                    "General",
                    1430
                );
            }
        } else if (doctor.getSpecialization().equals("Neurologist")) {
            seedVlog(doctor,
                "Mastering Sleep: The Ultimate Shield Against Anxiety 🧠",
                "Sleep is the single most effective thing we can do to reset our brain and body health each day. Adequate REM and deep sleep cycles reduce cortisol levels, consolidate cognitive memory, and clear amyloid plaques. Get my scientific blueprint to maximize deep sleep.",
                "https://www.youtube.com/watch?v=5MuIMqhT8DM",
                "https://images.unsplash.com/photo-1511295742364-927d44fa62d1?w=600&h=400&fit=crop&q=80",
                "Mental Health",
                2150
            );
        } else if (doctor.getSpecialization().equals("Dermatologist")) {
            seedVlog(doctor,
                "Skin Health & Hydration: Debunking Skin Protection Myths 🧴",
                "Your skin is a direct reflection of your hydration and internal metabolic health. Topical moisturizers protect the barrier, but skin cell renewal starts from within. Drink plenty of water and prioritize antioxidant foods like berries, tomatoes, and clean zinc supplements.",
                "https://www.youtube.com/watch?v=k9Xm4tA442Y",
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400&fit=crop&q=80",
                "Health Tips",
                1670
            );
        } else if (doctor.getSpecialization().equals("Pediatrician")) {
            seedVlog(doctor,
                "Active Growth & Child Nutrition: A Pediatrician's Advice 👶",
                "Early childhood nutrition sets the stage for a lifetime of metabolic health. Minimize refined sugars and high fructose corn syrup. Focus on balanced clean protein, developmental active play, and regular sleep cycles to fuel active growing bodies and brains.",
                "https://www.youtube.com/watch?v=0kH84w4aHjg",
                "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&h=400&fit=crop&q=80",
                "Health Tips",
                850
            );
        }
    }

    private void seedVlog(
        Doctor doctor, String title, String description,
        String videoUrl, String thumbnailUrl, String category, int views
    ) {
        DoctorVlog vlog = new DoctorVlog();
        vlog.setDoctor(doctor);
        vlog.setTitle(title);
        vlog.setDescription(description);
        vlog.setVideoUrl(videoUrl);
        vlog.setThumbnailUrl(thumbnailUrl);
        vlog.setCategory(category);
        vlog.setViewCount(views);
        vlog.setIsPublished(true);
        vlog.setPublishedAt(java.time.LocalDateTime.now());
        doctorVlogRepository.save(vlog);
    }
}
