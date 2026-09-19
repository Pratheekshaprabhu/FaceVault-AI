import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/v1";
const MATCH_THRESHOLD = 0.45;

function Recognize() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  /* =====================================================
     STOP CAMERA
  ===================================================== */

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
    setCameraLoading(false);
  };

  /* =====================================================
     CONNECT STREAM AFTER VIDEO IS RENDERED
  ===================================================== */

  useEffect(() => {
    if (
      cameraOpen &&
      videoRef.current &&
      streamRef.current
    ) {
      videoRef.current.srcObject =
        streamRef.current;

      videoRef.current
        .play()
        .catch((err) => {
          console.error(
            "Camera playback error:",
            err
          );
        });
    }
  }, [cameraOpen]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  /* =====================================================
     FILE HANDLER
  ===================================================== */

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");
    setResults([]);

    if (!selectedFile.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5 MB."
      );
      return;
    }

    stopCamera();

    setFile(selectedFile);

    const imageURL =
      URL.createObjectURL(selectedFile);

    setPreview(imageURL);
  };

  /* =====================================================
     FILE INPUT
  ===================================================== */

  const handleInputChange = (event) => {
    handleFile(event.target.files[0]);
  };

  /* =====================================================
     DRAG & DROP
  ===================================================== */

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile =
      event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  /* =====================================================
     REMOVE IMAGE
  ===================================================== */

  const removeImage = () => {
    stopCamera();

    setFile(null);
    setPreview("");
    setResults([]);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /* =====================================================
     OPEN CAMERA
  ===================================================== */

  const openCamera = async () => {
  setError("");
  setResults([]);
  setCameraLoading(true);

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported by this browser.");
    }

    // Release any previous camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    let stream;

    try {
      // First try a good-quality front camera
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
    } catch (firstError) {
      console.warn(
        "Primary camera request failed:",
        firstError.name
      );

      // Fallback: let the browser choose any available camera
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    streamRef.current = stream;
    setCameraOpen(true);

  } catch (err) {
    console.error("Camera error:", err);

    switch (err.name) {
      case "NotAllowedError":
        setError(
          "Camera permission is blocked. Click the camera icon beside the address bar and allow camera access."
        );
        break;

      case "NotFoundError":
        setError(
          "No camera was detected. Check that your webcam is connected and enabled."
        );
        break;

      case "NotReadableError":
        setError(
          "The camera could not be accessed. Close Camera, WhatsApp, Teams, Zoom, Meet, or other apps using the webcam, then try again."
        );
        break;

      case "OverconstrainedError":
        setError(
          "The selected camera does not support the requested settings. Please try again."
        );
        break;

      case "SecurityError":
        setError(
          "Camera access was blocked by browser security settings."
        );
        break;

      default:
        setError(
          `Unable to open the camera (${err.name || "unknown error"}). Please try again.`
        );
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    setCameraOpen(false);
  } finally {
    setCameraLoading(false);
  }
};

  /* =====================================================
     RECOGNIZE FACE
  ===================================================== */

  const recognizeFace = async () => {
    if (!file) {
      setError(
        "Please select or capture an image first."
      );
      return;
    }

    setScanning(true);
    setError("");
    setResults([]);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      const response =
        await axios.post(
          `${API}/recognize`,
          formData
        );

      setResults(
        response.data.results || []
      );

    } catch (err) {
      console.error(
        "Recognition error:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Face recognition failed. Please try another image.";

      setError(message);

    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="recognize-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="recognize-intro">

        <div>

          <span className="page-eyebrow">
            AI IDENTITY VERIFICATION
          </span>

          <h2>
            Recognize a face
          </h2>

          <p>
            Upload an image or capture one using
            your camera. FaceVault detects faces,
            generates SFace embeddings, compares
            them with enrolled identities and
            rejects unknown individuals.
          </p>

        </div>


        <div className="recognize-engine">

          <span className="engine-live-dot"></span>

          <div>
            <strong>
              AI Engine
            </strong>

            <small>
              Online
            </small>
          </div>

        </div>

      </section>


      {/* =================================================
          WORKSPACE
      ================================================= */}

      <section className="recognize-workspace">

        {/* =================================================
            LEFT CARD
        ================================================= */}

        <div className="recognize-upload-card">

          <div className="card-top">

            <div>

              <span className="page-eyebrow">
                STEP 01
              </span>

              <h3>
                Upload or capture
              </h3>

            </div>


            {file && (

              <button
                type="button"
                className="remove-button"
                onClick={removeImage}
              >
                × Remove
              </button>

            )}

          </div>


          {/* HIDDEN CANVAS */}

          <canvas
            ref={canvasRef}
            style={{
              display: "none",
            }}
          />


          {/* =================================================
              CAMERA
          ================================================= */}

          {cameraOpen ? (

            <div className="camera-container">

              <div className="camera-preview-wrapper">

                <video
                  ref={videoRef}
                  className="camera-preview"
                  autoPlay
                  playsInline
                  muted
                />


                <div className="camera-frame">

                  <span className="camera-corner top-left"></span>

                  <span className="camera-corner top-right"></span>

                  <span className="camera-corner bottom-left"></span>

                  <span className="camera-corner bottom-right"></span>

                </div>


                <div className="camera-status">

                  <span className="camera-live-dot"></span>

                  CAMERA ACTIVE

                </div>

              </div>


              <div className="camera-actions">

                <button
                  type="button"
                  className="camera-capture-button"
                  onClick={capturePhoto}
                >
                  ◉ Capture Photo
                </button>


                <button
                  type="button"
                  className="camera-cancel-button"
                  onClick={stopCamera}
                >
                  Cancel
                </button>

              </div>

            </div>

          ) : !preview ? (

            <>
              {/* =================================================
                  UPLOAD
              ================================================= */}

              <div
                className="recognize-dropzone"
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
                onClick={() =>
                  inputRef.current?.click()
                }
              >

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleInputChange}
                  hidden
                />

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Drop your image here
                </h3>

                <p>
                  or click to browse from your computer
                </p>

                <div className="upload-formats">

                  JPG&nbsp; • &nbsp;
                  PNG&nbsp; • &nbsp;
                  WEBP

                  <span>
                    Maximum 5 MB
                  </span>

                </div>

              </div>


              {/* =================================================
                  CAMERA OPTION
              ================================================= */}

              <div className="camera-option">

                <div className="camera-option-line">

                  <span></span>

                  <small>
                    OR
                  </small>

                  <span></span>

                </div>


                <button
                  type="button"
                  className="camera-open-button"
                  onClick={openCamera}
                  disabled={cameraLoading}
                >

                  <span className="camera-icon">
                    ◉
                  </span>

                  {cameraLoading
                    ? "Opening Camera..."
                    : "Use Camera"}

                </button>

              </div>

            </>

          ) : (

            /* =================================================
               PREVIEW
            ================================================= */

            <div className="recognize-preview">

              <img
                src={preview}
                alt="Face recognition preview"
              />


              {scanning && (

                <div className="recognize-scanner">

                  <div className="scanner-line"></div>

                  <div className="scanner-label">

                    <span></span>

                    ANALYZING FACE

                  </div>

                </div>

              )}


              {!scanning &&
                results.length > 0 && (

                  <div className="preview-detected-badge">

                    <span></span>

                    {results.length} face
                    {results.length > 1
                      ? "s"
                      : ""}{" "}
                    detected

                  </div>

                )}

            </div>

          )}


          {/* =================================================
              RETAKE CAMERA
          ================================================= */}

          {preview && !cameraOpen && (

            <button
              type="button"
              className="camera-retake-button"
              onClick={() => {
                removeImage();
                openCamera();
              }}
            >
              ↻ Retake with Camera
            </button>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="recognize-error">

              <span>
                !
              </span>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* =================================================
              ANALYZE BUTTON
          ================================================= */}

          <button
            type="button"
            className="recognize-button"
            disabled={
              !file ||
              scanning ||
              cameraOpen
            }
            onClick={recognizeFace}
          >

            {scanning ? (

              <>
                <span className="button-spinner"></span>

                Analyzing image...
              </>

            ) : (

              <>
                <span>
                  ◎
                </span>

                Analyze & Recognize

                <b>
                  →
                </b>
              </>

            )}

          </button>


          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="recognize-security">

            <span>
              ⌁
            </span>

            <p>
              Your image is processed locally by
              the FaceVault AI pipeline and is not
              stored as an uploaded image.
            </p>

          </div>

        </div>


        {/* =================================================
            RESULTS CARD
        ================================================= */}

        <div className="recognize-result-card">

          <div className="card-top">

            <div>

              <span className="page-eyebrow">
                STEP 02
              </span>

              <h3>
                Recognition result
              </h3>

            </div>


            {results.length > 0 && (

              <span className="result-count">

                {results.length} detection
                {results.length > 1
                  ? "s"
                  : ""}

              </span>

            )}

          </div>


          {scanning ? (

            <ScanningState />

          ) : results.length === 0 ? (

            <EmptyResult />

          ) : (

            <div className="results-list">

              {results.map(
                (result, index) => (

                  <RecognitionResult
                    key={index}
                    result={result}
                    index={index}
                  />

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          PIPELINE
      ================================================= */}

      <section className="recognize-pipeline">

        <div className="pipeline-heading">

          <span className="page-eyebrow">
            AI DECISION PIPELINE
          </span>

          <h3>
            What happens during recognition?
          </h3>

        </div>


        <div className="recognize-steps">

          <RecognizeStep
            number="01"
            title="Detect"
            subtitle="YuNet"
            description="Finds faces and facial landmarks."
          />

          <div className="step-connector">
            →
          </div>

          <RecognizeStep
            number="02"
            title="Embed"
            subtitle="SFace"
            description="Creates a 128-dimensional face embedding."
          />

          <div className="step-connector">
            →
          </div>

          <RecognizeStep
            number="03"
            title="Compare"
            subtitle="Cosine Similarity"
            description="Searches enrolled identities."
          />

          <div className="step-connector">
            →
          </div>

          <RecognizeStep
            number="04"
            title="Decide"
            subtitle="0.45 Threshold"
            description="Identifies or rejects as unknown."
          />

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   RECOGNITION RESULT
   ========================================================= */

function RecognitionResult({
  result,
  index
}) {

  const identified =
    result.status === "identified";

  const score =
    Number(result.score || 0);

  const percentage =
    Math.max(
      0,
      Math.min(score * 100, 100)
    );

  const thresholdPercentage =
    MATCH_THRESHOLD * 100;

  return (
    <div
      className={
        identified
          ? "recognition-result identified-result"
          : "recognition-result unknown-result"
      }
    >

      <div className="result-main">

        <div
          className={
            identified
              ? "result-avatar known-result-avatar"
              : "result-avatar unknown-result-avatar"
          }
        >

          {identified
            ? (result.identity || "P")
                .charAt(0)
                .toUpperCase()
            : "?"}

        </div>


        <div className="result-identity">

          <span>
            FACE{" "}
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </span>

          <h3>
            {result.identity ||
              "Unknown person"}
          </h3>

          <p>
            {identified
              ? "Identity matched against enrolled database"
              : "No enrolled identity passed the match threshold"}
          </p>

        </div>


        <div
          className={
            identified
              ? "decision-badge identified-badge"
              : "decision-badge unknown-badge"
          }
        >

          <span></span>

          {identified
            ? "IDENTIFIED"
            : "UNKNOWN"}

        </div>

      </div>


      <div className="result-similarity">

        <div className="similarity-header">

          <div>

            <span>
              SIMILARITY SCORE
            </span>

            <strong>
              {percentage.toFixed(1)}%
            </strong>

          </div>


          <div className="threshold-label">

            Threshold

            <strong>
              {thresholdPercentage.toFixed(
                0
              )}
              %
            </strong>

          </div>

        </div>


        <div className="large-similarity-track">

          <div
            className={
              identified
                ? "large-similarity-fill known-fill"
                : "large-similarity-fill unknown-fill"
            }
            style={{
              width: `${percentage}%`,
            }}
          ></div>


          <div
            className="threshold-marker"
            style={{
              left: `${thresholdPercentage}%`,
            }}
          >
            <span></span>
          </div>

        </div>


        <div className="similarity-scale">

          <span>
            0.00
          </span>

          <span>
            0.45 threshold
          </span>

          <span>
            1.00
          </span>

        </div>

      </div>


      <div className="decision-explanation">

        <div className="decision-icon">
          {identified ? "✓" : "!"}
        </div>

        <div>

          <strong>
            {identified
              ? "Identity verified"
              : "Identity rejected"}
          </strong>

          <p>

            {identified
              ? `The highest similarity score of ${score.toFixed(
                  4
                )} is above the configured project threshold of ${MATCH_THRESHOLD.toFixed(
                  2
                )}.`
              : `The highest similarity score of ${score.toFixed(
                  4
                )} is below the configured project threshold of ${MATCH_THRESHOLD.toFixed(
                  2
                )}. The face is therefore classified as unknown.`}

          </p>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY RESULT
   ========================================================= */

function EmptyResult() {

  return (
    <div className="recognize-empty">

      <div className="empty-result-icon">
        ◎
      </div>

      <h3>
        Ready for analysis
      </h3>

      <p>
        Upload or capture a face image on the
        left and start recognition to see the
        AI decision here.
      </p>

      <div className="empty-result-tags">

        <span>
          YuNet Detection
        </span>

        <span>
          SFace Embedding
        </span>

        <span>
          Cosine Matching
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   SCANNING STATE
   ========================================================= */

function ScanningState() {

  return (
    <div className="scanning-state">

      <div className="scanning-visual">

        <div className="scanning-ring ring-one"></div>

        <div className="scanning-ring ring-two"></div>

        <div className="scanning-center">
          ◎
        </div>

      </div>

      <h3>
        Analyzing face...
      </h3>

      <p>
        Detecting facial features and comparing
        biometric embeddings.
      </p>

      <div className="analysis-status">

        <span className="status-active">
          ●
        </span>

        AI engine processing

      </div>

    </div>
  );
}


/* =========================================================
   PIPELINE STEP
   ========================================================= */

function RecognizeStep({
  number,
  title,
  subtitle,
  description
}) {

  return (
    <div className="recognize-step">

      <div className="recognize-step-number">
        {number}
      </div>

      <div>

        <h4>
          {title}
        </h4>

        <span>
          {subtitle}
        </span>

        <p>
          {description}
        </p>

      </div>

    </div>
  );
}


export default Recognize;