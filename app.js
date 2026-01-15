import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// YOUR FIREBASE CONFIG GOES HERE (Use the one from before)
const firebaseConfig = {
    apiKey: "AIzaSyCYMTf26H1JRlA1QRJjzzlBmnQozLBzf0U",
    authDomain: "smartq-app-7807b.firebaseapp.com",
    projectId: "smartq-app-7807b",
    databaseURL: "https://smartq-app-7807b-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
let currentUser = null;
let selectedCategory = "";

// --- NAVIGATION LOGIC ---
window.showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// --- 1. LANDING PAGE ---
// --- 1. LANDING PAGE ---
window.selectRole = (role) => {
    if(role === 'admin') {
        // Check if already logged in
        if(auth.currentUser) checkAdminStatus(auth.currentUser.uid);
        else window.showScreen('loginScreen');
    } else {
        // Customer flow -> OPEN SCANNER
        window.startScanner(); 
    }
}

// --- 2. ADMIN AUTH ---
window.adminLogin = () => {
    signInWithPopup(auth, provider)
    .then((result) => {
        checkAdminStatus(result.user.uid);
    }).catch((error) => alert(error.message));
}

async function checkAdminStatus(uid) {
    const snap = await get(ref(db, 'admins/' + uid));
    if(snap.exists()) {
        // Already setup? Go to Dashboard
        window.location.href = "admin_dashboard.html";
    } else {
        // New admin? Go to Setup
        window.showScreen('categoryScreen');
    }
}

// --- 3. CATEGORY SETUP ---
window.selectCategory = (catName) => {
    selectedCategory = catName;
    document.getElementById('cat-name-display').innerText = "Selected: " + catName;
    window.showScreen('detailsScreen');
}

window.saveBusiness = () => {
    const bizName = document.getElementById('bizName').value;
    const prefix = document.getElementById('bizPrefix').value || "T"; // Default to T-1, T-2

    if(!bizName) return alert("Please enter your Organization Name");

    const data = {
        name: bizName,
        category: selectedCategory,
        prefix: prefix,
        qrCode: window.location.origin + "/customer.html?q=" + auth.currentUser.uid, // PERMANENT QR [cite: 6]
        current: 0,
        lastToken: 0,
        skipped: []
    };

    set(ref(db, 'admins/' + auth.currentUser.uid), data).then(() => {
        window.location.href = "admin_dashboard.html";
    });
}