import React, { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { supabase } from '../lib/supabase';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentFile: {
    file_name: string;
    file_url: string;
    type: string;
  };
  bucketName: 'job-documents' | 'student-documents';
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ isOpen, onClose, documentFile, bucketName }) => {
  const [downloading, setDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get preview URL when component mounts or document changes
  useEffect(() => {
    const loadPreviewUrl = async () => {
      try {
        if (!isOpen || !documentFile.file_url) return;

        // Get signed URL for preview
        const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(documentFile.file_url, 3600); // 1 hour expiry

        if (signedUrlError) throw signedUrlError;
        if (!signedUrl) throw new Error('Failed to get preview URL');

        setPreviewUrl(signedUrl);
        setError(null);
      } catch (err) {
        console.error('Error getting preview URL:', err);
        setError('Failed to load preview. Please try again later.');
        setPreviewUrl(null);
      }
    }

    loadPreviewUrl();

    // Cleanup on unmount
    return () => {
      setPreviewUrl(null);
      setError(null);
    };
  }, [isOpen, documentFile.file_url, bucketName]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      // Get signed URL for download
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(documentFile.file_url, 300); // 5 minutes expiry

      if (signedUrlError) throw signedUrlError;
      if (!signedUrl) throw new Error('Failed to get download URL');

      const response = await fetch(signedUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const link = document.createElement('a');
      const downloadUrl = URL.createObjectURL(blob);

      try {
        link.href = downloadUrl;
        link.download = documentFile.file_name;
        window.document.body.appendChild(link);
        link.click();
      } finally {
        window.document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err instanceof Error ? err.message : 'Failed to download file. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const isPDF = documentFile.file_name.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(documentFile.file_name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">{documentFile.type}</h3>
            <p className="text-sm text-gray-500">{documentFile.file_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-2 text-gray-600 hover:text-blue-500 disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border-b">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="relative bg-gray-100" style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {previewUrl && (
            isPDF ? (
              <div className="flex flex-col items-center py-4">
                <Document
                  file={previewUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <div key={`page_${index + 1}`} className="mb-4">
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        width={Math.min(window.innerWidth - 100, 800)}
                      />
                    </div>
                  ))}
                </Document>
              </div>
            ) : isImage ? (
              <img
                src={previewUrl}
                alt={document.file_name}
                className="max-w-full max-h-full object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Preview not available for this file type
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};