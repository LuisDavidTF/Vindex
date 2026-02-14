# Vindex 📦

**Vindex** is a modern, offline-first inventory management application built for "La Tiendita". It helps track products, manage expiration dates, and organize inventory by location (boxes).

## ✨ Features

- **Product Management**: Add, Edit, Delete, and List products.
- **Expiration Tracking**: Visual alerts for items expiring soon (90 days) or already expired.
- **Smart Location**: Organize items by "Boxes" (Cajas) or generic locations.
- **Search & Filters**: Instantly find products by name, brand, or category.
- **Offline First**: All data is stored locally using SQLite.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev) / React Native
- **Language**: TypeScript
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team)
- **UI Component**: [React Native Paper](https://reactnativepaper.com)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Navigation**: Expo Router

## 🚀 Getting Started

### Prerequisites
- Node.js & npm/yarn
- Expo Go app on your phone (or Android/iOS Simulator)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vindex.git
   cd vindex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app**
   ```bash
   npx expo start
   ```
   Scan the QR code with your phone.

## 📂 Project Structure

- `src/domain`: Entities and Business Logic (Clean Architecture).
- `src/data`: Database schema, repositories, and migrations.
- `src/presentation`: UI Screens, Components, and State Management.
- `skills/`: Project-specific AI agent skills and documentation.

## 🤝 Contributing

This project follows a strict **Clean Architecture** and uses **Conventional Commits**.
Please examine `GEMINI.md` for detailed coding guidelines.

### Commit Format
- `feat(...)`: New features
- `fix(...)`: Bug fixes
- `refactor(...)`: Code improvements

---
*Built with ❤️ by Antigravity*
