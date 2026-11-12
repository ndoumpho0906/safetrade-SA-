import { useState } from "react";
import {
Search, ShieldCheck, MessageCircle, Menu, X, MapPin,
ArrowRight, Heart, ShoppingBag, UserRound, Plus
} from "lucide-react";
import "./App.css";

const products = [
{ id: 1, name: "iPhone 13 Pro", category: "Electronics", price: "R8,500", location: "Cape Town", seller: "Tech Corner", verified: true, emoji: "📱", color: "#e8edf8" },
{ id: 2, name: "Modern Sofa Set", category: "Home & Furniture", price: "R4,200", location: "Johannesburg", seller: "Home Living SA", verified: true, emoji: "🛋️", color: "#f2e9df" },
{ id: 3, name: "Mountain Bicycle", category: "Sports", price: "R2,800", location: "Pretoria", seller: "Cycle World", verified: true, emoji: "🚲", color: "#e8f0e7" },
{ id: 4, name: "PlayStation 5", category: "Electronics", price: "R9,000", location: "Durban", seller: "Gaming Hub", verified: false, emoji: "🎮", color: "#eeebf8" },
{ id: 5, name: "Designer Handbag", category: "Fashion", price: "R1,500", location: "Cape Town", seller: "Style Boutique", verified: true, emoji: "👜", color: "#f5e9ec" },
{ id: 6, name: "Toyota Corolla", category: "Vehicles", price: "R145,000", location: "Polokwane", seller: "Auto Direct", verified: true, emoji: "🚗", color: "#e8edf0" },
{ id: 7, name: "Study Desk", category: "Home & Furniture", price: "R950", location: "Stellenbosch", seller: "Furniture Store", verified: true, emoji: "🪑", color: "#f1eddf" },
{ id: 8, name: "Samsung Smart TV", category: "Electronics", price: "R5,500", location: "Cape Town", seller: "Digital SA", verified: true, emoji: "📺", color: "#e9edf3" }
];

const categories = ["All products", "Electronics", "Vehicles", "Home & Furniture", "Fashion", "Sports"];

export default function App() {
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All products");
const [mobileMenu, setMobileMenu] = useState(false);
const [saved, setSaved] = useState([]);

const filtered = products.filter(product =>
(category === "All products" || product.category === category) &&
(product.name + product.seller + product.location).toLowerCase().includes(search.toLowerCase())
);

return (
<div className="app">
<div className="topbar">
<span>South Africa's marketplace for safer trading</span>
<span className="topbar-right"><ShieldCheck size={14} /> Trade with greater confidence</span>
</div>

<header className="header">
<a className="brand" href="#">
<span className="brand-icon"><ShieldCheck size={25} /></span>
<span>Safe<span className="brand-green">Trade</span><small>SOUTH AFRICA</small></span>
</a>
<nav className={mobileMenu ? "nav open" : "nav"}>
<a href="#products" onClick={() => setMobileMenu(false)}>Marketplace</a>
<a href="#how" onClick={() => setMobileMenu(false)}>How it works</a>
<a href="#safety" onClick={() => setMobileMenu(false)}>Safety centre</a>
</nav>
<div className="header-actions">
<button className="login-btn" onClick={() => alert("Account registration will be added in the next development stage.")}>Log in</button>
<button className="sell-btn" onClick={() => alert("Seller registration will be added in the next development stage.")}><Plus size={17} /> Start selling</button>
</div>
<button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
{mobileMenu ? <X /> : <Menu />}
</button>
</header>

<main>
<section className="hero">
<div className="hero-content">
<div className="hero-tag"><ShieldCheck size={15} /> A BETTER WAY TO BUY AND SELL</div>
<h1>Buy and sell with<br /><span>greater confidence.</span></h1>
<p>Discover great deals from sellers across South Africa. Connect directly, ask questions and make informed buying decisions.</p>
<div className="hero-search">
<Search size={20} />
<input value={search} onChange={e => setSearch(e.target.value)} placeholder="What are you looking for?" />
<button onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}>Search</button>
</div>
<div className="hero-trust"><ShieldCheck size={16} /> Look for verified seller profiles and review listings carefully.</div>
</div>
<div className="hero-art">
<div className="art-circle"></div>
<div className="art-card art-card-main"><span>🛍️</span><strong>Find your next great deal</strong><small>Explore products across South Africa</small></div>
<div className="art-card art-card-small"><ShieldCheck size={22} /><div><strong>Safer connections</strong><small>Know who you're trading with</small></div></div>
<div className="art-dot dot-one"></div><div className="art-dot dot-two"></div>
</div>
</section>

<section className="trust-strip">
<div><ShieldCheck /><span><strong>Seller profiles</strong><small>Get to know the seller</small></span></div>
<div><MessageCircle /><span><strong>Direct communication</strong><small>Ask before you buy</small></span></div>
<div><MapPin /><span><strong>Across South Africa</strong><small>Discover local listings</small></span></div>
</section>

<section className="marketplace" id="products">
<div className="section-heading">
<div><span className="eyebrow">EXPLORE THE MARKETPLACE</span><h2>Find what you need.</h2><p>Browse products listed by sellers across South Africa.</p></div>
<span className="listing-count">{filtered.length} listings</span>
</div>
<div className="categories">
{categories.map(item => <button key={item} className={category === item ? "category active" : "category"} onClick={() => setCategory(item)}>{item}</button>)}
</div>
<div className="product-grid">
{filtered.map(product => (
<article className="product-card" key={product.id}>
<div className="product-image" style={{ background: product.color }}>
<span>{product.emoji}</span>
<button className="heart-btn" aria-label="Save listing" onClick={() => setSaved(old => old.includes(product.id) ? old.filter(id => id !== product.id) : [...old, product.id])}>
<Heart size={18} fill={saved.includes(product.id) ? "#d94c60" : "none"} color={saved.includes(product.id) ? "#d94c60" : "currentColor"} />
</button>
</div>
<div className="product-info">
<span className="product-category">{product.category}</span>
<h3>{product.name}</h3>
<strong className="price">{product.price}</strong>
<div className="product-location"><MapPin size={13} /> {product.location}</div>
<div className="seller-line">
<span className="seller-avatar"><UserRound size={15} /></span>
<span className="seller-name">{product.seller}</span>
{product.verified && <span className="verified" title="Seller marked as verified"><ShieldCheck size={14} /> Verified</span>}
</div>
<button className="contact-btn" onClick={() => alert("Seller messaging will be connected in a later development stage.")}><MessageCircle size={16} /> Contact seller</button>
</div>
</article>
))}
</div>
{filtered.length === 0 && <div className="empty">No listings found. Try another search.</div>}
</section>

<section className="safety-section" id="safety">
<div><span className="eyebrow">SAFETY COMES FIRST</span><h2>Make informed decisions.</h2><p>SafeTrade helps buyers and sellers connect. Always inspect items, verify details and use safe payment and collection arrangements.</p></div>
<div className="safety-points">
<div><ShieldCheck /><span><strong>Check seller profiles</strong><small>Review available profile and verification information.</small></span></div>
<div><MessageCircle /><span><strong>Ask questions</strong><small>Request more details and current product photos.</small></span></div>
<div><MapPin /><span><strong>Trade carefully</strong><small>Meet safely and never pay before you're comfortable.</small></span></div>
</div>
</section>

<section className="how-section" id="how">
<span className="eyebrow">SIMPLE TO GET STARTED</span>
<h2>Trading made straightforward.</h2>
<div className="steps">
<div><span>01</span><ShoppingBag /><h3>Discover</h3><p>Browse products and find something you need.</p></div>
<div><span>02</span><UserRound /><h3>Connect</h3><p>Review seller information and ask questions.</p></div>
<div><span>03</span><ShieldCheck /><h3>Trade carefully</h3><p>Agree on safe payment and collection arrangements.</p></div>
</div>
</section>
</main>

<footer><a className="brand footer-brand" href="#"><span className="brand-icon"><ShieldCheck /></span><span>Safe<span className="brand-green">Trade</span><small>SOUTH AFRICA</small></span></a><p>A marketplace connecting South Africans. Trade responsibly and stay alert.</p><span>© {new Date().getFullYear()} SafeTrade South Africa.</span></footer>
</div>
);
}
