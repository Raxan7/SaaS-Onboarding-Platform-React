from django.core.management.base import BaseCommand
from support.models import SupportArticle
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds the support articles database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding support articles...')
        
        # Categories for articles
        categories = ['Getting Started', 'Meetings', 'Account Management', 'Troubleshooting', 'Integrations', 'Subscriptions']
        
        articles = [
            # Getting Started
            {
                'title': 'Creating your account',
                'category': 'Getting Started',
                'content': """
# Creating Your Account

Welcome to our SaaS Onboarding Platform! This guide will walk you through the process of creating and setting up your account.

## Step 1: Register

1. Navigate to the registration page
2. Enter your email address and a secure password
3. Select your account type (client or host)
4. Click "Register"

## Step 2: Verify Email

1. Check your email inbox for a verification message
2. Click the verification link in the email
3. You'll be redirected to the login page

## Step 3: Complete Your Profile

1. Log in with your credentials
2. You'll be directed to the onboarding process
3. Complete all required fields in your profile
4. Add your company information if applicable

## Step 4: Set Preferences

1. Configure your notification preferences
2. Set your availability for meetings
3. Choose any integration options

## Next Steps

After completing these steps, you're ready to start using the platform! Check out our other guides for more information on scheduling meetings, managing your subscription, and more.

If you need any assistance, our support team is here to help.
                """
            },
            {
                'title': 'Setting up your profile',
                'category': 'Getting Started',
                'content': """
# Setting Up Your Profile

A complete profile helps others know who they're meeting with and enhances your experience on our platform.

## Basic Information

1. Navigate to your profile settings
2. Add your name, job title, and professional bio
3. Upload a profile picture (a professional headshot is recommended)
4. Save your changes

## Company Details

1. Add your company name
2. Select your industry from the dropdown
3. Provide a brief description of your business
4. Include your company website and social media links

## Communication Preferences

1. Set your preferred language
2. Configure email notification settings
3. Choose whether to receive meeting reminders by SMS

## Availability Settings

1. Set your working hours
2. Mark days when you're unavailable
3. Set up buffer time between meetings
4. Configure your time zone settings

## Privacy Controls

1. Choose what information is visible to other users
2. Set default privacy settings for new meetings
3. Configure recording preferences for meetings

Remember to keep your profile updated as your information changes. A complete profile builds trust and improves your networking experience on our platform.
                """
            },
            {
                'title': 'Understanding the dashboard',
                'category': 'Getting Started',
                'content': """
# Understanding Your Dashboard

Your dashboard is the central hub for all your activities on our platform. This guide will help you navigate its features efficiently.

## Main Sections

1. **Overview Widget**: Shows your upcoming meetings, recent activities, and important notifications
2. **Calendar View**: Displays your schedule and allows for quick meeting creation
3. **Meetings Panel**: Lists all your past, upcoming, and pending meetings
4. **Quick Actions**: Buttons for common tasks like scheduling a meeting or updating your profile
5. **Subscription Information**: Shows your current plan, usage, and renewal information

## Navigation

- The main menu is located on the left sidebar
- Use the top search bar to quickly find meetings, contacts, or content
- The notification bell in the top right alerts you to important updates
- Your profile menu in the top right gives access to settings and logout

## Dashboard Customization

1. Rearrange widgets by dragging and dropping
2. Hide or show sections based on your preferences
3. Change the time range view in the calendar
4. Set default filters for your meetings list

## Monitoring Activity

- Track meeting analytics and attendance
- View your usage statistics
- Monitor team activity if you have a team account
- See notification history and important announcements

## Mobile Access

Your dashboard is fully responsive and accessible on mobile devices. The layout will adjust automatically, but all features remain available regardless of the device you're using.

Take some time to explore your dashboard and customize it to your workflow for the best experience.
                """
            },
            
            # Meetings
            {
                'title': 'Scheduling your first meeting',
                'category': 'Meetings',
                'content': """
# Scheduling Your First Meeting

This guide will walk you through the process of scheduling your first meeting on our platform.

## Step 1: Access the Scheduling Feature

1. Log in to your account
2. Click on the "Schedule Meeting" button on your dashboard
3. Alternatively, use the "+" button in the calendar view

## Step 2: Set Meeting Details

1. Add a meeting title that clearly describes the purpose
2. Select the meeting type (one-on-one, group, webinar)
3. Enter a brief description of the meeting agenda
4. Choose whether this is a recurring meeting

## Step 3: Choose Date and Time

1. Select your preferred date from the calendar
2. Choose a start time from your available slots
3. Set the duration of the meeting
4. Verify that the time zone is correct

## Step 4: Invite Participants

1. Enter the email addresses of participants
2. Add any guest participants who don't have accounts
3. Set participant roles if applicable
4. Add a personalized message to the invitation

## Step 5: Configure Meeting Settings

1. Choose video conference settings
2. Decide if you want to allow recording
3. Set up any pre-meeting forms or questionnaires
4. Configure calendar integration options

## Step 6: Review and Confirm

1. Review all meeting details
2. Make any necessary adjustments
3. Click "Schedule Meeting" to confirm
4. The system will send invitations to all participants

## After Scheduling

- All participants will receive an email invitation
- The meeting will appear in your calendar
- You'll receive reminders as the meeting approaches
- You can edit or cancel the meeting if needed

Congratulations! You've scheduled your first meeting. If you need to make changes, you can access the meeting details from your dashboard at any time.
                """
            },
            {
                'title': 'Managing meeting settings',
                'category': 'Meetings',
                'content': """
# Managing Meeting Settings

Customize your meeting experience with our comprehensive settings options.

## General Settings

1. **Default Duration**: Set your preferred meeting length
2. **Buffer Time**: Add time between consecutive meetings
3. **Time Zone**: Configure your primary time zone
4. **Meeting Templates**: Create and manage templates for recurring meeting types

## Video Conference Settings

1. **Default Provider**: Choose between built-in video or external providers
2. **Camera Settings**: Set default camera on/off when joining
3. **Audio Settings**: Configure microphone preferences
4. **Background Options**: Set virtual backgrounds or blur

## Calendar Integration

1. **Connected Calendars**: Manage your linked calendar accounts
2. **Availability Sync**: Control how your external calendars affect your available slots
3. **Meeting Visibility**: Choose how meetings appear in your calendar
4. **Notification Sync**: Decide if notifications should sync to your calendar apps

## Security Settings

1. **Waiting Room**: Enable/disable the waiting room feature
2. **Access Codes**: Set up meeting passwords or PIN requirements
3. **Domain Restrictions**: Limit access to specific email domains
4. **Recording Permissions**: Control who can record meetings

## Email Notifications

1. **Invitation Format**: Customize the appearance of meeting invitations
2. **Reminder Timing**: Set when reminders are sent before meetings
3. **Cancellation Notices**: Configure notification settings for canceled meetings
4. **Follow-up Emails**: Set up automatic follow-ups after meetings end

## Advanced Features

1. **Integrations**: Configure third-party app connections
2. **Analytics**: Set up tracking for meeting metrics
3. **Feedback Forms**: Create and manage post-meeting surveys
4. **Custom Branding**: Add your company logo and colors to meeting interfaces

Regularly reviewing and updating your meeting settings ensures you have the best possible experience and helps you make the most of all available features.
                """
            },
            
            # Account Management
            {
                'title': 'Managing your subscription',
                'category': 'Subscriptions',
                'content': """
# Managing Your Subscription

This guide explains how to view, change, and optimize your subscription plan.

## Viewing Your Current Plan

1. Navigate to Settings > Subscription
2. Here you'll see your current plan details:
   - Plan name and price
   - Billing cycle and next payment date
   - Features included in your plan
   - Usage statistics and limits

## Upgrading Your Subscription

1. From the Subscription page, click "Upgrade Plan"
2. Compare available plans and their features
3. Select your desired plan
4. Confirm payment details
5. Review the prorated amount for the current billing cycle
6. Confirm your upgrade

## Downgrading Your Subscription

1. Navigate to Settings > Subscription
2. Click "Change Plan"
3. Select a lower-tier plan
4. Review the changes to features and limitations
5. Confirm your selection
6. Your plan will change at the end of the current billing cycle

## Managing Payment Methods

1. Go to Settings > Subscription > Payment Methods
2. Add new payment methods
3. Set a default payment method
4. Remove outdated payment information
5. Update expiry dates or billing addresses

## Billing History and Invoices

1. Access Settings > Subscription > Billing History
2. View all past invoices
3. Download PDF receipts for accounting purposes
4. Print or export billing history reports

## Canceling Your Subscription

1. Navigate to Settings > Subscription
2. Click "Cancel Subscription"
3. Complete the feedback form explaining your reason for cancellation
4. Confirm your cancellation
5. Receive confirmation email with account status details

## Reactivating a Canceled Subscription

1. Log in to your account
2. Navigate to Settings > Subscription
3. Click "Reactivate Subscription"
4. Select a plan and confirm payment details
5. Your account will be immediately reactivated

Remember that our support team is available to answer any subscription-related questions. Contact us through the support chat or email for personalized assistance.
                """
            },
            {
                'title': 'Understanding pricing plans',
                'category': 'Subscriptions',
                'content': """
# Understanding Our Pricing Plans

A comprehensive breakdown of our subscription tiers and features.

## Basic Plan - $29/month

The Basic plan is ideal for individuals and small teams just getting started with our platform.

**Features include:**
- Up to 10 scheduled meetings per month
- Basic video conferencing tools
- Standard email support
- 1 user account
- Basic analytics
- 24-hour meeting history
- Knowledge base access

**Limitations:**
- No custom branding
- Limited to 60-minute meetings
- Basic reporting only

## Pro Plan - $99/month

The Pro plan is perfect for growing businesses that need more flexibility and features.

**Features include:**
- Everything in Basic, plus:
- Unlimited scheduled meetings
- Advanced video conferencing tools
- Priority email support
- Up to 5 user accounts
- Team collaboration features
- 90-day meeting history
- Custom meeting templates
- Meeting recording (10 hours storage)
- Basic integrations with CRM and calendar apps

**Limitations:**
- Limited custom branding options
- Standard API access only

## Enterprise Plan - $499/month

The Enterprise plan offers our most comprehensive set of features for larger organizations.

**Features include:**
- Everything in Pro, plus:
- Unlimited user accounts
- Premium support with dedicated account manager
- Phone and chat support
- 1-year meeting history
- Advanced reporting and analytics
- Custom branding options
- White-labeling capability
- SSO integration
- Advanced security features
- Unlimited meeting recording storage
- Full API access
- Custom integrations
- Advanced compliance features
- Onboarding assistance

## Add-ons Available for All Plans

- Additional user accounts
- Extended storage for recordings
- Premium support upgrade
- Advanced security features
- Enhanced API access
- Training sessions

## Annual Billing Discount

Save 20% on any plan by choosing annual billing instead of monthly payments.

## Free Trial

All plans come with a 14-day free trial with full access to features. No credit card required to start your trial.

For more detailed information or custom enterprise quotes, please contact our sales team through the support chat or email.
                """
            },
            
            # Troubleshooting
            {
                'title': 'Common technical issues',
                'category': 'Troubleshooting',
                'content': """
# Common Technical Issues and Solutions

This guide addresses the most frequent technical challenges our users encounter.

## Video and Audio Problems

### No sound during meetings
1. Check if your microphone is muted in the meeting controls
2. Verify that the correct audio input device is selected
3. Make sure your browser has permission to access your microphone
4. Try using headphones instead of speakers
5. Restart your browser or device

### Camera not working
1. Ensure your camera is not physically covered
2. Check if another application is using your camera
3. Verify browser permissions for camera access
4. Select the correct camera if you have multiple options
5. Update your device drivers or browser

## Connection Issues

### Unable to join meetings
1. Check your internet connection stability
2. Clear your browser cache and cookies
3. Try using a different browser
4. Disable VPN or proxy services temporarily
5. Verify the meeting link is correct and hasn't expired

### Meeting lags or freezes
1. Close other bandwidth-intensive applications
2. Use a wired internet connection instead of Wi-Fi if possible
3. Lower your video quality in the meeting settings
4. Ask other participants to turn off their video if not needed
5. Restart your router if problems persist

## Account Access Problems

### Forgotten password
1. Use the "Forgot Password" link on the login page
2. Check your email (including spam folder) for reset instructions
3. Follow the link in the email to create a new password
4. Contact support if you don't receive the email within 10 minutes

### Unable to log in
1. Verify you're using the correct email address
2. Check for typos in your login credentials
3. Ensure your account hasn't been deactivated
4. Clear browser cookies and try again
5. Try the incognito/private mode in your browser

## Calendar and Scheduling Issues

### Meetings not appearing in calendar
1. Check if calendar integration is properly set up
2. Verify you've accepted the meeting invitation
3. Check if the meeting was rescheduled or canceled
4. Refresh your calendar application
5. Reconnect your calendar integration in settings

### Time zone discrepancies
1. Verify your time zone settings in your profile
2. Check if daylight saving time has affected scheduling
3. Confirm the meeting organizer's time zone settings
4. Use the "Convert to my time zone" feature when viewing meetings

If you continue to experience technical difficulties after trying these solutions, please contact our support team for personalized assistance.
                """
            },
            {
                'title': 'Browser compatibility',
                'category': 'Troubleshooting',
                'content': """
# Browser Compatibility Guide

For the best experience on our platform, please review our browser recommendations and requirements.

## Recommended Browsers

Our platform performs optimally on the following browsers:

1. **Google Chrome** (version 90 or newer)
   - Best overall performance
   - Full feature support
   - Recommended for video meetings

2. **Mozilla Firefox** (version 88 or newer)
   - Good performance and stability
   - Complete feature support
   - Excellent privacy features

3. **Microsoft Edge** (Chromium-based, version 90 or newer)
   - Fast performance
   - Full feature compatibility
   - Integrated with Windows environments

4. **Safari** (version 14 or newer)
   - Good for Mac and iOS users
   - Supports most features
   - Some limitations with video conferencing features

## Browser Settings

For optimal performance, ensure your browser settings include:

1. **Cookies enabled** - Required for authentication
2. **JavaScript enabled** - Essential for platform functionality
3. **Pop-up blockers disabled** for our domain
4. **Camera and microphone permissions** granted
5. **Autoplay media** settings enabled

## Mobile Browsers

On mobile devices, we recommend:

1. **Chrome for Android** (latest version)
2. **Safari for iOS** (latest version)
3. **For best experience**, use our mobile app instead of mobile browsers

## Known Browser Issues

### Internet Explorer
- Not supported; please use Edge or another modern browser

### Older Safari Versions (13 and below)
- Limited video conferencing capabilities
- Potential issues with calendar integration
- Some UI elements may not display correctly

### Opera
- Generally works but not officially supported
- May have issues with certain video features

## Troubleshooting Browser Problems

If you encounter issues:

1. **Update your browser** to the latest version
2. **Clear cache and cookies** related to our site
3. **Disable extensions** that might interfere with functionality
4. **Check for browser updates** that might resolve compatibility issues
5. **Try an alternative browser** from our recommended list

We regularly update our platform to maintain compatibility with modern browsers. For the best experience, we recommend keeping your browser updated to the latest version.
                """
            },
            
            # Integrations
            {
                'title': 'Calendar integration',
                'category': 'Integrations',
                'content': """
# Calendar Integration Guide

Synchronize our platform with your favorite calendar applications for seamless scheduling.

## Supported Calendar Services

Our platform integrates with the following calendar services:

1. **Google Calendar**
2. **Microsoft Outlook/Office 365**
3. **Apple iCalendar**
4. **Exchange Server**
5. **CalDAV-compatible calendars**

## Setting Up Google Calendar Integration

1. Navigate to Settings > Integrations > Calendar
2. Click "Connect" next to Google Calendar
3. Sign in to your Google account when prompted
4. Review and approve the requested permissions
5. Select which Google calendars to sync
6. Choose sync preferences (two-way or one-way)
7. Save your settings

## Setting Up Microsoft Outlook Integration

1. Go to Settings > Integrations > Calendar
2. Select "Connect" beside Microsoft Outlook
3. Log in with your Microsoft account
4. Authorize the connection when prompted
5. Select calendars to include in the sync
6. Configure sync settings and preferences
7. Save your configuration

## Setting Up Apple iCalendar

1. Navigate to Settings > Integrations > Calendar
2. Find the "iCalendar URL" section
3. Copy the unique calendar URL provided
4. Open your Apple Calendar application
5. Select File > New Calendar Subscription
6. Paste the URL and click Subscribe
7. Adjust refresh and alert settings as needed
8. Click OK to finish

## Managing Calendar Integration

### Sync Settings
- Control which events are synced (all meetings, only those you host, etc.)
- Set refresh frequency (real-time, hourly, daily)
- Choose whether to sync meeting details and attendees
- Configure privacy settings for synced events

### Troubleshooting Sync Issues
1. Check your integration status in Settings
2. Verify internet connectivity
3. Ensure your calendar service account is active
4. Try disconnecting and reconnecting the integration
5. Check for conflicting calendar applications

### Best Practices
- Connect only the calendars you actively use
- Regularly review synced calendars for accuracy
- Use meeting categories/tags for better organization
- Set appropriate visibility settings for sensitive meetings

## Calendar Notifications

When integrated, you can receive notifications from:
- Our platform
- Your calendar application
- Or both (customizable in settings)

Adjust notification timing and delivery methods in your profile settings to avoid duplicate alerts.

For additional help with calendar integration, contact our support team through the chat widget.
                """
            },
        ]
        
        # Create articles
        created_count = 0
        for article_data in articles:
            slug = slugify(article_data['title'])
            
            # Check if article already exists
            if not SupportArticle.objects.filter(slug=slug).exists():
                SupportArticle.objects.create(
                    title=article_data['title'],
                    slug=slug,
                    content=article_data['content'],
                    category=article_data['category'],
                    is_published=True
                )
                created_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {created_count} support articles'))
