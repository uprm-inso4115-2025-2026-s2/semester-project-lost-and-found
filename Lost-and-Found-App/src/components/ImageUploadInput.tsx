import React, { useRef, useState } from "react";
import "./ImageUploadInput.css";
import imageIcon from "../assets/icons/image.svg";
import warningIcon from "../assets/icons/warning.svg";
import closeIcon from "../assets/icons/close.svg";


const ACCEPTED_FORMATS = [ ".jpeg", ".png"];

// Formats considered valid for item images
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  
  
]);

const ACCEPTED_EXTENSIONS = ".jpeg,.png,";

export interface ImageUploadInputProps {
  
  onValidFile?: (file: File) => void;

  /** Called when the selection is cleared. */
  onClear?: () => void;
}

type UploadState =
  | { kind: "idle" }
  | { kind: "invalid"; fileName: string }
  | { kind: "upload-error" ; fileName : string}
  | { kind: "valid"; previewUrl: string; fileName: string };

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  onValidFile,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [showPopup, setShowPopup] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    
    if (!file) {
      return;
    }

   
    const isValidExtension = /\.(jpeg|png)$/i.test(file.name);

    if (!ACCEPTED_MIME_TYPES.has(file.type) || !isValidExtension) {
      setState({ kind: "invalid", fileName: file.name });
      setShowPopup(true);
      // Reset the native input so the same invalid file can be re-selected
      // after the user dismisses the error and tries again.
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    
     //console.log("UPLOAD ERROR:", error);
     //console.log("URL ERROR:", error);

     
     setState({ kind: "valid", previewUrl, fileName: file.name });

    
     onValidFile?.(file);


    }

    

  

  function handleClear() {
    if (state.kind === "valid") {
      URL.revokeObjectURL(state.previewUrl);
    }
    setState({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <>
      <div className="imageUpload">
        {/* ── Drop zone / trigger ── */}
        <label className="imageUpload__zone" data-state={state.kind}>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="imageUpload__nativeInput"
            onChange={handleChange}
            aria-label="Upload item image"
          />

          {state.kind === "valid" ? (
            <img
              src={state.previewUrl}
              alt="Selected preview"
              className="imageUpload__preview"
            />
          ) : (
            <div className="imageUpload__placeholder">
              <img src={imageIcon} alt="upload" className="imageUpload__iconImg" />
              <span className="imageUpload__hint">
                {state.kind === "invalid"
                  ? "Try again with a supported format"
                  : "Click to upload an image"}
              </span>
              <span className="imageUpload__formats">{ACCEPTED_EXTENSIONS}</span>
            </div>
          )}
        </label>

        {/* ── Inline strip shown after popup is dismissed ── */}
        {state.kind === "invalid" && !showPopup && (
          <div className="imageUpload__errorStrip" role="alert">
            <img src={warningIcon} alt="warning" style={{width:18,height:18}} />
            <span>
              <strong>{state.fileName}</strong> is not a supported format.
            </span>
            <button
              type="button"
              className="imageUpload__stripRetry"
              onClick={() => setState({ kind: "idle" })}
            >
              Dismiss
            </button>
          </div>
        )}

        {state.kind === "upload-error" && (
          <div className="imageUpload__errorStrip" role="alert">
            <img src={warningIcon} alt="warning" style={{width:18,height:18}} />
            <span>Failed to upload <strong>{state.fileName}</strong>. Try again.</span>
          </div>
        )}

        {/* ── Clear button (shown when a valid file is loaded) ── */}
        {state.kind === "valid" && (
          <div className="imageUpload__actions">
            <span className="imageUpload__fileName">{state.fileName}</span>
            <button
              type="button"
              className="imageUpload__clearBtn"
              onClick={handleClear}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* ── Invalid-format popup ── */}
      {showPopup && state.kind === "invalid" && (
        <div
          className="imageUpload__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="imgErr-title"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="imageUpload__popup"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close (X) button */}
            <button
              type="button"
              className="imageUpload__popupClose"
              onClick={() => setShowPopup(false)}
              aria-label="Dismiss"
            >
              <img src={closeIcon} alt="close" style={{width:14,height:14}} />
            </button>

            {/* Icon */}
            <div className="imageUpload__popupIconWrap">
              <img src={warningIcon} alt="warning" className="imageUpload__popupBigIconImg" />
            </div>

            {/* Text */}
            <h3 id="imgErr-title" className="imageUpload__popupTitle">
              Unsupported File Format
            </h3>
            <p className="imageUpload__popupFile">"{state.fileName}"</p>
            <p className="imageUpload__popupBody">
              This file type cannot be uploaded. Please choose one of the
              supported formats:
            </p>

            {/* Format pills */}
            <div className="imageUpload__popupFormats">
              {ACCEPTED_FORMATS.map((fmt) => (
                <span key={fmt} className="imageUpload__formatPill">
                  {fmt}
                </span>
              ))}
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              className="imageUpload__popupBtn"
              onClick={() => setShowPopup(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
