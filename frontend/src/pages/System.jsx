function System() {
  return (
    <div className="system-page">

      <section className="system-intro">
        <div>
          <span className="page-eyebrow">
            FACEVAULT AI PLATFORM
          </span>

          <h2>
            System Information
          </h2>

          <p>
            Technical overview of the FaceVault open-set face
            recognition and identity verification pipeline.
          </p>
        </div>

        <div className="system-version">
          <span>VERSION</span>
          <strong>1.0.0</strong>
        </div>
      </section>


      {/* Architecture */}

      <section className="system-card-large">

        <div className="system-section-title">
          <span className="page-eyebrow">
            ARCHITECTURE
          </span>

          <h3>
            FaceVault AI Pipeline
          </h3>
        </div>

        <div className="architecture-flow">

          <ArchitectureNode
            number="01"
            title="Image Input"
            subtitle="JPG / PNG / WEBP"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="02"
            title="Face Detection"
            subtitle="YuNet"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="03"
            title="Face Embedding"
            subtitle="SFace · 128D"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="04"
            title="Similarity"
            subtitle="Cosine Distance"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            number="05"
            title="Decision"
            subtitle="Threshold 0.45"
          />

        </div>

      </section>


      {/* Technology */}

      <section className="system-section">

        <div className="system-section-title">
          <span className="page-eyebrow">
            TECHNOLOGY STACK
          </span>

          <h3>
            AI & Application Components
          </h3>
        </div>


        <div className="technology-grid">

          <TechnologyCard
            icon="AI"
            title="YuNet"
            category="Face Detection"
            description="Lightweight neural network used to locate faces and facial landmarks."
          />

          <TechnologyCard
            icon="SF"
            title="SFace"
            category="Face Recognition"
            description="Generates compact 128-dimensional face embeddings for identity comparison."
          />

          <TechnologyCard
            icon="API"
            title="FastAPI"
            category="Backend API"
            description="High-performance Python REST API connecting the frontend with the AI engine."
          />

          <TechnologyCard
            icon="DB"
            title="SQLite"
            category="Database"
            description="Stores enrolled identities, biometric embeddings and recognition history."
          />

          <TechnologyCard
            icon="RE"
            title="React"
            category="Frontend"
            description="Interactive dashboard for enrollment, recognition, people and activity management."
          />

          <TechnologyCard
            icon="CV"
            title="OpenCV"
            category="Computer Vision"
            description="Handles image processing, face alignment and model inference."
          />

        </div>

      </section>


      {/* Configuration */}

      <section className="system-section">

        <div className="system-section-title">
          <span className="page-eyebrow">
            CONFIGURATION
          </span>

          <h3>
            Recognition Parameters
          </h3>
        </div>


        <div className="config-grid">

          <ConfigItem
            label="Recognition Model"
            value="SFace"
          />

          <ConfigItem
            label="Embedding Size"
            value="128 dimensions"
          />

          <ConfigItem
            label="Matching Method"
            value="Cosine Similarity"
          />

          <ConfigItem
            label="Project Threshold"
            value="0.45"
          />

          <ConfigItem
            label="Face Detector"
            value="YuNet"
          />

          <ConfigItem
            label="Database"
            value="SQLite"
          />

        </div>

      </section>


      {/* Security */}

      <section className="system-security">

        <div className="security-icon">
          ◈
        </div>

        <div>
          <span className="page-eyebrow">
            OPEN-SET SECURITY
          </span>

          <h3>
            Unknown faces are explicitly rejected
          </h3>

          <p>
            FaceVault does not force every detected face to match
            an enrolled identity. The highest similarity score is
            compared against the configured threshold. Scores below
            the threshold are classified as unknown.
          </p>
        </div>

      </section>


      {/* Evaluation */}

      <section className="evaluation-card">

        <div>
          <span className="page-eyebrow">
            PROJECT EVALUATION
          </span>

          <h3>
            Recognition Evaluation
          </h3>

          <p>
            Current local evaluation dataset contains genuine and
            impostor samples used to verify identification and
            unknown rejection behavior.
          </p>
        </div>

        <div className="evaluation-badge">
          <strong>6</strong>
          <span>Test Samples</span>
        </div>

        <div className="evaluation-badge">
          <strong>0.45</strong>
          <span>Threshold</span>
        </div>

      </section>

    </div>
  );
}


/* =========================================================
   ARCHITECTURE NODE
   ========================================================= */

function ArchitectureNode({
  number,
  title,
  subtitle
}) {
  return (
    <div className="architecture-node">

      <span>
        {number}
      </span>

      <strong>
        {title}
      </strong>

      <small>
        {subtitle}
      </small>

    </div>
  );
}


/* =========================================================
   TECHNOLOGY CARD
   ========================================================= */

function TechnologyCard({
  icon,
  title,
  category,
  description
}) {
  return (
    <div className="technology-card">

      <div className="technology-icon">
        {icon}
      </div>

      <div>
        <span>
          {category}
        </span>

        <h4>
          {title}
        </h4>

        <p>
          {description}
        </p>
      </div>

    </div>
  );
}


/* =========================================================
   CONFIG ITEM
   ========================================================= */

function ConfigItem({
  label,
  value
}) {
  return (
    <div className="config-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


export default System;