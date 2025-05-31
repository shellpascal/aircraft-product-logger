
import React, { useState, useEffect } from 'react';
import { AircraftModel, AircraftRecord, Picture } from '../types';
import { ImageInput } from './ImageInput';

interface RecordFormProps {
  onSubmit: (record: Omit<AircraftRecord, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: AircraftRecord | null;
  isSubmitting: boolean;
}

const initialFormState = {
  aircraftModel: AircraftModel.GLOBAL,
  acNumber: '',
  moNumber: '',
  monumentNumber: '',
  startDate: '',
  finishDate: '',
  issues: '',
  pictures: [] as Picture[],
  notes: '',
};


export const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<AircraftRecord, 'id' | 'createdAt' | 'pictures' | 'moNumber'>, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        aircraftModel: initialData.aircraftModel,
        acNumber: initialData.acNumber,
        moNumber: initialData.moNumber || '',
        monumentNumber: initialData.monumentNumber,
        startDate: initialData.startDate,
        finishDate: initialData.finishDate,
        issues: initialData.issues,
        pictures: initialData.pictures,
        notes: initialData.notes,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handlePicturesChange = (newPictures: Picture[]) => {
    setFormData(prev => ({ ...prev, pictures: newPictures }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<AircraftRecord, 'id' | 'createdAt' | 'pictures' | 'moNumber'>, string>> = {};
    if (!formData.acNumber.trim()) {
      newErrors.acNumber = 'A/C# is required.';
    }
    // Add other validations as needed, e.g., date formats, monument number
    if (!formData.monumentNumber.trim()) newErrors.monumentNumber = 'Monument# is required.';
    if (!formData.startDate) newErrors.startDate = 'Start Date is required.';
    if (!formData.finishDate) newErrors.finishDate = 'Finish Date is required.';
    if (formData.startDate && formData.finishDate && formData.startDate > formData.finishDate) {
        newErrors.finishDate = 'Finish Date cannot be before Start Date.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };
  
  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">{initialData ? 'Edit Record' : 'Add New Record'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="aircraftModel" className="block text-sm font-medium text-slate-700">Aircraft Model <span className="text-red-500">*</span></label>
            <select id="aircraftModel" name="aircraftModel" value={formData.aircraftModel} onChange={handleChange} className={inputClass} required>
              <option value={AircraftModel.GLOBAL}>Global</option>
              <option value={AircraftModel.CHALLENGER}>Challenger</option>
            </select>
          </div>

          <div>
            <label htmlFor="acNumber" className="block text-sm font-medium text-slate-700">A/C# <span className="text-red-500">*</span></label>
            <input type="text" id="acNumber" name="acNumber" value={formData.acNumber} onChange={handleChange} className={`${inputClass} ${errors.acNumber ? 'border-red-500' : ''}`} required />
            {errors.acNumber && <p className={errorClass}>{errors.acNumber}</p>}
          </div>
          
          <div>
            <label htmlFor="moNumber" className="block text-sm font-medium text-slate-700">MO#</label>
            <input type="text" id="moNumber" name="moNumber" value={formData.moNumber} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label htmlFor="monumentNumber" className="block text-sm font-medium text-slate-700">Monument# <span className="text-red-500">*</span></label>
            <input type="text" id="monumentNumber" name="monumentNumber" value={formData.monumentNumber} onChange={handleChange} className={`${inputClass} ${errors.monumentNumber ? 'border-red-500' : ''}`} required />
            {errors.monumentNumber && <p className={errorClass}>{errors.monumentNumber}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start Date <span className="text-red-500">*</span></label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className={`${inputClass} ${errors.startDate ? 'border-red-500' : ''}`} required />
              {errors.startDate && <p className={errorClass}>{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="finishDate" className="block text-sm font-medium text-slate-700">Finish Date <span className="text-red-500">*</span></label>
              <input type="date" id="finishDate" name="finishDate" value={formData.finishDate} onChange={handleChange} className={`${inputClass} ${errors.finishDate ? 'border-red-500' : ''}`} required />
              {errors.finishDate && <p className={errorClass}>{errors.finishDate}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="issues" className="block text-sm font-medium text-slate-700">Issues</label>
            <textarea id="issues" name="issues" value={formData.issues} onChange={handleChange} rows={3} className={inputClass}></textarea>
          </div>

          <ImageInput pictures={formData.pictures} onPicturesChange={handlePicturesChange} />

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass}></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 flex items-center">
              {isSubmitting ? (
                <>
                  <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Saving...
                </>
              ) : (initialData ? 'Save Changes' : 'Add Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default RecordForm;