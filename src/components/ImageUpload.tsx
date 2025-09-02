import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Plus, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadImageToStorage, UploadedImage } from "@/lib/imageUpload";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  uploadedImages?: UploadedImage[];
  onUploadedImagesChange?: (images: UploadedImage[]) => void;
  maxImages?: number;
  autoUpload?: boolean;
}

export const ImageUpload = ({ 
  images, 
  onImagesChange, 
  uploadedImages = [], 
  onUploadedImagesChange,
  maxImages = 30,
  autoUpload = false 
}: ImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const newImages: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const totalCount = images.length + uploadedImages.length;

    Array.from(files).forEach((file) => {
      if (allowedTypes.includes(file.type)) {
        if (totalCount + newImages.length < maxImages) {
          newImages.push(file);
        }
      }
    });

    if (newImages.length > 0) {
      console.log('New images selected:', newImages.length);
      onImagesChange([...images, ...newImages]);
      
      // Auto-upload if enabled
      if (autoUpload && onUploadedImagesChange) {
        console.log('Auto-upload enabled, starting upload...');
        await uploadImages(newImages);
      } else {
        console.log('Auto-upload disabled or no onUploadedImagesChange callback');
        console.log('autoUpload:', autoUpload, 'onUploadedImagesChange:', !!onUploadedImagesChange);
      }
    }
  };

  const uploadImages = async (filesToUpload: File[] = images) => {
    if (filesToUpload.length === 0) return;
    
    setUploading(true);
    const newUploadProgress = { ...uploadProgress };
    
    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const fileKey = `${file.name}-${index}`;
        newUploadProgress[fileKey] = false;
        setUploadProgress({ ...newUploadProgress });
        
        try {
          const result = await uploadImageToStorage(file);
          newUploadProgress[fileKey] = true;
          setUploadProgress({ ...newUploadProgress });
          return result;
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as UploadedImage[];
      
      if (successfulUploads.length > 0) {
        onUploadedImagesChange && onUploadedImagesChange([...uploadedImages, ...successfulUploads]);
        // Remove uploaded files from the images array
        const uploadedFileNames = filesToUpload.map(f => f.name);
        const remainingImages = images.filter(img => !uploadedFileNames.includes(img.name));
        onImagesChange(remainingImages);
        
        toast({
          title: "Upload Successful",
          description: `${successfulUploads.length} image(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Something went wrong during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number, isUploaded: boolean = false) => {
    if (isUploaded) {
      const newUploadedImages = uploadedImages.filter((_, i) => i !== index);
      onUploadedImagesChange && onUploadedImagesChange(newUploadedImages);
    } else {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Apartment Images</label>
        <p className="text-xs text-muted-foreground mt-1">
          Upload up to {maxImages} images (JPG, PNG, WebP). Drag and drop or click to browse.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {images.length === 0 ? "Upload Images" : "Add More Images"}
            </p>
            <p className="text-xs text-muted-foreground">
              {images.length === 0 
                ? "Drag and drop images here, or click to browse"
                : `${images.length}/${maxImages} images uploaded`
              }
            </p>
          </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={images.length + uploadedImages.length >= maxImages}
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              {!autoUpload && images.length > 0 && onUploadedImagesChange && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => uploadImages()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Images
                </Button>
              )}
            </div>
        </div>
      </div>

      {/* Image Preview Grid */}
      {(images.length > 0 || uploadedImages.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Images ({images.length + uploadedImages.length}/{maxImages})
            </h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onImagesChange([]);
                onUploadedImagesChange && onUploadedImagesChange([]);
              }}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Show uploaded images first */}
            {uploadedImages.map((image, index) => (
              <Card key={`uploaded-${index}`} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 left-2">
                      <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeImage(index, true)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Show pending images */}
            {images.map((image, index) => {
              const fileKey = `${image.name}-${index}`;
              const isUploading = uploadProgress[fileKey] === false && uploading;
              const isUploaded = uploadProgress[fileKey] === true;
              
              return (
                <Card key={`pending-${index}`} className="relative group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Pending image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      
                      {isUploaded && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        onClick={() => removeImage(index, false)}
                        disabled={isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}; 