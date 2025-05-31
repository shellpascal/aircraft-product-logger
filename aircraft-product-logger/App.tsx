
import React, { useState, useEffect, useCallback } from 'react';
import { AircraftRecord, Picture } from './types';
import { RecordForm } from './components/RecordForm';
import { RecordCard } from './components/RecordCard';
import { RecordDetailModal } from './components/RecordDetailModal';
import { addRecord, getAllRecords, updateRecord, deleteRecord } from './services/db';

const App: React.FC = () => {
  const [records, setRecords] = useState<AircraftRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AircraftRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<AircraftRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRecords = await getAllRecords();
      setRecords(fetchedRecords);
    } catch (err) {
      console.error(err);
      setError('Failed to load records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleFormSubmit = async (formData: Omit<AircraftRecord, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingRecord) {
        const updatedRecord: AircraftRecord = { ...editingRecord, ...formData };
        await updateRecord(updatedRecord);
      } else {
        const newRecord: AircraftRecord = {
          ...formData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        };
        await addRecord(newRecord);
      }
      await fetchRecords(); // Refetch to get sorted and updated list
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${editingRecord ? 'update' : 'add'} record. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record: AircraftRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setError(null);
    // Confirmation is handled in RecordCard, but good to have a safeguard if called directly
    // if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await deleteRecord(id);
        await fetchRecords();
      } catch (err) {
        console.error(err);
        setError('Failed to delete record. Please try again.');
      }
    // }
  };
  
  const handleViewDetails = (record: AircraftRecord) => {
    setViewingRecord(record);
  };

  const filteredRecords = records.filter(record => 
    record.acNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.monumentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.moNumber && record.moNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <header className="bg-sky-700 text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Aircraft Product Logger</h1>
          <button
            onClick={() => { setEditingRecord(null); setIsFormOpen(true); }}
            className="mt-3 sm:mt-0 bg-white text-sky-700 px-4 py-2 rounded-md shadow hover:bg-sky-100 transition-colors font-semibold flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Record
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-700">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="mb-6 bg-white p-4 rounded-lg shadow sticky top-[calc(4rem+1px)] sm:top-[calc(4.5rem+1px)] z-30"> {/* Adjust top based on header height */}
          <input 
            type="text"
            placeholder="Search by A/C#, Monument#, or MO#..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <SpinnerIcon className="w-12 h-12 text-sky-600 animate-spin" />
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onView={handleViewDetails}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentMagnifyingGlassIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-600">No Records Found</h2>
            <p className="text-slate-500">
              {searchTerm ? "Try adjusting your search terms." : "Get started by adding a new record."}
            </p>
          </div>
        )}
      </main>

      {isFormOpen && (
        <RecordForm
          onSubmit={handleFormSubmit}
          onCancel={() => { setIsFormOpen(false); setEditingRecord(null); }}
          initialData={editingRecord}
          isSubmitting={isSubmitting}
        />
      )}

      {viewingRecord && (
        <RecordDetailModal 
          record={viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}
      
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-200 mt-auto">
        © {new Date().getFullYear()} Aircraft Product Logger. All rights reserved.
      </footer>
    </div>
  );
};


const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const DocumentMagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default App;