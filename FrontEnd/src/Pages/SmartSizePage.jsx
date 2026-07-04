import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import SmartSizeRecommendation from "../Components/SmartSizeRecommendation";
import Header from "../Components/header";
import Footer from "../Components/footer";
import NavBar from "../Components/navsidebar";
import { apiUrl } from "../services/api";

const SmartSizePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(sessionStorage.getItem("user") || "null");
  const isLoggedIn = !!(storedUser?.email);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (product || !productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl(`/products/${productId}`));
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.message || "Product not found.");
        }
      } catch (err) {
        setError("Unable to load product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isLoggedIn, navigate, product, productId]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="ssr-page-wrap">
      <Header />
      <NavBar />
      <main style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            Loading Smart Size tool...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#c00" }}>
            <h2>Smart Size</h2>
            <p>{error}</p>
            <button onClick={handleClose} style={{ marginTop: "1rem" }}>
              Go Back
            </button>
          </div>
        ) : (
          <SmartSizeRecommendation
            userId={storedUser?.id}
            isLoggedIn={isLoggedIn}
            product={product}
            pageMode={true}
            onClose={handleClose}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SmartSizePage;
