import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import Papa from "papaparse";

export interface CsvUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onUpload: (data: any[]) => Promise<void>;
  requiredColumns: string[];
}

export function CsvUploadModal({ open, onOpenChange, title, onUpload, requiredColumns }: CsvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      setError("Please select a valid CSV file.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const missing = requiredColumns.filter(c => !headers.includes(c));
        
        if (missing.length > 0) {
          setError(`Missing required columns: ${missing.join(", ")}`);
          setParsedData([]);
          return;
        }

        setParsedData(results.data);
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(parsedData);
      toast.success(`Successfully imported ${parsedData.length} records`);
      handleOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!file ? (
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Click to select a CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">Required columns: {requiredColumns.join(", ")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <FileText className="size-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={reset} disabled={isUploading}>
                  Remove
                </Button>
              </div>
              
              {error ? (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-success/10 text-success rounded-lg text-sm">
                  <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                  <p>Ready to import {parsedData.length} records</p>
                </div>
              )}
            </div>
          )}
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || !!error || isUploading || parsedData.length === 0}>
            {isUploading ? "Importing..." : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
