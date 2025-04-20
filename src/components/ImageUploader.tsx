import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
  title: string;
  description: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
  multiple?: boolean;
}

const ImageUploader = ({
  onImageUpload,
  title,
  description,
  acceptedTypes = "image/jpeg, image/png, image/jpg",
  maxSizeMB = 5,
  multiple = true
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
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
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const filesArray = multiple ? Array.from(files) : [files[0]];
      validateAndUpload(filesArray);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = multiple ? Array.from(files) : [files[0]];
      validateAndUpload(filesArray);
    }
  };
  
  const validateAndUpload = (files: File[]) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [...previews];
    
    // Process each file
    files.forEach(file => {
      // Get file extension from name as backup
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isValidType = 
        file.type.includes('jpeg') || 
        file.type.includes('jpg') || 
        file.type.includes('png') || 
        fileExt === 'jpg' || 
        fileExt === 'jpeg' || 
        fileExt === 'png';
      
      // Check valid file types with more robust matching
      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}. Please upload jpeg, png, or jpg`);
        return;
      }
      
      // Check file size
      if (file.size > maxSizeBytes) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
      
      validFiles.push(file);
    });
    
    // Call the upload handler if we have valid files
    if (validFiles.length > 0) {
      onImageUpload(validFiles);
    }
  };
  
  const clearImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    // Reset input if all images are cleared
    if (newPreviews.length === 0 && inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  const clearAllImages = () => {
    setPreviews([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full">
      {previews.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden border border-border">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-48 object-cover bg-black/5"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => clearImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {/* Add more images button */}
            <div
              className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer h-48 hover:border-primary/50 hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
            >
              <Plus className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Add more photos</p>
            </div>
          </div>
          
          {/* Clear all button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllImages}
            className="mt-2"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              {description}
            </p>
            <Button className="mt-4" size="sm" variant="secondary">
              <Upload className="mr-2 h-4 w-4" />
              {multiple ? "Choose Files" : "Choose File"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              jpeg, png, jpg up to {maxSizeMB}MB
            </p>
          </div>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/jpg"
            multiple={multiple}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
