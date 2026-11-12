import { useState } from "react";
import { supabase } from "./supabaseClient";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Auth({ onClose }) {
const [mode, setMode] = useState("login");
const [role, setRole] = useState("buyer");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

async function handleSubmit(e) {
e.preventDefault();
setLoading(true);
setMessage("");
setError("");

try {
if (mode === "signup") {
if (!name.trim()) {
throw new Error("Please enter your full name.");
}

const { data, error } = await supabase.auth.signUp({
email: email.trim(),
password,
options: {
data: {
full_name: name.trim(),
role: role
}
}
});

if (error) throw error;

if (data.session) {
setMessage("Your account has been created successfully!");
} else {
setMessage(
"Registration received. Please check your email to confirm your account before logging in."
);
}
} else {
const { error } = await supabase.auth.signInWithPassword({
email: email.trim(),
password
});

if (error) throw error;

setMessage("Login successful!");
if (onClose) onClose();
}
} catch (err) {
setError(err.message || "Something went wrong. Please try again.");
} finally {
setLoading(false);
}
}

return (
<div style={styles.overlay}>
<div style={styles.card}>
<button onClick={onClose} style={styles.close}>×</button>

<h2 style={styles.heading}>
{mode === "login" ? "Welcome back" : "Join SafeTrade"}
</h2>

<p style={styles.subtitle}>
{mode === "login"
? "Log in to your SafeTrade account."
: "Create an account to buy and sell safely."}
</p>

<div style={styles.tabs}>
<button
style={mode === "login" ? styles.activeTab : styles.tab}
onClick={() => {
setMode("login");
setError("");
setMessage("");
}}
>
Login
</button>

<button
style={mode === "signup" ? styles.activeTab : styles.tab}
onClick={() => {
setMode("signup");
setError("");
setMessage("");
}}
>
Register
</button>
</div>

<form onSubmit={handleSubmit}>
{mode === "signup" && (
<>
<label style={styles.label}>Full name</label>
<div style={styles.inputWrap}>
<User size={18} />
<input
style={styles.input}
type="text"
placeholder="Enter your full name"
value={name}
onChange={(e) => setName(e.target.value)}
required
/>
</div>

<label style={styles.label}>I want to</label>
<select
style={styles.select}
value={role}
onChange={(e) => setRole(e.target.value)}
>
<option value="buyer">Buy products</option>
<option value="seller">Sell products</option>
</select>
</>
)}

<label style={styles.label}>Email address</label>
<div style={styles.inputWrap}>
<Mail size={18} />
<input
style={styles.input}
type="email"
placeholder="you@example.com"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>
</div>

<label style={styles.label}>Password</label>
<div style={styles.inputWrap}>
<Lock size={18} />
<input
style={styles.input}
type={showPassword ? "text" : "password"}
placeholder="Enter your password"
value={password}
onChange={(e) => setPassword(e.target.value)}
minLength={6}
required
/>
<button
type="button"
style={styles.eye}
onClick={() => setShowPassword(!showPassword)}
>
{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>

{error && <p style={styles.error}>{error}</p>}
{message && <p style={styles.success}>{message}</p>}

<button type="submit" disabled={loading} style={styles.submit}>
{loading
? "Please wait..."
: mode === "login"
? "Log In"
: "Create Account"}
</button>
</form>

<p style={styles.footer}>
By continuing, you agree to use SafeTrade responsibly and follow
our marketplace safety guidelines.
</p>
</div>
</div>
);
}

const styles = {
overlay: {
position: "fixed",
inset: 0,
background: "rgba(0,0,0,0.65)",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "20px",
zIndex: 9999,
overflowY: "auto"
},
card: {
position: "relative",
background: "#fff",
color: "#172033",
width: "100%",
maxWidth: "430px",
padding: "32px",
borderRadius: "16px",
boxShadow: "0 15px 50px rgba(0,0,0,0.2)"
},
close: {
position: "absolute",
right: "16px",
top: "12px",
border: "none",
background: "none",
fontSize: "28px",
cursor: "pointer",
color: "#64748b"
},
heading: {
margin: "0 0 8px",
fontSize: "26px",
fontWeight: 700
},
subtitle: {
color: "#64748b",
marginBottom: "22px",
fontSize: "14px"
},
tabs: {
display: "flex",
background: "#f1f5f9",
borderRadius: "9px",
padding: "4px",
marginBottom: "22px"
},
tab: {
flex: 1,
border: "none",
padding: "11px",
background: "transparent",
cursor: "pointer",
borderRadius: "7px",
color: "#475569"
},
activeTab: {
flex: 1,
border: "none",
padding: "11px",
background: "#fff",
color: "#2563eb",
fontWeight: 700,
borderRadius: "7px",
cursor: "pointer"
},
label: {
display: "block",
fontSize: "13px",
fontWeight: 600,
marginBottom: "7px",
marginTop: "14px"
},
inputWrap: {
display: "flex",
alignItems: "center",
gap: "10px",
border: "1px solid #dbe2ea",
borderRadius: "8px",
padding: "0 12px",
color: "#64748b"
},
input: {
width: "100%",
border: "none",
outline: "none",
padding: "13px 0",
fontSize: "14px",
background: "transparent",
color: "#172033"
},
select: {
width: "100%",
padding: "13px",
border: "1px solid #dbe2ea",
borderRadius: "8px",
background: "#fff",
fontSize: "14px",
color: "#172033"
},
eye: {
border: "none",
background: "transparent",
color: "#64748b",
cursor: "pointer"
},
submit: {
width: "100%",
marginTop: "22px",
padding: "14px",
border: "none",
borderRadius: "8px",
background: "#2563eb",
color: "#fff",
fontWeight: 700,
fontSize: "15px",
cursor: "pointer"
},
error: {
color: "#dc2626",
fontSize: "13px",
marginTop: "12px"
},
success: {
color: "#15803d",
fontSize: "13px",
marginTop: "12px"
},
footer: {
marginTop: "20px",
fontSize: "11px",
color: "#94a3b8",
lineHeight: 1.6,
textAlign: "center"
}
};