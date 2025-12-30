// Theme Toggle
const themeToggle = document.getElementById("themeToggle")
const body = document.body

// Load theme from localStorage
const savedTheme = localStorage.getItem("theme")
if (savedTheme === "dark") {
  body.classList.add("dark-mode")
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode")
  const isDark = body.classList.contains("dark-mode")
  localStorage.setItem("theme", isDark ? "dark" : "light")
})

// Sidebar Toggle
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebar = document.getElementById("sidebar")

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed")
  localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"))
})

// Load sidebar state from localStorage
const sidebarCollapsed = localStorage.getItem("sidebarCollapsed")
if (sidebarCollapsed === "true") {
  sidebar.classList.add("collapsed")
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn")

mobileMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("mobile-open")
})

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 768) {
    if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove("mobile-open")
    }
  }
})

// Submenu Toggle (Main Level - HR, Finance, Loans)
const navItems = document.querySelectorAll(".nav-item.has-submenu")

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault()

    const module = item.getAttribute("data-module")
    const submenu = document.getElementById(`submenu-${module}`)

    // Close other main-level submenus
    document.querySelectorAll(".nav-item.has-submenu").forEach((otherItem) => {
      if (otherItem !== item) {
        const otherModule = otherItem.getAttribute("data-module")
        const otherSubmenu = document.getElementById(`submenu-${otherModule}`)
        if (otherSubmenu) {
          otherSubmenu.classList.remove("active")
          otherItem.classList.remove("active")
        }
      }
    })

    // Toggle current submenu
    submenu.classList.toggle("active")
    item.classList.toggle("active")
  })
})

// Nested Submenu Toggle (HR1 and similar nested items)
const nestedSubmenuButtons = document.querySelectorAll(".submenu-item.has-submenu")

nestedSubmenuButtons.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation() // Prevent parent submenu from closing

    const module = item.getAttribute("data-module")
    const submenu = document.getElementById(`submenu-${module}`)

    // Close other nested submenus at the same level
    const parentSubmenu = item.closest(".submenu")
    if (parentSubmenu) {
      parentSubmenu.querySelectorAll(".submenu-item.has-submenu").forEach((otherItem) => {
        if (otherItem !== item) {
          const otherModule = otherItem.getAttribute("data-module")
          const otherSubmenu = document.getElementById(`submenu-${otherModule}`)
          if (otherSubmenu) {
            otherSubmenu.classList.remove("active")
            otherItem.classList.remove("active")
          }
        }
      })
    }

    // Toggle current nested submenu
    submenu.classList.toggle("active")
    item.classList.toggle("active")
  })
})

// Prevent submenu links from toggling parent
document.querySelectorAll(".submenu-item:not(.has-submenu)").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation()
  })
})

// Initialize Lucide icons after page load
document.addEventListener("DOMContentLoaded", () => {
  const lucide = window.lucide 
  if (typeof lucide !== "undefined") {
    lucide.createIcons()
  }
})