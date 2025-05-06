#!/bin/bash

# Set the base directory
BASE_DIR="src"

# Create the directories recursively, handling existing ones
mkdir -p "$BASE_DIR/assets/videos"
mkdir -p "$BASE_DIR/assets/images"
mkdir -p "$BASE_DIR/components"
mkdir -p "$BASE_DIR/pages"
mkdir -p "$BASE_DIR/styles"

# Create the files, overwriting if they exist
printf "" > "$BASE_DIR/components/Header.tsx"
printf "" > "$BASE_DIR/components/Footer.tsx"
printf "" > "$BASE_DIR/components/PricingTiers.tsx"
printf "" > "$BASE_DIR/components/Testimonials.tsx"
printf "" > "$BASE_DIR/components/OnboardingWizard.tsx"
printf "" > "$BASE_DIR/components/MeetingGuarantee.tsx"
printf "" > "$BASE_DIR/components/FeatureShowcase.tsx"
printf "" > "$BASE_DIR/components/LiveChat.tsx"
printf "" > "$BASE_DIR/pages/Home.tsx"
printf "" > "$BASE_DIR/pages/Pricing.tsx"
printf "" > "$BASE_DIR/pages/Onboarding.tsx"
printf "" > "$BASE_DIR/pages/Dashboard.tsx"
printf "" > "$BASE_DIR/App.tsx"
printf "" > "$BASE_DIR/main.tsx"
printf "" > "$BASE_DIR/vite-env.d.ts"
printf "" > "$BASE_DIR/styles/theme.ts"
printf "" > "$BASE_DIR/styles/globalStyles.ts"

echo "Folder and file structure created (or overwritten) successfully."
