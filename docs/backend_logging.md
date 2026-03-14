# Backend Logging Documentation

This document describes how logging is implemented, configured, and used across the backend of the Sewa Setu project.

## 1. Centralized Logging Configuration

The backend utilizes a centralized logging configuration defined in `backend/logging_config.py`. 

### Formatting
Logs are formatted as **JSON** for better machine readability and structured parsing. Each log entry contains the following fields:
- `timestamp`: UTC time in ISO format
- `level`: Log severity (INFO, WARNING, ERROR, EXCEPTION)
- `message`: The actual log message
- `module`: The Python module where the log was generated
- `func`: The exact function name where the log originated
- *Optional extra fields*: If any extra data is attached to the log record, it is also appended to the JSON object.

### Log Delivery (Where do logs go?)
**Native Python Configuration**: The `setup_logger` function initializes a logger (named `sewasetu`), sets the default level to `INFO`, and attaches a `logging.StreamHandler(sys.stdout)`. 
*This means the Python backend natively only logs to the standard console output (stdout) and does not write to any file natively.*

**Why are log files created in the logs/ directory?**
Because the `scripts/start_all.sh` script launches services in tmux windows, and all output is piped through `scripts/rotatelogs.sh` to persistent log files in the `logs/` directory.

---

## 2. Logging Usage Across Backend Modules

Logging is widely used across the application to track flow, performance, business logic events, and errors. The logger is imported as follows:
`from backend.logging_config import logger`

Here is a breakdown of what each module logs:

### `backend/main.py`
- **INFO**: Application startup events (e.g., "SewaSetu Backend Started"). Server operational information. Duplicate reports detected & linked.
- **WARNING**: Failures to compute image hashes when submitting a report.
- **ERROR / EXCEPTION**: Failures during report submission, STT Proxy Network Errors, Database interaction failures.

### `backend/ws_manager.py` (WebSocket Manager)
- **INFO**: WebSocket connections established and disconnected (tracks active connection counts).
- **WARNING**: Failures to dispatch messages to active connected clients.

### `backend/services/escalation_service.py`
- **INFO**: Start of the Escalation Scheduler (noting whether it's in Demo Mode or not), cyclic execution of the job ("Running Escalation Check"), and successful escalation of reports.
- **ERROR**: General failures or crashes running the escalation job.

### `backend/services/duplicate_detector.py`
- **INFO**: Detection of valid image hashes.
- **WARNING**: Unexpected errors computing image hashes.

### `backend/ai_service.py`
- **INFO**: Successful AI classifications and associated confidence scores for submitted reports.
- **WARNING**: AI classification server timeouts.
- **ERROR**: Underlying AI classification server errors or connection aborts.

---

## 3. Summary

The native logging outputs both to `stdout` and to local log files using `RotatingFileHandler` (max 5MB, 3 backups) in the `logs/` directory. The `scripts/start_all.sh` script launches services in tmux windows, and all output is piped through `scripts/rotatelogs.sh` to capture anything that doesn't go through the native logger (like uvicorn startup logs).
