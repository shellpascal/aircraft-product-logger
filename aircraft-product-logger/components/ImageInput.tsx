
import React, { useState, useRef, useCallback } from 'react';
import { Picture } from '../types';

interface ImageInputProps {
  pictures: Picture[];
  onPicturesChange: (pictures: Picture[]) => void;
  maxFiles?: number;
}

const fileToPicture = (file: File): Promise<Picture> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: event.target?.result as string,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const ImageInput: React.FC<ImageInputProps> = ({ pictures, onPicturesChange, maxFiles = 5 }) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
      if (pictures.length + files.length > maxFiles) {
        setError(`Cannot upload more than ${maxFiles} images.`);
        // Clear the file input so the same file can be selected again if user tries after removing some
        if(fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const newPicturesPromises: Promise<Picture>[] = [];
      for (let i = 0; i < files.length; i++) {
        newPicturesPromises.push(fileToPicture(files[i]));
      }
      
      try {
        const newPictures = await Promise.all(newPicturesPromises);
        onPicturesChange([...pictures, ...newPictures]);
      } catch (err) {
        console.error("Error processing files:", err);
        setError("Error processing images. Please try again.");
      }
      if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    }
  }, [pictures, onPicturesChange, maxFiles]);

  const removePicture = (id: string) => {
    onPicturesChange(pictures.filter(p => p.id !== id));
    setError(null); // Clear error if user makes space
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Pictures</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
        >
          <CameraIcon className="w-5 h-5 mr-2 text-slate-500" />
          Add Pictures (Max {maxFiles})
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          capture="environment" // Prioritize camera on mobile
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {pictures.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {pictures.map((pic) => (
            <div key={pic.id} className="relative group aspect-square">
              <img src={pic.dataUrl} alt={pic.name || 'Uploaded image'} className="w-full h-full object-cover rounded-md shadow-md" />
              <button
                type="button"
                onClick={() => removePicture(pic.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-75 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
  </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ImageInput;