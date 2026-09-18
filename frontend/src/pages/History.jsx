import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/history`);

      setHistory(response.data.history || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load recognition history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const identifiedCount = history.filter(
    (item) => item.status === "identified"
  ).length;

  const unknownCount = history.filter(
    (item) => item.status === "unknown"
  ).length;

  return (
    <div className="history-page">

      {/* Page Header */}
      <section className="history-intro">
        <div>
          <span className="page-eyebrow">AUDIT & ACTIVITY</span>

          <h2>Recognition History</h2>

          <p>
            Review previous face recognition attempts, similarity scores,
            decisions and timestamps recorded by the FaceVault AI engine.
          </p>
        </div>

        <button className="refresh-button" onClick={loadHistory}>
          ↻ Refresh
        </button>
      </section>

      {/* Statistics */}
      <section className="history-stats">

        <div className="history-stat-card">
          <div className="history-stat-icon">◷</div>

          <div>
            <span>Total Attempts</span>
            <strong>{loading ? "—" : history.length}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon success">✓</div>

          <div>
            <span>Identified</span>
            <strong>{loading ? "—" : identifiedCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon warning">?</div>

          <div>
            <span>Unknown</span>
            <strong>{loading ? "—" : unknownCount}</strong>
          </div>
        </div>

        <div className="history-stat-card">
          <div className="history-stat-icon threshold">◎</div>

          <div>
            <span>Match Threshold</span>
            <strong>0.45</strong>
          </div>
        </div>

      </section>

      {/* History Table */}
      <section className="history-card">

        <div className="history-card-header">
          <div>
            <span className="page-eyebrow">RECOGNITION LOG</span>
            <h3>Recent Attempts</h3>
          </div>

          <div className="history-count">
            {history.length} records
          </div>
        </div>

        {loading ? (
          <div className="history-empty">
            <div className="loading-ring"></div>
            <h3>Loading recognition history</h3>
            <p>Fetching records from the FaceVault database...</p>
          </div>
        ) : error ? (
          <div className="history-empty error-state">
            <div className="empty-icon">!</div>
            <h3>Unable to load history</h3>
            <p>{error}</p>

            <button
              className="primary-button small-button"
              onClick={loadHistory}
            >
              Try Again
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">◷</div>
            <h3>No recognition records</h3>
            <p>
              Recognition attempts will automatically appear here after
              using the Recognize Face module.
            </p>
          </div>
        ) : (
          <div className="history-table-wrapper">

            <div className="history-table history-table-head">
              <div>ID</div>
              <div>IDENTITY</div>
              <div>SIMILARITY</div>
              <div>DECISION</div>
              <div>TIMESTAMP</div>
            </div>

            {history.map((item) => {
              const identified = item.status === "identified";
              const percentage = (Number(item.score || 0) * 100).toFixed(1);

              return (
                <div className="history-table history-table-row" key={item.id}>

                  <div className="history-id">
                    #{String(item.id).padStart(4, "0")}
                  </div>

                  <div className="history-identity">
                    <div
                      className={
                        identified
                          ? "history-avatar known-avatar"
                          : "history-avatar unknown-avatar"
                      }
                    >
                      {identified
                        ? item.identity?.charAt(0).toUpperCase()
                        : "?"}
                    </div>

                    <div>
                      <strong>
                        {item.identity || "Unknown person"}
                      </strong>

                      <span>
                        {identified
                          ? "Enrolled identity"
                          : "Not found in database"}
                      </span>
                    </div>
                  </div>

                  <div className="history-similarity">

                    <div className="similarity-value">
                      <strong>{percentage}%</strong>
                      <span>cosine similarity</span>
                    </div>

                    <div className="similarity-track">
                      <div
                        className="similarity-fill"
                        style={{
                          width: `${Math.min(
                            Number(item.score || 0) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                  </div>

                  <div>
                    <span
                      className={
                        identified
                          ? "history-status identified"
                          : "history-status unknown"
                      }
                    >
                      <span></span>
                      {identified ? "IDENTIFIED" : "UNKNOWN"}
                    </span>
                  </div>

                  <div className="history-time">
                    <strong>{formatDate(item.created_at)}</strong>
                    <span>{formatTime(item.created_at)}</span>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Information */}
      <section className="history-info-grid">

        <div className="history-info-card">
          <div className="info-icon">◎</div>

          <div>
            <h4>Similarity Score</h4>
            <p>
              FaceVault compares SFace embeddings using cosine similarity.
              Scores closer to 1 indicate greater embedding similarity.
            </p>
          </div>
        </div>

        <div className="history-info-card">
          <div className="info-icon">◈</div>

          <div>
            <h4>Open-Set Decision</h4>
            <p>
              A face is identified only when its best similarity reaches
              the configured 0.45 project threshold. Otherwise it is
              rejected as unknown.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default History;