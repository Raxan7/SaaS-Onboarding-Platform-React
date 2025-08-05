# SaaS Onboarding Platform

## Project Overview

This platform connects businesses with expert consultants for professional guidance and business growth. Built with a powerful React frontend and Django backend, it provides a seamless experience for booking expert consultation sessions, conducting video meetings, and getting AI-powered support.

[Watch Project Demo & Explanation](https://www.youtube.com/watch?v=0IL2us5frsA)

## Core Features

### For Clients
- **Expert Matching & Booking**: Find and schedule sessions with industry specialists
- **Video Consultations**: Seamless integration with Google Meet and LiveKit
- **Self-Service Support**: AI-powered chatbot for instant assistance
- **Knowledge Base**: Comprehensive articles and FAQs
- **Personalized Onboarding**: Customized guidance based on business needs

### For Experts
- **Profile Management**: Showcase expertise and availability
- **Session Management**: Calendar integration and scheduling tools
- **Client Communication**: Secure messaging system
- **Meeting Controls**: Advanced video conferencing features
- **Performance Analytics**: Track session metrics and feedback

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite for lightning-fast development
- **UI Components**: Material-UI for premium user experience
- **State Management**: React Context API + Custom Hooks
- **Animation**: Framer Motion for fluid UI transitions
- **Styling**: Styled Components with responsive design

### Backend
- **Framework**: Django with Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Token-based auth with secure sessions
- **Video Integration**: Google Meet API and LiveKit
- **AI Chat**: Hugging Face's Inference API
- **Payment Processing**: Stripe integration

## AI Chat Support

The platform features an AI-powered chat system that:
- Provides instant responses to common questions
- Learns from conversations to improve responses
- Seamlessly escalates to human support when needed
- Reduces support staff workload by handling routine inquiries
- Creates a 24/7 support experience

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Django 5.0+

### Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Deployment

The application is configured for deployment on Render using the included `render.yaml` configuration file.

## License

This project was developed for a client and is not open source. All rights reserved.

---

*Note: This project was custom-built for a client. The video demonstration provides a comprehensive overview of the platform's capabilities and implementation.*
```
