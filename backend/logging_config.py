import logging
import json
import sys
from datetime import datetime

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName,
        }
        
        # Add extra fields if available
        if hasattr(record, "extra_data"):
            log_record.update(record.extra_data)
            
        return json.dumps(log_record)

def setup_logger(name="sewasetu", level=logging.INFO):
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Console Handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    
    if not logger.handlers:
        logger.addHandler(handler)
        
    return logger

# Global Logger Instance
logger = setup_logger()
