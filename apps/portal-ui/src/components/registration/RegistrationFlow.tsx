import { useState } from 'react';
import { Step1_ChildPicker } from './steps/Step1_ChildPicker';
import { Step2_ClassSelection } from './steps/Step2_ClassSelection';
import { Step3_ReviewSummary } from './steps/Step3_ReviewSummary';

export const RegistrationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const renderStep = () => {
    switch(currentStep) {
      case 1: 
        return <Step1_ChildPicker onNext={() => setCurrentStep(2)} />;
      case 2: 
        return <Step2_ClassSelection 
                  onNext={() => setCurrentStep(3)} 
                  onBack={() => setCurrentStep(1)} 
               />;
      case 3: 
        return <Step3_ReviewSummary 
                  onNext={() => console.log("Init Paystack")} 
                  onBack={() => setCurrentStep(2)} 
               />;
      default: 
        return <Step1_ChildPicker onNext={() => setCurrentStep(2)} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
        {[1, 2, 3].map(step => (
          <div 
            key={step} 
            className={`flex-1 transition-all duration-500 ${currentStep >= step ? 'bg-sky-400' : ''}`} 
          />
        ))}
      </div>
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50 p-8">
        {renderStep()}
      </div>
    </div>
  );
};