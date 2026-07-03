import React, { useState, useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { getRecommendedSizeByChest } from './SizeChart';
import { createSizeRecommendation } from '../services/sizeRecommendationService';

const BODY_TYPES = [
  { id: 'Slim', label: 'Slim' },
  { id: 'Regular', label: 'Regular' },
  { id: 'Athletic', label: 'Athletic' },
  { id: 'Plus', label: 'Plus' },
];

const bodyTypeFactor = {
  Slim: 0.95,
  Regular: 1,
  Athletic: 1.06,
  Plus: 1.12,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const estimateMeasurements = (landmarks, bodyType) => {
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
  const factor = bodyTypeFactor[bodyType] || 1;

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
  const [bodyType, setBodyType] = useState('Regular');
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
        setError('No body landmarks detected. Please upload a clearer image with a full-body view.');
        setStatusMessage('Pose detection failed. Try another photo.');
        setAnalysisComplete(false);
        return;
      }

      const estimate = estimateMeasurements(results.poseLandmarks, bodyType);
      if (!estimate) {
        setError('Could not estimate measurements from this image.');
        setStatusMessage('Try an image with more body visibility.');
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
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
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

  const handleEstimateWithoutImage = () => {
    const shoulderInches = 17.0 * bodyTypeFactor[bodyType];
    const chestEstimate = clamp(shoulderInches * 2.2, 30, 64);
    const recommendedSize = getRecommendedSizeByChest(chestEstimate);
    const result = {
      productId: product?.id || null,
      productName: product?.name || '',
      bodyType,
      chestEstimate: Number(chestEstimate.toFixed(1)),
      shoulderInches: Number(shoulderInches.toFixed(1)),
      hipInches: null,
      confidence: 0.7,
      recommendedSize,
      saved: false,
    };

    setRecommendation(result);
    setStatusMessage('Using body type estimate. Upload an image for a more accurate recommendation.');
    setAnalysisComplete(true);
    setSavedRecord(null);
    setError('');
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
            <label className="ssr-label">Body Type</label>
            <div className="ssr-body-type-row">
              {BODY_TYPES.map((option) => (
                <button
                  key={option.id}
                  className={`ssr-body-type-btn ${bodyType === option.id ? 'active' : ''}`}
                  onClick={() => {
                    setBodyType(option.id);
                    setRecommendation(null);
                    setAnalysisComplete(false);
                    setSavedRecord(null);
                    setStatusMessage('Body type updated. Upload an image or estimate without an image.');
                    setError('');
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="ssr-label">Upload Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="ssr-file-input" />
            {imageUrl && (
              <div className="ssr-image-preview">
                <img ref={imageRef} src={imageUrl} alt="Uploaded preview" onLoad={() => {}} />
              </div>
            )}

            <div className="ssr-actions-row">
              <button className="ssr-button primary" onClick={handleAnalyze}>
                Analyze Image
              </button>
              <button className="ssr-button secondary" onClick={handleEstimateWithoutImage}>
                Estimate By Body Type
              </button>
            </div>

            <div className="ssr-status-card">
              <strong>Status:</strong>
              <p>{statusMessage}</p>
              {error && <p className="ssr-error">{error}</p>}
            </div>
          </section>

          <section className="ssr-panel-card ssr-result-card">
            <h3>Recommendation Result</h3>
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
                    <strong>{product.name}</strong>
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
          width: min(1080px, 100%);
          max-height: 95vh;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.18);
          padding: 28px;
          position: relative;
          overflow-y: auto;
        }
        .ssr-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .ssr-header h2 {
          margin: 0;
          font-size: 1.6rem;
          letter-spacing: -0.02em;
        }
        .ssr-header p {
          color: #545454;
          margin: 0.5rem 0 0;
          max-width: 60ch;
        }
        .ssr-close {
          border: none;
          background: #111;
          color: #fff;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
        }
        .ssr-grid {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1.2fr 0.9fr;
        }
        .ssr-panel-card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 18px;
          padding: 1.2rem;
        }
        .ssr-label {
          display: block;
          margin-bottom: 0.65rem;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #666;
          font-weight: 700;
        }
        .ssr-body-type-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .ssr-body-type-btn {
          border: 1px solid #d5d5d5;
          background: #f9f9f9;
          padding: 0.85rem 1rem;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .ssr-body-type-btn.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }
        .ssr-file-input {
          width: 100%;
          padding: 0.75rem 0.8rem;
          border-radius: 12px;
          border: 1px solid #d7d7d7;
          margin-bottom: 1rem;
        }
        .ssr-image-preview {
          margin-bottom: 1rem;
          border-radius: 18px;
          overflow: hidden;
          background: #f4f4f4;
          min-height: 260px;
          display: grid;
          place-items: center;
        }
        .ssr-image-preview img {
          width: 100%;
          object-fit: contain;
        }
        .ssr-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .ssr-button {
          border: none;
          padding: 0.95rem 1.3rem;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 700;
        }
        .ssr-button.primary {
          background: #111;
          color: #fff;
        }
        .ssr-button.secondary {
          background: #f4f4f4;
          color: #111;
        }
        .ssr-status-card {
          border: 1px solid #ececec;
          border-radius: 16px;
          padding: 1rem;
          background: #fafafa;
        }
        .ssr-status-card p {
          margin: 0.5rem 0 0;
          color: #555;
          line-height: 1.6;
        }
        .ssr-error {
          margin-top: 0.75rem;
          color: #b32929;
          font-weight: 700;
        }
        .ssr-result-card h3 {
          margin-top: 0;
          font-size: 1.1rem;
          margin-bottom: 0.85rem;
        }
        .ssr-result-details {
          display: grid;
          gap: 0.85rem;
        }
        .ssr-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.9rem 1rem;
          border-radius: 14px;
          background: #f7f7f7;
          color: #333;
        }
        .ssr-result-row span {
          color: #666;
          font-size: 0.95rem;
        }
        .ssr-save-row {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          .ssr-panel { max-height: 100vh; }
        }
      `}</style>
    </div>
  );
};

export default SmartSizeRecommendation;
