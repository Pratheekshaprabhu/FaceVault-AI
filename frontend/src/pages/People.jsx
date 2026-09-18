import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/v1";

function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/people`);

      setPeople(response.data.people || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        "Unable to load enrolled people."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeople();
  }, []);

  return (
    <div className="people-page">

      {/* HEADER */}

      <div className="people-intro">

        <div>
          <span className="page-kicker">
            IDENTITY MANAGEMENT
          </span>

          <h2>Enrolled people</h2>

          <p>
            Manage the identities currently registered
            in the FaceVault recognition database.
          </p>
        </div>

        <div className="people-count">
          <span>REGISTERED</span>
          <strong>{people.length}</strong>
        </div>

      </div>


      {/* TOOLBAR */}

      <div className="people-toolbar">

        <div className="database-status">
          <span></span>
          Database connected
        </div>

        <button
          className="people-refresh"
          onClick={loadPeople}
        >
          ↻ Refresh
        </button>

      </div>


      {/* TABLE */}

      <div className="people-card">

        <div className="people-table-header">

          <span>PERSON</span>
          <span>DATABASE ID</span>
          <span>EMBEDDING</span>
          <span>STATUS</span>
          <span>ACTION</span>

        </div>


        {loading ? (

          <div className="people-loading">

            <div className="large-spinner"></div>

            <p>
              Loading enrolled identities...
            </p>

          </div>

        ) : error ? (

          <div className="people-empty">

            <div className="people-empty-icon">
              !
            </div>

            <h3>
              Unable to load people
            </h3>

            <p>
              {error}
            </p>

            <button
              className="people-retry"
              onClick={loadPeople}
            >
              Try again
            </button>

          </div>

        ) : people.length === 0 ? (

          <div className="people-empty">

            <div className="people-empty-icon">
              ♙
            </div>

            <h3>
              No enrolled people
            </h3>

            <p>
              Enroll a face to create the first identity
              in your FaceVault database.
            </p>

          </div>

        ) : (

          people.map((person) => (

            <div
              className="people-row"
              key={person.id}
            >

              {/* PERSON */}

              <div className="person-cell">

                <div className="person-avatar">
                  {person.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {person.name}
                  </strong>

                  <span>
                    Face identity
                  </span>
                </div>

              </div>


              {/* ID */}

              <div className="id-cell">

                <span>
                  #
                  {String(person.id).padStart(
                    4,
                    "0"
                  )}
                </span>

              </div>


              {/* EMBEDDING */}

              <div className="embedding-cell">

                <span className="embedding-dot"></span>

                <div>
                  <strong>
                    SFace
                  </strong>

                  <small>
                    128-dimensional
                  </small>
                </div>

              </div>


              {/* STATUS */}

              <div>

                <span className="person-status">
                  <i></i>
                  Active
                </span>

              </div>


              {/* ACTION */}

              <div>

                <button
                  className="person-action"
                  title="Identity information"
                >
                  View
                </button>

              </div>

            </div>

          ))

        )}

      </div>


      {/* INFORMATION CARDS */}

      <div className="people-info-grid">

        <div className="people-info-card">

          <div className="people-info-icon">
            ◈
          </div>

          <div>

            <span>
              EMBEDDING MODEL
            </span>

            <h3>
              SFace
            </h3>

            <p>
              FaceVault uses SFace embeddings to
              represent enrolled identities numerically.
            </p>

          </div>

        </div>


        <div className="people-info-card">

          <div className="people-info-icon">
            #
          </div>

          <div>

            <span>
              MATCHING
            </span>

            <h3>
              Cosine Similarity
            </h3>

            <p>
              Query faces are compared against stored
              embeddings using similarity scoring.
            </p>

          </div>

        </div>


        <div className="people-info-card">

          <div className="people-info-icon">
            ⛨
          </div>

          <div>

            <span>
              OPEN-SET SECURITY
            </span>

            <h3>
              Unknown rejection
            </h3>

            <p>
              Faces below the configured 0.45 threshold
              are rejected instead of being assigned.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default People;