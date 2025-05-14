from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Plan
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class PlanListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticatedOrReadOnly]  # Allow GET for everyone or authenticated users

    def get_queryset(self):
        return Plan.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        try:
            # First try to get plans from database
            db_plans = self.get_queryset()
            if db_plans.exists():
                data = [{
                    'id': plan.stripe_price_id,
                    'name': plan.name,
                    'price': f"${plan.price}/{plan.interval}",
                    'features': plan.features or []
                } for plan in db_plans]
                return Response(data)

            # Fallback to Stripe if no plans in database
            prices = stripe.Price.list(active=True, expand=['data.product'])
            data = [{
                'id': price.id,
                'name': price.product.name,
                'price': f"${price.unit_amount/100}/{price.recurring.interval}",
                'features': getattr(price.product, 'features', [])
            } for price in prices.data]

            return Response(data)

        except Exception as e:
            return Response([{
                'id': 'basic_monthly',
                'name': 'Basic Plan',
                'price': '$29/month',
                'features': ['Up to 100 users', 'Basic support']
            }, {
                'id': 'pro_monthly',
                'name': 'Pro Plan',
                'price': '$99/month',
                'features': ['Unlimited users', 'Priority support']
            }])