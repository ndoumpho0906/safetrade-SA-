import { useState } from "react";
import {
Search, ShieldCheck, MessageCircle, Menu, X, MapPin,
Heart, ShoppingBag, UserRound, Plus, ArrowLeft,
ChevronRight, Camera, Flag, Send, CheckCircle,
Smartphone, Sofa, Car, Laptop, Bike, Watch
} from "lucide-react";
import "./App.css";

const initialProducts = [
{
id: 1, name: "iPhone 13 Pro Max", category: "Electronics",
price: "R8,500", location: "Cape Town", seller: "Tech Corner",
verified: true, emoji: "📱",
image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800",
description: "iPhone 13 Pro Max in excellent condition. Contact the seller for more photographs and details."
},
{
id: 2, name: "Modern Sofa Set", category: "Furniture",
price: "R4,200", location: "Johannesburg", seller: "Home Living SA",
verified: true, emoji: "🛋️",
image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
description: "Comfortable modern sofa set. Contact the seller to arrange an inspection."
},
{
id: 3, name: "Mountain Bicycle", category: "Sports",
price: "R2,800", location: "Pretoria", seller: "Cycle World",
verified: true, emoji: "🚲",
image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800",
description: "Mountain bicycle suitable for everyday riding and outdoor adventures."
},
{
id: 4, name: "PlayStation 5", category: "Electronics",
price: "R9,000", location: "Durban", seller: "Gaming Hub",
verified: false, emoji: "🎮",
image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800",
description: "PlayStation console listing. Ask the seller about condition and included accessories."
},
{
id: 5, name: "Designer Handbag", category: "Fashion",
price: "R1,500", location: "Cape Town", seller: "Style Boutique",
verified: true, emoji: "👜",
image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
description: "Fashion handbag. Request additional photographs and proof of authenticity where applicable."
},
{
id: 6, name: "Toyota Corolla", category: "Vehicles",
price: "R145,000", location: "Polokwane", seller: "Auto Direct",
verified: true, emoji: "🚗",
image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
description: "Vehicle listing. Arrange an in-person inspection and verify all vehicle documents before paying."
},
{
id: 7, name: "Study Desk", category: "Furniture",
price: "R950", location: "Stellenbosch", seller: "Furniture Store",
verified: true, emoji: "🪑",
image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
description: "Study desk suitable for a home office or student workspace."
},
{
id: 8, name: "Samsung Smart TV", category: "Electronics",
price: "R5,500", location: "Cape Town", seller: "Digital SA",
verified: true, emoji: "📺",
image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
description: "Samsung Smart TV listing. Contact the seller to confirm the screen size, condition and accessories."
}
];

const categories = [
"All", "Electronics", "Vehicles", "Furniture",
"Fashion", "Sports", "Home & Garden"
];

function App() {
const [products, setProducts] = useState(initialProducts);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [saved, setSaved] = useState([]);
const [selectedProduct, setSelectedProduct] = useState(null);
const [selectedSeller, setSelectedSeller] = useState(null);
const [activeModal, setActiveModal] = useState("");
const [mobileMenu, setMobileMenu] = useState(false);
const [message, setMessage] = useState("");
const [reportReason, setReportReason] = useState("");
const [newProduct, setNewProduct] = useState({
name: "", category: "Electronics", price: "",
location: "", seller: "", phone: "", description: "", image: ""
});

const filteredProducts = products.filter((product) => {
const matchesCategory = category === "All" || product.category === category;
const searchText = search.toLowerCase();
const matchesSearch =
product.name.toLowerCase().includes(searchText) ||
product.category.toLowerCase().includes(searchText) ||
product.location.toLowerCase().includes(searchText) ||
product.seller.toLowerCase().includes(searchText);

return matchesCategory && matchesSearch;
});

function toggleSaved(id) {
setSaved((previous) =>
previous.includes(id)
? previous.filter((item) => item !== id)
: [...previous, id]
);
}

function openSeller(product) {
setSelectedSeller({
name: product.seller,
location: product.location,
verified: product.verified
});
setSelectedProduct(null);
setActiveModal("seller");
}

function contactOnWhatsApp(product) {
const phone = product.phone || "";
if (!phone) {
alert("The seller has not added a WhatsApp number to this demonstration listing yet.");
return;
}
const cleanPhone = phone.replace(/\D/g, "");
const text = encodeURIComponent(
`Hi, I am interested in your ${product.name} listed on SafeTrade. Is it still available?`
);
window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
}

function submitListing(event) {
event.preventDefault();

const listing = {
...newProduct,
id: Date.now(),
price: newProduct.price.startsWith("R")
? newProduct.price
: `R${newProduct.price}`,
verified: false,
emoji: "📦",
image: newProduct.image || "",
description: newProduct.description || "Please contact the seller for more information."
};

setProducts((previous) => [listing, ...previous]);
setNewProduct({
name: "", category: "Electronics", price: "",
location: "", seller: "", phone: "", description: "", image: ""
});
setActiveModal("");
setCategory("All");
setSearch("");
alert("Your demonstration listing has been added to this page. It has not been submitted to a real admin for approval.");
}

function submitMessage(event) {
event.preventDefault();
if (!message.trim()) return;
alert("This is a demonstration messaging interface. Messages are not yet delivered or stored.");
setMessage("");
setActiveModal("");
}

function submitReport(event) {
event.preventDefault();
if (!reportReason) {
alert("Please select a reason for your report.");
return;
}
alert("Your demonstration report has been recorded on this screen only. It has not been sent to an admin.");
setReportReason("");
setActiveModal("");
}

function closeModal() {
setActiveModal("");
setSelectedProduct(null);
setSelectedSeller(null);
}

return (
<div className="app">
<header className="header">
<div className="nav-container">
<a href="#home" className="brand">
<span className="brand-icon"><ShieldCheck size={25} /></span>
<span>SafeTrade<span className="brand-sa"> SA</span></span>
</a>

<nav className={mobileMenu ? "nav-links open" : "nav-links"}>
<a href="#marketplace" onClick={() => setMobileMenu(false)}>Marketplace</a>
<a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
<a href="#safety" onClick={() => setMobileMenu(false)}>Safety centre</a>
</nav>

<div className="nav-actions">
<button className="saved-nav" onClick={() => {
setCategory("All");
setSearch("");
document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
}}>
<Heart size={17} /> Saved ({saved.length})
</button>
<button className="sell-button" onClick={() => setActiveModal("sell")}>
<Plus size={18} /> Sell an item
</button>
<button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">
{mobileMenu ? <X /> : <Menu />}
</button>
</div>
</div>
</header>

<main>
<section className="hero" id="home">
<div className="hero-content">
<span className="eyebrow"><ShieldCheck size={15} /> A safer way to trade</span>
<h1>Buy and sell with<br /><span>more confidence.</span></h1>
<p>Discover products, connect with sellers and make informed trading decisions across South Africa.</p>

<div className="hero-search">
<Search size={21} />
<input
value={search}
onChange={(event) => {
setSearch(event.target.value);
document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" });
}}
placeholder="What are you looking for?"
/>
<button onClick={() => document.getElementById("marketplace")?.scrollIntoView({ behavior: "smooth" })}>
Search
</button>
</div>

<div className="hero-trust">
<span><CheckCircle size={16} /> Seller profiles</span>
<span><CheckCircle size={16} /> Safety guidance</span>
<span><CheckCircle size={16} /> Direct contact</span>
</div>
</div>
<div className="hero-visual">
<div className="hero-image-card">
<img src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900" alt="Shopping marketplace" />
<div className="hero-floating-card">
<span className="floating-icon"><ShieldCheck size={22} /></span>
<div><strong>Trade smarter</strong><small>Always verify before paying</small></div>
</div>
</div>
</div>
</section>

<section className="trust-strip">
<div><ShieldCheck /><span><strong>Safety first</strong><small>Practical trading guidance</small></span></div>
<div><UserRound /><span><strong>Seller profiles</strong><small>Know who you contact</small></span></div>
<div><MessageCircle /><span><strong>Direct communication</strong><small>Connect with sellers</small></span></div>
<div><ShoppingBag /><span><strong>Local marketplace</strong><small>Discover items in SA</small></span></div>
</section>

<section className="market-section" id="marketplace">
<div className="section-heading">
<div>
<span className="eyebrow">EXPLORE SAFE TRADE</span>
<h2>Explore the marketplace</h2>
<p>Find something you need or discover your next great deal.</p>
</div>
<button className="outline-button" onClick={() => setActiveModal("sell")}>
<Plus size={17} /> Post a listing
</button>
</div>

<div className="category-list">
{categories.map((item) => (
<button
key={item}
className={category === item ? "category-chip active" : "category-chip"}
onClick={() => setCategory(item)}
>
{item}
</button>
))}
</div>

<div className="market-toolbar">
<div className="result-count">{filteredProducts.length} items found</div>
<div className="market-search">
<Search size={17} />
<input
value={search}
onChange={(event) => setSearch(event.target.value)}
placeholder="Search products, sellers or locations"
/>
{search && <button onClick={() => setSearch("")}><X size={16} /></button>}
</div>
</div>

{filteredProducts.length === 0 ? (
<div className="empty-state">
<ShoppingBag size={38} />
<h3>No listings found</h3>
<p>Try another search term or category.</p>
<button className="sell-button" onClick={() => { setSearch(""); setCategory("All"); }}>
Clear filters
</button>
</div>
) : (
<div className="product-grid">
{filteredProducts.map((product) => (
<article className="product-card" key={product.id}>
<div className="product-photo" onClick={() => setSelectedProduct(product)}>
{product.image ? (
<img src={product.image} alt={product.name} />
) : (
<div className="image-placeholder">{product.emoji}</div>
)}
<span className="condition-label">For sale</span>
<button
className={saved.includes(product.id) ? "heart-button saved" : "heart-button"}
onClick={(event) => {
event.stopPropagation();
toggleSaved(product.id);
}}
aria-label="Save listing"
>
<Heart size={19} fill={saved.includes(product.id) ? "currentColor" : "none"} />
</button>
</div>
<div className="product-info">
<div className="product-category">{product.category}</div>
<h3 onClick={() => setSelectedProduct(product)}>{product.name}</h3>
<div className="product-price">{product.price}</div>
<div className="product-location"><MapPin size={14} /> {product.location}</div>
<div className="seller-line">
<button onClick={() => openSeller(product)} className="seller-link">
<UserRound size={15} /> {product.seller}
</button>
{product.verified && <span className="verified-tag"><ShieldCheck size={13} /> Sample</span>}
</div>
<button className="details-button" onClick={() => setSelectedProduct(product)}>
View details <ChevronRight size={17} />
</button>
</div>
</article>
))}
</div>
)}
<p className="sample-notice">Demonstration listings only. Product details, prices and seller information are sample data, not verified live advertisements.</p>
</section>

<section className="how-section" id="how-it-works">
<div className="section-heading centered">
<span className="eyebrow">SIMPLE AND STRAIGHTFORWARD</span>
<h2>How SafeTrade works</h2>
<p>A few simple steps to help you trade more carefully.</p>
</div>
<div className="steps-grid">
<div className="step-card"><span className="step-number">01</span><Search size={28} /><h3>Discover</h3><p>Search the marketplace and explore available listings.</p></div>
<div className="step-card"><span className="step-number">02</span><UserRound size={28} /><h3>Review the seller</h3><p>Read the seller profile and ask questions about the item.</p></div>
<div className="step-card"><span className="step-number">03</span><MessageCircle size={28} /><h3>Connect</h3><p>Contact the seller and arrange a safe way to inspect the item.</p></div>
<div className="step-card"><span className="step-number">04</span><ShieldCheck size={28} /><h3>Trade carefully</h3><p>Verify the item and payment details before completing a transaction.</p></div>
</div>
</section>

<section className="safety-section" id="safety">
<div className="safety-content">
<span className="eyebrow">YOUR SAFETY MATTERS</span>
<h2>Trade with your eyes open.</h2>
<p>Take time to check the product, seller and payment arrangements. Never let pressure or an attractive price rush your decision.</p>
<ul>
<li><CheckCircle /> Meet in a safe, public place where possible.</li>
<li><CheckCircle /> Inspect the product before making payment.</li>
<li><CheckCircle /> Never share passwords or banking PINs.</li>
<li><CheckCircle /> Be cautious of requests for deposits or advance payments.</li>
</ul>
</div>
<div className="safety-art"><ShieldCheck size={105} strokeWidth={1.2} /></div>
</section>
</main>

<footer className="footer">
<a href="#home" className="brand footer-brand"><span className="brand-icon"><ShieldCheck size={23} /></span><span>SafeTrade<span className="brand-sa"> SA</span></span></a>
<p>A South African marketplace concept built around safer trading.</p>
<div className="footer-links"><a href="#marketplace">Marketplace</a><a href="#how-it-works">How it works</a><a href="#safety">Safety centre</a></div>
<small>© {new Date().getFullYear()} SafeTrade South Africa. Demonstration website.</small>
</footer>

{selectedProduct && (
<div className="modal-backdrop" onClick={closeModal}>
<div className="modal product-modal" onClick={(event) => event.stopPropagation()}>
<button className="modal-close" onClick={closeModal}><X /></button>
<div className="detail-layout">
<div className="detail-image">
{selectedProduct.image
? <img src={selectedProduct.image} alt={selectedProduct.name} />
: <span>{selectedProduct.emoji}</span>}
</div>
<div className="detail-content">
<span className="product-category">{selectedProduct.category}</span>
<h2>{selectedProduct.name}</h2>
<div className="detail-price">{selectedProduct.price}</div>
<p className="product-location"><MapPin size={15} /> {selectedProduct.location}</p>
<p>{selectedProduct.description}</p>
<div className="detail-seller">
<div className="seller-avatar"><UserRound /></div>
<div><strong>{selectedProduct.seller}</strong><small>Seller profile</small></div>
{selectedProduct.verified && <span className="verified-tag"><ShieldCheck size={13} /> Sample</span>}
</div>
<button className="primary-wide" onClick={() => {
setSelectedProduct(null);
setSelectedSeller({ name: selectedProduct.seller, location: selectedProduct.location, verified: selectedProduct.verified });
setActiveModal("message");
}}><MessageCircle size={18} /> Message seller</button>
<button className="secondary-wide" onClick={() => contactOnWhatsApp(selectedProduct)}>Contact on WhatsApp</button>
<button className="report-link" onClick={() => { setSelectedProduct(null); setActiveModal("report"); }}><Flag size={15} /> Report this listing</button>
<p className="modal-disclaimer">The sample badge is not proof of actual seller verification. Always verify details independently.</p>
</div>
</div>
</div>
</div>
)}

{activeModal === "seller" && selectedSeller && (
<div className="modal-backdrop" onClick={closeModal}>
<div className="modal small-modal" onClick={(event) => event.stopPropagation()}>
<button className="modal-close" onClick={closeModal}><X /></button>
<div className="seller-profile-icon"><UserRound size={38} /></div>
<h2>{selectedSeller.name}</h2>
<p className="product-location"><MapPin size={15} /> {selectedSeller.location}</p>
<div className="profile-status"><ShieldCheck size={17} /> {selectedSeller.verified ? "Sample verified label" : "Not verified in this demo"}</div>
<p className="modal-disclaimer">This is a demonstration seller profile. No identity checks have been performed.</p>
<button className="primary-wide" onClick={() => { setSelectedSeller(null); setActiveModal("message"); }}>Message seller</button>
</div>
</div>
)}

{activeModal === "sell" && (
<div className="modal-backdrop" onClick={closeModal}>
<div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
<button className="modal-close" onClick={closeModal}><X /></button>
<span className="eyebrow">JOIN THE MARKETPLACE</span>
<h2>Post a listing</h2>
<p className="form-intro">Provide accurate information about the item you want to sell.</p>
<form onSubmit={submitListing}>
<label>Product name<input required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. iPhone 14" /></label>
<div className="form-row">
<label>Category<select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>{categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></label>
<label>Price (R)<input required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="5000" /></label>
</div>
<label>Your name / business<input required value={newProduct.seller} onChange={(e) => setNewProduct({ ...newProduct, seller: e.target.value })} placeholder="Seller name" /></label>
<div className="form-row">
<label>Location<input required value={newProduct.location} onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })} placeholder="City or town" /></label>
<label>WhatsApp number<input value={newProduct.phone} onChange={(e) => setNewProduct({ ...newProduct, phone: e.target.value })} placeholder="e.g. 27821234567" /></label>
</div>
<label>Product image URL<input value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="Paste an image URL (optional)" /></label>
<label>Description<textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Describe the product and its condition" rows="3" /></label>
<div className="form-note"><ShieldCheck size={16} /> New listings in this demo are not actually reviewed by an administrator.</div>
<button className="primary-wide" type="submit"><Plus size={18} /> Add demonstration listing</button>
</form>
</div>
</div>
)}

{activeModal === "message" && (
<div className="modal-backdrop" onClick={closeModal}>
<div className="modal small-modal" onClick={(event) => event.stopPropagation()}>
<button className="modal-close" onClick={closeModal}><X /></button>
<span className="eyebrow">CONTACT THE SELLER</span>
<h2>Send a message</h2>
<p className="form-intro">Ask a question about the product.</p>
<form onSubmit={submitMessage}>
<label>Your message<textarea required rows="5" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, is this item still available?" /></label>
<button className="primary-wide" type="submit"><Send size={17} /> Send message</button>
</form>
<p className="modal-disclaimer">Messaging is a visual demonstration only. Messages are not delivered.</p>
</div>
</div>
)}

{activeModal === "report" && (
<div className="modal-backdrop" onClick={closeModal}>
<div className="modal small-modal" onClick={(event) => event.stopPropagation()}>
<button className="modal-close" onClick={closeModal}><X /></button>
<span className="eyebrow">HELP KEEP THE MARKETPLACE SAFE</span>
<h2>Report a listing</h2>
<p className="form-intro">Choose the reason you believe this listing should be reviewed.</p>
<form onSubmit={submitReport}>
<label>Reason for reporting
<select value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
<option value="">Select a reason</option>
<option>Suspected scam or fraud</option>
<option>Misleading product information</option>
<option>Suspicious or stolen goods</option>
<option>Inappropriate content</option>
<option>Other concern</option>
</select>
</label>
<button className="primary-wide" type="submit"><Flag size={17} /> Submit demonstration report</button>
</form>
<p className="modal-disclaimer">Reports are not yet sent to a real moderation team.</p>
</div>
</div>
)}
</div>
);
}

export default App;