
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
  Send,
  Inbox,
  Save,
  ArrowLeft,
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

const reportReasons = [
  "Suspicious listing",
  "Potential scam",
  "Prohibited item",
  "Misleading information",
  "Inappropriate content",
  "Other",
];

const emptyProduct = {
  name: "",
  category: "Electronics",
  price: "",
  seller: "",
  location: "",
  description: "",
};

const emptyProfile = {
  display_name: "",
  location: "",
  bio: "",
  avatar_url: "",
};

const steps = [
  {
    title: "Discover",
    text: "Browse real listings published by registered SafeTrade users.",
    Icon: Search,
  },
  {
    title: "Review the seller",
    text: "Read the seller's public profile and ask questions before buying.",
    Icon: UserRound,
  },
  {
    title: "Connect",
    text: "Contact sellers through private conversations on SafeTrade.",
    Icon: MessageCircle,
  },
  {
    title: "Trade carefully",
    text: "Meet safely, inspect items and agree on payment arrangements carefully.",
    Icon: ShieldCheck,
  },
];

function formatPrice(value) {
  return `R ${Number(value).toLocaleString("en-ZA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      <span className="image-placeholder">
        <ShoppingBag size={38} />
      </span>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [profiles, setProfiles] = useState({});
  const [saved, setSaved] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedBusy, setSavedBusy] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [myListingsOnly, setMyListingsOnly] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const [newProduct, setNewProduct] = useState({ ...emptyProduct });
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [profileForm, setProfileForm] = useState({ ...emptyProfile });
  const [profileSaving, setProfileSaving] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const dialogRef = useRef(null);
  const imageInputRef = useRef(null);
  const closeButtonRef = useRef(null);
  const messageEndRef = useRef(null);

  const overlayOpen = Boolean(modal || showAuth);
  const user = session?.user;

  const ownProfile = user ? profiles[user.id] : null;

  const displayName =
    ownProfile?.display_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.email?.split("@")[0] ||
    "SafeTrade seller";

  function isOwnListing(product) {
    return Boolean(user && product?.seller_id === user.id);
  }

  const myListingsCount = products.filter(isOwnListing).length;

  function showNotice(title, text) {
    setShowAuth(false);
    setModal({ type: "notice", title, text });
  }

  function closeModal() {
    setModal(null);
    setFormError("");
    setReportDetails("");
    setMessageText("");
  }

  function openAuth() {
    setModal(null);
    setMenuOpen(false);
    setShowAuth(true);
  }

  function scrollToMarketplace() {
    document.getElementById("marketplace")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setSavedOnly(false);
    setMyListingsOnly(false);
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading products:", error.message);
      setProductsError(error.message);
      setProductsLoading(false);
      return;
    }

    const loadedProducts = (data ?? []).map((product) => ({
      ...product,
      price: Number(product.price),
      image: product.image || "",
    }));

    setProducts(loadedProducts);
    setProductsLoading(false);

    const sellerIds = [
      ...new Set(
        loadedProducts
          .map((product) => product.seller_id)
          .filter(Boolean)
      ),
    ];

    if (sellerIds.length > 0) {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name, location, bio, avatar_url")
        .in("user_id", sellerIds);

      if (!profileError) {
        setProfiles((current) => {
          const next = { ...current };

          for (const profile of profileData ?? []) {
            next[profile.user_id] = profile;
          }

          return next;
        });
      }
    }
  }

  async function loadSavedProducts() {
    if (!user) {
      setSaved([]);
      return;
    }

    setSavedLoading(true);

    const { data, error } = await supabase
      .from("saved_products")
      .select("product_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Could not load saved products:", error.message);
      showNotice(
        "Could not load favourites",
        "Your saved listings could not be loaded. Please try again."
      );
    } else {
      setSaved((data ?? []).map((item) => item.product_id));
    }

    setSavedLoading(false);
  }

  async function loadConversations() {
    if (!user) {
      setConversations([]);
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("id, product_id, buyer_id, seller_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load conversations:", error.message);
      showNotice(
        "Could not load messages",
        "Your conversations could not be loaded. Please try again."
      );
      return;
    }

    const conversationRows = data ?? [];
    const productIds = [
      ...new Set(conversationRows.map((item) => item.product_id)),
    ];
    const participantIds = [
      ...new Set(
        conversationRows.flatMap((item) => [
          item.buyer_id,
          item.seller_id,
        ])
      ),
    ];

    const [productResult, profileResult] = await Promise.all([
      productIds.length
        ? supabase
            .from("products")
            .select("id, name, image, price")
            .in("id", productIds)
        : Promise.resolve({ data: [], error: null }),
      participantIds.length
        ? supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", participantIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const productMap = Object.fromEntries(
      (productResult.data ?? []).map((item) => [item.id, item])
    );

    const profileMap = Object.fromEntries(
      (profileResult.data ?? []).map((item) => [
        item.user_id,
        item,
      ])
    );

    setConversations(
      conversationRows.map((conversation) => ({
        ...conversation,
        product: productMap[conversation.product_id] || null,
        buyer: profileMap[conversation.buyer_id] || null,
        seller: profileMap[conversation.seller_id] || null,
        otherUserId:
          conversation.buyer_id === user.id
            ? conversation.seller_id
            : conversation.buyer_id,
        otherUserName:
          conversation.buyer_id === user.id
            ? profileMap[conversation.seller_id]?.display_name ||
              "Seller"
            : profileMap[conversation.buyer_id]?.display_name ||
              "Buyer",
      }))
    );
  }

  async function loadMessages(conversationId) {
    if (!conversationId) return;

    setMessagesLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Could not load messages:", error.message);
      showNotice(
        "Could not load messages",
        "The conversation could not be loaded. Please try again."
      );
    } else {
      setMessages(data ?? []);
    }

    setMessagesLoading(false);
  }

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setAuthLoading(false);
      setAuthError("");

      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setShowAuth(true);
        setModal(null);
      }

      if (event === "SIGNED_OUT") {
        setSaved([]);
        setConversations([]);
        setMessages([]);
        setSavedOnly(false);
        setMyListingsOnly(false);
      }
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
    loadProducts();
  }, []);

  useEffect(() => {
    if (!user) {
      setSaved([]);
      return;
    }

    loadSavedProducts();

    const loadOwnProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, location, bio, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Could not load profile:", error.message);
        return;
      }

      if (data) {
        setProfiles((current) => ({
          ...current,
          [user.id]: data,
        }));
      }
    };

    loadOwnProfile();
  }, [user?.id]);

  useEffect(() => {
    if (modal?.type !== "conversation" || !modal.conversationId) {
      return undefined;
    }

    const conversationId = modal.conversationId;

    loadMessages(conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => {
            if (current.some((item) => item.id === payload.new.id)) {
              return current;
            }

            return [...current, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [modal?.type, modal?.conversationId]);

  useEffect(() => {
    if (modal?.type !== "conversation") return;

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, modal?.type]);

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
        setRecoveryMode(false);
        setFormError("");
        return;
      }

      if (event.key !== "Tab") return;

      const controls = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

      if (!controls.length) return;

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
      product.seller,
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
      location: ownProfile?.location || "",
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

  async function toggleSaved(productId) {
    if (!user) {
      openAuth();
      return;
    }

    if (savedBusy) return;

    setSavedBusy(true);

    const alreadySaved = saved.includes(productId);

    try {
      if (alreadySaved) {
        const { error } = await supabase
          .from("saved_products")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;

        setSaved((current) =>
          current.filter((id) => id !== productId)
        );
      } else {
        const { error } = await supabase
          .from("saved_products")
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;

        setSaved((current) =>
          current.includes(productId)
            ? current
            : [...current, productId]
        );
      }
    } catch (error) {
      console.error("Could not update favourite:", error);

      showNotice(
        "Could not update favourites",
        error.message || "Please try again."
      );
    } finally {
      setSavedBusy(false);
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
      let imageUrl = isEditing ? existingProduct.image || "" : "";

      if (removeExistingImage) {
        imageUrl = "";
      }

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
      if (!data) throw new Error("The listing could not be saved.");

      const savedProduct = {
        ...data,
        price: Number(data.price),
        image: data.image || "",
      };

      setProducts((current) =>
        isEditing
          ? current.map((item) =>
              item.id === savedProduct.id ? savedProduct : item
            )
          : [
              savedProduct,
              ...current.filter((item) => item.id !== savedProduct.id),
            ]
      );

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
          : "Your listing has been published and is visible in the marketplace."
      );
    } catch (error) {
      if (uploadedImagePath) {
        try {
          await supabase.storage
            .from("product-images")
            .remove([uploadedImagePath]);
        } catch (cleanupError) {
          console.warn("Could not clean up the uploaded photo:", cleanupError);
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
          "The listing was not deleted. Please check that you own it."
        );
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      setSaved((current) =>
        current.filter((item) => item !== product.id)
      );

      if (modal?.product?.id === product.id) {
        setModal(null);
      }

      const imagePath = getProductImagePath(product.image);

      if (imagePath) {
        const { error: imageError } = await supabase.storage
          .from("product-images")
          .remove([imagePath]);

        if (imageError) {
          console.warn("Listing deleted, but photo removal failed:", imageError);
        }
      }

      showNotice(
        "Listing deleted",
        "Your listing has been deleted successfully."
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

  async function openSellerProfile(product) {
    const profile = profiles[product.seller_id];

    setModal({
      type: "seller",
      product,
      profile: profile || null,
      loading: !profile,
    });

    if (!profile && product.seller_id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, location, bio, avatar_url, created_at")
        .eq("user_id", product.seller_id)
        .maybeSingle();

      if (!error && data) {
        setProfiles((current) => ({
          ...current,
          [data.user_id]: data,
        }));

        setModal((current) =>
          current?.type === "seller" &&
          current.product?.id === product.id
            ? { ...current, profile: data, loading: false }
            : current
        );
      } else {
        setModal((current) =>
          current?.type === "seller" &&
          current.product?.id === product.id
            ? { ...current, loading: false }
            : current
        );
      }
    }
  }

  function openProfileEditor() {
    if (!user) {
      openAuth();
      return;
    }

    setProfileForm({
      display_name: ownProfile?.display_name || displayName,
      location: ownProfile?.location || "",
      bio: ownProfile?.bio || "",
      avatar_url: ownProfile?.avatar_url || "",
    });

    setFormError("");
    setModal({ type: "profile-edit" });
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!user) return;

    const display_name = profileForm.display_name.trim();
    const location = profileForm.location.trim();
    const bio = profileForm.bio.trim();
    const avatar_url = profileForm.avatar_url.trim();

    if (!display_name) {
      setFormError("Please enter a display name.");
      return;
    }

    setProfileSaving(true);
    setFormError("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name,
          location: location || null,
          bio: bio || null,
          avatar_url: avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfiles((current) => ({
        ...current,
        [user.id]: data,
      }));

      setModal(null);

      showNotice(
        "Profile updated",
        "Your public seller profile has been updated successfully."
      );
    } catch (error) {
      console.error("Could not save profile:", error);

      setFormError(
        error.message || "Your profile could not be updated."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  async function startConversation(product) {
    if (!user) {
      openAuth();
      return;
    }

    if (isOwnListing(product)) {
      showNotice(
        "Your own listing",
        "You cannot start a buyer conversation with yourself."
      );
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        "start_product_conversation",
        {
          p_product_id: product.id,
        }
      );

      if (error) throw error;

      if (!data) {
        throw new Error("A conversation could not be created.");
      }

      setMessages([]);
      setMessageText("");
      setModal({
        type: "conversation",
        conversationId: data,
        product,
      });

      loadConversations();
    } catch (error) {
      console.error("Could not start conversation:", error);

      showNotice(
        "Could not contact seller",
        error.message || "Please try again."
      );
    }
  }

  async function openInbox() {
    if (!user) {
      openAuth();
      return;
    }

    setModal({ type: "inbox", loading: true });
    await loadConversations();
    setModal((current) =>
      current?.type === "inbox"
        ? { ...current, loading: false }
        : current
    );
  }

  function openConversation(conversation) {
    setMessages([]);
    setMessageText("");

    setModal({
      type: "conversation",
      conversationId: conversation.id,
      product: conversation.product,
      otherUserName: conversation.otherUserName,
    });
  }

  async function sendMessage(event) {
    event.preventDefault();

    if (!user || !modal?.conversationId) return;

    const body = messageText.trim();

    if (!body) return;

    if (body.length > 5000) {
      showNotice(
        "Message too long",
        "Messages must contain 5,000 characters or fewer."
      );
      return;
    }

    setMessageSending(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: modal.conversationId,
          sender_id: user.id,
          body,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((current) =>
        current.some((item) => item.id === data.id)
          ? current
          : [...current, data]
      );

      setMessageText("");
    } catch (error) {
      console.error("Could not send message:", error);

      showNotice(
        "Message not sent",
        error.message || "Please try again."
      );
    } finally {
      setMessageSending(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();

    if (!user) {
      openAuth();
      return;
    }

    if (!modal?.product?.id) return;

    setReportSubmitting(true);
    setFormError("");

    try {
      const { error } = await supabase.from("reports").insert({
        product_id: modal.product.id,
        reporter_id: user.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });

      if (error) throw error;

      setModal(null);
      setReportDetails("");

      showNotice(
        "Report submitted",
        "Thank you. Your report has been recorded. This does not mean the listing has already been reviewed or removed."
      );
    } catch (error) {
      console.error("Could not submit report:", error);

      setFormError(
        error.message || "Your report could not be submitted."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      setSession(null);
      setModal(null);
      setShowAuth(false);
      setSaved([]);
      setConversations([]);
      setMessages([]);
      setSavedOnly(false);
      setMyListingsOnly(false);
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

  const selectedProduct = modal?.product;

  const modalTitle =
    modal?.type === "product"
      ? selectedProduct?.name
      : modal?.type === "seller"
        ? "Seller profile"
        : modal?.type === "sell"
          ? "Post a listing"
          : modal?.type === "edit"
            ? "Edit your listing"
            : modal?.type === "account"
              ? "Your account"
              : modal?.type === "profile-edit"
                ? "Edit your profile"
                : modal?.type === "inbox"
                  ? "Your messages"
                  : modal?.type === "conversation"
                    ? "Conversation"
                    : modal?.type === "report"
                      ? "Report listing"
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
            {user && (
              <button
                className="saved-nav"
                onClick={openInbox}
                aria-label="Open messages"
              >
                <MessageCircle size={17} />
                Messages
              </button>
            )}

            <button
              className="saved-nav"
              aria-pressed={savedOnly}
              onClick={() => {
                if (!user) {
                  openAuth();
                  return;
                }

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
        <div role="alert" className="app-alert">
          Login connection: {authError}
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-content" style={{ textAlign: "left" }}>
            <span className="eyebrow">
              <ShieldCheck size={15} />
              SOUTH AFRICAN ONLINE MARKETPLACE
            </span>

            <h1>
              Find something great.
              <br />
              <span>Trade more carefully.</span>
            </h1>

            <p>
              Discover products listed by sellers across South Africa.
              Connect with sellers, save your favourites and make
              informed decisions before trading.
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
                <Search size={15} /> Browse products
              </span>
              <span>
                <Heart size={15} /> Save favourites
              </span>
              <span>
                <MessageCircle size={15} /> Contact sellers
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
                alt="Furniture in a living room"
              />

              <div className="hero-floating-card">
                <div className="floating-icon">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <strong>Make informed decisions</strong>
                  <small>Always check before you trade.</small>
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
              <small>Find products you need</small>
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
              <small>Your saved items stay in your account</small>
            </span>
          </div>

          <div>
            <MessageCircle />
            <span>
              <strong>Contact sellers</strong>
              <small>Private buyer–seller conversations</small>
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

              <p>Explore products listed by users across South Africa.</p>
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
                if (!user) {
                  openAuth();
                  return;
                }

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
              {savedLoading ? "Loading favourites…" : `${filteredProducts.length} listing${filteredProducts.length === 1 ? "" : "s"} found`}
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

              <button className="sell-button" onClick={loadProducts}>
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={38} />

              <h3>
                {myListingsOnly
                  ? "You have no listings yet"
                  : savedOnly
                    ? "You have no saved listings"
                    : "No listings found"}
              </h3>

              <p>
                {myListingsOnly
                  ? "Your published listings will appear here."
                  : savedOnly
                    ? "Use the heart button on a listing to save it to your account."
                    : "Try another search or browse a different category."}
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
              {filteredProducts.map((item) => {
                const sellerProfile = profiles[item.seller_id];

                return (
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
                        Live listing
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
                        disabled={savedBusy}
                      >
                        <Heart
                          size={19}
                          fill={
                            saved.includes(item.id)
                              ? "currentColor"
                              : "none"
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
                          onClick={() => openSellerProfile(item)}
                        >
                          <UserRound size={15} />
                          {sellerProfile?.display_name || item.seller}
                        </button>

                        <span className="verified-tag">
                          Seller profile
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
                        <div className="listing-management">
                          <button
                            type="button"
                            className="secondary-wide"
                            onClick={() => openEditForm(item)}
                          >
                            <Pencil size={15} /> Edit
                          </button>

                          <button
                            type="button"
                            className="secondary-wide"
                            onClick={() => handleDeleteListing(item)}
                            disabled={deletingProductId === item.id}
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
                );
              })}
            </div>
          )}

          <p className="sample-notice">
            Listings are submitted by registered users. SafeTrade does not
            independently verify seller identities, product descriptions,
            ownership or prices. Always inspect products and exercise
            caution before making payments or arranging collection.
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
              Discover products, connect with sellers and make informed
              trading decisions.
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
              SafeTrade provides marketplace tools, but buyers and sellers
              must still take reasonable precautions when arranging trades.
            </p>

            <ul>
              <li>
                <CheckCircle size={18} />
                Review seller information and ask questions.
              </li>
              <li>
                <CheckCircle size={18} />
                Inspect products before making payment.
              </li>
              <li>
                <CheckCircle size={18} />
                Avoid sending money to unverified parties.
              </li>
              <li>
                <CheckCircle size={18} />
                Use the report feature to flag suspicious listings.
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
          A South African online marketplace connecting buyers and sellers.
        </p>

        <div className="footer-links">
          <a href="#marketplace">Marketplace</a>
          <a href="#how-it-works">How it works</a>
          <a href="#safety">Safety centre</a>
        </div>

        <small>
          © {new Date().getFullYear()} SafeTrade SA. All rights reserved.
        </small>
      </footer>

      {showAuth && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Log in or create an account"
        >
          <Auth
            recoveryMode={recoveryMode}
            onClose={() => {
              setShowAuth(false);
              setRecoveryMode(false);
            }}
          />
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
              ["sell", "edit", "profile-edit", "report"].includes(modal.type)
                ? " form-modal"
                : modal.type !== "product" &&
                    modal.type !== "conversation" &&
                    modal.type !== "inbox"
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
                      <strong>
                        {profiles[selectedProduct.seller_id]?.display_name ||
                          selectedProduct.seller}
                      </strong>
                      <small>Seller profile — not identity verified</small>
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
                        onClick={() => handleDeleteListing(selectedProduct)}
                        disabled={deletingProductId === selectedProduct.id}
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
                      onClick={() => startConversation(selectedProduct)}
                    >
                      <MessageCircle size={17} />
                      Contact seller
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
                      onClick={() => {
                        if (!user) {
                          openAuth();
                          return;
                        }

                        setReportReason(reportReasons[0]);
                        setReportDetails("");
                        setFormError("");
                        setModal({
                          type: "report",
                          product: selectedProduct,
                        });
                      }}
                    >
                      <Flag size={14} /> Report listing
                    </button>
                  )}

                  <p className="modal-disclaimer">
                    Seller identities, product ownership, descriptions and
                    prices are not independently verified by SafeTrade.
                    Exercise caution before completing a transaction.
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

                {modal.loading ? (
                  <p className="form-intro">Loading seller profile…</p>
                ) : (
                  <>
                    <p>
                      <strong>
                        {modal.profile?.display_name ||
                          selectedProduct.seller ||
                          "SafeTrade seller"}
                      </strong>
                    </p>

                    {modal.profile?.location && (
                      <p className="product-location">
                        <MapPin size={15} />
                        {modal.profile.location}
                      </p>
                    )}

                    {modal.profile?.bio ? (
                      <p className="form-intro">{modal.profile.bio}</p>
                    ) : (
                      <p className="form-intro">
                        This seller has not added a profile description.
                      </p>
                    )}

                    <div className="profile-status">
                      <ShieldCheck size={18} />
                      Registered account — identity not verified
                    </div>

                    <p className="modal-disclaimer">
                      This profile displays information provided by the
                      seller. It is not an identity verification certificate.
                    </p>

                    <button
                      className="primary-wide"
                      onClick={() => {
                        setModal({
                          type: "product",
                          product: selectedProduct,
                        });
                      }}
                    >
                      View listing <ChevronRight size={17} />
                    </button>
                  </>
                )}
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
                      <ShieldCheck size={18} />
                      Signed in
                    </div>

                    <button
                      className="primary-wide"
                      onClick={openProfileEditor}
                    >
                      <Pencil size={17} />
                      Edit public profile
                    </button>

                    <button
                      className="secondary-wide"
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
                      className="secondary-wide"
                      onClick={openInbox}
                    >
                      <Inbox size={17} />
                      Messages
                    </button>

                    <button
                      className="secondary-wide"
                      onClick={() => {
                        setModal(null);
                        setSavedOnly(true);
                        setMyListingsOnly(false);
                        scrollToMarketplace();
                      }}
                    >
                      <Heart size={17} />
                      Saved listings ({saved.length})
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

            {modal.type === "profile-edit" && (
              <>
                <span className="eyebrow">YOUR PUBLIC INFORMATION</span>

                <h2 id="modal-title">{modalTitle}</h2>

                <p className="form-intro">
                  This information is displayed on your public seller profile.
                  Do not include private information.
                </p>

                <form onSubmit={saveProfile}>
                  <label>
                    Display name
                    <input
                      type="text"
                      value={profileForm.display_name}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          display_name: event.target.value,
                        }))
                      }
                      maxLength={80}
                      required
                    />
                  </label>

                  <label>
                    City or town
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      maxLength={100}
                      placeholder="For example: Cape Town"
                    />
                  </label>

                  <label>
                    About you
                    <textarea
                      rows={4}
                      value={profileForm.bio}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          bio: event.target.value,
                        }))
                      }
                      maxLength={500}
                      placeholder="Tell buyers a little about yourself."
                    />
                  </label>

                  {formError && (
                    <p role="alert" className="form-error">
                      {formError}
                    </p>
                  )}

                  <button
                    className="primary-wide"
                    type="submit"
                    disabled={profileSaving}
                  >
                    <Save size={17} />
                    {profileSaving ? "Saving…" : "Save profile"}
                  </button>
                </form>
              </>
            )}

            {modal.type === "inbox" && (
              <div className="inbox-content">
                <h2 id="modal-title">Your messages</h2>

                <p className="form-intro">
                  Your private conversations with buyers and sellers.
                </p>

                {modal.loading ? (
                  <div className="empty-state">
                    <MessageCircle size={32} />
                    <p>Loading conversations…</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="empty-state">
                    <Inbox size={35} />
                    <h3>No conversations yet</h3>
                    <p>
                      When you contact a seller or receive a message,
                      conversations will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="conversation-list">
                    {conversations.map((conversation) => (
                      <button
                        className="conversation-list-item"
                        key={conversation.id}
                        onClick={() => openConversation(conversation)}
                      >
                        <span className="conversation-avatar">
                          <UserRound size={20} />
                        </span>

                        <span className="conversation-summary">
                          <strong>{conversation.otherUserName}</strong>
                          <small>
                            {conversation.product?.name ||
                              "Marketplace listing"}
                          </small>
                          <small>
                            Started {formatDate(conversation.created_at)}
                          </small>
                        </span>

                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {modal.type === "conversation" && (
              <div className="conversation-content">
                <button
                  type="button"
                  className="back-to-inbox"
                  onClick={openInbox}
                >
                  <ArrowLeft size={16} />
                  Back to messages
                </button>

                <h2 id="modal-title">
                  {modal.otherUserName || "Conversation"}
                </h2>

                {modal.product && (
                  <div className="conversation-product">
                    <strong>{modal.product.name}</strong>
                    <span>{formatPrice(modal.product.price)}</span>
                  </div>
                )}

                <div className="message-list" aria-live="polite">
                  {messagesLoading ? (
                    <p className="message-empty">Loading messages…</p>
                  ) : messages.length === 0 ? (
                    <p className="message-empty">
                      This is the beginning of your conversation. Send a
                      message to get started.
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble${
                          message.sender_id === user?.id
                            ? " own-message"
                            : ""
                        }`}
                      >
                        <p>{message.body}</p>
                        <small>{formatDateTime(message.created_at)}</small>
                      </div>
                    ))
                  )}

                  <div ref={messageEndRef} />
                </div>

                <form className="message-form" onSubmit={sendMessage}>
                  <textarea
                    rows={2}
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(event.target.value)
                    }
                    placeholder="Write your message…"
                    maxLength={5000}
                    required
                  />

                  <button
                    className="sell-button"
                    type="submit"
                    disabled={messageSending || !messageText.trim()}
                    aria-label="Send message"
                  >
                    <Send size={17} />
                    {messageSending ? "Sending…" : "Send"}
                  </button>
                </form>

                <p className="modal-disclaimer">
                  Do not share passwords, banking PINs or other sensitive
                  information in messages.
                </p>
              </div>
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
                    : "Add your product to the SafeTrade marketplace."}
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
                      <div className="image-edit-preview">
                        <p className="form-intro">Current product photo</p>

                        <img
                          src={modal.product.image}
                          alt="Current product"
                        />

                        <button
                          type="button"
                          onClick={removeSelectedImage}
                          disabled={listingSubmitting}
                        >
                          Remove current photo
                        </button>
                      </div>
                    )}

                  {imagePreview && (
                    <div className="image-edit-preview">
                      <p className="form-intro">New photo preview</p>

                      <img
                        src={imagePreview}
                        alt="Preview of the product being listed"
                      />

                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        disabled={listingSubmitting}
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
                    Add one JPG, PNG, or WEBP photo (maximum 5 MB). Do not
                    include private contact or payment information in
                    your listing.
                  </div>

                  {formError && (
                    <p role="alert" className="form-error">
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

            {modal.type === "report" && (
              <>
                <span className="eyebrow">HELP KEEP SAFETRADE SAFE</span>

                <h2 id="modal-title">Report listing</h2>

                <p className="form-intro">
                  Report a listing that appears suspicious, misleading or
                  inappropriate. Reports are recorded for review; submission
                  does not automatically remove a listing.
                </p>

                <form onSubmit={submitReport}>
                  <label>
                    Reason for report
                    <select
                      value={reportReason}
                      onChange={(event) =>
                        setReportReason(event.target.value)
                      }
                    >
                      {reportReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Additional details (optional)
                    <textarea
                      rows={4}
                      value={reportDetails}
                      onChange={(event) =>
                        setReportDetails(event.target.value)
                      }
                      maxLength={2000}
                      placeholder="Explain why you are reporting this listing."
                    />
                  </label>

                  {formError && (
                    <p role="alert" className="form-error">
                      {formError}
                    </p>
                  )}

                  <button
                    className="primary-wide"
                    type="submit"
                    disabled={reportSubmitting}
                  >
                    <Flag size={17} />
                    {reportSubmitting ? "Submitting…" : "Submit report"}
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
