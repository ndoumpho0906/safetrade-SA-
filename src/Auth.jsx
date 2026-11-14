import { useState } from "react";
import { supabase } from "./supabaseClient";
import { X, ShieldCheck, Mail, Lock, User } from "lucide-react";

function Auth({ onClose }) {
const [isRegistering, setIsRegistering] = useState(false);
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

async function handleSubmit(event) {
event.preventDefault();

setLoading(true);
setError("");
setMessage("");

try {
if (isRegistering) {
if (!fullName.trim()) {
throw new Error("Please enter your full name.");
}

const { data, error } = await supabase.auth.signUp({
email: email.trim(),
password,
options: {
data: {
full_name: fullName.trim()
}
}
});

if (error) throw error;

if (data.session) {
setMessage("Your account has been created successfully.");
setTimeout(() => onClose?.(), 1200);
} else {
setMessage(
"Registration successful! Please check your email and confirm your account before logging in."
);
}
} else {
const { error } = await supabase.auth.signInWithPassword({
email: email.trim(),
password
});

if (error) throw error;

setMessage("Login successful!");

setTimeout(() => onClose?.(), 800);
}
} catch (err) {
setError(err.message || "Something went wrong. Please try again.");
} finally {
setLoading(false);
}
}

return (
<div
style={styles.overlay}
onClick={(event) => {
if (event.target === event.currentTarget) {
onClose?.();
}
}}
>
<div style={styles.modal}>
<button
type="button"
onClick={onClose}
style={styles.closeButton}
aria-label="Close"
>
<X size={22} />
</button>

<div style={styles.logo}>
<ShieldCheck size={35} />
</div>

<h2 style={styles.title}>
{isRegistering ? "Create your account" : "Welcome back"}
</h2>

<p style={styles.subtitle}>
{isRegistering
? "Join SafeTrade SA and start trading safely."
: "Log in to your SafeTrade SA account."}
</p>

<form onSubmit={handleSubmit}>
{isRegistering && (
<div style={styles.inputGroup}>
<label style={styles.label}>Full name</label>
<div style={styles.inputWrapper}>
<User size={18} style={styles.inputIcon} />
<input
type="text"
placeholder="Enter your full name"
value={fullName}
onChange={(event) => setFullName(event.target.value)}
required
style={styles.input}
/>
</div>
</div>
)}

<div style={styles.inputGroup}>
<label style={styles.label}>Email address</label>
<div style={styles.inputWrapper}>
<Mail size={18} style={styles.inputIcon} />
<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(event) => setEmail(event.target.value)}
required
style={styles.input}
/>
</div>
</div>

<div style={styles.inputGroup}>
<label style={styles.label}>Password</label>
<div style={styles.inputWrapper}>
<Lock size={18} style={styles.inputIcon} />
<input
type="password"
placeholder="Enter your password"
value={password}
onChange={(event) => setPassword(event.target.value)}
minLength={6}
required
style={styles.input}
/>
</div>
</div>

{error && (
<p style={styles.error}>{error}</p>
)}

{message && (
<p style={styles.success}>{message}</p>
)}

<button
type="submit"
disabled={loading}
style={{
...styles.submitButton,
opacity: loading ? 0.7 : 1
}}
>
{loading
? "Please wait..."
: isRegistering
? "Create Account"
: "Log In"}
</button>
</form>

<p style={styles.switchText}>
{isRegistering
? "Already have an account?"
: "Don't have an account?"}

<button
type="button"
onClick={() => {
setIsRegistering(!isRegistering);
setError("");
setMessage("");
}}
style={styles.switchButton}
>
{isRegistering ? "Log In" : "Register"}
</button>
</p>

<p style={styles.securityText}>
<ShieldCheck size={15} />
Your account is protected by Supabase authentication.
</p>
</div>
</div>
);
}

const styles = {
overlay: {
position: "fixed",
inset: 0,
backgroundColor: "rgba(0, 0, 0, 0.65)",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "20px",
zIndex: 9999
},
modal: {
backgroundColor: "#ffffff",
width: "100%",
maxWidth: "430px",
padding: "35px 28px",
borderRadius: "16px",
position: "relative",
boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
maxHeight: "90vh",
overflowY: "auto",
color: "#172033"
},
closeButton: {
position: "absolute",
right: "18px",
top: "18px",
border: "none",
background: "transparent",
cursor: "pointer",
color: "#64748b"
},
logo: {
width: "60px",
height: "60px",
borderRadius: "15px",
background: "#e8f5ee",
color: "#16834a",
display: "flex",
alignItems: "center",
justifyContent: "center",
marginBottom: "20px"
},
title: {
fontSize: "25px",
margin: "0 0 8px",
fontWeight: "700"
},
subtitle: {
color: "#64748b",
fontSize: "14px",
marginBottom: "25px",
lineHeight: 1.5
},
inputGroup: {
marginBottom: "18px"
},
label: {
display: "block",
fontSize: "13px",
fontWeight: "600",
marginBottom: "8px"
},
inputWrapper: {
display: "flex",
alignItems: "center",
border: "1px solid #dbe1e8",
borderRadius: "9px",
padding: "0 12px",
background: "#ffffff"
},
inputIcon: {
color: "#94a3b8",
flexShrink: 0
},
input: {
width: "100%",
border: "none",
outline: "none",
padding: "13px 10px",
fontSize: "14px",
background: "transparent",
color: "#172033"
},
submitButton: {
width: "100%",
padding: "14px",
border: "none",
borderRadius: "9px",
background: "#16834a",
color: "#ffffff",
fontSize: "15px",
fontWeight: "700",
cursor: "pointer",
marginTop: "8px"
},
error: {
color: "#dc2626",
background: "#fef2f2",
padding: "10px",
borderRadius: "7px",
fontSize: "13px"
},
success: {
color: "#15803d",
background: "#f0fdf4",
padding: "10px",
borderRadius: "7px",
fontSize: "13px"
},
switchText: {
textAlign: "center",
fontSize: "13px",
marginTop: "22px",
color: "#64748b"
},
switchButton: {
border: "none",
background: "transparent",
color: "#16834a",
fontWeight: "700",
cursor: "pointer",
marginLeft: "5px"
},
securityText: {
display: "flex",
alignItems: "center",
justifyContent: "center",
gap: "6px",
color: "#64748b",
fontSize: "11px",
marginTop: "22px"
}
};

export default Auth;
