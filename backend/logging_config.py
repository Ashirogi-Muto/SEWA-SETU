import logging
import json
import sys
from datetime import datetime, timezone

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        
        # Add extra fields if available
        if hasattr(record, "extra_data"):
            log_record.update(record.extra_data)
            
        return json.dumps(log_record)

import os
from logging.handlers import RotatingFileHandler

def get_logger(name, filename=None, level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid adding handlers multiple times if logger already exists
    if logger.handlers:
        return logger
        
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JsonFormatter())
    logger.addHandler(console_handler)
    
    # File Handler
    if filename:
        # Ensure log directory exists dynamically just in case someone deletes it while running
        os.makedirs("logs/backend", exist_ok=True)
        
        file_handler = RotatingFileHandler(
            f"logs/backend/{filename}.log", 
            maxBytes=5 * 1024 * 1024, # 5MB limit
            backupCount=3
        )
        file_handler.setFormatter(JsonFormatter())
        logger.addHandler(file_handler)
        
    return logger
