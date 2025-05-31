
import React from 'react';
import { AircraftRecord } from '../types';

interface RecordCardProps {
  record: AircraftRecord;
  onView: (record: AircraftRecord) => void;
  onEdit: (record: AircraftRecord) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    // Add timeZone: 'UTC' to interpret date string as UTC if it doesn't have timezone info
    return new Date(dateString + (dateString.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  } catch {
    return dateString; // fallback if date is invalid
  }
};

export const RecordCard: React.FC<RecordCardProps> = ({ record, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all hover:shadow-xl flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-sky-700 break-all">A/C#: {record.acNumber}</h3>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full whitespace-nowrap ml-2">{record.aircraftModel}</span>
        </div>
        <p className="text-sm text-slate-600 mb-1">Monument#: <span className="font-medium break-all">{record.monumentNumber}</span></p>
        {record.moNumber && <p className="text-sm text-slate-600 mb-1">MO#: <span className="font-medium break-all">{record.moNumber}</span></p>}
        <p className="text-sm text-slate-600">
          Dates: <span className="font-medium">{formatDate(record.startDate)}</span> - <span className="font-medium">{formatDate(record.finishDate)}</span>
        </p>
        {record.pictures.length > 0 && (
          <div className="mt-3 aspect-[16/9]"> {/* Maintain aspect ratio for the image container */}
            <img 
              src={record.pictures[0].dataUrl} 
              alt={record.pictures[0].name || 'Record image'} 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
         <p className="text-xs text-slate-400 mt-3">
          Created: {new Date(record.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="bg-slate-50 px-5 py-3 flex justify-end space-x-2 border-t border-slate-200">
        <button
          onClick={() => onView(record)}
          className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors px-3 py-1 rounded hover:bg-sky-100"
        >
          View Details
        </button>
        <button
          onClick={() => onEdit(record)}
          className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors px-3 py-1 rounded hover:bg-amber-100"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete record for A/C# ${record.acNumber}? This action cannot be undone.`)) {
              onDelete(record.id);
            }
          }}
          className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors px-3 py-1 rounded hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecordCard;