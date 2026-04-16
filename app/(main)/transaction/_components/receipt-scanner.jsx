"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ReceiptScanner({ onDataExtracted, categories }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or PDF file");
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }

    // Show preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to scan receipt");
      }

      const data = await response.json();
      setExtractedData(data);
      toast.success("Receipt scanned successfully!");

      // Call the callback to populate form
      onDataExtracted(data, categories);
    } catch (error) {
      toast.error(error.message);
      setExtractedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={handleInputChange}
          disabled={loading}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          {loading ? (
            <>
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600">
                Scanning receipt...
              </p>
            </>
          ) : extractedData ? (
            <>
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm font-medium text-green-600">
                Receipt scanned successfully
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Upload Receipt
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Drag and drop or click to select (JPG, PNG, or PDF)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Receipt preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Extracted Data Summary */}
      {extractedData && (
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {extractedData.vendor}
                </p>
                <p className="text-xs text-gray-500">{extractedData.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {extractedData.currency} {extractedData.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-green-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Items:</p>
              <div className="space-y-1">
                {extractedData.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="text-xs text-gray-600 flex justify-between">
                    <span>{item.name}</span>
                    <span>
                      {item.quantity}x {extractedData.currency}
                      {item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
                {extractedData.items.length > 3 && (
                  <p className="text-xs text-gray-500 italic">
                    +{extractedData.items.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-green-200">
              <p className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full inline-block">
                {extractedData.category}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Retry Button */}
      {extractedData && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setExtractedData(null);
            setPreview(null);
            fileInputRef.current?.click();
          }}
          className="w-full"
        >
          Scan Different Receipt
        </Button>
      )}
    </div>
  );
}
