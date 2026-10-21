VAETO CRM
Antigravity Backend Implementation Prompt Pack
220 sequential prompts for implementing a secure Spring Boot backend while preserving the existing frontend
Project baseline: existing Vaeto CRM frontend with login, user dashboard, admin dashboard, lead management, follow-ups, tasks, reports, calendar, settings, user management, roles and permissions. Recommended backend: Java 17, Spring Boot, Spring Security, REST APIs, and TiDB/MySQL.
How to use this pack
•	Open your existing project folder in Antigravity and make sure the agent can inspect the full repository.
•	Paste the Master Context Prompt below first. Then submit prompts in numerical order, one prompt at a time.
•	Do not ask the agent to implement all 220 prompts in a single turn. Ask it to finish, test, and summarize each prompt before continuing.
•	Commit or back up your work after each stable phase. Review diffs before accepting large changes.
•	Do not paste real database passwords, JWT secrets, or other credentials into prompts or source code.
•	Treat deployment as complete only after you test the actual public URL in a fresh browser session.
Master Context Prompt — paste this first
You are a senior full-stack software engineer and security reviewer. You are working on my existing Vaeto CRM Lead Management Dashboard repository. The frontend is already implemented and working; it includes a login page, a user dashboard, an admin dashboard, a profile dropdown with logout, dashboard KPI cards, lead-status chart, upcoming follow-ups, and navigation for tasks, reports, calendar, settings, lead management, user management, roles and permissions, and system settings. Inspect the actual source to verify all routes and features. Preserve the current Vaeto logo, content, layout, colors, and responsive behavior. Do not redesign or replace the frontend. Build a real backend using Java 17, Spring Boot, Spring Security, REST/JSON APIs, JPA, database migrations, and TiDB/MySQL compatibility. Use DB_URL, DB_USERNAME, and DB_PASSWORD as environment variables, and use a strong environment-provided JWT secret if JWT is chosen. Never hard-code secrets or demo credentials. Use layered architecture, DTOs, validation, centralized errors, authorization on every protected endpoint, role-based access, record ownership checks, audit logging for important admin actions, and automated tests. Do not fake success or leave mock data presented as real backend data. Work in small, reviewable steps; inspect before editing, explain the intended change, implement it, run relevant tests/builds, fix failures, and report changed files and commands. Do not delete working code or perform large unrelated refactors. Ask before destructive database changes or changes to existing UI behavior. If a requirement is unclear, inspect the repository and ask one concise question rather than guessing. Begin by inspecting the repository and reporting the architecture; do not make code changes until I approve the plan.
Prompt sequence
Phase 1 — Project inspection and safe planning
Prompt 001: Inspect the entire existing repository before editing anything. Identify the frontend framework, package manager, routes, components, styling system, current mock data, and any existing backend. Return a concise architecture report and do not change files yet.
Prompt 002: Map every visible page and interaction in the existing Vaeto CRM UI: login, user dashboard, admin dashboard, profile menu, leads, follow-ups, tasks, reports, calendar, settings, user management, roles and permissions, and system settings. Record the current route for each.
Prompt 003: Inspect package.json, frontend environment files, source folders, and build scripts. Determine the exact command used to run and build the existing frontend; do not assume the framework beyond what the repository proves.
Prompt 004: Check whether a Spring Boot backend already exists. If it does, inspect it and extend it rather than creating a duplicate. If not, propose a separate backend folder that fits the current repository.
Prompt 005: Create a backend implementation plan for Java 17, Spring Boot, Spring Security, REST APIs, and TiDB/MySQL compatibility. Break the work into small phases and identify dependencies between them.
Prompt 006: Create a feature inventory that maps each existing UI screen to the backend data and API operations it needs. Include loading, empty, success, validation-error, and server-error states.
Prompt 007: Identify all hard-coded demo values, mock arrays, localStorage-only business data, and fake login logic. List where each appears and how it should be replaced by API calls.
Prompt 008: Identify existing UI elements that must remain unchanged, including Vaeto logo, colors, layout, typography, sidebar, cards, charts, menus, and responsive behavior. Establish a rule to preserve them.
Prompt 009: Check for secrets, database passwords, tokens, or private configuration accidentally committed to the repository. Report findings and recommend safe handling without printing secret values.
Prompt 010: After the inspection, present the proposed folder structure, data model, API plan, security plan, and test plan. Wait for my approval before making large structural changes.
Phase 2 — Master instructions and architecture
Prompt 011: Act as a senior full-stack engineer specializing in Java 17, Spring Boot, Spring Security, REST APIs, SQL databases, React, and secure CRM systems. Work directly in the existing repository and verify assumptions from actual files.
Prompt 012: Use Java 17 for the backend and a stable Spring Boot version compatible with Java 17. Prefer Maven unless the repository already uses Gradle. Explain any version choice before changing build files.
Prompt 013: Keep the current frontend appearance and behavior intact. Do not redesign the login page, user dashboard, admin dashboard, or navigation while implementing backend functionality.
Prompt 014: Use a clean layered backend architecture: controller, service, repository, entity, DTO, mapper where useful, configuration, exception handling, and security packages. Avoid putting business logic in controllers.
Prompt 015: Use RESTful JSON APIs with consistent URL patterns, HTTP methods, status codes, pagination, and error responses. Document all endpoints and request/response examples.
Prompt 016: Use environment variables for database credentials, JWT secrets, allowed frontend origins, and deployment-specific configuration. Never commit real secrets or put credentials in frontend code.
Prompt 017: Use DTOs for API requests and responses rather than exposing persistence entities directly. Validate incoming data and avoid returning password hashes or sensitive internal fields.
Prompt 018: Use database migrations with Flyway or another consistent migration mechanism. Make schema changes versioned and repeatable rather than relying on production auto-update.
Prompt 019: Use constructor injection, clear naming, meaningful logs, and centralized exception handling. Avoid field injection, broad catch-and-ignore blocks, and silent failures.
Prompt 020: Before each phase, summarize intended changes; after each phase, run relevant tests/builds, report changed files and results, and fix failures before continuing.
Phase 3 — Backend project setup
Prompt 021: Create or complete the Spring Boot backend project for Java 17 using Maven. Include only required dependencies and ensure the project builds from a clean checkout.
Prompt 022: Add dependencies for Spring Web, Spring Data JPA, Spring Security, Bean Validation, the database driver appropriate for TiDB/MySQL, Flyway, and testing. Check compatibility rather than blindly using latest versions.
Prompt 023: Create the base package structure for configuration, security, auth, users, leads, contacts, tasks, follow-ups, meetings, reports, settings, common DTOs, exceptions, and auditing.
Prompt 024: Add application.yml or application.properties with environment-variable placeholders for server port, database connection, JPA behavior, CORS, and JWT settings. Do not put real passwords in it.
Prompt 025: Configure the application to read the deployment port from PORT when available while retaining a sensible local development default.
Prompt 026: Add a health endpoint suitable for local checks and hosting-platform health checks. Keep it free of sensitive configuration details.
Prompt 027: Add a consistent API prefix such as /api/v1 and apply it to new controllers. Avoid breaking any existing route or frontend behavior.
Prompt 028: Add a .gitignore suitable for Java, Maven, IDE files, frontend dependencies, build outputs, local environment files, and generated secrets.
Prompt 029: Create a README with prerequisites, Java version, database setup, environment variables, migration instructions, run commands, test commands, and troubleshooting.
Prompt 030: Run the Maven build and tests. Fix compilation and dependency errors, then show the exact local command to start the backend.
Phase 4 — Database and TiDB
Prompt 031: Design the relational schema for users, roles, permissions, leads, contacts, tasks, follow-ups, meetings, audit events, and application settings. Explain keys and relationships before implementing.
Prompt 032: Configure Spring Data JPA for TiDB/MySQL using environment variables DB_URL, DB_USERNAME, and DB_PASSWORD. Do not hard-code credentials.
Prompt 033: Check the JDBC URL format required by the chosen TiDB connection method, including SSL settings when required by TiDB. Do not invent hostnames or passwords.
Prompt 034: Create Flyway migration V1 for the core users and role tables, with appropriate primary keys, unique constraints, timestamps, and indexes.
Prompt 035: Create Flyway migration V2 for leads and contacts, including ownership, status, source, company, contact information, and created/updated timestamps.
Prompt 036: Create Flyway migration V3 for tasks, follow-ups, and meetings, with due dates, scheduled dates, status, priority, owner, and links to relevant leads.
Prompt 037: Create Flyway migration V4 for permissions, role-permission mappings, audit events, and system settings. Keep migrations ordered and immutable after release.
Prompt 038: Use database constraints and indexes for frequent filters such as lead owner, lead status, email, due date, meeting date, and created date. Avoid unnecessary indexes.
Prompt 039: Configure JPA schema validation so the application checks the migrated schema instead of automatically changing production tables. Ensure startup order runs migrations safely.
Prompt 040: Add an integration test or documented smoke test that verifies the app can connect to a test database and execute a basic repository query without exposing credentials.
Phase 5 — Entities, repositories, and DTOs
Prompt 041: Implement the User entity with a unique normalized email, encoded password field, active/locked state, display name, timestamps, and assigned role. Never serialize the password field.
Prompt 042: Implement Role and Permission entities or an equivalent well-structured role-permission model. Avoid scattering hard-coded role checks throughout the application.
Prompt 043: Implement the Lead entity with fields justified by the existing UI and business needs, including name, company, email, phone, source, status, owner, notes, and timestamps.
Prompt 044: Implement the Contact entity and define its relationship to leads only after confirming the UI's expected contact model. Avoid duplicating data without a clear reason.
Prompt 045: Implement Task, FollowUp, and Meeting entities with status, owner, due/scheduled date, description, and optional lead association.
Prompt 046: Create request and response DTOs for each entity. Exclude secrets and internal persistence details from response DTOs.
Prompt 047: Create repositories with typed methods for common lookups, including normalized email, owner-specific records, status filters, and date-range queries.
Prompt 048: Add pagination and sorting support for list endpoints. Set sensible maximum page sizes and validate sort fields to prevent invalid query requests.
Prompt 049: Use Java enums for stable values such as lead status, task priority, meeting status, and follow-up status, and provide safe validation for invalid input.
Prompt 050: Add unit tests for entity constraints, DTO validation, enum handling, and repository query behavior where practical.
Phase 6 — Login, logout, and authentication
Prompt 051: Implement a login endpoint that accepts email and password, verifies the user securely, and returns a documented authentication response. Do not use hard-coded demo credentials.
Prompt 052: Use BCrypt or Spring Security's recommended password encoder to hash passwords before storing them. Never store or log plain-text passwords.
Prompt 053: Implement JWT authentication only with a strong secret supplied through environment configuration. Validate issuer, expiration, signature, and relevant claims.
Prompt 054: Define the authentication response contract, including token type, access token, expiry information, and safe user profile fields. Never include password hashes.
Prompt 055: Implement a logout strategy appropriate to the chosen authentication design. If access tokens are stateless, explain token expiry and implement revocation/refresh handling if the security requirements call for it.
Prompt 056: Implement a current-user endpoint such as GET /api/v1/auth/me so the frontend can restore the signed-in user's profile and role after refresh.
Prompt 057: Implement consistent authentication errors for missing credentials, invalid credentials, disabled accounts, and expired tokens without revealing whether a specific email exists.
Prompt 058: Configure Spring Security to protect private APIs and permit only the required public endpoints such as login and health checks.
Prompt 059: Add login attempt protections appropriate to the app, such as rate limiting or temporary lockout, without making legitimate account recovery impossible.
Prompt 060: Write tests for successful login, invalid password, unknown account, disabled user, missing token, malformed token, expired token, and logout behavior.
Phase 7 — Authorization and role security
Prompt 061: Define the exact role names used by the UI, such as USER and ADMIN, and map them consistently to Spring Security authorities. Do not assume frontend labels are secure permissions.
Prompt 062: Create a permission matrix for user and admin access across dashboard, leads, tasks, reports, calendar, follow-ups, user management, roles, and system settings.
Prompt 063: Enforce authorization on the backend for every protected endpoint. Hiding a button in React is not sufficient security.
Prompt 064: Ensure a normal user can only view and modify records they are authorized to access. Add owner-based checks to services, not just UI filters.
Prompt 065: Ensure admins can access permitted administrative features while still validating input and logging important changes.
Prompt 066: Protect user-management and role-management APIs so only authorized administrators can invoke them.
Prompt 067: Prevent users from changing their own role or escalating privileges through crafted request bodies.
Prompt 068: Check record ownership for get-by-ID, update, delete, export, and nested-resource endpoints to prevent insecure direct object references.
Prompt 069: Return appropriate 401 and 403 responses and ensure error messages do not expose internal details or other users' data.
Prompt 070: Write authorization tests for user versus admin access, cross-user record access, role escalation attempts, and direct API requests that bypass the frontend.
Phase 8 — Connect the existing frontend
Prompt 071: Inspect the current frontend source and identify the existing login form, dashboard pages, API utilities, route definitions, and authentication state. Do not replace working UI components.
Prompt 072: Create a centralized frontend API client using the existing framework and coding style. Read the backend base URL from a frontend environment variable.
Prompt 073: Add a typed or clearly documented API layer for authentication, users, leads, tasks, follow-ups, meetings, reports, and settings.
Prompt 074: Connect the existing login form to the real backend login endpoint while preserving its current Vaeto logo, layout, colors, and responsive behavior.
Prompt 075: Replace fake login success with real authentication errors and loading states. Keep error messages visible and accessible without redesigning the form.
Prompt 076: Implement a protected-route mechanism that restores the authenticated session safely and redirects unauthenticated users to the existing login route.
Prompt 077: Connect the existing profile menu to the authenticated user's real name, email, and role from the backend.
Prompt 078: Connect the existing logout menu item to the backend logout/session-clearing flow and redirect to the login page after successful logout.
Prompt 079: Handle API network errors, expired sessions, unauthorized responses, and loading states consistently. Do not silently show demo data as if it came from the database.
Prompt 080: Build the frontend and verify that all existing routes, styles, and page layouts still work. Report any UI changes before applying them.
Phase 9 — User dashboard and statistics
Prompt 081: Implement a dashboard summary API that returns totals for leads, contacts, today's meetings, follow-ups, and completed meetings using real database queries.
Prompt 082: Make dashboard statistics respect the signed-in user's permissions and ownership rules. Admin totals should follow the agreed administrative scope.
Prompt 083: Implement a lead-status aggregation endpoint for the existing donut chart, returning counts and percentages from database records.
Prompt 084: Implement trend data for dashboard mini charts only if reliable historical data exists. If not, return a clearly documented no-history state instead of inventing percentage changes.
Prompt 085: Connect the existing dashboard KPI cards to backend summary data without changing their visual layout.
Prompt 086: Connect the lead-status chart to real aggregate data and handle zero leads without dividing by zero or rendering misleading percentages.
Prompt 087: Connect the upcoming follow-ups panel to real records ordered by due date and time, with permission-aware filtering.
Prompt 088: Use the app's intended timezone consistently for 'today', meeting schedules, and due-date filters. Document whether timestamps are stored in UTC.
Prompt 089: Add loading, empty, and API-error states to the dashboard while preserving its existing design.
Prompt 090: Add tests for summary counts, status aggregates, date boundaries, user scoping, admin scoping, and empty datasets.
Phase 10 — Lead management
Prompt 091: Implement create-lead API validation using fields present in the current lead form. Confirm required fields from the frontend rather than inventing mandatory fields.
Prompt 092: Implement paginated lead listing with search, status, source, owner, and date filters that match existing UI controls.
Prompt 093: Implement get-lead-by-ID with authorization checks so users cannot access another user's lead by changing the URL or request ID.
Prompt 094: Implement update-lead with field validation, ownership checks, updated timestamps, and clear handling of missing records.
Prompt 095: Implement delete-lead with authorization and an appropriate deletion policy. Prefer a documented soft-delete strategy if auditability or recovery is required.
Prompt 096: Implement lead status transitions and validate allowed statuses. Keep frontend status labels consistent with backend enum values.
Prompt 097: Implement lead assignment for admins or authorized roles and prevent ordinary users from assigning leads to arbitrary accounts.
Prompt 098: Add duplicate detection for likely duplicate leads using normalized email or other agreed business keys, while allowing legitimate shared contact details when required.
Prompt 099: Implement lead details and notes/history functionality if the current UI provides it. Validate access to every nested record.
Prompt 100: Connect all existing lead table, search, filters, pagination, add/edit forms, status controls, and action buttons to the real API without changing their layout.
Phase 11 — Contacts
Prompt 101: Confirm from the current UI whether contacts are standalone records or derived from leads, then document the intended relationship before coding.
Prompt 102: Implement contact creation with normalized email, phone validation where appropriate, and required-field validation based on the existing form.
Prompt 103: Implement contact listing with pagination, search, sorting, and permission-aware filtering.
Prompt 104: Implement contact detail retrieval with ownership and authorization checks.
Prompt 105: Implement contact updates with validation and safe handling of linked leads.
Prompt 106: Implement contact deletion or archival according to the chosen data-retention policy and confirm linked-record behavior.
Prompt 107: Prevent accidental duplicate contacts where the business rules require uniqueness, while avoiding overly restrictive global email constraints.
Prompt 108: Add repository tests for contact search, linked lead queries, pagination, and user scoping.
Prompt 109: Connect the current contacts UI or contact statistics to the API if such a screen or widget exists in the project.
Prompt 110: Document contact endpoints with request/response examples and test the full create-read-update-delete flow.
Phase 12 — Tasks and My Tasks
Prompt 111: Implement task creation with title, description, priority, status, due date, owner, and optional lead association based on existing UI fields.
Prompt 112: Implement a My Tasks endpoint that returns tasks assigned to the authenticated user and supports status and due-date filters.
Prompt 113: Implement task detail retrieval with permission and ownership checks.
Prompt 114: Implement task updates with validation for status transitions, due dates, priority, and assignment changes.
Prompt 115: Implement task completion and reopening behavior consistent with the frontend controls.
Prompt 116: Implement task deletion or archival with authorization and audit logging where appropriate.
Prompt 117: Add overdue-task queries using a documented timezone and date-boundary policy.
Prompt 118: Connect the existing My Tasks page, filters, forms, badges, and action buttons to the task APIs.
Prompt 119: Add tests for assignment, task status changes, overdue filtering, date boundaries, and cross-user access.
Prompt 120: Verify that task counts on the dashboard agree with the underlying task records and the agreed definitions.
Phase 13 — Follow-ups
Prompt 121: Implement follow-up creation with date, time, purpose, status, owner, notes, and optional lead association based on existing UI fields.
Prompt 122: Implement a paginated follow-up list ordered by scheduled time with filters for upcoming, overdue, completed, and owner.
Prompt 123: Implement follow-up detail retrieval and verify that users can access only authorized records.
Prompt 124: Implement follow-up updates with validation and safe handling of schedule changes.
Prompt 125: Implement follow-up completion and cancellation with consistent status values and timestamps.
Prompt 126: Implement a My Follow-ups endpoint for the profile menu and ensure it returns the current user's records.
Prompt 127: Implement upcoming follow-up queries for the dashboard with a configurable limit and stable date ordering.
Prompt 128: Prevent invalid dates and times, and define how timezone conversion works between browser, backend, and database.
Prompt 129: Connect the existing Follow-ups screen, dashboard list, and profile-menu shortcut to the backend.
Prompt 130: Test creation, rescheduling, completion, overdue handling, timezone boundaries, and role-based access.
Phase 14 — Meetings and calendar
Prompt 131: Implement meeting creation with title, scheduled start/end, participants or owner, optional lead, location/link, status, and notes based on the existing UI.
Prompt 132: Validate that meeting end time is after start time and reject malformed date/time input.
Prompt 133: Implement a calendar API that returns authorized meetings for a requested date range.
Prompt 134: Implement meeting update, cancellation, and status changes with permission checks and clear conflict responses.
Prompt 135: Implement today's meeting count and completed-meeting count using explicit, documented status definitions.
Prompt 136: Check for schedule overlaps where the business rules require it and return helpful conflict details without leaking private meeting information.
Prompt 137: Connect the existing Calendar page and Schedule Meeting form to the real API while preserving the current UI.
Prompt 138: Connect dashboard meeting statistics and date-based widgets to the same meeting data source.
Prompt 139: Test date-range boundaries, timezones, overlapping meetings, cancelled meetings, and user-specific visibility.
Prompt 140: Document how meetings behave when a lead or user is archived or deleted, and implement the chosen rule.
Phase 15 — Reports and exports
Prompt 141: Inspect the existing Reports page and list every visible metric, chart, filter, and export action before implementing report endpoints.
Prompt 142: Implement a lead report API with date range, status, source, and owner filters supported by the current UI.
Prompt 143: Implement follow-up and task report endpoints using the same definitions as their corresponding dashboard counts.
Prompt 144: Implement meeting reports with scheduled, completed, cancelled, and date-range metrics as appropriate to the current interface.
Prompt 145: Ensure all report queries enforce role and ownership permissions and cannot reveal other users' records.
Prompt 146: Implement pagination or bounded aggregation for large reports to avoid loading the entire database into memory.
Prompt 147: Add CSV export only if the UI has an export action or the requirement is approved; escape CSV cells to prevent spreadsheet formula injection.
Prompt 148: Connect existing report charts and tables to real aggregate responses without changing their visual design.
Prompt 149: Add tests that compare report totals against known test records and verify date filters and authorization.
Prompt 150: Document report metric definitions so labels and percentages match the numbers returned by the backend.
Phase 16 — User management
Prompt 151: Implement an admin-only paginated user listing with search, active status, and role filters matching the current User Management page.
Prompt 152: Implement administrator-created user accounts with validated name, normalized email, assigned role, and secure initial-password handling.
Prompt 153: Implement user detail retrieval without returning password hashes, tokens, or sensitive authentication internals.
Prompt 154: Implement user profile updates with field-level validation and permission checks.
Prompt 155: Implement account activation and deactivation with safeguards against accidentally disabling the last active administrator.
Prompt 156: Implement password reset or invitation flow appropriate to the available infrastructure; do not email users unless an email provider is configured.
Prompt 157: Prevent deleting or demoting the last active administrator and document account archival behavior.
Prompt 158: Audit important user-management actions with actor, target, action, timestamp, and safe metadata.
Prompt 159: Connect the existing Admin dashboard's User Management page and action controls to the backend.
Prompt 160: Test admin-only access, duplicate email handling, deactivation, last-admin protection, and safe response fields.
Phase 17 — Roles and permissions
Prompt 161: Inspect the current Roles & Permissions UI and map each displayed role, permission group, checkbox, and save action to a backend data model.
Prompt 162: Implement APIs to list roles and their permissions, restricted to authorized administrators.
Prompt 163: Implement a role creation endpoint only if the current UI supports creating roles; validate role names and reserved system roles.
Prompt 164: Implement role update and permission assignment with validation and transaction-safe persistence.
Prompt 165: Implement role detail retrieval and prevent exposing administrative permission data to ordinary users.
Prompt 166: Prevent privilege escalation by validating who may grant high-impact permissions and protecting system-critical roles.
Prompt 167: Ensure changes to a user's role take effect according to a documented token/session refresh policy.
Prompt 168: Connect existing permission checkboxes and save controls to the API and display clear success or validation feedback.
Prompt 169: Add integration tests proving that changed permissions actually change backend authorization decisions.
Prompt 170: Document the default roles and permissions, including a safe recovery procedure if an administrator misconfigures access.
Phase 18 — Settings, profile, and password changes
Prompt 171: Inspect the current Settings page and separate personal preferences from system-wide settings according to what the UI actually shows.
Prompt 172: Implement a current-user profile endpoint and update endpoint with validation and safe field allowlisting.
Prompt 173: Implement change-password functionality that verifies the current password, enforces a documented password policy, and stores only a secure hash.
Prompt 174: Invalidate or rotate relevant sessions/tokens after password changes according to the chosen authentication design.
Prompt 175: Implement user preferences such as theme or display settings only if they exist in the UI, and persist them for the correct user.
Prompt 176: Implement system settings APIs for administrators only, using a strict allowlist of editable keys.
Prompt 177: Never expose database credentials, JWT secrets, SMTP passwords, or other secret values through a settings API.
Prompt 178: Connect profile, Change Password, and Settings UI controls to the appropriate APIs while preserving existing styling.
Prompt 179: Add tests for invalid current password, weak new password, unauthorized system settings access, and secret-field filtering.
Prompt 180: Document which settings are user-specific, which are global, and how configuration changes are validated and applied.
Phase 19 — Validation, errors, and API documentation
Prompt 181: Create a consistent error response structure with timestamp, status, stable error code, safe message, and field-level validation errors where useful.
Prompt 182: Add centralized exception handling for validation errors, missing records, duplicate records, authentication failures, authorization failures, and unexpected errors.
Prompt 183: Validate all request bodies and query parameters, including page size, sorting, search length, enum values, dates, and IDs.
Prompt 184: Ensure API responses never reveal stack traces, SQL details, secrets, password hashes, or internal file paths in production.
Prompt 185: Use correct HTTP status codes such as 200, 201, 204, 400, 401, 403, 404, and 409 where appropriate.
Prompt 186: Add OpenAPI/Swagger documentation if compatible with the selected Spring Boot version and allowed by the deployment security policy.
Prompt 187: Document every endpoint's role requirements, request schema, response schema, validation errors, and example payloads.
Prompt 188: Add correlation/request IDs to logs where practical so errors can be diagnosed without logging personal or secret data.
Prompt 189: Review all API error messages for consistency and make sure the frontend can display them safely.
Prompt 190: Run API contract checks and verify the documented examples match actual controller behavior.
Phase 20 — Security hardening
Prompt 191: Review CORS configuration and allow only the actual deployed frontend origin plus approved local development origins. Do not use wildcard origins with credentials.
Prompt 192: Choose a token-storage strategy based on the app's threat model. Prefer secure HttpOnly cookies where practical, or document and mitigate risks if bearer tokens are used.
Prompt 193: If cookies are used for authentication, configure Secure, HttpOnly, SameSite, and CSRF protection correctly for the deployment setup.
Prompt 194: Ensure password hashes and authentication tokens are never written to application logs, analytics, URLs, or error messages.
Prompt 195: Add rate limiting or equivalent protection to login and other sensitive endpoints using a maintainable approach appropriate to the hosting environment.
Prompt 196: Review input validation, output encoding, SQL query construction, and file/export behavior for injection risks.
Prompt 197: Review every endpoint for insecure direct object references, missing authorization checks, and mass-assignment vulnerabilities.
Prompt 198: Use secure production settings for error pages, actuator endpoints, HTTP headers, and management endpoints.
Prompt 199: Add dependency vulnerability checks and remove unused dependencies. Fix known high-severity issues where compatible updates exist.
Prompt 200: Perform a security review checklist and produce a report of findings, severity, fixes applied, and remaining risks before deployment.
Phase 21 — Tests and end-to-end verification
Prompt 201: Create unit tests for core service logic using isolated test data and clear arrange-act-assert structure.
Prompt 202: Create controller tests for authentication, validation, status codes, and JSON response shapes.
Prompt 203: Create repository integration tests against a disposable test database or Testcontainers setup compatible with the project.
Prompt 204: Test login-to-dashboard flow from the frontend using a test account created securely for local testing.
Prompt 205: Test user and admin journeys separately, including menu visibility, protected routes, data scope, and logout behavior.
Prompt 206: Test CRUD operations for leads, contacts, tasks, follow-ups, meetings, and user management where each feature exists.
Prompt 207: Test pagination, sorting, search, empty results, invalid IDs, duplicate records, and large page-size rejection.
Prompt 208: Test unauthorized access and cross-user record access using direct HTTP requests, not just UI interactions.
Prompt 209: Run backend tests and frontend production build; fix failures rather than disabling tests or weakening assertions to get a green result.
Prompt 210: Provide a final verification report listing commands executed, pass/fail results, unresolved issues, and manual checks still required.
Phase 22 — Deployment and handover
Prompt 211: Inspect the repository and deployment target, then provide a deployment plan that matches the actual frontend host, backend host, and TiDB database. Do not assume Vercel can directly run a traditional Spring Boot server.
Prompt 212: Prepare the backend for deployment on a Java-compatible host such as Render or another approved platform, with Java 17 and the correct build/start commands.
Prompt 213: Configure production environment variables for DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, CORS_ALLOWED_ORIGINS, and PORT as applicable. Use platform secret settings and never commit values.
Prompt 214: Confirm the TiDB connection string, SSL requirements, database user privileges, and network accessibility from the backend host. Do not display passwords in logs or documentation.
Prompt 215: Configure the frontend's production API base URL using its environment-variable convention and rebuild the frontend for production.
Prompt 216: Verify CORS uses the exact deployed frontend origin and that HTTPS is used between the browser and backend.
Prompt 217: Run database migrations safely during deployment and verify the app fails clearly if required configuration is missing.
Prompt 218: Add a production health check and document how to inspect sanitized logs, diagnose database connection failures, and restart or redeploy safely.
Prompt 219: Test the public login URL, user dashboard, admin dashboard, lead operations, follow-ups, meetings, logout, and refresh/deep links using deployed URLs.
Prompt 220: Prepare a handover document for the manager with architecture, deployment URLs to be filled in after deployment, features completed, test results, environment-variable names, and known limitations. Never include secrets.
Final acceptance checklist
•	Frontend design and routes remain intact.
•	Login uses real backend authentication; logout clears the session/token correctly.
•	USER and ADMIN access is enforced by backend authorization, not only frontend visibility.
•	Leads, tasks, follow-ups, meetings, and other implemented features persist in the database.
•	Dashboard statistics and charts use real, permission-scoped database queries.
•	TiDB/MySQL credentials and JWT secrets are supplied only through environment variables.
•	Database schema is managed by versioned migrations.
•	Backend tests pass and frontend production build succeeds.
•	CORS, HTTPS, input validation, error handling, and secret handling have been reviewed.
•	Public deployment URLs have been tested in a fresh browser session, including direct page refresh.
Important: The prompts are a controlled implementation plan, not a guarantee that every feature already exists in the repository. Antigravity must inspect the source and adapt each prompt to the actual UI and codebase.
