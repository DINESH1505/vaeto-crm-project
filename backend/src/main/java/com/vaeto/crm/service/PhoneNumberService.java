package com.vaeto.crm.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import com.vaeto.crm.exception.BadRequestException;
import org.springframework.stereotype.Service;

@Service
public class PhoneNumberService {

    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    /**
     * Validates whether a raw phone number is valid according to Google's libphonenumber metadata.
     * Rejects empty, incomplete, malformed numbers, and numbers containing alphabetic characters.
     */
    public boolean isValid(String rawNumber, String defaultRegion) {
        if (rawNumber == null || rawNumber.trim().isEmpty()) {
            return false;
        }
        String trimmed = rawNumber.trim();
        // Reject letters or illegal special characters
        if (trimmed.matches(".*[a-zA-Z].*")) {
            return false;
        }
        try {
            String region = resolveRegion(trimmed, defaultRegion);
            Phonenumber.PhoneNumber numberProto = phoneUtil.parse(trimmed, region);
            return phoneUtil.isValidNumber(numberProto);
        } catch (NumberParseException e) {
            return false;
        }
    }

    /**
     * Validates and normalizes phone number to standard E.164 format (e.g., +919876543210).
     * Throws BadRequestException if invalid.
     */
    public String validateAndNormalize(String rawNumber, String defaultRegion) {
        if (rawNumber == null || rawNumber.trim().isEmpty()) {
            throw new BadRequestException("Phone number is required");
        }
        String trimmed = rawNumber.trim();
        if (trimmed.matches(".*[a-zA-Z].*")) {
            throw new BadRequestException("Please enter a valid phone number for the selected country.");
        }
        try {
            String region = resolveRegion(trimmed, defaultRegion);
            Phonenumber.PhoneNumber numberProto = phoneUtil.parse(trimmed, region);
            if (!phoneUtil.isValidNumber(numberProto)) {
                throw new BadRequestException("Please enter a valid phone number for the selected country.");
            }
            return phoneUtil.format(numberProto, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new BadRequestException("Please enter a valid phone number for the selected country.");
        }
    }

    private String resolveRegion(String rawNumber, String defaultRegion) {
        if (rawNumber.startsWith("+")) {
            return "ZZ";
        }
        if (defaultRegion != null && !defaultRegion.isBlank()) {
            return defaultRegion.trim().toUpperCase();
        }
        return "IN";
    }
}
