# 📦 CCS MediaSync

**A modern Lab & Studio Inventory Management System built for educational institutions.**

CCS MediaSync helps IT departments and multimedia labs track equipment, monitor stock levels, and manage inventory with a clean, intuitive interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

<br />

<p align="center">
  <a href="https://finals-cecmediasync-inventory.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Visit_App-8B5CF6?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## 📸 Screenshots

### Light Mode
<img width="1588" alt="CCS MediaSync Light Mode" src="https://github.com/user-attachments/assets/51fcf7e9-296b-4641-9175-cd8ed735d30c" />

### Dark Mode
<img width="1588" alt="CCS MediaSync Dark Mode" src="https://github.com/user-attachments/assets/92aeb865-cee1-4c2f-8c7a-251514101228" />

### Visual Indicators
<img width="791" alt="Stock Level Visual Indicators" src="https://github.com/user-attachments/assets/a29da993-c33c-471d-b1b2-7b35f7ba748a" />

---

## ✨ Features

### 🎯 Smart Stock Monitoring
Four-level stock status system with visual indicators:
- 🔴 **Red** — Out of Stock (0%)
- 🟠 **Orange** — Critical (1-29%)
- 🟡 **Yellow** — Warning (30-49%)
- 🟢 **Green** — Healthy (≥50%)

### ⚡ Quick Add Catalog
Pre-configured templates for common lab and studio equipment:
- Networking supplies (RJ45, patch cords, tools)
- Workstation essentials (cables, adapters, peripherals)
- Multimedia gear (cameras, lenses, SD cards)
- Studio equipment (tripods, lighting, audio)

### 🔧 Full CRUD Operations
- Add custom inventory items with category and minimum stock thresholds
- Adjust stock quantities with +/- controls
- Delete items with confirmation modal
- Duplicate detection with consolidation options

### 🔍 Search & Filter
Real-time search functionality to quickly find equipment across your inventory.

### 🌓 Dark Mode
Built-in theme toggle with system preference detection.

### 🚀 Performance Optimized
- Smart caching during off-peak hours (8 PM - 8 AM)
- Dynamic fetching during business hours for real-time accuracy
- Server-side rendering with Next.js App Router

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Prisma 7** | Database ORM |
| **MySQL/MariaDB** | Database |
| **Tailwind CSS 4** | Styling |
| **Lucide React** | Icons |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL or MariaDB server
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ccs-mediasync.git
   cd ccs-mediasync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database connection (choose one method)
   
   # Option 1: Connection string
   DATABASE_URL="mysql://user:password@localhost:3306/mediasync"
   
   # Option 2: Individual variables
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=mediasync
   ```

4. **Set up the database**
   ```bash
   # Create the database (if it doesn't exist)
   mysql -u root -p -e "CREATE DATABASE mediasync;"
   
   # Run Prisma migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
├── app/
│   ├── components/
│   │   ├── CategorySelector.tsx    # Category dropdown
│   │   ├── CustomItemForm.tsx      # Manual item entry form
│   │   ├── DeleteConfirmationModal.tsx
│   │   ├── DuplicateItemModal.tsx  # Duplicate handling UI
│   │   ├── InventoryItemRow.tsx    # Single item display
│   │   ├── InventoryList.tsx       # Main inventory grid
│   │   ├── QuickAddCatalog.tsx     # Template-based quick add
│   │   ├── ThemeProvider.tsx       # Dark mode context
│   │   └── ThemeToggle.tsx         # Theme switch button
│   ├── actions.ts                  # Server actions (CRUD)
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── lib/
│   ├── prisma.ts                   # Prisma client instance
│   └── utils.tsx                   # Utility functions
├── prisma/
│   └── schema.prisma               # Database schema
└── public/                         # Static assets
```

---

## 🗃️ Database Schema

```prisma
model InventoryItem {
  id        Int      @id @default(autoincrement())
  name      String
  category  String
  quantity  Int
  minStock  Int      @default(10)
  status    String   @default("Healthy")
  createdAt DateTime @default(now())
}
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run database migrations |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable
4. Deploy

### Self-Hosted

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for educational institutions**

</div>
