import logging
import json
import sys
import os
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        if hasattr(record, "extra_data"):
            log_record.update(record.extra_data)
        return json.dumps(log_record)

def get_logger(name, filename=None, level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    if logger.handlers:
        return logger
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JsonFormatter())
    logger.addHandler(console_handler)
    # File Handler
    if filename:
        os.makedirs("logs/ai-server", exist_ok=True)
        file_handler = RotatingFileHandler(
            f"logs/ai-server/{filename}.log",
            maxBytes=5 * 1024 * 1024,  # 5MB limit
            backupCount=3
        )
        file_handler.setFormatter(JsonFormatter())
        logger.addHandler(file_handler)
    return logger
