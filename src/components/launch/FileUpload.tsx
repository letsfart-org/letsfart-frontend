import { useState, useRef, useEffect } from "react";

export const FileUpload = ({
  value,
  onChange,
  onBlur,
  ref
}: {
  value?: File;
  onChange: (file?: File) => void;
  onBlur: () => void;
  ref: React.Ref<HTMLInputElement>;
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 合并外部ref和内部ref
  const handleRef = (node: HTMLInputElement) => {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement>).current = node;
    }
    fileInputRef.current = node;
  };

  // 生成预览URL
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      
      // 清理函数
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file);
  };

  const handleClear = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          onBlur={onBlur}
          ref={handleRef}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm font-medium border rounded-md bg-background hover:bg-accent"
        >
          Browse Images
        </button>
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-sm text-destructive hover:bg-destructive/10 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">Preview:</p>
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Token logo preview"
              className="object-contain border rounded"
              style={{ 
                maxWidth: "70px", 
                maxHeight: "70px" 
              }}
            />
            <p className="text-xs text-muted-foreground">
              {value?.name}
              <br />
              {(value?.size ? (value.size / 1024).toFixed(2) : 0)} KB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
