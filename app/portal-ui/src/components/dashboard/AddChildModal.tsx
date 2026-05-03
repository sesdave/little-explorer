import React, { useState, useRef } from 'react';
import { useFamilyStore } from '@/store/family.store';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Camera, Loader2, X, Sun } from 'lucide-react';
import { calculateAge } from '@/utils/date-utils';
import { useNotificationStore } from '@/store/notification.store';
import api from '@/services/api';

interface AddChildModalProps {
  trigger: React.ReactNode;
}

export const AddChildModal = ({ trigger }: AddChildModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Store access
  const { token } = useAuthStore();
  const { addChild } = useFamilyStore();

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    allergies: ''
  });

  const resetForm = () => {
    setFormData({ firstName: '', lastName: '', dob: '', allergies: '' });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     // 1. Prepare Multipart Form Data
  //     const data = new FormData();
  //     data.append('firstName', formData.firstName);
  //     data.append('lastName', formData.lastName);
  //     data.append('dob', formData.dob);
  //     if (formData.allergies) data.append('allergies', formData.allergies);
  //     if (imageFile) data.append('photo', imageFile);

  //     // 2. Backend Submission (NestJS)
  //     const response = await fetch('http://localhost:4000/api/v1/family/children', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         // Browser automatically sets multipart/form-data boundary
  //       },
  //       body: data,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to save explorer');
  //     }

  //     const savedChild = await response.json();

  //     // 3. Update Zustand Store & UI
  //     addChild(savedChild);
      
  //     // 4. Close Modal
  //     setIsOpen(false);
  //     resetForm();
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     alert(error instanceof Error ? error.message : "Could not save explorer profile.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const showNotification = useNotificationStore((state) => state.show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('dob', formData.dob);

      if (formData.allergies) {
        form.append('allergies', formData.allergies);
      }

      if (imageFile) {
        form.append('photo', imageFile);
      }

      // ✅ Use axios instance (auto baseURL + auth header)
      const { data } = await api.post('/v1/family/children', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ✅ If backend returns { data: child }
      const savedChild = data?.data || data;

      addChild(savedChild);

      showNotification('Explorer added successfully!', 'success');

      setIsOpen(false);
      resetForm();

    } catch (error: any) {
      console.error("Upload failed:", error);

      const message =
        error.response?.data?.message ||
        'Could not save explorer profile.';

      showNotification(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return <div onClick={() => setIsOpen(true)}>{trigger}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-md rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Styling - Matching Design #1 */}
        <div className="bg-sky-300 p-6 border-b-4 border-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-300 p-1.5 rounded-lg border-2 border-slate-900">
               <Sun size={20} className="text-slate-900" fill="currentColor" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase italic">New Explorer</h3>
          </div>
          <button 
            onClick={() => { setIsOpen(false); resetForm(); }} 
            className="text-slate-900 hover:rotate-90 transition-transform"
          >
             <X size={28} strokeWidth={4} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Integrity Check Field: Full Name */}
          <Input 
            label="Child's Full Name" 
            placeholder="Explorer's Name"
            required 
            className="border-2 border-slate-900 rounded-xl"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />

          {/* Side-by-Side DOB and Automated Age (Design #2) */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <Input 
              type="date" 
              label="Date of Birth" 
              required 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
            />
            <div className="flex flex-col space-y-1.5">
               <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Calculated Age</label>
               <div className="h-11 px-4 flex items-center bg-slate-100 border-2 border-slate-300 rounded-xl font-black text-slate-400 italic">
                 {formData.dob ? `Age ${calculateAge(formData.dob)}` : 'Ages --'}
               </div>
            </div>
          </div>

          {/* Photo & Notes Row */}
          <div className="flex items-start gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 shrink-0 rounded-2xl border-4 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden hover:border-sky-400 transition-colors"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <Camera className="text-slate-300" />
              )}
            </div>
            <div className="flex-1">
              <Input 
                label="Allergies / Medical" 
                placeholder="Any notes?" 
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>
          </div>

          {/* Action Buttons - Matching Design #4 */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              className="flex-1 font-black text-slate-400 uppercase tracking-widest text-sm hover:text-slate-600 transition-colors"
              onClick={() => { setIsOpen(false); resetForm(); }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-rose-400 text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] py-3 rounded-2xl font-black uppercase tracking-widest hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:bg-slate-300"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange} 
      />
    </div>
  );
};