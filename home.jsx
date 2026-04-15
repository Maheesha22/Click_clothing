import "./Home.css";
import { FaShoppingCart, FaUser } from "react-icons/fa";

const products = [
  {
    id: 1,
    name: "Casual T-Shirt",
    colors: "Black, White",
    sizes: "S, M, L",
    price: "Rs. 2500",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: 2,
    name: "Denim Jacket",
    colors: "Blue",
    sizes: "M, L",
    price: "Rs. 7500",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
  },
  {
    id: 3,
    name: "Summer Dress",
    colors: "Red, Yellow",
    sizes: "S, M",
    price: "Rs. 5200",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3",
  },
];

function Home() {
  return (
    <div className="home">

      {/* Navigation Bar */}
      <nav className="navbar">
        <h1 className="logo">CLICK</h1>

        <ul className="nav-links">
          <li>Home</li>
          <li>About Us</li>
          <li>Category</li>
          <li>Contact Us</li>
          <li>Login</li>
        </ul>

        <div className="nav-icons">
          <FaShoppingCart />
          <FaUser />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"
          alt="Clothing Banner"
        />
        <div className="hero-text">
          <h2>New Fashion Arrivals</h2>
          <p>Style that clicks with you</p>
        </div>
      </section>

      {/* Recently Added Products */}
      <section className="products">
        <h2>Recently Added</h2>

        <div className="product-grid">
          {products.map((item) => (
            <div className="product-card" key={item.id}>
              <img src={item.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Colors: {item.colors}</p>
              <p>Sizes: {item.sizes}</p>
              <p className="price">{item.price}</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
