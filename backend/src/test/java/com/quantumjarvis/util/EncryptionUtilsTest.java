package com.quantumjarvis.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EncryptionUtilsTest {

    @Test
    public void testEncryptionDecryption() throws Exception {
        String masterPassword = "strong-master-password";
        String secretData = "my-secret-password-123";

        String encrypted = EncryptionUtils.encrypt(secretData, masterPassword);
        assertNotNull(encrypted);
        assertNotEquals(secretData, encrypted);

        String decrypted = EncryptionUtils.decrypt(encrypted, masterPassword);
        assertEquals(secretData, decrypted);
    }

    @Test
    public void testDecryptionWithWrongMasterPassword() throws Exception {
        String masterPassword = "strong-master-password";
        String wrongMasterPassword = "wrong-master-password";
        String secretData = "my-secret-password-123";

        String encrypted = EncryptionUtils.encrypt(secretData, masterPassword);

        assertThrows(Exception.class, () -> {
            EncryptionUtils.decrypt(encrypted, wrongMasterPassword);
        });
    }

    @Test
    public void testEncryptionIsRandomized() throws Exception {
        String masterPassword = "strong-master-password";
        String secretData = "my-secret-password-123";

        String encrypted1 = EncryptionUtils.encrypt(secretData, masterPassword);
        String encrypted2 = EncryptionUtils.encrypt(secretData, masterPassword);

        assertNotEquals(encrypted1, encrypted2);
        assertEquals(secretData, EncryptionUtils.decrypt(encrypted1, masterPassword));
        assertEquals(secretData, EncryptionUtils.decrypt(encrypted2, masterPassword));
    }
}
