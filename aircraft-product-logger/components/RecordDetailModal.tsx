
import React from 'react';
import { AircraftRecord } from '../types';

interface RecordDetailModalProps {
  record: AircraftRecord | null;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    // Add timeZone: 'UTC' to interpret date string as UTC if it doesn't have timezone info
    return new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return dateString;
  }
};

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-sky-700 break-all">Record Details: A/C# {record.acNumber}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-700 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div><strong className="text-slate-600 font-medium">Aircraft Model:</strong> {record.aircraftModel}</div>
            <div className="break-all"><strong className="text-slate-600 font-medium">A/C#:</strong> {record.acNumber}</div>
            <div className="break-all"><strong className="text-slate-600 font-medium">MO#:</strong> {record.moNumber || 'N/A'}</div>
            <div className="break-all"><strong className="text-slate-600 font-medium">Monument#:</strong> {record.monumentNumber}</div>
            <div><strong className="text-slate-600 font-medium">Start Date:</strong> {formatDate(record.startDate)}</div>
            <div><strong className="text-slate-600 font-medium">Finish Date:</strong> {formatDate(record.finishDate)}</div>
          </div>
          
          <div>
            <strong className="text-slate-600 font-medium block mb-1">Issues:</strong>
            <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-200">{record.issues || 'No issues reported.'}</div>
          </div>
          
          <div>
            <strong className="text-slate-600 font-medium block mb-1">Notes:</strong>
            <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-200">{record.notes || 'No notes.'}</div>
          </div>

          {record.pictures.length > 0 && (
            <div>
              <strong className="text-slate-600 font-medium block mb-2">Pictures:</strong>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {record.pictures.map(pic => (
                  <div key={pic.id} className="aspect-square">
                    <img 
                      src={pic.dataUrl} 
                      alt={pic.name || 'Record image'} 
                      className="w-full h-full object-cover rounded-md shadow-md border border-slate-200" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-4 text-right">
            Created: {new Date(record.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-6 text-right pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default RecordDetailModal;