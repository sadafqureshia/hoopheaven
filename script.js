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
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js"

// Import Appwrite SDK
// import {
//   Client,
//   Account,
//   Databases,
//   Storage,
//   ID,
//   Query,
// } from "https://cdn.jsdelivr.net/npm/appwrite@13.0.1/dist/esm/sdk.js"

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeF99hAgCiiCcV_PLVubfkqk1C48qGjZs",
  authDomain: "login-cf8a8.firebaseapp.com",
  projectId: "login-cf8a8",
  storageBucket: "login-cf8a8.appspot.com",
  messagingSenderId: "120301879243",
  appId: "1:120301879243:web:78de7d329d743b57d3c04e",
}

// Appwrite Configuration
// const APPWRITE_CONFIG = {
//   endpoint: "http://localhost/v1", // Change to your Appwrite endpoint
//   projectId: "hoop-heaven", // Change to your project ID
//   databaseId: "main",
//   collectionsId: {
//     products: "products",
//     contacts: "contacts",
//   },
//   bucketId: "products",
// }

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Appwrite
// const client = new Client()
// client.setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId)

// const account = new Account(client)
// const databases = new Databases(client)
// const storage = new Storage(client)

// Global variables
let currentAdmin = null
let products = []
let currentFilter = "all"
let currentProduct = null // Track current product in modal
let isLoading = false

// Performance optimization: Debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Performance optimization: Throttle function
function throttle(func, limit) {
  let inThrottle
  return function () {
    const args = arguments
    
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏡 The Hoop Heaven - Initializing...")

  // Initialize theme
  initializeTheme()

  // Enhanced loading screen with progress
  showLoadingWithProgress()

  // Initialize all functionality
  setupEventListeners()
  setupMobileMenu()
  setupSmoothScrolling()
  setupScrollAnimations()
  setupScrollProgress()
  setupBackToTop()
  setupProductFilters()
  setupCounterAnimations()
  setupThemeToggle()
  checkAdminAuth()
  loadProducts()

  console.log("✅ Initialization complete!")
})

// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle")
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme)
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)

  // Add smooth transition effect
  document.body.style.transition = "background-color 0.3s ease, color 0.3s ease"
  setTimeout(() => {
    document.body.style.transition = ""
  }, 300)
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById("themeToggle")
  const icon = themeToggle?.querySelector("i")
  if (icon) {
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }
}

// Enhanced loading screen with progress
function showLoadingWithProgress() {
  const progressBar = document.querySelector(".progress-bar")
  let progress = 0

  const interval = setInterval(() => {
    progress += Math.random() * 20 // Faster progress
    if (progress > 100) progress = 100

    if (progressBar) {
      progressBar.style.width = `${progress}%`
    }

    if (progress >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        const loadingScreen = document.getElementById("loadingScreen")
        if (loadingScreen) {
          loadingScreen.style.opacity = "0"
          setTimeout(() => {
            loadingScreen.style.display = "none"
            // Trigger hero animations
            triggerHeroAnimations()
          }, 300) // Faster transition
        }
      }, 200) // Faster delay
    }
  }, 50) // Faster updates
}

// Trigger hero animations
function triggerHeroAnimations() {
  const heroElements = document.querySelectorAll(".hero .animate-fade-in, .hero .animate-slide-up")
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add("animate-in")
    }, index * 100) // Faster stagger
  })
}

// Setup scroll progress bar with throttling
function setupScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress-bar")

  const updateProgress = throttle(() => {
    const scrollTop = window.pageYOffset
    const docHeight = document.body.scrollHeight - window.innerHeight
    const scrollPercent = (scrollTop / docHeight) * 100

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`
    }
  }, 16) // 60fps

  window.addEventListener("scroll", updateProgress, { passive: true })
}

// Setup back to top button with throttling
function setupBackToTop() {
  const backToTopBtn = document.getElementById("backToTop")

  const handleScroll = throttle(() => {
    if (window.pageYOffset > 300) {
      backToTopBtn?.classList.remove("hidden")
    } else {
      backToTopBtn?.classList.add("hidden")
    }
  }, 100)

  window.addEventListener("scroll", handleScroll, { passive: true })

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })
}

// Setup product filters with debouncing
function setupProductFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn")

  const debouncedFilter = debounce(() => {
    filterProducts()
  }, 150)

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"))
      // Add active class to clicked button
      btn.classList.add("active")

      // Get filter value
      currentFilter = btn.dataset.filter

      // Filter products with debouncing
      debouncedFilter()
    })
  })
}

// Optimized filter products function
function filterProducts() {
  const productCards = document.querySelectorAll(".product-card")

  // Use requestAnimationFrame for smooth animations
  requestAnimationFrame(() => {
    productCards.forEach((card, index) => {
      const category = card.dataset.category

      if (currentFilter === "all" || category === currentFilter) {
        card.style.display = "block"
        // Staggered animation
        setTimeout(() => {
          card.style.opacity = "1"
          card.style.transform = "translateY(0) scale(1)"
        }, index * 30) // Faster stagger
      } else {
        // Animate out
        card.style.opacity = "0"
        card.style.transform = "translateY(20px) scale(0.9)"
        setTimeout(() => {
          card.style.display = "none"
        }, 200) // Faster hide
      }
    })
  })
}

// Setup counter animations with Intersection Observer
function setupCounterAnimations() {
  const counters = document.querySelectorAll(".stat-number")

  const animateCounter = (counter) => {
    const target = Number.parseInt(counter.dataset.count)
    const duration = 1500 // Faster animation
    const step = target / (duration / 16)
    let current = 0

    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      counter.textContent = Math.floor(current) + (target > 99 ? "+" : "")
    }, 16)
  }

  // Intersection Observer for counter animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target.querySelector(".stat-number")
          if (counter && !counter.classList.contains("animated")) {
            counter.classList.add("animated")
            animateCounter(counter)
          }
        }
      })
    },
    { threshold: 0.5 },
  )

  document.querySelectorAll(".stat").forEach((stat) => {
    observer.observe(stat)
  })
}

// Setup all event listeners
function setupEventListeners() {
  console.log("🔧 Setting up event listeners...")

  // Admin access button
  const adminAccessBtn = document.getElementById("adminAccessBtn")
  if (adminAccessBtn) {
    adminAccessBtn.addEventListener("click", showAdminLogin)
  }

  // Admin login form
  const adminLoginForm = document.getElementById("adminLoginForm")
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin)
  }

  // Add product button
  const addProductBtn = document.getElementById("addProductBtn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", showAddProductModal)
  }

  // Logout button
  const logoutAdminBtn = document.getElementById("logoutAdminBtn")
  if (logoutAdminBtn) {
    logoutAdminBtn.addEventListener("click", handleAdminLogout)
  }

  // Add product form
  const addProductForm = document.getElementById("addProductForm")
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProduct)
  }

  // Product image upload
  const productImage = document.getElementById("productImage")
  if (productImage) {
    productImage.addEventListener("change", handleImagePreview)
  }

  // Contact form
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactForm)
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

  // Header scroll effect with throttling
  window.addEventListener("scroll", throttle(handleHeaderScroll, 16), { passive: true })

  // Notification close button
  const notificationClose = document.querySelector(".notification-close")
  if (notificationClose) {
    notificationClose.addEventListener("click", () => {
      document.getElementById("notification")?.classList.add("hidden")
    })
  }

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
    if (user && user.email === "sadafqureshi078@gmail.com"&&"muzamilmalik754@gmail.com") {
      currentAdmin = user
      showAdminControls()
      console.log("✅ Admin authenticated:", user.email)
    } else {
      currentAdmin = null
      hideAdminControls()
      if (user && user.email !== "sadafqureshi078@gmail.com"&&"muzamilmalik754@gmail.com") {
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
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login as Admin'
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

// Optimized add product handler
async function handleAddProduct(e) {
  e.preventDefault()

  if (isLoading) return // Prevent multiple submissions
  isLoading = true

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

    // Optimized image upload
    const timestamp = Date.now()
    const sanitizedFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const imageRef = ref(storage, `products/${timestamp}_${sanitizedFileName}`)

    const metadata = {
      contentType: imageFile.type,
      customMetadata: {
        "uploaded-by": currentAdmin?.uid || "admin",
        "upload-time": new Date().toISOString(),
      },
    }

    const snapshot = await uploadBytes(imageRef, imageFile, metadata)
    const imageUrl = await getDownloadURL(snapshot.ref)

    console.log("✅ Image uploaded successfully:", imageUrl)

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

  // Reset button and loading state
  if (submitBtn && originalHTML) {
    submitBtn.disabled = false
    submitBtn.innerHTML = originalHTML
  }
  isLoading = false
}

// New function: Delete product
async function deleteProduct() {
  if (!currentProduct || !currentAdmin) {
    showNotification("Unable to delete product", "error")
    return
  }

  // Confirm deletion
  if (!confirm(`Are you sure you want to delete "${currentProduct.name}"? This action cannot be undone.`)) {
    return
  }

  const deleteBtn = document.getElementById("modalDeleteBtn")
  const originalHTML = deleteBtn?.innerHTML

  if (deleteBtn) {
    deleteBtn.disabled = true
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...'
  }

  try {
    console.log("🗑️ Deleting product:", currentProduct.id)

    // Delete image from storage if it exists and is not a base64 image
    if (currentProduct.imageUrl && !currentProduct.imageUrl.startsWith("data:")) {
      try {
        const imageRef = ref(storage, currentProduct.imageUrl)
        await deleteObject(imageRef)
        console.log("✅ Product image deleted from storage")
      } catch (storageError) {
        console.warn("⚠️ Could not delete image from storage:", storageError)
        // Continue with product deletion even if image deletion fails
      }
    }

    // Delete product document from Firestore
    await deleteDoc(doc(db, "products", currentProduct.id))

    console.log("✅ Product deleted successfully")

    // Close modal and refresh products
    closeProductModal()
    await loadProducts()
    showNotification("Product deleted successfully!", "success")
  } catch (error) {
    console.error("❌ Error deleting product:", error)
    showNotification("Error deleting product", "error")
  }

  // Reset button
  if (deleteBtn && originalHTML) {
    deleteBtn.disabled = false
    deleteBtn.innerHTML = originalHTML
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

// Optimized load and display products
async function loadProducts() {
  if (isLoading) return
  isLoading = true

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

  isLoading = false
}

// Optimized display products with virtual scrolling concept
function displayProducts() {
  const productsGrid = document.getElementById("productsGrid")
  const productsEmpty = document.getElementById("productsEmpty")

  if (!productsGrid) return

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment()

  if (products.length === 0) {
    if (productsEmpty) productsEmpty.style.display = "block"
    productsGrid.innerHTML = ""
    return
  }

  if (productsEmpty) productsEmpty.style.display = "none"

  // Clear existing products
  productsGrid.innerHTML = ""

  // Create product cards in batches for better performance
  const batchSize = 6
  let currentBatch = 0

  const createBatch = () => {
    const start = currentBatch * batchSize
    const end = Math.min(start + batchSize, products.length)

    for (let i = start; i < end; i++) {
      const productCard = createProductCard(products[i], i)
      fragment.appendChild(productCard)
    }

    productsGrid.appendChild(fragment)
    currentBatch++

    // Continue with next batch if there are more products
    if (end < products.length) {
      requestAnimationFrame(createBatch)
    } else {
      // Animate cards after all are created
      requestAnimationFrame(() => {
        animateProductCards()
      })
    }
  }

  // Start creating batches
  requestAnimationFrame(createBatch)
}

// Optimized create product card
function createProductCard(product, index) {
  const card = document.createElement("div")
  card.className = "product-card animate-on-scroll"
  card.dataset.category = product.category
  card.style.animationDelay = `${(index % 6) * 0.1}s` // Reset delay for batches
  card.onclick = () => showProductModal(product)

  const features = product.features || []
  const featuresHTML = features
    .slice(0, 3)
    .map((feature) => `<span class="feature-tag"><i class="fas fa-check"></i> ${feature}</span>`)
    .join("")

  // Use template literals for better performance
  card.innerHTML = `
    <div class="product-image-container">
      <img src="${product.imageUrl || "/placeholder.svg?height=250&width=350"}" 
           alt="${product.name}" 
           class="product-image"
           onerror="this.src='/placeholder.svg?height=250&width=350'"
           loading="lazy">
      <div class="product-overlay">
        <div class="product-category">
          <i class="fas fa-${getCategoryIcon(product.category)}"></i>
          ${product.category}
        </div>
      </div>
    </div>
    
    <div class="product-content">
        <div class="product-header">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">₹${product.price}</div>
        </div>
        
        <p class="product-description">${product.description}</p>
        
        <div class="product-features">
            ${featuresHTML}
            ${features.length > 3 ? `<span class="feature-tag"><i class="fas fa-plus"></i> ${features.length - 3} more</span>` : ""}
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

function getCategoryIcon(category) {
  const icons = {
    frames: "picture-o",
    keychains: "key",
    custom: "magic",
  }
  return icons[category] || "gift"
}

// Enhanced product modal with delete functionality
function showProductModal(product) {
  currentProduct = product // Store current product for deletion

  const modal = document.getElementById("productModal")
  const modalTitle = document.getElementById("modalTitle")
  const modalImage = document.getElementById("modalImage")
  const modalPrice = document.getElementById("modalPrice")
  const modalDescription = document.getElementById("modalDescription")
  const modalFeatures = document.getElementById("modalFeatures")
  const modalWhatsApp = document.getElementById("modalWhatsApp")
  const modalCall = document.getElementById("modalCall")
  const modalDeleteBtn = document.getElementById("modalDeleteBtn")

  if (modalTitle) modalTitle.innerHTML = `<i class="fas fa-gift"></i> ${product.name}`
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
        featureSpan.innerHTML = `<i class="fas fa-check"></i> ${feature}`
        modalFeatures.appendChild(featureSpan)
      })
    }
  }

  const whatsappMessage = `Hi! I'm interested in ${product.name}. Price: ₹${product.price}. Can you provide more details?`
  if (modalWhatsApp) modalWhatsApp.href = `https://wa.me/917889842002?text=${encodeURIComponent(whatsappMessage)}`
  if (modalCall) modalCall.href = "tel:+917889842002"

  // Show/hide delete button based on admin status
  if (modalDeleteBtn) {
    if (currentAdmin) {
      modalDeleteBtn.classList.remove("hidden")
    } else {
      modalDeleteBtn.classList.add("hidden")
    }
  }

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
    currentProduct = null // Clear current product
  }
}

// Optimized contact form handler
async function handleContactForm(e) {
  e.preventDefault()

  if (isLoading) return
  isLoading = true

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
  isLoading = false
}

// Utility functions
function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden")
  })
  document.body.style.overflow = "auto"
  currentProduct = null
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

// Optimized notification system
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  const icon = notification?.querySelector(".notification-icon")
  const text = notification?.querySelector(".notification-text")

  if (notification && icon && text) {
    notification.className = `notification ${type}`
    icon.className = `notification-icon fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`
    text.textContent = message

    notification.classList.remove("hidden")

    // Auto hide after 4 seconds (faster)
    setTimeout(() => {
      notification.classList.add("hidden")
    }, 4000)
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

// Optimized header scroll effect
function handleHeaderScroll() {
  const header = document.querySelector(".header")
  if (header) {
    if (window.scrollY > 100) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  }
}

// Optimized scroll animations with Intersection Observer
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  // Observe elements with animate-on-scroll class
  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el)
  })
}

// Optimized product card animations
function animateProductCards() {
  const cards = document.querySelectorAll(".product-card")

  // Use requestAnimationFrame for smooth animations
  requestAnimationFrame(() => {
    cards.forEach((card, index) => {
      setTimeout(
        () => {
          card.classList.add("animate-in")
        },
        (index % 6) * 50,
      ) // Faster stagger, reset for batches
    })
  })
}

// Make functions available globally for onclick handlers
window.closeAdminLogin = closeAdminLogin
window.closeAddProductModal = closeAddProductModal
window.closeProductModal = closeProductModal
window.deleteProduct = deleteProduct

console.log("🏡 The Hoop Heaven - Enhanced script loaded successfully!")
