"""
WSGI config for saas_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
import logging
from pathlib import Path

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_backend.settings')

# Create logs directory if it doesn't exist
BASE_DIR = Path(__file__).resolve().parent.parent
log_dir = os.path.join(BASE_DIR, 'logs')
os.makedirs(log_dir, exist_ok=True)

# Configure payment logging
payment_logger = logging.getLogger('payment_process')
payment_logger.info("============== Application Starting ==============")
payment_logger.info("Payment logging initialized")

application = get_wsgi_application()
