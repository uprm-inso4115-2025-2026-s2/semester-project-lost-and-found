import React, { useRef, useState } from "react";
import "./ImageUploadInput.css";

// Formats considered valid for item images
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .gif";

export interface ImageUploadInputProps {
  /**
   * Called when the user picks a valid image file.
   *
   * TODO (backend): replace the `previewUrl` parameter with a real upload
   * call to Supabase Storage and pass back the resulting public URL instead.
   * The `file` parameter is the raw File object ready to be uploaded.
   */
  onValidFile: (file: File, previewUrl: string) => void;

  /** Called when the selection is cleared. */
  onClear?: () => void;
}

type UploadState =
  | { kind: "idle" }
  | { kind: "invalid"; fileName: string }
  | { kind: "valid"; previewUrl: string; fileName: string };

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  onValidFile,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setState({ kind: "idle" });
      return;
    }

    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      setState({ kind: "invalid", fileName: file.name });
      // Reset the native input so the same invalid file can be re-selected
      // after the user dismisses the error and tries again.
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setState({ kind: "valid", previewUrl, fileName: file.name });

    // TODO (backend): upload `file` to Supabase Storage here and pass the
    // returned public URL to `onValidFile` instead of the local blob URL.
    onValidFile(file, previewUrl);
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
              Click to upload an image
            </span>
            <span className="imageUpload__formats">
              {ACCEPTED_EXTENSIONS}
            </span>
          </div>
        )}
      </label>

      {/* ── Error state ── */}
      {state.kind === "invalid" && (
        <div className="imageUpload__error" role="alert">
          <span className="imageUpload__errorIcon">⚠️</span>
          <div className="imageUpload__errorBody">
            <p className="imageUpload__errorTitle">Unsupported file format</p>
            <p className="imageUpload__errorSub">
              <strong>{state.fileName}</strong> is not a supported image type.
              Please upload a {ACCEPTED_EXTENSIONS} file.
            </p>
          </div>
          {/* TODO (UI): replace this text-based error with the designed
              error image/graphic from the poll-winner style guide once
              the asset is ready. */}
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
  );
};
