package com.altruist;

import com.google.firebase.auth.FirebaseAuth;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AltruistApplicationTests {

    @MockBean
    private FirebaseAuth firebaseAuth;

    @Test
    void contextLoads() {
    }
}
