import { useRef, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";
const MATCH_THRESHOLD = 0.45;

function Recognize() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");
    setResults([]);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const removeImage = () => {
    setFile(null);
    setPreview("");
    setResults([]);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const recognizeFace = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setScanning(true);
    setError("");
    setResults([]);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API}/recognize`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setResults(response.data.results || []);

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.detail ||
        "Face recognition failed. Please try another image.";

      setError(message);

    } finally {
      setScanning(false);
    }
  };

  const identifiedResults = results.filter(
    (result) => result.status === "identified"
  );

  return (
    <div className="recognize-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="recognize-intro">

        <div>
          <span className="page-eyebrow">
            AI IDENTITY VERIFICATION
          </span>

          <h2>
            Recognize a face
          </h2>

          <p>
            Upload an image and FaceVault will detect faces,
            generate SFace embeddings, compare them with enrolled
            identities and reject unknown individuals.
          </p>
        </div>

        <div className="recognize-engine">

          <span className="engine-live-dot"></span>

          <div>
            <strong>AI Engine</strong>
            <small>Online</small>
          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN WORKSPACE
      ===================================================== */}

      <section className="recognize-workspace">

        {/* ===================================================
            UPLOAD / PREVIEW
        =================================================== */}

        <div className="recognize-upload-card">

          <div className="card-top">

            <div>
              <span className="page-eyebrow">
                STEP 01
              </span>

              <h3>
                Upload image
              </h3>
            </div>

            {file && (
              <button
                className="remove-button"
                onClick={removeImage}
              >
                × Remove
              </button>
            )}

          </div>


          {!preview ? (

            <div
              className="recognize-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
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
                JPG&nbsp; • &nbsp;PNG&nbsp; • &nbsp;WEBP
                <span>Maximum 5 MB</span>
              </div>

            </div>

          ) : (

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

              {!scanning && results.length > 0 && (
                <div className="preview-detected-badge">
                  <span></span>
                  {results.length} face
                  {results.length > 1 ? "s" : ""} detected
                </div>
              )}

            </div>

          )}


          {error && (
            <div className="recognize-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}


          <button
            className="recognize-button"
            disabled={!file || scanning}
            onClick={recognizeFace}
          >

            {scanning ? (
              <>
                <span className="button-spinner"></span>
                Analyzing image...
              </>
            ) : (
              <>
                <span>◎</span>
                Analyze & Recognize
                <b>→</b>
              </>
            )}

          </button>


          <div className="recognize-security">

            <span>⌁</span>

            <p>
              Your image is processed locally by the
              FaceVault AI pipeline and is not stored as an
              uploaded image.
            </p>

          </div>

        </div>


        {/* ===================================================
            RESULTS
        =================================================== */}

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
                {results.length > 1 ? "s" : ""}
              </span>
            )}

          </div>


          {scanning ? (

            <ScanningState />

          ) : results.length === 0 ? (

            <EmptyResult />

          ) : (

            <div className="results-list">

              {results.map((result, index) => (

                <RecognitionResult
                  key={index}
                  result={result}
                  index={index}
                />

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          PIPELINE
      ===================================================== */}

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

          <div className="step-connector">→</div>

          <RecognizeStep
            number="02"
            title="Embed"
            subtitle="SFace"
            description="Creates a 128-dimensional face embedding."
          />

          <div className="step-connector">→</div>

          <RecognizeStep
            number="03"
            title="Compare"
            subtitle="Cosine Similarity"
            description="Searches enrolled identities."
          />

          <div className="step-connector">→</div>

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

function RecognitionResult({ result, index }) {

  const identified = result.status === "identified";

  const score = Number(result.score || 0);

  const percentage = Math.max(
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

      {/* Result Header */}

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
            FACE {String(index + 1).padStart(2, "0")}
          </span>

          <h3>
            {result.identity || "Unknown person"}
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


      {/* Similarity */}

      <div className="result-similarity">

        <div className="similarity-header">

          <div>
            <span>SIMILARITY SCORE</span>

            <strong>
              {percentage.toFixed(1)}%
            </strong>
          </div>

          <div className="threshold-label">
            Threshold
            <strong>
              {thresholdPercentage.toFixed(0)}%
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
              width: `${percentage}%`
            }}
          ></div>

          <div
            className="threshold-marker"
            style={{
              left: `${thresholdPercentage}%`
            }}
          >
            <span></span>
          </div>

        </div>


        <div className="similarity-scale">
          <span>0.00</span>
          <span>0.45 threshold</span>
          <span>1.00</span>
        </div>

      </div>


      {/* Decision */}

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
        Upload a face image on the left and start
        recognition to see the AI decision here.
      </p>

      <div className="empty-result-tags">

        <span>YuNet Detection</span>
        <span>SFace Embedding</span>
        <span>Cosine Matching</span>

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