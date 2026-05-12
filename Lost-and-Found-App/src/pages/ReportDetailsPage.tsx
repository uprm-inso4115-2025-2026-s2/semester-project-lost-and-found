import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "./ReportDetailsPage.css";

import { getReport } from "../ReportManagement/ReportDatabaseManagement";
import type { Report } from "../ReportManagement/Reports";

const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!reportId) return;

    getReport(reportId).then(setReport);
  }, [reportId]);

  if (!report) {
    return <div className="detailsPage">Loading...</div>;
  }

  return (
    <div className="detailsPage">
      {/* Back Button */}
      <button
        className="backBtn"
        onClick={() => navigate(-1)}
      >
        ←
      </button>

      {/* Image */}
      <div className="detailsImageContainer">
        {report.getImageURL() ? (
          <img
            src={report.getImageURL()}
            alt={report.getTitle()}
            className="detailsImage"
          />
        ) : (
          <div className="detailsPlaceholder">
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="detailsContent">
        <h1 className="detailsTitle">
          {report.getTitle()}
        </h1>

        {/* Info Row */}
        <div className="detailsInfoRow">
          <div className="infoItem">
            <span className="infoLabel">Category</span>
            <span>{report.getCategory()}</span>
          </div>

          <div className="infoItem">
            <span className="infoLabel">Location</span>
            <span>{report.getLocation()}</span>
          </div>

          <div className="infoItem">
            <span className="infoLabel">Date</span>
            <span>
              {report
                .getDateFound()
                .toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="tagsSection">
          <h3>Tags</h3>

          <div className="tagsContainer">
            {report.getTags().map((tag, index) => (
              <span key={index} className="tagPill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="descriptionSection">
          <h3>Description</h3>

          <div className="descriptionBox">
            {report.getDescription()}
          </div>
        </div>

        {/* Buttons */}
        <div className="detailsActions">
          <button className="claimBtn">
            Claim Item
          </button>

          <button className="contactBtn">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;