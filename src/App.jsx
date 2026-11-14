import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShieldCheck,
  MessageCircle,
  Menu,
  X,
  MapPin,
  Heart,
  ShoppingBag,
  UserRound,
  Plus,
  ChevronRight,
  Flag,
  CheckCircle,
  LogOut,
  Pencil,
  Trash2,
} from "lucide-react";
import Auth from "./Auth";
import { supabase } from "./supabaseClient";
import "./App.css";

const categories = [
  "All",
  "Electronics",
  "Food & Groceries",
  "Fashion",
  "Furniture",
  "Home & Garden",
  "Beauty & Personal Care",
  "Vehicles",
  "Property",
  "Books & Stationery",
  "Sports & Outdoors",
  "Baby & Kids",
  "Agriculture & Farming",
  "Tools & Equipment",
  "Services",
  "Other",
];

const initialProducts = [
  {
    id: "sample-phone",
    name: "iPhone 13 — 128GB",
    category: "Electronics",
    price: 6500,
    location: "Johannesburg",
    seller: "Demo Seller A",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration listing for a used phone. This item is not actually offered for sale.",
  },
  {
    id: "sample-sofa",
    name: "Three-seater sofa",
    category: "Furniture",
    price: 3200,
    location: "Cape Town",
    seller: "Demo Seller B",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration listing for a sofa. Product details and price are sample data.",
  },
  {
    id: "sample-car",
    name: "Compact city car",
    category: "Vehicles",
    price: 85000,
    location: "Pretoria",
    seller: "Demo Seller C",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration vehicle listing. No ownership, vehicle history, or condition checks have been performed.",
  },
  {
    id: "sample-shoes",
    name: "Casual sneakers",
    category: "Fashion",
    price: 450,
    location: "Durban",
    seller: "Demo Seller D",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration listing for casual sneakers. This is not a live advertisement.",
  },
  {
    id: "sample-laptop",
    name: "Everyday laptop",
    category: "Electronics",
    price: 4800,
    location: "Bloemfontein",
    seller: "Demo Seller E",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
    description:
      "Sample laptop listing for testing the marketplace interface. Specifications are not verified.",
  },
  {
    id: "sample-chair",
    name: "Office chair",
    category: "Furniture",
    price: 950,
    location: "Gqeberha",
    seller: "Demo Seller F",
    image:
      "https://unsplash.com/photos/E4hB0LMXXc0/download?force=true",
    description:
      "Sample office chair listing. No actual seller or product is connected to this demonstration.",
  },
  {
    id: "sample-plants",
    name: "Indoor plant collection",
    category: "Home & Garden",
    price: 350,
    location: "Stellenbosch",
    seller: "Demo Seller G",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration listing for indoor plants and pots. Availability is not real.",
  },
  {
    id: "sample-jacket",
    name: "Winter jacket",
    category: "Fashion",
    price: 600,
    location: "Polokwane",
    seller: "Demo Seller H",
    image:
      "https://unsplash.com/photos/92_tCTr9rtw/download?force=true",
    description:
      "Sample winter jacket listing used to demonstrate browsing and saved items.",
  },
  {
    id: "sample-playstation",
    name: "PlayStation 5",
    category: "Electronics",
    price: 8500,
    location: "Johannesburg",
    seller: "Demo Seller I",
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration gaming console listing. The photo and price are illustrative only.",
  },
  {
    id: "sample-corolla",
    name: "Toyota Corolla",
    category: "Vehicles",
    price: 145000,
    location: "Pretoria",
    seller: "Demo Seller J",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
    description:
      "Demonstration vehicle listing. The photo is illustrative and may not show the exact model. This is not a real sale.",
  },
];

const emptyProduct = {
  name: "",
  category: "Electronics",
  price: "",
  seller: "",
  location: "",
  description: "",
};

const steps = [
  {
    title: "Discover",
    text: "Search the marketplace and explore demonstration listings.",
    Icon: Search,
  },
  {
    title: "Review the seller",
    text: "Look at the available information before deciding to trade.",
    Icon: UserRound,
  },
  {
    title: "Connect",
    text: "Messaging is planned but is not connected in this version.",
    Icon: MessageCircle,
  },
  {
    title: "Trade carefully",
    text: "This demonstration does not process payments or guarantee trades.",
    Icon: ShieldCheck,
  },
];

function formatPrice(value) {
  return `R ${Number(value).toLocaleString("en-ZA", {
    maximumFractionDigits: 2,
  })}`;
}

// Extracts the file path of a photo stored in the Supabase bucket.
function getProductImagePath(imageUrl) {
  if (!imageUrl) return null;

  const marker = "/storage/v1/object/public/product-images/";
  const index = imageUrl.indexOf(marker);

  if (index === -1) return null;

  try {
    return decodeURIComponent(imageUrl.slice(index + marker.length));
  } catch {
    return imageUrl.slice(index + marker.length);
  }
}

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [product.image]);

  if (!product.image || failed) {
    return (
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: "100%",
          height: "100%",
          minHeight: "145px",
          color: "#77847d",
          fontSize: "14px",
          background: "#f1f5f2",
        }}
      >
        Photo unavailable
      </span>
    );
  }

  return (
    <img
      src={product.image}
      alt={`Illustrative sample for ${product.name}`}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [myListingsOnly, setMyListingsOnly] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const [newProduct, setNewProduct] = useState({ ...emptyProduct });
  const [formError, setFormError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  const dialogRef = useRef(null);
  const imageInputRef = useRef(null);
  const closeButtonRef = useRef(null);

  const overlayOpen = Boolean(modal || showAuth);
  const user = session?.user;

  const displayName =
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "My account";

  const isOwnListing = (product) =>
    Boolean(
      user &&
        product?.seller_id === user.id &&
        !String(product.id).startsWith("sample-")
    );

  const myListingsCount = products.filter(
    (product) => isOwnListing(product)
  ).length;

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setAuthLoading(false);
      setAuthError("");
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) setAuthError(error.message);

        setSession(data?.session ?? null);
        setAuthLoading(false);
      })
      .catch((error) => {
        if (!active) return;

        setAuthError(
          error.message || "Unable to check your login status."
        );
        setAuthLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Error loading products:", error.message);
        setProductsError(error.message);
        setProductsLoading(false);
        return;
      }

      const databaseProducts = (data ?? []).map((product) => ({
        ...product,
        price: Number(product.price),
        image: product.image || "",
      }));

      setProducts([...databaseProducts, ...initialProducts]);
      setProductsError("");
      setProductsLoading(false);
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!overlayOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      if (showAuth) {
        dialogRef.current?.querySelector("input, button")?.focus();
      } else {
        closeButtonRef.current?.focus();
      }
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setModal(null);
        setShowAuth(false);
        setFormError("");
        return;
      }

      if (event.key !== "Tab") return;

      const controls = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

      if (controls.length === 0) return;

      const first = controls[0];
      const last = controls[controls.length - 1];
      const focusInside = dialogRef.current?.contains(
        document.activeElement
      );

      if (!focusInside) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (previousFocus?.isConnected) {
        previousFocus.focus?.();
      }
    };
  }, [overlayOpen, showAuth, modal?.type]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = [
      product.name,
      product.location,
      product.category,
      product.description,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);

    return (
      matchesSearch &&
      (category === "All" || product.category === category) &&
      (!savedOnly || saved.includes(product.id)) &&
      (!myListingsOnly || isOwnListing(product))
    );
  });

  function closeModal() {
    setModal(null);
    setFormError("");
  }

  function showNotice(title, text) {
    setShowAuth(false);
    setModal({ type: "notice", title, text });
  }

  function openAuth() {
    setModal(null);
    setMenuOpen(false);
    setShowAuth(true);
  }

  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setSavedOnly(false);
    setMyListingsOnly(false);
  }

  function scrollToMarketplace() {
    document.getElementById("marketplace")?.scrollIntoView();
  }

  function openSellForm() {
    setMenuOpen(false);
    setFormError("");
    setSelectedImage(null);
    setRemoveExistingImage(false);

    if (imageInputRef.current) imageInputRef.current.value = "";

    if (!user) {
      openAuth();
      return;
    }

    setNewProduct({
      ...emptyProduct,
      seller: displayName,
    });

    setModal({ type: "sell" });
  }

  function openEditForm(product) {
    if (!isOwnListing(product)) {
      showNotice(
        "Permission denied",
        "You can only edit listings belonging to your account."
      );
      return;
    }

    setFormError("");
    setSelectedImage(null);
    setRemoveExistingImage(false);

    if (imageInputRef.current) imageInputRef.current.value = "";

    setNewProduct({
      name: product.name || "",
      category: product.category || "Other",
      price: String(product.price ?? ""),
      seller: product.seller || displayName,
      location: product.location || "",
      description: product.description || "",
    });

    setModal({ type: "edit", product });
  }

  function updateProduct(field, value) {
    setNewProduct((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Please choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("The product photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setRemoveExistingImage(false);
    setSelectedImage(file);
  }

  function removeSelectedImage() {
    setSelectedImage(null);

    if (modal?.type === "edit") {
      setRemoveExistingImage(true);
    }

    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      setSession(null);
      setMyListingsOnly(false);
      setModal(null);
      setMenuOpen(false);
    } catch (error) {
      showNotice(
        "Could not log out",
        error.message || "Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  }

  async function submitListing(event) {
    event.preventDefault();
    setFormError("");

    if (!user) {
      setModal(null);
      openAuth();
      return;
    }

    const isEditing = modal?.type === "edit";
    const existingProduct = isEditing ? modal.product : null;

    if (isEditing && !isOwnListing(existingProduct)) {
      setFormError("You are not authorised to edit this listing.");
      return;
    }

    const price = Number(newProduct.price);
    const name = newProduct.name.trim();
    const seller = newProduct.seller.trim();
    const location = newProduct.location.trim();
    const description = newProduct.description.trim();

    if (!name || !seller || !location) {
      setFormError("Please complete the required fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setFormError("Please enter a price greater than zero.");
      return;
    }

    setListingSubmitting(true);

    let uploadedImagePath = null;

    try {
      // Keep the existing photo when editing unless the user removes it.
      let imageUrl = isEditing ? existingProduct.image || "" : "";

      if (removeExistingImage) {
        imageUrl = "";
      }

      // Upload a replacement photo when the user selects one.
      if (selectedImage) {
        const fileExtension =
          selectedImage.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeExtension = [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(fileExtension)
          ? fileExtension
          : "jpg";

        uploadedImagePath = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${safeExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(uploadedImagePath, selectedImage, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedImage.type,
          });

        if (uploadError) {
          uploadedImagePath = null;
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        const { data: publicImage } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadedImagePath);

        imageUrl = publicImage.publicUrl;
      }

      const listingToSave = {
        seller_id: user.id,
        name,
        category: newProduct.category,
        price,
        location,
        seller,
        image: imageUrl,
        description: description || "No description provided.",
      };

      let data;
      let error;

      if (isEditing) {
        const result = await supabase
          .from("products")
          .update(listingToSave)
          .eq("id", existingProduct.id)
          .eq("seller_id", user.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from("products")
          .insert(listingToSave)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      if (!data) {
        throw new Error("The listing could not be saved.");
      }

      const savedProduct = {
        ...data,
        price: Number(data.price),
        image: data.image || "",
      };

      // Update the local marketplace immediately.
      if (isEditing) {
        setProducts((current) =>
          current.map((item) =>
            item.id === savedProduct.id ? savedProduct : item
          )
        );
      } else {
        setProducts((current) => [
          savedProduct,
          ...current.filter((item) => item.id !== savedProduct.id),
        ]);
      }

      // Only remove the old photo after the database update succeeds.
      if (isEditing && (selectedImage || removeExistingImage)) {
        const oldImagePath = getProductImagePath(existingProduct.image);

        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("product-images")
            .remove([oldImagePath]);

          if (removeError) {
            console.warn(
              "The listing was saved, but the previous photo could not be removed:",
              removeError.message
            );
          }
        }
      }

      setNewProduct({ ...emptyProduct });
      setSelectedImage(null);
      setRemoveExistingImage(false);

      if (imageInputRef.current) imageInputRef.current.value = "";

      clearFilters();
      setModal(null);

      showNotice(
        isEditing ? "Listing updated" : "Listing published",
        isEditing
          ? "Your listing has been updated successfully."
          : "Your listing has been saved to SafeTrade and is now visible in the marketplace."
      );
    } catch (error) {
      // Remove a newly uploaded photo if saving the listing failed.
      if (uploadedImagePath) {
        try {
          await supabase.storage
            .from("product-images")
            .remove([uploadedImagePath]);
        } catch (cleanupError) {
          console.warn(
            "Could not remove the uploaded photo after the listing failed:",
            cleanupError
          );
        }
      }

      console.error("Error saving listing:", error);

      setFormError(
        error.message || "We could not save your listing. Please try again."
      );
    } finally {
      setListingSubmitting(false);
    }
  }

  async function handleDeleteListing(product) {
    if (!user || !isOwnListing(product)) {
      showNotice(
        "Permission denied",
        "You can only delete listings belonging to your account."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingProductId(product.id);

    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .eq("seller_id", user.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "The listing was not deleted. Please check that you own this listing."
        );
      }

      // Remove the listing from the page.
      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      setSaved((current) =>
        current.filter((item) => item !== product.id)
      );

      if (
        (modal?.type === "product" ||
          modal?.type === "edit") &&
        modal.product?.id === product.id
      ) {
        setModal(null);
      }

      // Remove the associated uploaded photo, if it belongs to our bucket.
      const imagePath = getProductImagePath(product.image);

      let photoWarning = "";

      if (imagePath) {
        const { error: imageError } = await supabase.storage
          .from("product-images")
          .remove([imagePath]);

        if (imageError) {
          console.warn(
            "Listing deleted, but photo removal failed:",
            imageError.message
          );

          photoWarning =
            " The listing was deleted, but its photo could not be removed automatically.";
        }
      }

      showNotice(
        "Listing deleted",
        `Your listing has been deleted successfully.${photoWarning}`
      );
    } catch (error) {
      console.error("Error deleting listing:", error);

      showNotice(
        "Could not delete listing",
        error.message || "Please try again."
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  const selectedProduct = modal?.product;

  const modalTitle =
    modal?.type === "product"
      ? selectedProduct?.name
      : modal?.type === "seller"
        ? "Seller information"
        : modal?.type === "sell"
          ? "Post a listing"
          : modal?.type === "edit"
            ? "Edit your listing"
            : modal?.type === "account"
              ? "Your account"
              : modal?.title || "";

  return (
    <div className="app" id="home">
      <header className="header">
        <div className="nav-container">
          <a
            className="brand"
            href="#home"
            aria-label="SafeTrade SA home"
          >
            <span className="brand-icon">
              <ShieldCheck size={23} />
            </span>
            <span>
              SafeTrade<span className="brand-sa"> SA</span>
            </span>
          </a>

          <nav
            id="main-navigation"
            className={`nav-links${menuOpen ? " open" : ""}`}
            aria-label="Main navigation"
          >
            <a href="#marketplace" onClick={() => setMenuOpen(false)}>
              Marketplace
            </a>

            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>

            <a href="#safety" onClick={() => setMenuOpen(false)}>
              Safety centre
            </a>

            <button
              className="outline-button"
              disabled={authLoading}
              onClick={() => {
                if (user) {
                  setMenuOpen(false);
                  setModal({ type: "account" });
                } else {
                  openAuth();
                }
              }}
            >
              <UserRound size={17} />
              {authLoading
                ? "Checking login…"
                : user
                  ? "My account"
                  : "Login / Register"}
            </button>
          </nav>

          <div className="nav-actions">
            <button
              className="saved-nav"
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly((current) => !current);
                setMyListingsOnly(false);
                scrollToMarketplace();
              }}
            >
              <Heart size={17} />
              Saved ({saved.length})
            </button>

            <button className="sell-button" onClick={openSellForm}>
              <Plus size={17} /> Sell
            </button>

            <button
              className="menu-button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {authError && (
        <div
          role="alert"
          style={{
            background: "#fff3f3",
            color: "#9b3030",
            padding: "12px 20px",
            textAlign: "left",
          }}
        >
          Login connection: {authError}
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-content" style={{ textAlign: "left" }}>
            <span className="eyebrow">
              <ShieldCheck size={15} />
              SOUTH AFRICAN MARKETPLACE CONCEPT
            </span>

            <h1>
              Find something great.
              <br />
              <span>Trade more carefully.</span>
            </h1>

            <p>
              Explore a marketplace concept for buying and selling
              across South Africa. Product listings are demonstrations,
              not live advertisements.
            </p>

            <form
              className="hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                scrollToMarketplace();
              }}
            >
              <Search size={20} />

              <input
                aria-label="Search marketplace"
                placeholder="What are you looking for?"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button type="submit">Search</button>
            </form>

            <div className="hero-trust">
              <span>
                <Search size={15} /> Browse listings
              </span>
              <span>
                <Heart size={15} /> Save favourites
              </span>
              <span>
                <ShieldCheck size={15} /> Stay alert
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div
              className="hero-image-card"
              style={{
                background: "linear-gradient(135deg, #eaf6ef, #badfc9)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80"
                alt="Sample sofa in a living room"
              />

              <div className="hero-floating-card">
                <div className="floating-icon">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <strong>Take time to check</strong>
                  <small>No trade is guaranteed safe.</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="trust-strip">
          <div>
            <Search />
            <span>
              <strong>Explore categories</strong>
              <small>Find something useful</small>
            </span>
          </div>

          <div>
            <MapPin />
            <span>
              <strong>Browse locations</strong>
              <small>Search by city or town</small>
            </span>
          </div>

          <div>
            <Heart />
            <span>
              <strong>Save favourites</strong>
              <small>For this page session only</small>
            </span>
          </div>

          <div>
            <ShieldCheck />
            <span>
              <strong>Demo marketplace</strong>
              <small>No payments or trade guarantees</small>
            </span>
          </div>
        </div>

        <section
          className="market-section"
          id="marketplace"
          style={{ scrollMarginTop: "90px" }}
        >
          <div className="section-heading">
            <div style={{ textAlign: "left" }}>
              <span className="eyebrow">EXPLORE THE MARKETPLACE</span>

              <h2>
                {myListingsOnly
                  ? "My listings"
                  : savedOnly
                    ? "Your saved listings"
                    : "Discover listings"}
              </h2>

              <p>Explore marketplace listings from across South Africa.</p>
            </div>

            <button className="outline-button" onClick={openSellForm}>
              <Plus size={17} /> Post a listing
            </button>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-chip${
                  category === item ? " active" : ""
                }`}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}

            <button
              className={`category-chip${savedOnly ? " active" : ""}`}
              aria-pressed={savedOnly}
              onClick={() => {
                setSavedOnly((current) => !current);
                setMyListingsOnly(false);
              }}
            >
              Saved ({saved.length})
            </button>

            {user && (
              <button
                className={`category-chip${
                  myListingsOnly ? " active" : ""
                }`}
                aria-pressed={myListingsOnly}
                onClick={() => {
                  setMyListingsOnly((current) => !current);
                  setSavedOnly(false);
                }}
              >
                My Listings ({myListingsCount})
              </button>
            )}
          </div>

          <div className="market-toolbar">
            <span className="result-count" aria-live="polite">
              {filteredProducts.length} listing
              {filteredProducts.length === 1 ? "" : "s"} found
            </span>

            <div className="market-search">
              <Search size={17} />

              <input
                aria-label="Filter listings"
                placeholder="Search items, categories or locations"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {productsLoading ? (
            <div className="empty-state">
              <ShoppingBag size={38} />
              <h3>Loading listings…</h3>
              <p>Connecting to the SafeTrade marketplace.</p>
            </div>
          ) : productsError ? (
            <div className="empty-state">
              <ShoppingBag size={38} />
              <h3>Could not load listings</h3>
              <p>{productsError}</p>

              <button
                className="sell-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={38} />

              <h3>
                {myListingsOnly
                  ? "You have no listings yet"
                  : "No listings found"}
              </h3>

              <p>
                {myListingsOnly
                  ? "Your published listings will appear here."
                  : "Try another search or save an item using its heart button."}
              </p>

              {myListingsOnly ? (
                <button className="sell-button" onClick={openSellForm}>
                  <Plus size={17} /> Post your first listing
                </button>
              ) : (
                <button className="sell-button" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((item) => (
                <article className="product-card" key={item.id}>
                  <div className="product-photo">
                    <button
                      aria-label={`View ${item.name}`}
                      onClick={() =>
                        setModal({ type: "product", product: item })
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        border: 0,
                        padding: 0,
                        background: "transparent",
                      }}
                    >
                      <ProductImage product={item} />
                    </button>

                    <span className="condition-label">
                      {String(item.id).startsWith("sample-")
                        ? "Demo listing"
                        : "Live listing"}
                    </span>

                    <button
                      className={`heart-button${
                        saved.includes(item.id) ? " saved" : ""
                      }`}
                      onClick={() => toggleSaved(item.id)}
                      aria-label={
                        saved.includes(item.id)
                          ? `Unsave ${item.name}`
                          : `Save ${item.name}`
                      }
                      aria-pressed={saved.includes(item.id)}
                    >
                      <Heart
                        size={19}
                        fill={
                          saved.includes(item.id) ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className="product-info" style={{ textAlign: "left" }}>
                    <div className="product-category">{item.category}</div>
                    <h3>{item.name}</h3>

                    <div className="product-price">
                      {formatPrice(item.price)}
                    </div>

                    <div className="product-location">
                      <MapPin size={14} /> {item.location}
                    </div>

                    <div className="seller-line">
                      <button
                        className="seller-link"
                        onClick={() =>
                          setModal({ type: "seller", product: item })
                        }
                      >
                        <UserRound size={15} /> {item.seller}
                      </button>

                      <span className="verified-tag">
                        {String(item.id).startsWith("sample-")
                          ? "Demo only"
                          : "Seller account"}
                      </span>
                    </div>

                    <button
                      className="details-button"
                      onClick={() =>
                        setModal({ type: "product", product: item })
                      }
                    >
                      View details <ChevronRight size={17} />
                    </button>

                    {isOwnListing(item) && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          type="button"
                          className="secondary-wide"
                          onClick={() => openEditForm(item)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Pencil size={15} /> Edit
                        </button>

                        <button
                          type="button"
                          className="secondary-wide"
                          onClick={() => handleDeleteListing(item)}
                          disabled={deletingProductId === item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Trash2 size={15} />
                          {deletingProductId === item.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="sample-notice">
            Listings marked "Demo listing" are illustrative examples and
            are not real offers. Listings marked "Live listing" have been
            submitted by registered users and are stored in the SafeTrade
            database. Seller identities and products are not independently
            verified. Product photo uploads are supported. Messaging and
            payments are not connected yet. Saved favourites are currently
            kept only for this page session.
          </p>
        </section>

        <section
          className="how-section"
          id="how-it-works"
          style={{ scrollMarginTop: "90px" }}
        >
          <div className="section-heading centered">
            <span className="eyebrow">SIMPLE AND STRAIGHTFORWARD</span>
            <h2>How SafeTrade works</h2>
            <p>
              Explore the concept. Marketplace features are still in
              development.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map(({ title, text, Icon }, index) => (
              <div className="step-card" key={title}>
                <span className="step-number">0{index + 1}</span>
                <Icon size={28} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="safety-section"
          id="safety"
          style={{ scrollMarginTop: "90px" }}
        >
          <div className="safety-content" style={{ textAlign: "left" }}>
            <span className="eyebrow">YOUR SAFETY MATTERS</span>
            <h2>Trade with your eyes open.</h2>

            <p>
              This prototype does not verify sellers, inspect products,
              hold payments, or guarantee transactions.
            </p>

            <ul>
              <li>
                <CheckCircle size={18} />
                Sample seller profiles are not identity checks.
              </li>
              <li>
                <CheckCircle size={18} />
                Demo prices are not offers from actual sellers.
              </li>
              <li>
                <CheckCircle size={18} />
                Messaging and reporting are not connected yet.
              </li>
              <li>
                <CheckCircle size={18} />
                Do not use this demo to arrange real payments.
              </li>
            </ul>
          </div>

          <div className="safety-art" aria-hidden="true">
            <ShieldCheck size={100} strokeWidth={1.4} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-icon">
            <ShieldCheck size={23} />
          </span>
          <span>
            SafeTrade<span className="brand-sa"> SA</span>
          </span>
        </a>

        <p>
          A South African marketplace concept. Product listings are
          demonstrations.
        </p>

        <div className="footer-links">
          <a href="#marketplace">Marketplace</a>
          <a href="#how-it-works">How it works</a>
          <a href="#safety">Safety centre</a>
        </div>

        <small>
          © {new Date().getFullYear()} SafeTrade SA. Marketplace
          demonstration.
        </small>
      </footer>

      {showAuth && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Log in or create an account"
        >
          <Auth onClose={() => setShowAuth(false)} />
        </div>
      )}

      {modal && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            ref={dialogRef}
            className={`modal${
              modal.type === "sell" || modal.type === "edit"
                ? " form-modal"
                : modal.type !== "product"
                  ? " small-modal"
                  : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{ textAlign: "left" }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="modal-close"
              onClick={closeModal}
              aria-label="Close window"
            >
              <X size={18} />
            </button>

            {modal.type === "product" && selectedProduct && (
              <div className="detail-layout">
                <div className="detail-image">
                  <ProductImage product={selectedProduct} />
                </div>

                <div className="detail-content">
                  <div className="product-category">
                    {selectedProduct.category}
                  </div>

                  <h2 id="modal-title">{modalTitle}</h2>

                  <div className="detail-price">
                    {formatPrice(selectedProduct.price)}
                  </div>

                  <p className="product-location">
                    <MapPin size={15} />
                    {selectedProduct.location}
                  </p>

                  <p>{selectedProduct.description}</p>

                  <div className="detail-seller">
                    <div className="seller-avatar">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <strong>{selectedProduct.seller}</strong>
                      <small>Identity not verified</small>
                    </div>
                  </div>

                  {isOwnListing(selectedProduct) ? (
                    <>
                      <button
                        className="primary-wide"
                        onClick={() => openEditForm(selectedProduct)}
                      >
                        <Pencil size={17} />
                        Edit your listing
                      </button>

                      <button
                        className="secondary-wide"
                        onClick={() =>
                          handleDeleteListing(selectedProduct)
                        }
                        disabled={
                          deletingProductId === selectedProduct.id
                        }
                      >
                        <Trash2 size={17} />
                        {deletingProductId === selectedProduct.id
                          ? "Deleting…"
                          : "Delete listing"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="primary-wide"
                      onClick={() =>
                        showNotice(
                          "Messaging is not connected",
                          "No message has been sent. This demonstration does not connect you to a seller."
                        )
                      }
                    >
                      <MessageCircle size={17} />
                      Contact seller — demo
                    </button>
                  )}

                  <button
                    className="secondary-wide"
                    onClick={() => toggleSaved(selectedProduct.id)}
                    aria-pressed={saved.includes(selectedProduct.id)}
                  >
                    <Heart
                      size={17}
                      fill={
                        saved.includes(selectedProduct.id)
                          ? "currentColor"
                          : "none"
                      }
                    />

                    {saved.includes(selectedProduct.id)
                      ? "Remove from saved"
                      : "Save listing"}
                  </button>

                  {!isOwnListing(selectedProduct) && (
                    <button
                      className="report-link"
                      onClick={() =>
                        showNotice(
                          "Reporting is not connected",
                          "No report has been submitted. This button is a placeholder for a future reporting feature."
                        )
                      }
                    >
                      <Flag size={14} /> Report listing — demo
                    </button>
                  )}

                  <p className="modal-disclaimer">
                    Demonstration listing only. Photos are illustrative.
                    No seller verification, payment protection, or
                    fulfilment is provided.
                  </p>
                </div>
              </div>
            )}

            {modal.type === "seller" && selectedProduct && (
              <>
                <div className="seller-profile-icon">
                  <UserRound size={35} />
                </div>

                <h2 id="modal-title">{modalTitle}</h2>

                <p>
                  <strong>{selectedProduct.seller}</strong>
                </p>

                <p className="product-location">
                  <MapPin size={15} />
                  {selectedProduct.location}
                </p>

                <div className="profile-status">
                  <UserRound size={18} />
                  Demonstration profile — identity not verified
                </div>

                <p className="form-intro">
                  This listing is not linked to a verified seller account.
                  No trading history or reviews are available.
                </p>

                <button
                  className="primary-wide"
                  onClick={() =>
                    setModal({
                      type: "product",
                      product: selectedProduct,
                    })
                  }
                >
                  View listing <ChevronRight size={17} />
                </button>
              </>
            )}

            {modal.type === "account" && (
              <>
                <div className="seller-profile-icon">
                  <UserRound size={35} />
                </div>

                <h2 id="modal-title">{modalTitle}</h2>

                {user ? (
                  <>
                    <p>
                      <strong>{displayName}</strong>
                    </p>

                    <p
                      className="form-intro"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {user.email}
                    </p>

                    <div className="profile-status">
                      <UserRound size={18} />
                      Signed in
                    </div>

                    <p className="modal-disclaimer">
                      Your listings are saved to the SafeTrade database.
                      Seller identity and products are not independently
                      verified. Favourites are currently saved only for
                      this page session.
                    </p>

                    <button
                      className="primary-wide"
                      onClick={() => {
                        setModal(null);
                        setMyListingsOnly(true);
                        setSavedOnly(false);
                        scrollToMarketplace();
                      }}
                    >
                      <ShoppingBag size={17} />
                      My Listings ({myListingsCount})
                    </button>

                    <button
                      className="primary-wide"
                      onClick={handleSignOut}
                      disabled={signingOut}
                    >
                      <LogOut size={17} />
                      {signingOut ? "Logging out…" : "Log out"}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="form-intro">
                      You are not currently signed in.
                    </p>

                    <button className="primary-wide" onClick={openAuth}>
                      <UserRound size={17} />
                      Login / Register
                    </button>
                  </>
                )}
              </>
            )}

            {(modal.type === "sell" || modal.type === "edit") && (
              <>
                <span className="eyebrow">
                  {modal.type === "edit"
                    ? "MANAGE YOUR LISTING"
                    : "SELL ON SAFETRADE"}
                </span>

                <h2 id="modal-title">{modalTitle}</h2>

                <p className="form-intro">
                  {modal.type === "edit"
                    ? "Update your product details and manage its photo."
                    : "Add your item to the marketplace. You must be signed in to publish a listing."}
                </p>

                <form onSubmit={submitListing}>
                  <label>
                    Item title
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(event) =>
                        updateProduct("name", event.target.value)
                      }
                      placeholder="For example: Wooden coffee table"
                      maxLength={100}
                      required
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Category
                      <select
                        value={newProduct.category}
                        onChange={(event) =>
                          updateProduct("category", event.target.value)
                        }
                      >
                        {categories
                          .filter((item) => item !== "All")
                          .map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                      </select>
                    </label>

                    <label>
                      Price in rand
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(event) =>
                          updateProduct("price", event.target.value)
                        }
                        placeholder="500"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Display name
                      <input
                        type="text"
                        value={newProduct.seller}
                        onChange={(event) =>
                          updateProduct("seller", event.target.value)
                        }
                        placeholder="Your display name"
                        maxLength={60}
                        required
                      />
                    </label>

                    <label>
                      City or town
                      <input
                        type="text"
                        value={newProduct.location}
                        onChange={(event) =>
                          updateProduct("location", event.target.value)
                        }
                        placeholder="Cape Town"
                        maxLength={80}
                        required
                      />
                    </label>
                  </div>

                  <label>
                    Description
                    <textarea
                      rows={4}
                      value={newProduct.description}
                      onChange={(event) =>
                        updateProduct("description", event.target.value)
                      }
                      placeholder="Describe the item and its condition."
                      maxLength={2000}
                    />
                  </label>

                  <label>
                    Product photo (optional)
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>

                  {modal.type === "edit" &&
                    !imagePreview &&
                    !removeExistingImage &&
                    modal.product?.image && (
                      <div
                        style={{
                          marginTop: "10px",
                          marginBottom: "16px",
                        }}
                      >
                        <p className="form-intro">Current product photo</p>

                        <img
                          src={modal.product.image}
                          alt="Current product"
                          style={{
                            display: "block",
                            width: "100%",
                            maxHeight: "220px",
                            objectFit: "contain",
                            borderRadius: "12px",
                            background: "#f1f5f2",
                          }}
                        />

                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          disabled={listingSubmitting}
                          style={{ marginTop: "8px" }}
                        >
                          Remove current photo
                        </button>
                      </div>
                    )}

                  {imagePreview && (
                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      <p className="form-intro">New photo preview</p>

                      <img
                        src={imagePreview}
                        alt="Preview of the product being listed"
                        style={{
                          display: "block",
                          width: "100%",
                          maxHeight: "220px",
                          objectFit: "contain",
                          borderRadius: "12px",
                          background: "#f1f5f2",
                        }}
                      />

                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        disabled={listingSubmitting}
                        style={{ marginTop: "8px" }}
                      >
                        Remove photo
                      </button>
                    </div>
                  )}

                  {modal.type === "edit" &&
                    removeExistingImage &&
                    !imagePreview && (
                      <p className="form-intro">
                        The existing photo will be removed when you save.
                      </p>
                    )}

                  <div className="form-note">
                    <ShieldCheck size={17} />
                    Add one JPG, PNG, or WEBP photo (maximum 5 MB). Your
                    photo and listing will be saved to SafeTrade. Listings
                    are not independently verified. Do not enter private
                    contact or payment information in the description.
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      style={{ color: "#b42318", fontSize: "13px" }}
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    className="primary-wide"
                    type="submit"
                    disabled={listingSubmitting}
                  >
                    {modal.type === "edit" ? (
                      <Pencil size={17} />
                    ) : (
                      <Plus size={17} />
                    )}

                    {listingSubmitting
                      ? "Saving…"
                      : modal.type === "edit"
                        ? "Save changes"
                        : "Publish listing"}
                  </button>
                </form>
              </>
            )}

            {modal.type === "notice" && (
              <>
                <div className="seller-profile-icon">
                  <MessageCircle size={30} />
                </div>

                <h2 id="modal-title">{modalTitle}</h2>

                <p className="form-intro">{modal.text}</p>

                <button className="primary-wide" onClick={closeModal}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;