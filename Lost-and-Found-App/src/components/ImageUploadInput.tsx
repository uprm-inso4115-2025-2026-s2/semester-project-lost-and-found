import React, { useRef, useState } from "react";
import "./ImageUploadInput.css";
import { supabase } from "../supabaseClient.ts";

const ACCEPTED_FORMATS = [".jpg", ".jpeg", ".png", ".gif"];

// Formats considered valid for item images
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif"
  
]);

const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .gif";

export interface ImageUploadInputProps {
  /**
   * Called when the user picks a valid image file.
   *
   * TODO (backend): replace the `previewUrl` parameter with a real upload
   * call to Supabase Storage and pass back the resulting public URL instead.
   * The `file` parameter is the raw File object ready to be uploaded.
   */
  onValidFile?: (url: string) => void;

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

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    
    if (!file) {
      setState({ kind: "idle" });
      return;
    }

   
    const isValidExtension = /\.(jpg|jpeg|png|gif)$/i.test(file.name);

    if (!ACCEPTED_MIME_TYPES.has(file.type) || !isValidExtension) {
      setState({ kind: "invalid", fileName: file.name });
      setShowPopup(true);
      // Reset the native input so the same invalid file can be re-selected
      // after the user dismisses the error and tries again.
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    try{
      const fileName = `${Date.now()}-${file.name}`;
      
      const { error } = await supabase.storage.from("ReportImages").upload(fileName,file);
      //console.log(error);

      if(error){
        throw error;
      }
     const { data } = supabase.storage.from("ReportImages").getPublicUrl(fileName);
     //console.log("UPLOAD ERROR:", error);
     //console.log("URL ERROR:", error);

     
     setState({ kind: "valid", previewUrl, fileName: file.name });

    // TODO (backend): upload `file` to Supabase Storage here and pass the
    // returned public URL to `onValidFile` instead of the local blob URL.
     onValidFile?.(data.publicUrl);


    }

    catch(err){
      console.error(err);

      setState({ kind: "upload-error", fileName: file.name});
    }

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
              <span className="imageUpload__icon">🖼️</span>
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
            <span>⚠️</span>
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
            <span>⚠️</span>
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
              ✕
            </button>

            {/* Icon */}
            <div className="imageUpload__popupIconWrap">
              <span className="imageUpload__popupBigIcon">⚠️</span>
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
