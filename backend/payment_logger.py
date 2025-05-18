import logging
import os
from django.conf import settings

def setup_payment_logging():
    """
    Configure detailed logging for the payment process to help debug payment issues.
    """
    # Create a logger for payment processing
    logger = logging.getLogger('payment_process')
    logger.setLevel(logging.DEBUG)
    
    # Create a formatter that includes timestamps and log levels
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Log to console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    
    # Add the console handler to the logger
    logger.addHandler(console_handler)
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(settings.BASE_DIR, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Log to a file in the logs directory
    file_handler = logging.FileHandler(os.path.join(log_dir, 'payment_process.log'))
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Add the file handler to the logger
    logger.addHandler(file_handler)
    
    # Return the configured logger
    return logger
