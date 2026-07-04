import React, { useState, useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { getRecommendedSizeByChest } from './Sizechart';
import { createSizeRecommendation } from '../services/sizeRecommendationService';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Estimate measurements from pose landmarks — image-only flow (no body-type selection)
const estimateMeasurements = (landmarks) => {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (!leftShoulder || !rightShoulder) {
    return null;
  }

  const shoulderNormalized = Math.abs(leftShoulder.x - rightShoulder.x);
  const hipNormalized = leftHip && rightHip ? Math.abs(leftHip.x - rightHip.x) : shoulderNormalized;
  const shoulderInches = 12 + shoulderNormalized * 14;
  const hipInches = 12 + hipNormalized * 14;

  // Use image-only factor (regular) to avoid asking users to select body type
  const factor = 1;

  const chestEstimate = clamp(
    ((shoulderInches * 2.2 + hipInches * 1.8) / 2) * factor,
    30,
    64
  );

  const visibilityValues = [leftShoulder, rightShoulder, leftHip, rightHip]
    .filter(Boolean)
    .map((landmark) => landmark.visibility ?? 0);

  const averageVisibility =
    visibilityValues.reduce((sum, value) => sum + value, 0) /
    Math.max(visibilityValues.length, 1);

  const confidence = clamp(0.55 + averageVisibility * 0.36, 0.6, 0.98);

  return {
    chestEstimate: Number(chestEstimate.toFixed(1)),
    shoulderInches: Number(shoulderInches.toFixed(1)),
    hipInches: Number(hipInches.toFixed(1)),
    confidence: Number(confidence.toFixed(2)),
  };
};

const SmartSizeRecommendation = ({ userId, isLoggedIn, product, onClose, onSaved, pageMode = false }) => {
  // Image-only flow: bodyType is not selectable by user
  const bodyType = 'Regular';
  const [imageUrl, setImageUrl] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Upload an image or select your body type to start.');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedRecord, setSavedRecord] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const imageRef = useRef(null);
  const poseRef = useRef(null);

  useEffect(() => {
    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const initPose = () => {
    if (poseRef.current) {
      return poseRef.current;
    }

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

      pose.onResults(async (results) => {
        if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
          setError('No body landmarks detected. Please upload a clearer full-body image (standing, not covered).');
          setStatusMessage('Pose detection failed. Try another clear, full-body photo (avoid blankets or loose clothing).');
          setAnalysisComplete(false);
          return;
        }

        const estimate = estimateMeasurements(results.poseLandmarks);
        if (!estimate) {
          setError('Could not estimate measurements from this image.');
          setStatusMessage('Try an image with clearer body visibility (full height, good lighting).');
          setAnalysisComplete(false);
          return;
        }

      const recommendedSize = getRecommendedSizeByChest(estimate.chestEstimate);
      const result = {
        productId: product?.id || null,
        productName: product?.name || '',
        bodyType,
        chestEstimate: estimate.chestEstimate,
        shoulderInches: estimate.shoulderInches,
        hipInches: estimate.hipInches,
        confidence: estimate.confidence,
        recommendedSize,
        saved: false,
      };

      setError('');
      setRecommendation(result);
      setStatusMessage('Recommendation ready. Save it to history or reuse it on the product page.');
      setAnalysisComplete(true);
      setSavedRecord(null);
    });

    poseRef.current = pose;
    return pose;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Accept only jpeg/png for more consistent pose results
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please upload a JPG or PNG image (full-body photo).');
      return;
    }

    setError('');
    setRecommendation(null);
    setAnalysisComplete(false);
    setSavedRecord(null);
    setStatusMessage('Image loaded. Click Analyze to run body detection.');
    setImageUrl(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      setError('Upload a photo first to run the size recommendation.');
      return;
    }

    setError('');
    setStatusMessage('Detecting body landmarks...');
    setAnalysisComplete(false);

    try {
      const pose = initPose();
      await pose.send({ image: imageRef.current });
    } catch (err) {
      console.error('Pose processing error:', err);
      setError('An error occurred while processing the image. Try another photo.');
      setStatusMessage('Unable to get landmarks from the image.');
    }
  };

  

  const handleSave = async () => {
    if (!isLoggedIn) {
      setError('Please log in to save your size recommendation history.');
      return;
    }

    if (!recommendation) {
      setError('No recommendation available to save yet.');
      return;
    }

    setSaving(true);
    try {
      const response = await createSizeRecommendation({
        userId,
        productId: recommendation.productId,
        productName: recommendation.productName,
        recommendedSize: recommendation.recommendedSize,
        bodyType: recommendation.bodyType,
        confidence: recommendation.confidence,
        chestEstimate: recommendation.chestEstimate,
      });

      setSavedRecord(response.data);
      setRecommendation((prev) => prev ? { ...prev, saved: true } : prev);
      setStatusMessage('Recommendation saved to your size history.');
      onSaved?.(response.data);
    } catch (err) {
      console.error('Error saving recommendation:', err);
      setError('Unable to save recommendation. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={pageMode ? "ssr-page" : "ssr-overlay"} onClick={pageMode ? undefined : onClose}>
      <div className="ssr-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ssr-header">
          <div>
            <h2>Smart Size Recommendation</h2>
            <p>Upload an image, select a body type, and get the size that best matches our size chart.</p>
          </div>
          <button className="ssr-close" onClick={onClose} aria-label="Close size recommendation tool">
            ✕
          </button>
        </div>

        <div className="ssr-grid">
          <section className="ssr-panel-card">
            <label className="ssr-label">Upload Image</label>
            <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="ssr-file-input" />
            <div className="ssr-guidance order-tab">
              <strong>Accepted formats:</strong> JPG, PNG.
              <div style={{ marginTop: 6 }}>
                Use a clear full-body photo (standing, minimal loose clothing). Avoid blankets or heavy coverings — such images cannot be analyzed properly.
              </div>
            </div>
            {imageUrl && (
              <div className="ssr-image-preview">
                <img ref={imageRef} src={imageUrl} alt="Uploaded preview" onLoad={() => {}} />
              </div>
            )}

            <div className="ssr-actions-row">
              <button className="ssr-button primary" onClick={handleAnalyze}>
                Analyze Image
              </button>
            </div>

            <div className="ssr-status-card">
              <strong>Status:</strong>
              <p>{statusMessage}</p>
              {error && <p className="ssr-error">{error}</p>}
            </div>
          </section>

          <section className="ssr-panel-card ssr-result-card">
            <h3 className="section-title">Recommendation Result</h3>
            {!analysisComplete && (
              <p>Use an image or body profile to generate a recommendation.</p>
            )}
            {analysisComplete && recommendation && (
              <div className="ssr-result-details">
                <div className="ssr-result-row">
                  <span>Recommended Size</span>
                  <strong>{recommendation.recommendedSize}</strong>
                </div>
                <div className="ssr-result-row">
                  <span>Estimated Chest</span>
                  <strong>{recommendation.chestEstimate} in</strong>
                </div>
                <div className="ssr-result-row">
                  <span>Shoulder Width</span>
                  <strong>{recommendation.shoulderInches} in</strong>
                </div>
                {recommendation.hipInches !== null && (
                  <div className="ssr-result-row">
                    <span>Hip Width</span>
                    <strong>{recommendation.hipInches} in</strong>
                  </div>
                )}
                <div className="ssr-result-row">
                  <span>Confidence</span>
                  <strong>{Math.round((recommendation.confidence || 0) * 100)}%</strong>
                </div>
                {product && (
                  <div className="ssr-result-row">
                    <span>Product</span>
                    <strong className="order-tab">{product.name}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="ssr-save-row">
              {isLoggedIn ? (
                <button
                  className="ssr-button primary"
                  onClick={handleSave}
                  disabled={!analysisComplete || !recommendation || saving || recommendation.saved}
                >
                  {recommendation?.saved ? 'Saved to History' : 'Save to History'}
                </button>
              ) : (
                <p className="ssr-login-note">Login to store your recommendation history automatically.</p>
              )}
              {savedRecord && (
                <p className="ssr-success">Saved at {new Date(savedRecord.createdAt).toLocaleString()}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .ssr-page {
          position: relative;
          min-height: 100vh;
          background: #f8f8f8;
          padding: 2rem 1rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .section-title { font-family: 'Cormorant Garamond', serif !important; }
        .order-tab { font-family: 'Jost', sans-serif !important; }
        .ssr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(12, 12, 12, 0.7);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          overflow-y: auto;
        }
        .ssr-panel {
          width: 100%;
          max-width: 960px;
          box-sizing: border-box;
          max-height: 95vh;
          background: #ffffff;
          border-radius: 18px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          padding: 20px;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .ssr-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .ssr-header h2 {
          margin: 0;
          font-size: 1.4rem;
          letter-spacing: -0.02em;
        }
        .ssr-header p {
          color: #545454;
          margin: 0.4rem 0 0;
          max-width: 100%;
        }
        .ssr-guidance {
          background: #fffdf2;
          border: 1px solid #f4e9c8;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          color: #333;
          font-size: 0.7rem;
          line-height: 1.35;
          margin-bottom: 0.75rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
          display: block;
          width: 100%;
          box-sizing: border-box;
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          position: relative;
          z-index: 5;
        }
        .ssr-guidance strong {
          font-weight: 700;
          margin-right: 0.4rem;
          font-size: 0.72rem;
        }
        .ssr-close {
          border: none;
          background: #111;
          color: #fff;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.95rem;
          line-height: 1;
        }
        .ssr-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(0,1.2fr) minmax(0,0.9fr);
          align-items: start;
        }
        .ssr-panel-card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 12px;
          padding: 1rem;
        }
        .ssr-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #666;
          font-weight: 700;
        }
        .ssr-file-input {
          width: 100%;
          padding: 0.65rem 0.7rem;
          border-radius: 10px;
          border: 1px solid #d7d7d7;
          margin-bottom: 0.75rem;
        }
        .ssr-image-preview {
          margin-bottom: 0.75rem;
          border-radius: 12px;
          overflow: hidden;
          background: #f4f4f4;
          min-height: 200px;
          display: grid;
          place-items: center;
        }
        .ssr-image-preview img {
          max-width: 100%;
          height: auto;
          display: block;
        }
        .ssr-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .ssr-button {
          border: none;
          padding: 0.8rem 1.1rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
        }
        .ssr-button.primary {
          background: #111;
          color: #fff;
          position: relative;
          z-index: 2;
        }
        .ssr-status-card {
          border: 1px solid #ececec;
          border-radius: 12px;
          padding: 0.8rem;
          background: #fafafa;
        }
        .ssr-status-card p {
          margin: 0.4rem 0 0;
          color: #555;
          line-height: 1.5;
        }
        .ssr-error {
          margin-top: 0.6rem;
          color: #b32929;
          font-weight: 700;
        }
        .ssr-result-card h3 {
          margin-top: 0;
          font-size: 1.05rem;
          margin-bottom: 0.65rem;
        }
        .ssr-result-details {
          display: grid;
          gap: 0.6rem;
        }
        .ssr-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.7rem 0.8rem;
          border-radius: 10px;
          background: #f7f7f7;
          color: #333;
        }
        .ssr-result-row span {
          color: #666;
          font-size: 0.95rem;
        }
        .ssr-save-row {
          margin-top: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          position: relative;
          z-index: 1;
        }
        .ssr-login-note {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }
        .ssr-success {
          color: #1d7a1d;
          font-weight: 700;
          margin: 0;
        }

        @media (max-width: 900px) {
          .ssr-grid { grid-template-columns: 1fr; }
          .ssr-panel { max-height: 100vh; padding: 14px; border-radius: 12px; }
          .ssr-image-preview { min-height: 160px; }
        }
      `}</style>
    </div>
  );
};

export default SmartSizeRecommendation;