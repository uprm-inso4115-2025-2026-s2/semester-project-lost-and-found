import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.ts";

import "./ReportDetailsPage.css";

import { editReport, getReport } from "../ReportManagement/ReportDatabaseManagement";
import type { Report } from "../ReportManagement/Reports";

const ReportDetailPage: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(0);

  const [report, setReport] = useState<Report | null>(null);

  const handleClaim = async () => {
    const user = await supabase.auth.getUser();

    if (!reportId) return;
    
    try {
      if (report?.getStatus() !== "Claimed") {
        if (report?.getType() === "Lost") {
          const { data, error } = await supabase
            .from('UserAccounts')
            .select()
            .eq('Email', report.getCreatedBy())
            .single();

          if (!data) {
            console.error(error);
          } else {
            const phoneNum = data.Phonenumber;
            const subject = "Your Item Has Been Found!"
            const message = "To claim your item please go to the Lost and Found office located in the library on campus or contact the finder of your item: " + phoneNum;
            // Send an in app notification instead 
          }

        } else if (report?.getType() === "Found") {
          report.setStatus('CLAIMED');
          setCode(report.getNewRecoveryCode());
          report.setClaimedBy(user.data.user?.email || "");
          await editReport(report.getID(), report);
        }

      } else if (report.getStatus() === "Claimed" && report.getType() == "Found" && report.getClaimedBy() === user.data.user?.id) {
        setCode(report.getRecoveryCode());
      }

    } catch (error) {
      console.error("Could not claim report:", error);
    }
  };

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
          <button className="claimBtn" onClick={handleClaim}>
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