import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API =  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/v1";

function Enroll() {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  // ==========================================
  // STOP CAMERA
  // ==========================================

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

  // ==========================================
  // CLEANUP CAMERA WHEN LEAVING PAGE
  // ==========================================

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // ==========================================
// ATTACH CAMERA STREAM TO VIDEO
// ==========================================

useEffect(() => {
  if (!cameraOpen) return;

  const video = videoRef.current;
  const stream = streamRef.current;

  if (!video || !stream) return;

  video.srcObject = stream;

  const playVideo = async () => {
    try {
      await video.play();
      console.log("Camera preview started successfully");
    } catch (error) {
      console.error("Camera preview error:", error);
    }
  };

  video.onloadedmetadata = playVideo;

  // In case metadata has already loaded
  if (video.readyState >= 2) {
    playVideo();
  }

  return () => {
    video.onloadedmetadata = null;
  };
}, [cameraOpen]);

  // ==========================================
  // SELECT IMAGE
  // ==========================================

  const selectFile = (selectedFile) => {
    setMessage("");
    setError("");

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG and PNG images are allowed.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    stopCamera();

    setFile(selectedFile);

    const imageURL = URL.createObjectURL(selectedFile);
    setPreview(imageURL);
  };

  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  // ==========================================
  // DRAG & DROP
  // ==========================================

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    selectFile(droppedFile);
  };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeFile = () => {
    setFile(null);
    setPreview(null);

    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================
  // OPEN CAMERA
  // ==========================================

  const openCamera = async () => {
  setError("");
  setMessage("");
  setCameraLoading(true);

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera is not supported by this browser.");
    }

    // Stop previous stream if one exists
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    let stream;

    try {
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

      // Fallback camera request
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
          "No camera was detected on this device."
        );
        break;

      case "NotReadableError":
        setError(
          "The camera could not be accessed. Close other apps using the webcam and try again."
        );
        break;

      case "OverconstrainedError":
        setError(
          "The camera does not support the requested settings. Please try again."
        );
        break;

      case "SecurityError":
        setError(
          "Camera access was blocked by browser security settings."
        );
        break;

      default:
        setError(
          `Unable to open the camera (${err.name || "unknown error"}).`
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

  // ==========================================
  // CAPTURE PHOTO
  // ==========================================

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Camera is not ready.");
      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setError(
        "Camera is still loading. Please wait a moment."
      );
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture photo.");
      return;
    }

    /*
     * Mirror the captured image because the
     * front camera preview is mirrored.
     */
    context.save();

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Unable to capture photo.");
          return;
        }

        const capturedFile = new File(
          [blob],
          `camera-enrollment-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setFile(capturedFile);

        const imageURL =
          URL.createObjectURL(capturedFile);

        setPreview(imageURL);

        setError("");
        setMessage("");

        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  // ==========================================
  // ENROLL FACE
  // ==========================================

  const handleEnroll = async () => {
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError(
        "Please enter the person's name."
      );
      return;
    }

    if (!file) {
      setError(
        "Please select or capture a face image."
      );
      return;
    }

    const formData = new FormData();

    formData.append(
      "name",
      name.trim()
    );

    formData.append(
      "file",
      file
    );

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/enroll`,
        formData
      );

      if (response.data.success) {
        setMessage(
          `Face enrolled successfully for ${response.data.name}.`
        );

        setName("");

        removeFile();
      }

    } catch (err) {
      console.error(
        "Enrollment error:",
        err
      );

      const detail =
        err.response?.data?.detail ||
        "Unable to enroll the face. Please try again.";

      setError(detail);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="enroll-page">

      {/* =====================================
          INTRO
      ====================================== */}

      <div className="enroll-intro">

        <div>

          <span className="page-kicker">
            IDENTITY MANAGEMENT
          </span>

          <h2>
            Enroll a new face
          </h2>

          <p>
            Add a person to the FaceVault recognition
            database. For best results, use a clear
            image with one visible face.
          </p>

        </div>

        <div className="secure-badge">
          <span>●</span>
          Biometric processing
        </div>

      </div>


      <div className="enroll-layout">

        {/* ===================================
            LEFT SIDE
        ==================================== */}

        <div className="enroll-card">

          {/* PERSON INFORMATION */}

          <div className="card-header">

            <div>

              <span className="step-label">
                STEP 01
              </span>

              <h3>
                Person information
              </h3>

            </div>

            <div className="step-number">
              01
            </div>

          </div>


          <label className="field-label">
            Full name
          </label>

          <input
            type="text"
            className="name-input"
            placeholder="Enter person's name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
              setMessage("");
            }}
          />


          <div className="input-hint">
            This name will be associated with the
            face embedding.
          </div>


          <div className="card-divider"></div>


          {/* FACE IMAGE */}

          <div className="card-header upload-header">

            <div>

              <span className="step-label">
                STEP 02
              </span>

              <h3>
                Face image
              </h3>

            </div>

            <div className="file-limit">
              MAX 5 MB
            </div>

          </div>


          {/* =================================
              CAMERA CANVAS
          ================================== */}

          <canvas
            ref={canvasRef}
            style={{
              display: "none",
            }}
          />


          {/* =================================
              CAMERA VIEW
          ================================== */}

          {cameraOpen ? (

            <div className="camera-container">

              <div className="camera-preview-wrapper">

                <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  width="100%"
  height="420"
  style={{
    width: "100%",
    height: "420px",
    display: "block",
    visibility: "visible",
    opacity: 1,
    objectFit: "cover",
    backgroundColor: "#050814",
    borderRadius: "16px",
  }}
/>

                {/* FACE FRAME */}

                <div className="camera-frame">

                  <span className="camera-corner top-left"></span>

                  <span className="camera-corner top-right"></span>

                  <span className="camera-corner bottom-left"></span>

                  <span className="camera-corner bottom-right"></span>

                </div>


                {/* CAMERA STATUS */}

                <div className="camera-status">

                  <span className="camera-live-dot"></span>

                  CAMERA ACTIVE

                </div>

              </div>


              {/* CAMERA BUTTONS */}

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
              {/* ===============================
                  UPLOAD AREA
              ================================ */}

              <div
                className={`upload-zone ${
                  dragging
                    ? "dragging"
                    : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <div className="upload-icon">
                  ↑
                </div>

                <h4>
                  Drop your face image here
                </h4>

                <p>
                  or click to browse from your computer
                </p>

                <div className="upload-formats">
                  JPG &nbsp;•&nbsp; PNG
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  hidden
                  onChange={handleFileChange}
                />

              </div>


              {/* ===============================
                  CAMERA OPTION
              ================================ */}

              <div className="camera-option">

                <div className="camera-option-line">
                  <span></span>
                  OR
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

            /* =================================
               IMAGE PREVIEW
            ================================== */

            <div className="preview-container">

              <div className="preview-image-wrapper">

                <img
                  src={preview}
                  alt="Selected face"
                  className="preview-image"
                />

                <div className="preview-overlay">
                  <span>
                    IMAGE READY
                  </span>
                </div>

              </div>


              <div className="preview-info">

                <div>

                  <strong>
                    {file?.name}
                  </strong>

                  <span>
                    {file
                      ? (
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)
                      : "0.00"}{" "}
                    MB
                  </span>

                </div>


                <button
                  type="button"
                  className="remove-button"
                  onClick={removeFile}
                >
                  Remove
                </button>

              </div>


              {/* RETAKE CAMERA */}

              <button
                type="button"
                className="camera-retake-button"
                onClick={() => {
                  removeFile();
                  openCamera();
                }}
              >
                ↻ Retake with Camera
              </button>

            </div>

          )}


          {/* =================================
              ERROR
          ================================== */}

          {error && (

            <div className="enroll-message error">

              <span>
                !
              </span>

              {error}

            </div>

          )}


          {/* =================================
              SUCCESS
          ================================== */}

          {message && (

            <div className="enroll-message success">

              <span>
                ✓
              </span>

              {message}

            </div>

          )}


          {/* =================================
              ENROLL BUTTON
          ================================== */}

          <button
            type="button"
            className="enroll-submit"
            onClick={handleEnroll}
            disabled={loading || cameraOpen}
          >

            {loading ? (

              <>
                <span className="spinner"></span>

                Processing face...
              </>

            ) : (

              <>
                <span>
                  ✦
                </span>

                Enroll Face

                <b>
                  →
                </b>
              </>

            )}

          </button>

        </div>


        {/* ===================================
            RIGHT SIDE
        ==================================== */}

        <div className="enroll-info-column">

          {/* QUALITY CARD */}

          <div className="info-card quality-card">

            <div className="info-icon">
              ◈
            </div>

            <span className="info-label">
              FACE QUALITY
            </span>

            <h3>
              Prepare a good
              <br />
              enrollment image
            </h3>

            <p>
              FaceVault checks the image before
              creating the biometric representation.
            </p>


            <div className="quality-list">

              <div>

                <span>
                  ✓
                </span>

                <p>

                  <strong>
                    One face
                  </strong>

                  Only one person should be visible.

                </p>

              </div>


              <div>

                <span>
                  ✓
                </span>

                <p>

                  <strong>
                    Clear image
                  </strong>

                  Avoid blurry or low-quality photos.

                </p>

              </div>


              <div>

                <span>
                  ✓
                </span>

                <p>

                  <strong>
                    Good lighting
                  </strong>

                  Keep the face clearly visible.

                </p>

              </div>

            </div>

          </div>


          {/* PIPELINE */}

          <div className="pipeline-mini">

            <span className="info-label">
              ENROLLMENT PIPELINE
            </span>

            <div className="mini-pipeline">

              <div className="mini-step">

                <span>
                  01
                </span>

                Detect

              </div>


              <div className="mini-line"></div>


              <div className="mini-step">

                <span>
                  02
                </span>

                Quality

              </div>


              <div className="mini-line"></div>


              <div className="mini-step">

                <span>
                  03
                </span>

                Embed

              </div>


              <div className="mini-line"></div>


              <div className="mini-step">

                <span>
                  04
                </span>

                Store

              </div>

            </div>

          </div>


          {/* PRIVACY */}

          <div className="privacy-card">

            <span className="privacy-icon">
              ⛨
            </span>

            <div>

              <strong>
                Privacy-aware storage
              </strong>

              <p>
                FaceVault stores the generated
                embedding rather than keeping the
                uploaded image.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Enroll;