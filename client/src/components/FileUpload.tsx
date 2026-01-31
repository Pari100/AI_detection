import { useCallback, useState } from 'react';
import { Upload, Music, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (base64: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.includes('audio') && !file.name.endsWith('.mp3')) {
      setError('Please upload an MP3 file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/mp3;base64,")
      const base64Content = base64String.split(',')[1];
      onFileSelect(base64Content);
    };
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile, disabled]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearFile = () => {
    setFileName(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!fileName ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-2xl p-8 md:p-12
              transition-all duration-300 ease-out
              flex flex-col items-center justify-center text-center gap-4
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-white/10 hover:border-primary/50 hover:bg-white/[0.02]'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              type="file"
              accept=".mp3,audio/mpeg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={disabled}
            />
            
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              bg-gradient-to-tr from-white/5 to-white/10 group-hover:from-primary/20 group-hover:to-purple-500/20
              transition-colors duration-300
            `}>
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground">
                Drop your audio file here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports MP3 (Max 5MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-white/10 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">Ready for analysis</p>
              </div>
            </div>
            <button 
              onClick={clearFile}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
