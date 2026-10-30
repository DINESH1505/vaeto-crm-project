package com.vaeto.crm.service;

import com.vaeto.crm.dto.request.BulkImportRequest;
import com.vaeto.crm.dto.request.LeadRequest;
import com.vaeto.crm.dto.response.BulkImportResultDto;
import com.vaeto.crm.model.Lead;
import com.vaeto.crm.repository.LeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

class BulkImportTest {

    private LeadService leadService;

    static class StubLeadRepository implements LeadRepository {
        List<Lead> savedLeads = new ArrayList<>();

        @Override
        public List<String> findAllActiveEmails() {
            return List.of("existing@example.com");
        }

        @Override
        public <S extends Lead> List<S> saveAll(Iterable<S> entities) {
            for (S entity : entities) {
                savedLeads.add(entity);
            }
            List<S> result = new ArrayList<>();
            entities.forEach(result::add);
            return result;
        }

        @Override public long countByStatus(String status) { return 0; }
        @Override public long countByStatusActive(String status) { return 0; }
        @Override public long countActive() { return 0; }
        @Override public long countDeleted() { return 0; }
        @Override public long countTotal() { return 0; }
        @Override public Page<Lead> findFiltered(Long ownerId, String status, String search, boolean includeDeleted, Pageable pageable) { return null; }
        @Override public List<Object[]> countByStatusGrouped() { return Collections.emptyList(); }
        @Override public void flush() {}
        @Override public <S extends Lead> S saveAndFlush(S entity) { return null; }
        @Override public <S extends Lead> List<S> saveAllAndFlush(Iterable<S> entities) { return null; }
        @Override public void deleteAllInBatch(Iterable<Lead> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<Long> longs) {}
        @Override public void deleteAllInBatch() {}
        @Override public Lead getOne(Long aLong) { return null; }
        @Override public Lead getById(Long aLong) { return null; }
        @Override public Lead getReferenceById(Long aLong) { return null; }
        @Override public <S extends Lead> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Lead> List<S> findAll(Example<S> example) { return Collections.emptyList(); }
        @Override public <S extends Lead> List<S> findAll(Example<S> example, Sort sort) { return Collections.emptyList(); }
        @Override public <S extends Lead> Page<S> findAll(Example<S> example, Pageable pageable) { return null; }
        @Override public <S extends Lead> long count(Example<S> example) { return 0; }
        @Override public <S extends Lead> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Lead, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends Lead> S save(S entity) { return null; }
        @Override public Optional<Lead> findById(Long aLong) { return Optional.empty(); }
        @Override public boolean existsById(Long aLong) { return false; }
        @Override public List<Lead> findAll() { return Collections.emptyList(); }
        @Override public List<Lead> findAllById(Iterable<Long> longs) { return Collections.emptyList(); }
        @Override public long count() { return 0; }
        @Override public void deleteById(Long aLong) {}
        @Override public void delete(Lead entity) {}
        @Override public void deleteAllById(Iterable<? extends Long> longs) {}
        @Override public void deleteAll(Iterable<? extends Lead> entities) {}
        @Override public void deleteAll() {}
        @Override public List<Lead> findAll(Sort sort) { return Collections.emptyList(); }
        @Override public Page<Lead> findAll(Pageable pageable) { return null; }
    }

    private StubLeadRepository stubRepo;

    @BeforeEach
    void setUp() {
        stubRepo = new StubLeadRepository();
        leadService = new LeadService(stubRepo, null, new PhoneNumberService());
    }

    @Test
    void testBulkImport_AllColumnsMappedCorrectly() {
        BulkImportRequest request = new BulkImportRequest();
        request.setSkipDuplicates(true);

        List<LeadRequest> leads = new ArrayList<>();

        // 1. Comprehensive lead with all 13 columns populated
        LeadRequest lr1 = new LeadRequest();
        lr1.setCompany("Acme Corp");
        lr1.setContactName("Alice Smith");
        lr1.setTitle("Chief Technology Officer");
        lr1.setEmail("alice@acme.com");
        lr1.setPhone("+91 98765 43210");
        lr1.setCorporatePhone("044 2233 4455");
        lr1.setCompletedOn("2026-09-15");
        lr1.setMeetingDate("2026-10-30");
        lr1.setMeetingTime("10:30 AM");
        lr1.setLastContact("2026-09-14");
        lr1.setStatus("Negotiation");
        lr1.setComments("Key enterprise account proposal under review");
        leads.add(lr1);

        // 2. Lead with missing optional fields & blank status -> status should default to "New", null fields preserved as null
        LeadRequest lr2 = new LeadRequest();
        lr2.setCompany("Beta LLC");
        lr2.setContactName("Bob Jones");
        lr2.setTitle(null);
        lr2.setEmail(null);
        lr2.setPhone(null);
        lr2.setCorporatePhone(null);
        lr2.setCompletedOn(null);
        lr2.setMeetingDate(null);
        lr2.setMeetingTime(null);
        lr2.setLastContact(null);
        lr2.setStatus(""); // blank status
        lr2.setComments(null);
        leads.add(lr2);

        // 3. Lead with whitespace email, blank phone, whitespace title
        LeadRequest lr3 = new LeadRequest();
        lr3.setCompany("Gamma Inc");
        lr3.setContactName("Charlie Brown");
        lr3.setTitle("   ");
        lr3.setEmail("   ");
        lr3.setPhone("");
        lr3.setStatus(null); // null status
        leads.add(lr3);

        // 4. Duplicate email lead -> skipped
        LeadRequest lr4 = new LeadRequest();
        lr4.setCompany("Existing Company");
        lr4.setContactName("David Lee");
        lr4.setEmail("existing@example.com");
        leads.add(lr4);

        // 5. Invalid email -> failed
        LeadRequest lr5 = new LeadRequest();
        lr5.setCompany("Delta Co");
        lr5.setContactName("Eve Green");
        lr5.setEmail("invalid-email-format");
        leads.add(lr5);

        request.setLeads(leads);

        BulkImportResultDto result = leadService.bulkImportLeads(request, "1", "Test Admin");

        assertEquals(5, result.getTotalDetected());
        assertEquals(3, result.getImportedCount(), "Should import 3 valid leads");
        assertEquals(1, result.getSkippedCount(), "Should skip 1 duplicate lead");
        assertEquals(1, result.getFailedCount(), "Should fail 1 invalid email lead");

        List<Lead> savedLeads = stubRepo.savedLeads;
        assertEquals(3, savedLeads.size());

        // Verify lead 1: all columns preserved accurately
        Lead saved1 = savedLeads.get(0);
        assertEquals("Acme Corp", saved1.getCompany());
        assertEquals("Alice Smith", saved1.getContactName());
        assertEquals("Chief Technology Officer", saved1.getTitle());
        assertEquals("alice@acme.com", saved1.getEmail());
        assertEquals("+919876543210", saved1.getPhone());
        assertEquals("044 2233 4455", saved1.getCorporatePhone());
        assertEquals("2026-09-15", saved1.getCompletedOn());
        assertEquals("2026-10-30", saved1.getMeetingDate());
        assertEquals("10:30", saved1.getMeetingTime());
        assertEquals("2026-09-14", saved1.getLastContact());
        assertEquals("Negotiation", saved1.getStatus());
        assertEquals("Key enterprise account proposal under review", saved1.getComments());

        // Verify lead 2: null fields remain null, status defaults to "New"
        Lead saved2 = savedLeads.get(1);
        assertEquals("Beta LLC", saved2.getCompany());
        assertEquals("Bob Jones", saved2.getContactName());
        assertNull(saved2.getTitle(), "Title should be null");
        assertNull(saved2.getEmail(), "Email should be null");
        assertNull(saved2.getPhone(), "Phone should be null, not 0000000000");
        assertNull(saved2.getCorporatePhone(), "Corporate phone should be null");
        assertEquals(LocalDate.now().toString(), saved2.getCompletedOn(), "Completed on should automatically be import date (today)");
        assertNull(saved2.getMeetingDate(), "Meeting date should be null");
        assertNull(saved2.getMeetingTime(), "Meeting time should be null");
        assertNull(saved2.getLastContact(), "Last contact should be null");
        assertEquals("New", saved2.getStatus(), "Status should default to 'New'");

        // Verify lead 3: whitespace fields trimmed to null, status defaults to "New"
        Lead saved3 = savedLeads.get(2);
        assertEquals("Gamma Inc", saved3.getCompany());
        assertNull(saved3.getTitle());
        assertNull(saved3.getEmail());
        assertNull(saved3.getPhone());
        assertEquals("New", saved3.getStatus());
    }
}
