# Requirements Document: SewaSetu Civic Reporting System

## Introduction

SewaSetu is an AI-powered civic reporting system that enables citizens to report municipal issues through multiple channels (text, voice, images) with support for Hinglish language processing. The system leverages AWS Bedrock for natural language understanding, Amazon Transcribe for voice-to-text conversion, and S3 for multimedia storage. It provides citizens with an intuitive reporting interface and administrators with a comprehensive dashboard for managing and responding to civic issues.

## Glossary

- **Citizen_Portal**: The web interface through which citizens submit civic issue reports
- **Admin_Dashboard**: The web interface through which administrators manage and respond to reports
- **Report**: A civic issue submission containing description, location, category, and optional multimedia
- **Hinglish**: A hybrid language mixing Hindi and English commonly used in India
- **NLP_Service**: The AWS Bedrock-powered service that processes and understands Hinglish text
- **Transcription_Service**: The Amazon Transcribe service that converts voice recordings to text
- **Storage_Service**: The Amazon S3 service that stores multimedia files (images, audio)
- **Report_Status**: The current state of a report (submitted, in_progress, resolved, rejected)
- **Department**: A municipal department responsible for handling specific categories of issues
- **Category**: A classification of civic issues (e.g., roads, sanitation, water supply, electricity)

## Requirements

### Requirement 1: Citizen Report Submission

**User Story:** As a citizen, I want to submit civic issue reports through multiple input methods, so that I can report problems in the most convenient way for me.

#### Acceptance Criteria

1. WHEN a citizen enters text in Hinglish or English, THE Citizen_Portal SHALL accept and process the input
2. WHEN a citizen records voice input, THE Citizen_Portal SHALL capture the audio and send it to the Transcription_Service
3. WHEN a citizen attaches an image, THE Citizen_Portal SHALL upload it to the Storage_Service and associate it with the report
4. WHEN a citizen submits a report, THE System SHALL generate a unique report identifier and return it to the citizen
5. THE Citizen_Portal SHALL allow citizens to provide location information for each report
6. WHEN a report is submitted, THE System SHALL persist the report data immediately

### Requirement 2: Hinglish Language Processing

**User Story:** As a citizen, I want to report issues in Hinglish, so that I can communicate naturally in my preferred language mix.

#### Acceptance Criteria

1. WHEN text input contains Hinglish content, THE NLP_Service SHALL process and understand the mixed language input
2. WHEN the NLP_Service processes text, THE System SHALL extract key information including issue type, location, and severity
3. WHEN the NLP_Service completes processing, THE System SHALL return structured data with confidence scores
4. THE NLP_Service SHALL handle code-switching between Hindi and English within the same sentence
5. WHEN the NLP_Service cannot understand input with sufficient confidence, THE System SHALL request clarification from the citizen

### Requirement 3: Voice Recording and Transcription

**User Story:** As a citizen, I want to report issues using voice recording, so that I can quickly describe problems without typing.

#### Acceptance Criteria

1. WHEN a citizen starts voice recording, THE Citizen_Portal SHALL capture audio in a format compatible with the Transcription_Service
2. WHEN a citizen stops recording, THE Citizen_Portal SHALL upload the audio file to the Storage_Service
3. WHEN audio is uploaded, THE System SHALL send it to the Transcription_Service for processing
4. WHEN the Transcription_Service completes processing, THE System SHALL store the transcribed text with the report
5. THE Transcription_Service SHALL support Hindi and English language transcription
6. WHEN transcription fails, THE System SHALL retain the original audio file and notify the citizen

### Requirement 4: Multimedia Attachment Management

**User Story:** As a citizen, I want to attach photos of civic issues, so that I can provide visual evidence of the problem.

#### Acceptance Criteria

1. WHEN a citizen selects an image file, THE Citizen_Portal SHALL validate the file type and size
2. THE Citizen_Portal SHALL accept image files in JPEG, PNG, and WebP formats
3. THE Citizen_Portal SHALL reject files larger than 10MB and display an error message
4. WHEN an image is uploaded, THE Storage_Service SHALL store it and return a unique identifier
5. WHEN a report is created, THE System SHALL associate all uploaded media identifiers with the report
6. THE System SHALL support multiple image attachments per report (up to 5 images)

### Requirement 5: Automatic Report Categorization

**User Story:** As a system administrator, I want reports to be automatically categorized, so that they can be routed to the appropriate department efficiently.

#### Acceptance Criteria

1. WHEN the NLP_Service processes a report, THE System SHALL assign a Category based on the content analysis
2. THE System SHALL support categories including roads, sanitation, water_supply, electricity, street_lighting, parks, and other
3. WHEN the NLP_Service assigns a category with confidence below 70%, THE System SHALL flag the report for manual categorization
4. WHEN a category is assigned, THE System SHALL route the report to the corresponding Department
5. THE System SHALL allow administrators to override automatic categorization

### Requirement 6: Report Status Management

**User Story:** As an administrator, I want to manage report statuses, so that I can track the lifecycle of civic issues from submission to resolution.

#### Acceptance Criteria

1. WHEN a report is created, THE System SHALL set the Report_Status to submitted
2. WHEN an administrator assigns a report to a department, THE System SHALL update the Report_Status to in_progress
3. WHEN an administrator marks a report as complete, THE System SHALL update the Report_Status to resolved
4. WHEN an administrator rejects a report, THE System SHALL update the Report_Status to rejected and require a rejection reason
5. WHEN the Report_Status changes, THE System SHALL record the timestamp and administrator identifier
6. WHEN the Report_Status changes, THE System SHALL notify the citizen who submitted the report

### Requirement 7: Admin Dashboard Functionality

**User Story:** As an administrator, I want a comprehensive dashboard to view and manage reports, so that I can efficiently handle civic issues.

#### Acceptance Criteria

1. WHEN an administrator accesses the Admin_Dashboard, THE System SHALL display all reports with filtering and sorting capabilities
2. THE Admin_Dashboard SHALL allow filtering by Category, Report_Status, Department, and date range
3. WHEN an administrator selects a report, THE Admin_Dashboard SHALL display full report details including text, transcription, images, and location
4. THE Admin_Dashboard SHALL allow administrators to add comments and updates to reports
5. THE Admin_Dashboard SHALL display reports in a paginated list with 20 reports per page
6. WHEN an administrator searches for text, THE System SHALL return reports matching the search query in description or transcription

### Requirement 8: Department Assignment and Workflow

**User Story:** As an administrator, I want to assign reports to specific departments, so that the right team handles each issue.

#### Acceptance Criteria

1. WHEN a report is categorized, THE System SHALL automatically assign it to the default Department for that Category
2. THE Admin_Dashboard SHALL allow administrators to manually reassign reports to different departments
3. WHEN a report is assigned to a Department, THE System SHALL notify department members
4. THE System SHALL track which Department is currently responsible for each report
5. THE Admin_Dashboard SHALL display department workload metrics showing active reports per department

### Requirement 9: Real-Time Status Updates for Citizens

**User Story:** As a citizen, I want to track the status of my submitted reports, so that I know what action is being taken.

#### Acceptance Criteria

1. WHEN a citizen provides their report identifier, THE Citizen_Portal SHALL display the current Report_Status
2. THE Citizen_Portal SHALL display the report submission date, current status, and last update timestamp
3. WHEN an administrator adds a comment, THE Citizen_Portal SHALL display it to the citizen who submitted the report
4. THE Citizen_Portal SHALL display the assigned Department for each report
5. WHEN a report is resolved, THE Citizen_Portal SHALL display the resolution details

### Requirement 10: Analytics and Reporting

**User Story:** As a system administrator, I want to view analytics on civic reports, so that I can identify trends and improve municipal services.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display total report counts grouped by Category
2. THE Admin_Dashboard SHALL display report resolution metrics including average time to resolution per Category
3. THE Admin_Dashboard SHALL display trend charts showing report volume over time
4. THE Admin_Dashboard SHALL display department performance metrics including active reports and resolution rates
5. THE Admin_Dashboard SHALL allow exporting analytics data in CSV format
6. THE System SHALL calculate metrics based on reports from the last 30 days by default with configurable date ranges

### Requirement 11: Data Persistence and Retrieval

**User Story:** As a system operator, I want all report data to be reliably stored and retrievable, so that no civic issues are lost.

#### Acceptance Criteria

1. WHEN a report is submitted, THE System SHALL persist all report data to the database before returning success to the citizen
2. THE System SHALL store report metadata including identifier, timestamp, citizen contact, location, category, status, and department
3. THE System SHALL store references to multimedia files in the Storage_Service
4. THE System SHALL store NLP processing results including extracted entities and confidence scores
5. WHEN the database is queried, THE System SHALL return complete report data including all associated multimedia references
6. THE System SHALL maintain an audit log of all status changes and assignments

### Requirement 12: Error Handling and Resilience

**User Story:** As a citizen, I want the system to handle errors gracefully, so that I can successfully submit reports even when some services are temporarily unavailable.

#### Acceptance Criteria

1. WHEN the NLP_Service is unavailable, THE System SHALL accept the report and queue it for processing when the service recovers
2. WHEN the Transcription_Service fails, THE System SHALL retain the audio file and allow manual transcription
3. WHEN the Storage_Service is unavailable, THE System SHALL return an error message and allow the citizen to retry
4. WHEN any service returns an error, THE System SHALL log the error with sufficient detail for debugging
5. THE Citizen_Portal SHALL display user-friendly error messages without exposing technical details
6. WHEN a report submission fails, THE System SHALL preserve the citizen's input to allow resubmission without re-entering data

### Requirement 13: Authentication and Authorization

**User Story:** As a system administrator, I want secure access controls, so that only authorized personnel can manage reports.

#### Acceptance Criteria

1. WHEN an administrator attempts to access the Admin_Dashboard, THE System SHALL require authentication
2. THE System SHALL support role-based access control with roles including admin, department_user, and viewer
3. WHEN a user with admin role is authenticated, THE System SHALL allow full access to all dashboard features
4. WHEN a user with department_user role is authenticated, THE System SHALL restrict access to reports assigned to their Department
5. WHEN a user with viewer role is authenticated, THE System SHALL allow read-only access to reports
6. THE Citizen_Portal SHALL not require authentication for submitting reports

### Requirement 14: Location Data Handling

**User Story:** As a citizen, I want to specify the location of civic issues, so that municipal workers can find and address the problem.

#### Acceptance Criteria

1. THE Citizen_Portal SHALL allow citizens to enter location as free text
2. THE Citizen_Portal SHALL allow citizens to select location using an interactive map
3. WHEN a citizen uses a mobile device, THE Citizen_Portal SHALL offer to use the device's GPS coordinates
4. WHEN location data is provided, THE System SHALL store it with the report
5. THE Admin_Dashboard SHALL display report locations on a map view
6. THE NLP_Service SHALL extract location information from text descriptions when explicitly mentioned

### Requirement 15: API Design and Integration

**User Story:** As a system integrator, I want well-defined APIs, so that I can integrate SewaSetu with other municipal systems.

#### Acceptance Criteria

1. THE System SHALL expose a REST API for report submission with endpoints accepting JSON payloads
2. THE System SHALL expose a REST API for report retrieval with filtering and pagination support
3. THE System SHALL expose a REST API for status updates requiring authentication
4. WHEN an API request is malformed, THE System SHALL return a 400 status code with error details
5. WHEN an API request is unauthorized, THE System SHALL return a 401 status code
6. THE System SHALL document all API endpoints with request/response schemas and examples
