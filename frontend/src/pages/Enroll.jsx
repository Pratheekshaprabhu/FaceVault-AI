import { useRef, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";

function Enroll() {
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectFile = (selectedFile) => {
    setMessage("");
    setError("");

    if (!selectedFile) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg"
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only JPG and PNG images are allowed.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setFile(selectedFile);

    const imageURL = URL.createObjectURL(selectedFile);
    setPreview(imageURL);
  };

  const handleFileChange = (event) => {
    selectFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    selectFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEnroll = async () => {
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter the person's name.");
      return;
    }

    if (!file) {
      setError("Please select a face image.");
      return;
    }

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("file", file);

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
      const detail =
        err.response?.data?.detail ||
        "Unable to enroll the face. Please try again.";

      setError(detail);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enroll-page">

      <div className="enroll-intro">
        <div>
          <span className="page-kicker">
            IDENTITY MANAGEMENT
          </span>

          <h2>Enroll a new face</h2>

          <p>
            Add a person to the FaceVault recognition database.
            For best results, use a clear image with one visible face.
          </p>
        </div>

        <div className="secure-badge">
          <span>●</span>
          Biometric processing
        </div>
      </div>


      <div className="enroll-layout">

        {/* LEFT SIDE */}
        <div className="enroll-card">

          <div className="card-header">
            <div>
              <span className="step-label">STEP 01</span>
              <h3>Person information</h3>
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
            This name will be associated with the face embedding.
          </div>


          <div className="card-divider"></div>


          <div className="card-header upload-header">

            <div>
              <span className="step-label">STEP 02</span>
              <h3>Face image</h3>
            </div>

            <div className="file-limit">
              MAX 5 MB
            </div>

          </div>


          {!preview ? (

            <div
              className={`upload-zone ${
                dragging ? "dragging" : ""
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
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

          ) : (

            <div className="preview-container">

              <div className="preview-image-wrapper">

                <img
                  src={preview}
                  alt="Selected face"
                  className="preview-image"
                />

                <div className="preview-overlay">
                  <span>IMAGE READY</span>
                </div>

              </div>

              <div className="preview-info">

                <div>
                  <strong>
                    {file?.name}
                  </strong>

                  <span>
                    {(file?.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <button
                  className="remove-button"
                  onClick={removeFile}
                >
                  Remove
                </button>

              </div>

            </div>

          )}


          {error && (
            <div className="enroll-message error">
              <span>!</span>
              {error}
            </div>
          )}


          {message && (
            <div className="enroll-message success">
              <span>✓</span>
              {message}
            </div>
          )}


          <button
            className="enroll-submit"
            onClick={handleEnroll}
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="spinner"></span>
                Processing face...
              </>
            ) : (
              <>
                <span>✦</span>
                Enroll Face
                <b>→</b>
              </>
            )}

          </button>

        </div>


        {/* RIGHT SIDE */}
        <div className="enroll-info-column">

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
              FaceVault checks the image before creating
              the biometric representation.
            </p>

            <div className="quality-list">

              <div>
                <span>✓</span>
                <p>
                  <strong>One face</strong>
                  Only one person should be visible.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Clear image</strong>
                  Avoid blurry or low-quality photos.
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Good lighting</strong>
                  Keep the face clearly visible.
                </p>
              </div>

            </div>

          </div>


          <div className="pipeline-mini">

            <span className="info-label">
              ENROLLMENT PIPELINE
            </span>

            <div className="mini-pipeline">

              <div className="mini-step">
                <span>01</span>
                Detect
              </div>

              <div className="mini-line"></div>

              <div className="mini-step">
                <span>02</span>
                Quality
              </div>

              <div className="mini-line"></div>

              <div className="mini-step">
                <span>03</span>
                Embed
              </div>

              <div className="mini-line"></div>

              <div className="mini-step">
                <span>04</span>
                Store
              </div>

            </div>

          </div>


          <div className="privacy-card">

            <span className="privacy-icon">
              ⛨
            </span>

            <div>
              <strong>
                Privacy-aware storage
              </strong>

              <p>
                FaceVault stores the generated embedding
                rather than keeping the uploaded image.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Enroll;