import { useState } from "react";
import Header from "../Components/header";
import Footer from "../Components/footer";
import "./FAQ.css";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Simply browse our collection, select the items you like, choose your size and quantity, and click 'Add to Cart'. When you're ready, go to your cart and proceed to checkout. Follow the steps to enter your shipping details and payment information to complete your order."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Visa, MasterCard, American Express, Discover credit/debit cards, PayPal, and Cash on Delivery (COD) for select locations."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within Sri Lanka. Express shipping is available for 1-2 business days. International shipping may take 7-14 business days depending on the destination."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free standard shipping on all orders over Rs. 10,000 within Sri Lanka."
    },
    {
      question: "What is your return policy?",
      answer: "We accept returns within 14 days of delivery. Items must be unworn, unwashed, with all original tags attached. For more details, please visit our Returns & Exchanges page."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is shipped, you will receive a confirmation email with a tracking number. You can also track your order by logging into your account and visiting the 'Order History' section."
    },
    {
      question: "How do I find my size?",
      answer: "Please refer to our Size Guide available on each product page. If you're between sizes, we recommend sizing up for a more comfortable fit."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "Orders can be changed or cancelled within 2 hours of placement. Please contact our customer support immediately if you need to make changes."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a link to reset your password."
    },
    {
      question: "How can I contact customer support?",
      answer: "You can reach us via email at support@clothingstore.com, call us at +94 11 234 5678, or use our Contact Us form. Our support team is available Monday to Friday, 9 AM to 6 PM."
    }
  ];

  return (
    <>
      <Header />
      <div className="faq-container">
        <div className="faq-hero">
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">Find answers to common questions about shopping with us</p>
        </div>

        <div className="faq-content">
          <div className="faq-section">
            <h2 className="faq-section-title">Shopping & Orders</h2>
            
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className={`faq-question ${openIndex === index ? 'active' : ''}`}
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="faq-contact-section">
            <h3>Still have questions?</h3>
            <p>Can't find the answer you're looking for? Please contact our support team.</p>
            <div className="faq-contact-buttons">
              <a href="/contactus" className="faq-contact-btn primary">Contact Us</a>
              <a href="/feedback" className="faq-contact-btn secondary">Send Feedback</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
