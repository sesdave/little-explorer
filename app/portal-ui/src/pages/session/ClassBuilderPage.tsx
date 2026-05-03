import React, { useState, useEffect } from 'react';

// 1. Internal Feature Components
import { 
  ClassTable, 
  ClassBuilderHeader, 
  ClassValidationFooter 
} from '../../components/session/builder';

// 2. Feature Hooks
import { useClasses } from '@/hooks/use-classes';

// 3. Types
import { ClassEntity } from '@mle/types';
import { useParams, Navigate } from 'react-router-dom';

/**
 * ClassBuilderPage
 * * A Smart Container that manages the "Draft State" of session classes.
 * It allows admins to modify class templates in bulk before syncing 
 * changes to the server.
 */
export const ClassBuilderPage = () => {
    // Grab the ID from the URL path defined in adminRoutes
  const { sessionId } = useParams<{ sessionId: string }>();

  // Use a fallback or error check if sessionId is missing
  if (!sessionId) return <Navigate to="/admin/sessions" />;
  // 1. Server State: Fetching and Mutation logic via TanStack Query
  const { classes, updateBulkClasses, isSaving } = useClasses(sessionId);
  
  // 2. Draft State: Local state to hold unsaved changes
  const [localClasses, setLocalClasses] = useState<ClassEntity[]>([]);

  // 3. Sync Logic: Populate local draft whenever server data is successfully fetched
  // This ensures the admin sees the "Current Truth" on initial load or after a reset.
  // useEffect(() => {
  //   if (classes) {
  //     setLocalClasses(classes);
  //   }
  // }, [classes]);
  useEffect(() => {
    setLocalClasses(Array.isArray(classes) ? classes : []);
  }, [classes]);

  // 4. Update Handler: Marks a row as "isDirty" to track unsaved changes
  const handleUpdateField = (id: string, field: string, value: any) => {
    setLocalClasses(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value, isDirty: true } : c
    ));
  };

  // 5. Add Handler: Creates a temporary local class with a unique temp ID
  const handleAddClass = () => {
    const newClass: ClassEntity = { 
      id: `temp-${Date.now()}`, 
      name: 'New Section', 
      ageMin: 4, 
      ageMax: 6, 
      capacity: 20, 
      isDirty: true,
      sessionId // Link it to the current scope immediately
    };
    setLocalClasses(prev => [...prev, newClass]);
  };

  // 6. Delete Handler: Optimistically removes from the local list
  const handleDeleteClass = (id: string) => {
    setLocalClasses(prev => prev.filter(c => c.id !== id));
    // Note: Actual DB deletion usually requires a separate confirmation/mutation
  };

  const handleSave = () => {
    const dirtyClasses = localClasses.filter(c => c.isDirty);
    if (dirtyClasses.length === 0) return;
    
    updateBulkClasses(dirtyClasses);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Global Actions Bar */}
      <ClassBuilderHeader 
        onSave={handleSave}
        onReset={() => setLocalClasses(classes || [])}
        isSaving={isSaving}
        hasChanges={localClasses.some(c => c.isDirty)}
      />

      {/* Main Data Grid */}
      <ClassTable 
        classes={localClasses} 
        onUpdate={handleUpdateField}
        onDelete={handleDeleteClass}
        onAdd={handleAddClass}
      />

      {/* Logic & Error Validation Display */}
      <ClassValidationFooter classes={localClasses} />
    </div>
  );
};