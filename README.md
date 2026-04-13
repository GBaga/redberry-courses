<div align="center">
  <div style="background-color: #4F46E5; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 16px;">
    <h1 align="center" style="color: white; margin: 0; font-size: 32px;">🚀 RedClass Learning Platform</h1>
  </div>
  <p align="center">
    <strong>A modern, responsive e-learning platform built for the Redberry Bootcamp XI assignment.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

<hr />

## 📖 Overview

**RedClass** is a premium online course catalog and enrollment management system. Designed with a mobile-first approach and a sleek, modern UI, it allows users to discover new skills, filter courses dynamically, and manage their learning schedules without conflicts.

This project was developed from the ground up to meet the rigorous specifications of the **Redberry Bootcamp XI** technical assignment, achieving 100% compliance with the provided GitBook criteria.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure Login & Registration modals with real-time validation via `yup` and API error handling. |
| 🎛️ **Dynamic Catalog** | Paginated course list with real-time sidebar filtering (Categories → Topics cascading) and sorting. |
| 📅 **Smart Enrollment** | Interactive selection of *Weekly Schedules*, *Time Slots*, and *Session Types* (Online, Hybrid, In-Person). |
| ⚠️ **Conflict Detection** | Intelligent validation that prevents users from double-booking overlapping class schedules. |
| 📈 **Progress Tracking** | A dedicated off-canvas sidebar and dashboard sections to track completion percentages. |
| 📱 **Responsive UI** | Pixel-perfect layout across Mobile, Tablet, and Desktop, featuring slide-in drawers and premium micro-animations. |

---

## 🛠️ Technology Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + Custom CSS Modules/Utilities
* **State Management:** React Context API (`AuthContext`, `ModalContext`)
* **Forms & Validation:** `react-hook-form` + `yup`
* **API Calls:** `axios`
* **Icons:** `lucide-react`

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gbaga/redberry-courses.git
   cd redberry-courses
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Architecture

```plaintext
redberry-courses/
├── src/
│   ├── app/              # Next.js App Router pages (Dashboard, Catalog, Course Details)
│   ├── components/       # Reusable UI components
│   │   ├── layout/       # Navbar, Footer
│   │   ├── modals/       # Login, Register, Profile, Enrolled Sidebar
│   │   └── ui/           # Buttons, Inputs, Course Cards
│   ├── context/          # React Context providers (Auth, Modals)
│   ├── services/         # Axios API configuration and endpoints
│   └── utils/            # Helper functions (cn, animations)
├── public/               # Static assets
└── package.json          # Dependencies & Scripts
```

---

## 🎯 Status

> [!NOTE]  
> This project is a submission for the Redberry Bootcamp XI assignment. All required features, including complex state management for schedule building and responsive design edge cases, have been implemented and audited.

---

<div align="center">
  <p>Built with ❤️ for Redberry Bootcamp XI</p>
</div>
