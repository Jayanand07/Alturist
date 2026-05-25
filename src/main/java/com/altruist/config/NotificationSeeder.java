package com.altruist.config;

import com.altruist.model.User;
import com.altruist.repository.UserRepository;
import com.altruist.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class NotificationSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final com.altruist.repository.NotificationRepository notificationRepository;

    @Override
    public void run(String... args) throws Exception {
        if (notificationRepository.count() == 0) {
            log.info("Database is empty of notifications. Seeding mock notifications for dev/local environment...");
            List<User> users = userRepository.findAll();
            int seededCount = 0;
            for (User user : users) {
                // Seed 3 realistic, premium notifications for each user
                notificationService.createNotification(
                    user.getId(),
                    "Welcome to Altruist Wellness! 🏥",
                    "Your premium healthcare account is successfully active. Explore virtual doctor consultations, pharmacy stores, and NABL-accredited diagnostic labs near you.",
                    "SYSTEM"
                );
                
                notificationService.createNotification(
                    user.getId(),
                    "Upcoming Health Checkup Reminder 🗓️",
                    "Friendly reminder: Your Advanced Health Package diagnostic home sample collect is scheduled for tomorrow at 08:30 AM. Please fast for 8-10 hours prior.",
                    "APPOINTMENT"
                );
                
                notificationService.createNotification(
                    user.getId(),
                    "New Message from Dr. Wong 💬",
                    "Hey! I reviewed your symptoms list. Please avoid cold foods and complete your primary blood glucose screening tests at the earliest.",
                    "CHAT"
                );
                seededCount += 3;
            }
            log.info("Successfully seeded {} mock notifications across {} users!", seededCount, users.size());
        } else {
            log.info("Notifications already exist. Skipping notification seeding.");
        }
    }
}
