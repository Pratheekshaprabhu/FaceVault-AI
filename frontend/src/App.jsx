import { useEffect, useState } from "react";
import axios from "axios";

import Enroll from "./pages/Enroll";
import Recognize from "./pages/Recognize";
import People from "./pages/People";
import History from "./pages/History";
import System from "./pages/System";

import "./App.css";

const API = "http://127.0.0.1:8000/api/v1";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [people, setPeople] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const [peopleResponse, historyResponse] =
        await Promise.all([
          axios.get(`${API}/people`),
          axios.get(`${API}/history`)
        ]);

      setPeople(
        peopleResponse.data.people || []
      );

      setHistory(
        historyResponse.data.history || []
      );

    } catch (error) {
      console.error(
        "Backend connection failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDashboard();
  }, []);


  const identifiedCount = history.filter(
    (item) => item.status === "identified"
  ).length;


  const unknownCount = history.filter(
    (item) => item.status === "unknown"
  ).length;


  return (
    <div className="app-shell">

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-mark">
            <span>F</span>
          </div>

          <div>
            <h2>FaceVault</h2>
            <p>AI Recognition</p>
          </div>

        </div>


        <div className="nav-label">
          WORKSPACE
        </div>


        <nav className="navigation">

          <NavButton
            icon="⌂"
            label="Dashboard"
            active={
              activePage === "dashboard"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          />


          <NavButton
            icon="+"
            label="Enroll Face"
            active={
              activePage === "enroll"
            }
            onClick={() =>
              setActivePage("enroll")
            }
          />


          <NavButton
            icon="◎"
            label="Recognize"
            active={
              activePage === "recognize"
            }
            onClick={() =>
              setActivePage("recognize")
            }
          />


          <NavButton
            icon="♙"
            label="People"
            active={
              activePage === "people"
            }
            onClick={() =>
              setActivePage("people")
            }
          />


          <NavButton
            icon="◷"
            label="History"
            active={
              activePage === "history"
            }
            onClick={() =>
              setActivePage("history")
            }
          />


          <NavButton
            icon="◇"
            label="System"
            active={
              activePage === "system"
            }
            onClick={() =>
              setActivePage("system")
            }
          />

        </nav>


        <div className="sidebar-spacer"></div>


        {/* System Status */}

        <div className="system-card">

          <div className="system-top">

            <span className="online-dot"></span>

            <span>
              System Online
            </span>

          </div>


          <p>
            FaceVault AI Engine
          </p>


          <div className="engine-status">

            <span>
              YuNet
            </span>

            <strong>
              Detection
            </strong>

          </div>


          <div className="engine-status">

            <span>
              SFace
            </span>

            <strong>
              Recognition
            </strong>

          </div>

        </div>


        <div className="sidebar-footer">

          <span>
            v1.0.0
          </span>

          <span>
            AI Platform
          </span>

        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="main-content">


        {/* ===================================================
            TOP HEADER
            =================================================== */}

        <header className="top-header">

          <div>

            <div className="breadcrumb">

              FaceVault

              <span>
                /
              </span>

              {getPageTitle(activePage)}

            </div>


            <h1>
              {getPageTitle(activePage)}
            </h1>

          </div>


          <div className="header-right">


            <div className="api-status">

              <span></span>

              API Connected

            </div>


            <div className="profile">

              <div className="profile-avatar">
                P
              </div>


              <div className="profile-info">

                <strong>
                  Pratheeksha
                </strong>

                <span>
                  Administrator
                </span>

              </div>


              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* ===================================================
            DASHBOARD
            =================================================== */}

        {activePage === "dashboard" && (

          <div className="page">


            {/* HERO */}

            <section className="hero">

              <div className="hero-content">

                <div className="hero-badge">

                  <span className="badge-pulse"></span>

                  OPEN-SET FACE RECOGNITION

                </div>


                <h2>

                  Identity verification,

                  <br />

                  <span>
                    powered by AI.
                  </span>

                </h2>


                <p>

                  Detect faces, generate biometric
                  embeddings, compare identities and
                  intelligently reject unknown individuals.

                </p>


                <div className="hero-buttons">


                  <button
                    className="primary-button"
                    onClick={() =>
                      setActivePage("recognize")
                    }
                  >

                    <span>
                      ◎
                    </span>

                    Recognize Face

                    <b>
                      →
                    </b>

                  </button>


                  <button
                    className="outline-button"
                    onClick={() =>
                      setActivePage("enroll")
                    }
                  >

                    + Enroll Person

                  </button>

                </div>


                <div className="hero-meta">


                  <div>

                    <strong>
                      YuNet
                    </strong>

                    <span>
                      Face Detection
                    </span>

                  </div>


                  <div>

                    <strong>
                      SFace
                    </strong>

                    <span>
                      Face Embeddings
                    </span>

                  </div>


                  <div>

                    <strong>
                      0.45
                    </strong>

                    <span>
                      Match Threshold
                    </span>

                  </div>

                </div>

              </div>


              {/* AI VISUAL */}

              <div className="ai-visual">

                <div className="orbital orbital-one"></div>

                <div className="orbital orbital-two"></div>

                <div className="orbital orbital-three"></div>


                <div className="face-frame">


                  <div className="corner top-left"></div>

                  <div className="corner top-right"></div>

                  <div className="corner bottom-left"></div>

                  <div className="corner bottom-right"></div>


                  <div className="face-placeholder">

                    <div className="head"></div>

                    <div className="shoulders"></div>

                  </div>


                  <div className="scan-bar"></div>

                </div>


                <div className="ai-tag">

                  <span></span>

                  AI ENGINE ACTIVE

                </div>

              </div>

            </section>


            {/* =================================================
                STATISTICS
                ================================================= */}

            <section className="section">


              <div className="section-heading">

                <div>

                  <span>
                    OVERVIEW
                  </span>

                  <h2>
                    System Statistics
                  </h2>

                </div>


                <button
                  className="refresh-button"
                  onClick={loadDashboard}
                >
                  ↻ Refresh
                </button>

              </div>


              <div className="stats-grid">


                <StatCard
                  icon="♙"
                  label="Enrolled People"
                  value={
                    loading
                      ? "—"
                      : people.length
                  }
                  detail="Registered identities"
                />


                <StatCard
                  icon="◎"
                  label="Recognition Attempts"
                  value={
                    loading
                      ? "—"
                      : history.length
                  }
                  detail="Total API requests"
                />


                <StatCard
                  icon="✓"
                  label="Known Identifications"
                  value={
                    loading
                      ? "—"
                      : identifiedCount
                  }
                  detail="Successfully matched"
                />


                <StatCard
                  icon="?"
                  label="Unknown Rejections"
                  value={
                    loading
                      ? "—"
                      : unknownCount
                  }
                  detail="Safely rejected"
                />

              </div>

            </section>


            {/* =================================================
                AI PIPELINE
                ================================================= */}

            <section className="section">


              <div className="section-heading">

                <div>

                  <span>
                    AI PIPELINE
                  </span>

                  <h2>
                    How FaceVault works
                  </h2>

                </div>

              </div>


              <div className="pipeline">


                <PipelineCard
                  number="01"
                  title="Detect"
                  subtitle="YuNet"
                  description="Locates faces and facial landmarks in the uploaded image."
                />


                <div className="pipeline-arrow">
                  →
                </div>


                <PipelineCard
                  number="02"
                  title="Embed"
                  subtitle="SFace"
                  description="Transforms the detected face into a biometric embedding."
                />


                <div className="pipeline-arrow">
                  →
                </div>


                <PipelineCard
                  number="03"
                  title="Match"
                  subtitle="Cosine Similarity"
                  description="Compares the query embedding against enrolled identities."
                />


                <div className="pipeline-arrow">
                  →
                </div>


                <PipelineCard
                  number="04"
                  title="Decide"
                  subtitle="Threshold 0.45"
                  description="Returns an identity or safely rejects the face as unknown."
                />

              </div>

            </section>


            {/* =================================================
                RECENT ACTIVITY
                ================================================= */}

            <section className="section">


              <div className="section-heading">

                <div>

                  <span>
                    ACTIVITY
                  </span>

                  <h2>
                    Recent Recognition
                  </h2>

                </div>


                <button
                  className="text-button"
                  onClick={() =>
                    setActivePage("history")
                  }
                >
                  View all →
                </button>

              </div>


              <div className="activity-card">


                {history.length === 0 ? (

                  <div className="empty-state">

                    <div>
                      ◷
                    </div>

                    <h3>
                      No recognition activity yet
                    </h3>

                    <p>
                      Recognition attempts will appear here.
                    </p>

                  </div>

                ) : (

                  history
                    .slice(0, 5)
                    .map((item) => (

                      <div
                        className="activity-row"
                        key={item.id}
                      >


                        <div className="activity-icon">

                          {item.status === "identified"
                            ? "✓"
                            : "?"}

                        </div>


                        <div className="activity-name">

                          <strong>
                            {item.identity ||
                              "Unknown person"}
                          </strong>

                          <span>
                            {formatDate(
                              item.created_at
                            )}
                          </span>

                        </div>


                        <div className="activity-score">

                          <span>
                            Similarity
                          </span>

                          <strong>

                            {(
                              Number(item.score || 0) *
                              100
                            ).toFixed(1)}

                            %

                          </strong>

                        </div>


                        <div
                          className={
                            item.status === "identified"
                              ? "status known"
                              : "status unknown"
                          }
                        >

                          {item.status}

                        </div>

                      </div>

                    ))

                )}

              </div>

            </section>

          </div>

        )}


        {/* ===================================================
            ENROLL
            =================================================== */}

        {activePage === "enroll" && (
          <Enroll />
        )}


        {/* ===================================================
            RECOGNIZE
            =================================================== */}

        {activePage === "recognize" && (
          <Recognize />
        )}


        {/* ===================================================
            PEOPLE
            =================================================== */}

        {activePage === "people" && (
          <People />
        )}


        {/* ===================================================
            HISTORY
            =================================================== */}

        {activePage === "history" && (
          <History />
        )}


        {/* ===================================================
            SYSTEM
            =================================================== */}

        {activePage === "system" && (
          <System />
        )}


        {/* ===================================================
            FALLBACK
            =================================================== */}

        {activePage !== "dashboard" &&
          activePage !== "enroll" &&
          activePage !== "recognize" &&
          activePage !== "people" &&
          activePage !== "history" &&
          activePage !== "system" && (

            <div className="coming-page">

              <div className="coming-icon">
                {getPageIcon(activePage)}
              </div>


              <span>
                FACEVAULT AI
              </span>


              <h2>
                {getPageTitle(activePage)}
              </h2>


              <p>
                This module is ready to be connected
                to the FaceVault AI backend.
              </p>


              <button
                className="primary-button"
                onClick={() =>
                  setActivePage("dashboard")
                }
              >
                ← Back to Dashboard
              </button>

            </div>

          )}

      </main>

    </div>
  );
}


/* =========================================================
   NAVIGATION BUTTON
   ========================================================= */

function NavButton({
  icon,
  label,
  active,
  onClick
}) {

  return (

    <button
      className={`nav-button ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >

      <span className="nav-icon">
        {icon}
      </span>


      <span>
        {label}
      </span>


      {active && (

        <span className="nav-arrow">
          ›
        </span>

      )}

    </button>

  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  icon,
  label,
  value,
  detail
}) {

  return (

    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>


      <div className="stat-content">

        <span>
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <small>
          {detail}
        </small>

      </div>

    </div>

  );
}


/* =========================================================
   PIPELINE CARD
   ========================================================= */

function PipelineCard({
  number,
  title,
  subtitle,
  description
}) {

  return (

    <div className="pipeline-card">

      <div className="pipeline-number">
        {number}
      </div>


      <h3>
        {title}
      </h3>


      <span>
        {subtitle}
      </span>


      <p>
        {description}
      </p>

    </div>

  );
}


/* =========================================================
   PAGE TITLE
   ========================================================= */

function getPageTitle(page) {

  const titles = {

    dashboard: "Dashboard",

    enroll: "Enroll Face",

    recognize: "Recognize",

    people: "People",

    history: "Recognition History",

    system: "System Information"

  };

  return titles[page] || "Dashboard";
}


/* =========================================================
   PAGE ICON
   ========================================================= */

function getPageIcon(page) {

  const icons = {

    enroll: "+",

    recognize: "◎",

    people: "♙",

    history: "◷",

    system: "◇"

  };

  return icons[page] || "✦";
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(date) {

  if (!date) {
    return "Unknown time";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


export default App;