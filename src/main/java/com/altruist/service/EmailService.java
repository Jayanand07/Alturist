package com.altruist.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        log.info("Attempting to send welcome email to: [{}] ({})", toEmail, fullName);
        
        if (toEmail == null || toEmail.trim().isEmpty() || "placeholder".equalsIgnoreCase(fromEmail)) {
            log.warn("SMTP mail sender username not configured properly or target email is empty. welcome email simulation logged.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to Altruist Wellness! \uD83C\uDF3F");
            
            String safeName = (fullName != null && !fullName.trim().isEmpty()) ? fullName : "there";
            
            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333333; line-height: 1.6;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>" +
                    "<div style='background-color: #0D9373; padding: 24px; text-align: center;'>" +
                    "<h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Welcome to Altruist Wellness!</h1>" +
                    "</div>" +
                    "<div style='padding: 30px;'>" +
                    "<p style='font-size: 16px; font-weight: bold;'>Dear " + safeName + ",</p>" +
                    "<p>Thank you for registering on <strong>Altruist Wellness</strong>, India's most trusted healthcare platform.</p>" +
                    "<p>With your new account, you can access premium services including:</p>" +
                    "<ul>" +
                    "<li><strong>Consult with specialist doctors online</strong> — Chat with verified doctors within 10 minutes.</li>" +
                    "<li><strong>Order genuine medicines</strong> — Flat 18% off with 2-hour express delivery.</li>" +
                    "<li><strong>Book lab tests at home</strong> — Hygienic sample collection and reports in 24 hours.</li>" +
                    "<li><strong>Explore affordable health insurance plans</strong> — Hospicash, Health Insurance & Term Plans for you and your family.</li>" +
                    "</ul>" +
                    "<p>To get started, log in to your dashboard and explore our health plans.</p>" +
                    "<div style='text-align: center; margin: 30px 0;'>" +
                    "<a href='https://altruistwellness.com/patient' style='background-color: #E8593C; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 14px;'>Go to Dashboard</a>" +
                    "</div>" +
                    "<p>If you have any questions, please contact our support team at <a href='mailto:support@altruistwellness.com'>support@altruistwellness.com</a>.</p>" +
                    "<p>Stay healthy,<br/><strong>Team Altruist Wellness</strong></p>" +
                    "</div>" +
                    "<div style='background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;'>" +
                    "© 2025 Altruist Wellness. Amritsar, Punjab, India." +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            
            log.info("Welcome email sent successfully to: [{}]", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: [{}]. Error: {}", toEmail, e.getMessage());
            // Fail gracefully as specified in commitments
        }
    }

    @Async
    public void sendCallbackNotificationEmail(String phone) {
        log.info("Attempting to send callback notification email for phone: [{}]", phone);

        if ("placeholder".equalsIgnoreCase(fromEmail)) {
            log.warn("SMTP not configured. Callback notification email for [{}] logged only.", phone);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo("support@altruistwellness.com");
            helper.setSubject("New Callback Request — Altruist");

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

            String htmlContent = "<html>" +
                    "<body style='font-family: Arial, sans-serif; color: #333333; line-height: 1.6;'>" +
                    "<div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>" +
                    "<div style='background-color: #E8593C; padding: 20px; text-align: center;'>" +
                    "<h2 style='color: #ffffff; margin: 0; font-size: 20px;'>📞 New Callback Request</h2>" +
                    "</div>" +
                    "<div style='padding: 24px;'>" +
                    "<p>A user has requested a callback from the website.</p>" +
                    "<table style='width: 100%; border-collapse: collapse;'>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #64748b;'>Mobile Number:</td><td style='padding: 8px 0;'>" + phone + "</td></tr>" +
                    "<tr><td style='padding: 8px 0; font-weight: bold; color: #64748b;'>Requested At:</td><td style='padding: 8px 0;'>" + timestamp + "</td></tr>" +
                    "</table>" +
                    "<p style='margin-top: 16px; font-size: 13px; color: #94a3b8;'>Please call back the user at your earliest convenience.</p>" +
                    "</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            helper.setText(htmlContent, true);
            mailSender.send(message);

            log.info("Callback notification email sent successfully for phone: [{}]", phone);
        } catch (Exception e) {
            log.error("Failed to send callback notification email for phone: [{}]. Error: {}", phone, e.getMessage());
            // Fail gracefully — the callback was already logged
        }
    }
}
