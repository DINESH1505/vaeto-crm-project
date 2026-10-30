package com.vaeto.crm.service;

import com.vaeto.crm.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class PhoneNumberServiceTest {

    private PhoneNumberService phoneNumberService;

    @BeforeEach
    void setUp() {
        phoneNumberService = new PhoneNumberService();
    }

    @ParameterizedTest(name = "Valid international number: {0} ({1}) -> {2}")
    @CsvSource({
            "'+91 98765 43210', IN, +919876543210",
            "'+1 202 555 0123', US, +12025550123",
            "'+44 7911 123456', GB, +447911123456",
            "'+1 416 555 0199', CA, +14165550199",
            "'+61 412 345 678', AU, +61412345678",
            "'+49 1512 3456789', DE, +4915123456789",
            "'+81 90 1234 5678', JP, +819012345678"
    })
    @DisplayName("Should validate and normalize valid international numbers from multiple countries")
    void testValidInternationalNumbers(String rawInput, String region, String expectedE164) {
        assertTrue(phoneNumberService.isValid(rawInput, region));
        String normalized = phoneNumberService.validateAndNormalize(rawInput, region);
        assertEquals(expectedE164, normalized);
    }

    @Test
    @DisplayName("Should validate and normalize national format when region is supplied")
    void testNationalFormatWithRegion() {
        // India national number without +91
        String inResult = phoneNumberService.validateAndNormalize("9876543210", "IN");
        assertEquals("+919876543210", inResult);

        // US national number without +1
        String usResult = phoneNumberService.validateAndNormalize("2025550123", "US");
        assertEquals("+12025550123", usResult);

        // UK national number with leading 0
        String ukResult = phoneNumberService.validateAndNormalize("07911 123456", "GB");
        assertEquals("+447911123456", ukResult);
    }

    @Test
    @DisplayName("Should default region to IN when region is null or blank and number has no plus")
    void testDefaultRegionToIndia() {
        String result = phoneNumberService.validateAndNormalize("9876543210", null);
        assertEquals("+919876543210", result);
    }

    @ParameterizedTest(name = "Invalid number: {0}")
    @ValueSource(strings = {
            "+9198765",           // Incomplete Indian number
            "+120255",            // Incomplete US number
            "+447911",            // Incomplete UK number
            "+9198765ABCD",       // Letters included
            "invalid-phone",      // Pure text
            "+10000000000",       // Invalid country code / area code
            "+99912345678",       // Non-existent country calling code
            "123"                 // Too short
    })
    @DisplayName("Should reject invalid, incomplete, or malformed numbers")
    void testInvalidNumbers(String invalidNumber) {
        assertFalse(phoneNumberService.isValid(invalidNumber, "IN"));
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                phoneNumberService.validateAndNormalize(invalidNumber, "IN")
        );
        assertEquals("Please enter a valid phone number for the selected country.", ex.getMessage());
    }

    @Test
    @DisplayName("Should return null for null or empty phone numbers when optional")
    void testEmptyPhone() {
        assertFalse(phoneNumberService.isValid(null, "IN"));
        assertFalse(phoneNumberService.isValid("", "IN"));
        assertNull(phoneNumberService.validateAndNormalize(null, "IN"));
        assertNull(phoneNumberService.validateAndNormalize("", "IN"));
        assertNull(phoneNumberService.validateAndNormalize("   ", "IN"));
    }
}
