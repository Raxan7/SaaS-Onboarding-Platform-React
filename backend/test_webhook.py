#!/usr/bin/env python
"""
Test script to simulate Stripe webhook events.
Usage: python test_webhook.py [event_type]

Available event types:
- checkout.session.completed
- invoice.payment_succeeded
- customer.subscription.deleted
"""

import sys
import json
import requests
import hmac
import hashlib
import os
import time
from datetime import datetime, timedelta

# Configuration
WEBHOOK_URL = "http://localhost:8000/api/subscriptions/webhook/"
WEBHOOK_SECRET = "your_webhook_secret"  # Replace with your actual webhook secret

# Sample event data templates
EVENT_TEMPLATES = {
    "checkout.session.completed": {
        "id": "evt_test_checkout_completed",
        "object": "event",
        "api_version": "2020-08-27",
        "created": int(time.time()),
        "data": {
            "object": {
                "id": "cs_test_checkout",
                "object": "checkout.session",
                "customer": "cus_test_customer",
                "subscription": "sub_test_subscription",
                "payment_status": "paid",
                "mode": "subscription"
            }
        },
        "type": "checkout.session.completed"
    },
    "invoice.payment_succeeded": {
        "id": "evt_test_invoice_paid",
        "object": "event",
        "api_version": "2020-08-27",
        "created": int(time.time()),
        "data": {
            "object": {
                "id": "in_test_invoice",
                "object": "invoice",
                "customer": "cus_test_customer",
                "subscription": "sub_test_subscription",
                "status": "paid",
                "total": 9900  # $99.00
            }
        },
        "type": "invoice.payment_succeeded"
    },
    "customer.subscription.deleted": {
        "id": "evt_test_subscription_deleted",
        "object": "event",
        "api_version": "2020-08-27",
        "created": int(time.time()),
        "data": {
            "object": {
                "id": "sub_test_subscription",
                "object": "subscription",
                "customer": "cus_test_customer",
                "status": "canceled"
            }
        },
        "type": "customer.subscription.deleted"
    }
}

def simulate_webhook(event_type, customer_id=None, subscription_id=None):
    """Simulate a Stripe webhook event."""
    if event_type not in EVENT_TEMPLATES:
        print(f"Error: Unknown event type '{event_type}'")
        print(f"Available types: {', '.join(EVENT_TEMPLATES.keys())}")
        return

    # Get the event template
    event = EVENT_TEMPLATES[event_type].copy()
    event_data = event["data"]["object"]
    
    # Customize the event with provided parameters
    if customer_id:
        event_data["customer"] = customer_id
    
    if subscription_id:
        if "subscription" in event_data:
            event_data["subscription"] = subscription_id
        elif event_data["object"] == "subscription":
            event_data["id"] = subscription_id
    
    # For subscription events, set realistic dates
    if event_type == "checkout.session.completed" or event_type == "invoice.payment_succeeded":
        # Add current_period_end for subscription objects
        now = int(time.time())
        thirty_days_later = int((datetime.now() + timedelta(days=30)).timestamp())
        
        if "subscription" in event_data and event_data["subscription"]:
            # Add subscription data
            if event_type == "checkout.session.completed":
                # This would be returned by a subscription retrieve call
                event["subscription_data"] = {
                    "id": event_data["subscription"],
                    "current_period_start": now,
                    "current_period_end": thirty_days_later,
                    "items": {
                        "data": [
                            {
                                "price": {
                                    "id": "price_1RO3I9La8vPOEHR7d9EzMNvl",  # Pro plan
                                    "product": "prod_SIeb5I65qJqCMO"
                                }
                            }
                        ]
                    }
                }
    
    # Convert event to JSON
    payload = json.dumps(event)
    
    # Create a signature (this is how Stripe verifies webhooks)
    timestamp = str(int(time.time()))
    signed_payload = f"{timestamp}.{payload}"
    signature = hmac.new(
        WEBHOOK_SECRET.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Prepare the headers
    headers = {
        'Content-Type': 'application/json',
        'Stripe-Signature': f"t={timestamp},v1={signature}"
    }
    
    # Send the webhook request
    print(f"Sending {event_type} webhook...")
    print(f"Customer ID: {event_data.get('customer')}")
    print(f"Subscription ID: {event_data.get('subscription', event_data.get('id') if event_data.get('object') == 'subscription' else None)}")
    
    try:
        response = requests.post(WEBHOOK_URL, data=payload, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
    except Exception as e:
        print(f"Error sending webhook: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_webhook.py [event_type] [customer_id] [subscription_id]")
        print(f"Available event types: {', '.join(EVENT_TEMPLATES.keys())}")
        sys.exit(1)
    
    event_type = sys.argv[1]
    customer_id = sys.argv[2] if len(sys.argv) > 2 else None
    subscription_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    simulate_webhook(event_type, customer_id, subscription_id)
