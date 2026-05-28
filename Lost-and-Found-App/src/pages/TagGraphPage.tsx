import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TagGraphPage.css";
import backIcon from "../assets/icons/back.svg";
import { getTagStats } from "../TagManagement/TagGraphService";
import type { TagStat } from "../TagManagement/TagGraphService";

export default function TagGraphPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTagStats()
      .then(setTags)
      .catch((err) => {
        console.error(err);
        setError("Failed to load tag data. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const maxCount = tags.length > 0 ? tags[0].count : 1;

  return (
    <div className="tagGraphPage">
      <header className="tagGraphHeader">
        <button className="tagGraphBackBtn" onClick={() => navigate("/")}>
          <img src={backIcon} alt="back" />
        </button>
        <h1>Tag Graph</h1>
      </header>

      <p className="tagGraphSubtitle">
        Tag usage frequency across all reports.
      </p>

      <div className="tagGraphContent">
        {loading ? (
          <div className="tagGraphState">
            <p className="tagGraphStateLabel">Loading tag data…</p>
          </div>
        ) : error ? (
          <div className="tagGraphState tagGraphStateError">
            <p className="tagGraphStateLabel">{error}</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="tagGraphState">
            <p className="tagGraphStateLabel">No tags found in any reports yet.</p>
          </div>
        ) : (
          <div className="tagGraphList">
            {tags.map(({ tagName, count }) => (
              <div key={tagName} className="tagGraphRow">
                <span className="tagGraphLabel" title={tagName}>{tagName}</span>
                <div className="tagGraphBarWrap">
                  <div
                    className="tagGraphBar"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="tagGraphCount">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
