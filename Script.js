// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js"
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWQk-JPIGOfDXe9K56yGER8Bqrzsf78bk",
  authDomain: "hoop-heaven.firebaseapp.com",
  projectId: "hoop-heaven",
  storageBucket: "hoop-heaven.firebasestorage.app",
  messagingSenderId: "58453106105",
  appId: "1:58453106105:web:77f3d9a2e2c4d43614aa68",
  measurementId: "G-WQTXMSTM9K",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Global variables
let currentAdmin = null
let products = []

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏡 The Hoop Heaven - Initializing...")

  // Show loading screen
  setTimeout(() => {
    const loadingScreen = document.getElementById("loadingScreen")
    if (loadingScreen) {
      loadingScreen.style.opacity = "0"
      setTimeout(() => {
        loadingScreen.style.display = "none"
      }, 500)
    }
  }, 2000)

  // Initialize all functionality
  setupEventListeners()
  setupMobileMenu()
  setupSmoothScrolling()
  setupScrollAnimations()
  checkAdminAuth()
  loadProducts()

  console.log("✅ Initialization complete!")
})

// Setup all event listeners
function setupEventListeners() {
  console.log("🔧 Setting up event listeners...")

  // Admin access button
  const adminAccessBtn = document.getElementById("adminAccessBtn")
  if (adminAccessBtn) {
    adminAccessBtn.addEventListener("click", showAdminLogin)
    console.log("✅ Admin access button listener added")
  }

  // Admin login form
  const adminLoginForm = document.getElementById("adminLoginForm")
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin)
    console.log("✅ Admin login form listener added")
  }

  // Add product button
  const addProductBtn = document.getElementById("addProductBtn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", showAddProductModal)
    console.log("✅ Add product button listener added")
  }

  // Logout button
  const logoutAdminBtn = document.getElementById("logoutAdminBtn")
  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener("click", handleAdminLogout)
    console.log("✅ Logout button listener added")
  }

  // Add product form - THIS IS THE KEY FIX
  const addProductForm = document.getElementById("addProductForm")
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProduct)
    console.log("✅ Add product form listener added")
  }

  // Product image upload
  const productImage = document.getElementById("productImage")
  if (productImage) {
    productImage.addEventListener("change", handleImagePreview)
    console.log("✅ Product image upload listener added")
  }

  // Contact form
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm)
    console.log("✅ Contact form listener added")
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      closeAllModals()
    }
  })

  // Escape key to close modals
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals()
    }
  })

  // Header scroll effect
  window.addEventListener("scroll", handleHeaderScroll)

  console.log("✅ All event listeners set up successfully!")
}

// Setup mobile menu
function setupMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobileMenuToggle")
  const navLinks = document.querySelector(".nav-links")

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active")
      mobileMenuToggle.classList.toggle("active")
    })

    // Close mobile menu when clicking on nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active")
        mobileMenuToggle.classList.remove("active")
      })
    })
  }
}

// Setup smooth scrolling
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const headerHeight = document.querySelector(".header")?.offsetHeight || 70
        const targetPosition = target.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })
}

// Admin authentication functions
function checkAdminAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user && user.email === "sadafqureshi078@gmail.com") {
      currentAdmin = user
      showAdminControls()
      console.log("✅ Admin authenticated:", user.email)
    } else {
      currentAdmin = null
      hideAdminControls()
      if (user && user.email !== "sadafqureshi078@gmail.com") {
        signOut(auth)
        showNotification("Access denied. Only authorized admin can access.", "error")
      }
    }
  })
}

function showAdminLogin() {
  const modal = document.getElementById("adminLoginModal")
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"

    // Focus on email input
    setTimeout(() => {
      const emailInput = document.getElementById("adminEmail")
      if (emailInput) emailInput.focus()
    }, 100)
  }
}

function closeAdminLogin() {
  const modal = document.getElementById("adminLoginModal")
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = "auto"
    clearAdminLoginForm()
  }
}

async function handleAdminLogin(e) {
  e.preventDefault()
  console.log("🔐 Attempting admin login...")

  const email = document.getElementById("adminEmail")?.value
  const password = document.getElementById("adminPassword")?.value
  const loginBtn = document.getElementById("adminLoginBtn")

  if (email !== "sadafqureshi078@gmail.com") {
    showError("adminErrorMessage", "Access denied. You are not authorized as admin.")
    return
  }

  if (loginBtn) {
    loginBtn.disabled = true
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'
  }

  try {
    await signInWithEmailAndPassword(auth, email, password)
    closeAdminLogin()
    showNotification("Admin login successful!", "success")
    console.log("✅ Admin login successful")
  } catch (error) {
    console.error("❌ Login error:", error)
    showError("adminErrorMessage", getFirebaseErrorMessage(error.code))
  }

  if (loginBtn) {
    loginBtn.disabled = false
    loginBtn.innerHTML = "Login as Admin"
  }
}

async function handleAdminLogout() {
  try {
    await signOut(auth)
    showNotification("Logged out successfully!", "success")
    console.log("✅ Admin logged out")
  } catch (error) {
    console.error("❌ Logout error:", error)
    showNotification("Error logging out", "error")
  }
}

function showAdminControls() {
  const adminAccessBtn = document.getElementById("adminAccessBtn")
  const adminControls = document.getElementById("adminControls")

  if (adminAccessBtn) adminAccessBtn.style.display = "none"
  if (adminControls) adminControls.classList.remove("hidden")
}

function hideAdminControls() {
  const adminAccessBtn = document.getElementById("adminAccessBtn")
  const adminControls = document.getElementById("adminControls")

  if (adminAccessBtn) adminAccessBtn.style.display = "block"
  if (adminControls) adminControls.classList.add("hidden")
}

// Product management functions
function showAddProductModal() {
  console.log("📦 Opening add product modal...")
  const modal = document.getElementById("addProductModal")
  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"

    // Focus on product name input
    setTimeout(() => {
      const nameInput = document.getElementById("productName")
      if (nameInput) nameInput.focus()
    }, 100)

    console.log("✅ Add product modal opened")
  }
}

function closeAddProductModal() {
  const modal = document.getElementById("addProductModal")
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = "auto"
    clearAddProductForm()
  }
}

// THIS IS THE MAIN FIX - Proper add product handler
async function handleAddProduct(e) {
  e.preventDefault()
  console.log("📦 Starting add product process...")

  const submitBtn = e.target.querySelector('button[type="submit"]')
  const originalHTML = submitBtn?.innerHTML

  if (submitBtn) {
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Product...'
  }

  try {
    // Get form data
    const name = document.getElementById("productName")?.value?.trim()
    const price = Number.parseFloat(document.getElementById("productPrice")?.value)
    const description = document.getElementById("productDescription")?.value?.trim()
    const category = document.getElementById("productCategory")?.value
    const featuresText = document.getElementById("productFeatures")?.value?.trim()
    const imageFile = document.getElementById("productImage")?.files[0]

    console.log("📝 Form data:", { name, price, description, category, featuresText, imageFile })

    // Validation
    if (!name || !price || !description || !category) {
      throw new Error("Please fill in all required fields")
    }

    if (!imageFile) {
      throw new Error("Please select an image for the product")
    }

    if (price <= 0) {
      throw new Error("Price must be greater than 0")
    }

    // Validate file type and size
    if (!imageFile.type.startsWith("image/")) {
      throw new Error("Please select a valid image file")
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("Image size should be less than 5MB")
    }

    console.log("✅ Validation passed, uploading image...")

    // Upload image to Firebase Storage
    const timestamp = Date.now()
    const imageRef = ref(storage, `products/${timestamp}_${imageFile.name}`)
    const snapshot = await uploadBytes(imageRef, imageFile)
    const imageUrl = await getDownloadURL(snapshot.ref)

    console.log("✅ Image uploaded:", imageUrl)

    // Process features
    const features = featuresText
      ? featuresText
          .split("\n")
          .filter((f) => f.trim())
          .map((f) => f.trim())
      : []

    // Create product data
    const productData = {
      name,
      price,
      description,
      category,
      features,
      imageUrl,
      createdAt: serverTimestamp(),
      createdBy: currentAdmin?.uid || "admin",
      status: "active",
    }

    console.log("📦 Adding product to Firestore:", productData)

    // Add product to Firestore
    const docRef = await addDoc(collection(db, "products"), productData)

    console.log("✅ Product added with ID:", docRef.id)

    // Close modal and refresh products
    closeAddProductModal()
    await loadProducts()
    showNotification("Product added successfully!", "success")
  } catch (error) {
    console.error("❌ Error adding product:", error)
    showNotification(error.message || "Error adding product", "error")
  }

  // Reset button
  if (submitBtn && originalHTML) {
    submitBtn.disabled = false
    submitBtn.innerHTML = originalHTML
  }
}

function handleImagePreview(e) {
  const file = e.target.files[0]
  const preview = document.getElementById("imagePreview")

  if (file && preview) {
    // Validate file
    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file", "error")
      e.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size should be less than 5MB", "error")
      e.target.value = ""
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">`
      preview.classList.add("has-image")
    }
    reader.readAsDataURL(file)
  }
}

// Load and display products
async function loadProducts() {
  console.log("📦 Loading products from Firebase...")

  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    products = []
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    console.log("✅ Loaded", products.length, "products")
    displayProducts()
  } catch (error) {
    console.error("❌ Error loading products:", error)
    showNotification("Error loading products", "error")
  }
}

function displayProducts() {
  const productsGrid = document.getElementById("productsGrid")
  const productsEmpty = document.getElementById("productsEmpty")

  if (!productsGrid) return

  productsGrid.innerHTML = ""

  if (products.length === 0) {
    if (productsEmpty) productsEmpty.style.display = "block"
    return
  }

  if (productsEmpty) productsEmpty.style.display = "none"

  products.forEach((product, index) => {
    const productCard = createProductCard(product, index)
    productsGrid.appendChild(productCard)
  })

  // Animate cards
  animateProductCards()
}

function createProductCard(product, index) {
  const card = document.createElement("div")
  card.className = "product-card"
  card.style.animationDelay = `${index * 0.1}s`
  card.onclick = () => showProductModal(product)

  const features = product.features || []
  const featuresHTML = features
    .slice(0, 3)
    .map((feature) => `<span class="feature-tag">${feature}</span>`)
    .join("")

  card.innerHTML = `
    <img src="${product.imageUrl || "/placeholder.svg?height=250&width=350"}" 
         alt="${product.name}" 
         class="product-image"
         onerror="this.src='/placeholder.svg?height=250&width=350'"
         loading="lazy">
    
    <div class="product-content">
        <div class="product-header">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">₹${product.price}</div>
        </div>
        
        <p class="product-description">${product.description}</p>
        
        <div class="product-features">
            ${featuresHTML}
            ${features.length > 3 ? `<span class="feature-tag">+${features.length - 3} more</span>` : ""}
        </div>
        
        <div class="product-actions">
            <a href="https://wa.me/917889842002?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}`)}" 
               class="product-btn whatsapp" 
               onclick="event.stopPropagation()">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
            </a>
            <a href="tel:+917889842002" 
               class="product-btn call" 
               onclick="event.stopPropagation()">
                <i class="fas fa-phone"></i>
                <span>Call</span>
            </a>
        </div>
    </div>
  `

  return card
}

// Product modal functions
function showProductModal(product) {
  const modal = document.getElementById("productModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalImage = document.getElementById("modalImage")
  const modalPrice = document.getElementById("modalPrice")
  const modalDescription = document.getElementById("modalDescription")
  const modalFeatures = document.getElementById("modalFeatures")
  const modalWhatsApp = document.getElementById("modalWhatsApp")
  const modalCall = document.getElementById("modalCall")

  if (modalTitle) modalTitle.textContent = product.name
  if (modalImage) {
    modalImage.src = product.imageUrl || "/placeholder.svg?height=300&width=400"
    modalImage.alt = product.name
  }
  if (modalPrice) modalPrice.textContent = `₹${product.price}`
  if (modalDescription) modalDescription.textContent = product.description

  // Clear and populate features
  if (modalFeatures) {
    modalFeatures.innerHTML = ""
    if (product.features && product.features.length > 0) {
      product.features.forEach((feature) => {
        const featureSpan = document.createElement("span")
        featureSpan.className = "modal-feature"
        featureSpan.textContent = feature
        modalFeatures.appendChild(featureSpan)
      })
    }
  }

  const whatsappMessage = `Hi! I'm interested in ${product.name}. Price: ₹${product.price}. Can you provide more details?`
  if (modalWhatsApp) modalWhatsApp.href = `https://wa.me/917889842002?text=${encodeURIComponent(whatsappMessage)}`
  if (modalCall) modalCall.href = "tel:+917889842002"

  if (modal) {
    modal.classList.remove("hidden")
    document.body.style.overflow = "hidden"
  }
}

function closeProductModal() {
  const modal = document.getElementById("productModal")
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = "auto"
  }
}

// Contact form handler
async function handleContactForm(e) {
  e.preventDefault()

  const submitBtn = e.target.querySelector(".submit-btn")
  const originalHTML = submitBtn?.innerHTML

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'
    submitBtn.disabled = true
  }

  try {
    const formData = {
      name: document.getElementById("contactName")?.value,
      phone: document.getElementById("contactPhone")?.value,
      product: document.getElementById("contactProduct")?.value,
      message: document.getElementById("contactMessage")?.value,
      timestamp: serverTimestamp(),
    }

    if (!formData.name || !formData.phone || !formData.message) {
      throw new Error("Please fill in all required fields")
    }

    await addDoc(collection(db, "contacts"), formData)

    // Send WhatsApp message
    const whatsappMessage = `New Contact Form Submission:
Name: ${formData.name}
Phone: ${formData.phone}
Product Interest: ${formData.product || "Not specified"}
Message: ${formData.message}`

    window.open(`https://wa.me/917889842002?text=${encodeURIComponent(whatsappMessage)}`, "_blank")

    e.target.reset()
    showNotification("Message sent successfully!", "success")
  } catch (error) {
    console.error("Error sending message:", error)
    showNotification(error.message || "Error sending message", "error")
  }

  if (submitBtn && originalHTML) {
    submitBtn.innerHTML = originalHTML
    submitBtn.disabled = false
  }
}

// Utility functions
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden")
  })
  document.body.style.overflow = "auto"
}

function clearAdminLoginForm() {
  const form = document.getElementById("adminLoginForm")
  if (form) form.reset()
  hideError("adminErrorMessage")
}

function clearAddProductForm() {
  const form = document.getElementById("addProductForm")
  if (form) form.reset()

  const preview = document.getElementById("imagePreview")
  if (preview) {
    preview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Click to upload image</span>'
    preview.classList.remove("has-image")
  }
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.textContent = message
    errorElement.style.display = "block"
  }
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId)
  if (errorElement) {
    errorElement.style.display = "none"
  }
}

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  const icon = notification?.querySelector(".notification-icon")
  const text = notification?.querySelector(".notification-text")

  if (notification && icon && text) {
    notification.className = `notification ${type}`
    icon.className = `notification-icon fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`
    text.textContent = message

    notification.classList.remove("hidden")

    setTimeout(() => {
      notification.classList.add("hidden")
    }, 5000)
  }
}

function getFirebaseErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later."
    default:
      return "Login failed. Please check your credentials."
  }
}

function handleHeaderScroll() {
  const header = document.querySelector(".header")
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)"
      header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)"
      header.style.boxShadow = "none"
    }
  }
}

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  setTimeout(() => {
    document.querySelectorAll(".about-item, .about-card, .contact-card, .section-header").forEach((el) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(30px)"
      el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
      observer.observe(el)
    })
  }, 1000)
}

function animateProductCards() {
  const cards = document.querySelectorAll(".product-card")
  cards.forEach((card, index) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(30px)"

    setTimeout(() => {
      card.style.opacity = "1"
      card.style.transform = "translateY(0)"
      card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
    }, index * 100)
  })
}

// Make functions available globally for onclick handlers
window.closeAdminLogin = closeAdminLogin
window.closeAddProductModal = closeAddProductModal
window.closeProductModal = closeProductModal

console.log("🏡 The Hoop Heaven - Script loaded successfully!")
