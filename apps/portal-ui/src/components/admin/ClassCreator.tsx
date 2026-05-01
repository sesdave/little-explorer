import React from 'react';
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// 1. Define the props interface to prevent "any" errors
interface ClassFormProps {
  sessionId: string;
}

export const ClassForm = ({ sessionId }: ClassFormProps) => {
  
  // Handlers for the form (to be connected to your API later)
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding class to session:", sessionId);
  };

  return (
    <form 
      onSubmit={handleAddClass}
      className="mt-8 p-8 bg-yellow-50/50 rounded-[2.5rem] border-2 border-dashed border-yellow-200 animate-in fade-in slide-in-from-top-4 duration-500"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-900">Add New Class</h3>
          <p className="text-sm text-slate-500 font-medium">Session ID: {sessionId}</p>
        </div>
        <div className="h-12 w-12 bg-yellow-200 rounded-2xl flex items-center justify-center text-2xl">
          🎨
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Class Name occupies full width on mobile, 2 cols on desktop */}
        <div className="md:col-span-2">
          <Input 
            label="Class Name" 
            placeholder="e.g. Tiny Explorers Art Lab" 
            required 
          />
        </div>

        <Input 
          type="number" 
          label="Max Capacity" 
          placeholder="20" 
          required 
        />

        <div className="flex gap-4">
          <Input type="number" label="Min Age" placeholder="2" required />
          <Input type="number" label="Max Age" placeholder="5" required />
        </div>

        <Input 
          type="number" 
          label="Price ($)" 
          icon="$" 
          placeholder="150" 
          required 
        />

        <div className="flex items-end">
          <Button 
            type="submit"
            variant="secondary" 
            className="w-full"
          >
            + Add Class to Session
          </Button>
        </div>
      </div>
    </form>
  );
};