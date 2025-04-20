import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Plus } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  maxFiles?: number;
  title?: string;
  description?: string;
}

const ImageUploader = ({
  onImageUpload,
  maxFiles = 5,
  title = "Upload Images",
  description = "Drag & drop images here or click to browse"
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(Array.from(droppedFiles));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(Array.from(selectedFiles));
    }
  };
  
  const handleFiles = (newFiles: File[]) => {
    // Filter for image files
    const imageFiles = newFiles.filter(file => 
      file.type.startsWith('image/')
    );
    
    // Limit to max files
    const combinedFiles = [...files, ...imageFiles].slice(0, maxFiles);
    setFiles(combinedFiles);
    
    // Create previews
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    
    // Revoke old URLs to prevent memory leaks
    if (previews.length > 0) {
      previews.forEach(url => URL.revokeObjectURL(url));
    }
    
    setPreviews(newPreviews);
    onImageUpload(combinedFiles);
  };
  
  const removeFile = (index: number) => {
    // Revoke the URL
    URL.revokeObjectURL(previews[index]);
    
    // Remove the file and preview
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    
    const updatedPreviews = [...previews];
    updatedPreviews.splice(index, 1);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onImageUpload(updatedFiles);
  };
  
  const clearAll = () => {
    // Revoke all URLs
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageUpload([]);
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 
            ${isDragging ? 'border-primary bg-primary/10' : 'hover:border-primary/50 hover:bg-muted/20'} 
            ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <div className="mb-4 p-3 bg-primary/10 rounded-full animate-pulse">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <p className="text-xs text-muted-foreground">
              {files.length === 0 
                ? `Maximum ${maxFiles} images, up to 5MB each` 
                : `${files.length} of ${maxFiles} images selected`}
            </p>
          </div>
        </div>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>
      
      {/* Preview Section */}
      {previews.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Selected Images</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div 
                key={index} 
                className="relative aspect-square group transition-all duration-300 hover:shadow-md rounded-lg overflow-hidden border animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img 
                  src={preview} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="bg-primary text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    {files[index].name.length > 20 
                      ? files[index].name.substring(0, 20) + "..." 
                      : files[index].name}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add more button if not at max */}
            {files.length < maxFiles && (
              <button 
                onClick={() => inputRef.current?.click()}
                className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary/70 animate-fade-in"
              >
                <div className="flex flex-col items-center p-4">
                  <ImageIcon className="h-6 w-6 mb-2" />
                  <span className="text-xs font-medium">Add More</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
