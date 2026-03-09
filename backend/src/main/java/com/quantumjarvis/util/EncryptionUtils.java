package com.quantumjarvis.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

public class EncryptionUtils {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128;
    private static final int IV_LENGTH_BYTE = 12;
    private static final int SALT_LENGTH_BYTE = 16;
    private static final int ITERATION_COUNT = 65536;
    private static final int KEY_LENGTH_BIT = 256;

    public static String encrypt(String password, String masterPassword) throws Exception {
        byte[] salt = new byte[SALT_LENGTH_BYTE];
        new SecureRandom().nextBytes(salt);

        byte[] iv = new byte[IV_LENGTH_BYTE];
        new SecureRandom().nextBytes(iv);

        SecretKey secretKey = getSecretKey(masterPassword, salt);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        byte[] cipherText = cipher.doFinal(password.getBytes());

        byte[] combined = ByteBuffer.allocate(salt.length + iv.length + cipherText.length)
                .put(salt)
                .put(iv)
                .put(cipherText)
                .array();

        return Base64.getEncoder().encodeToString(combined);
    }

    public static String decrypt(String encryptedData, String masterPassword) throws Exception {
        byte[] combined = Base64.getDecoder().decode(encryptedData);
        ByteBuffer buffer = ByteBuffer.wrap(combined);

        byte[] salt = new byte[SALT_LENGTH_BYTE];
        buffer.get(salt);

        byte[] iv = new byte[IV_LENGTH_BYTE];
        buffer.get(iv);

        byte[] cipherText = new byte[buffer.remaining()];
        buffer.get(cipherText);

        SecretKey secretKey = getSecretKey(masterPassword, salt);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_LENGTH_BIT, iv));

        byte[] plainText = cipher.doFinal(cipherText);
        return new String(plainText);
    }

    private static SecretKey getSecretKey(String masterPassword, byte[] salt) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        KeySpec spec = new PBEKeySpec(masterPassword.toCharArray(), salt, ITERATION_COUNT, KEY_LENGTH_BIT);
        SecretKey tmp = factory.generateSecret(spec);
        return new SecretKeySpec(tmp.getEncoded(), "AES");
    }
}
