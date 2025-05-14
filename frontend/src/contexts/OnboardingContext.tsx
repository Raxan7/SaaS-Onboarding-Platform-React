// contexts/OnboardingContext.tsx
import { createContext, useContext, useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

export interface OnboardingData {
  account: {
    fullName: string;
    email: string;
    password: string;
  };
  company: {
    companyName: string;
    jobTitle: string;
    industry: string;
  };
  companyStepCompleted: boolean; // Added property to track step completion
  meeting: {
    meetingDate: string;
    meetingGoals: string;
  };
  payment: {
    planId: string | null;
    plans?: Plan[]; // Optional if you want to store plans in context
  };
}

const defaultOnboardingData: OnboardingData = {
  account: {
    fullName: '',
    email: '',
    password: ''
  },
  company: {
    companyName: '',
    jobTitle: '',
    industry: ''
  },
  companyStepCompleted: false, // Default value
  meeting: {
    meetingDate: '',
    meetingGoals: ''
  },
  payment: {
    planId: null
  }
};

const OnboardingContext = createContext<{
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}>({
  data: defaultOnboardingData,
  setData: () => {},
  currentStep: 0,
  setCurrentStep: () => {}
});

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <OnboardingContext.Provider value={{ data, setData, currentStep, setCurrentStep }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};