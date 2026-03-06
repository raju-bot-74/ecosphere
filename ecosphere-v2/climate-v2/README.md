# 🌍 Sustainable Development & Climate Action Website

A comprehensive website dedicated to promoting sustainable development and climate action — featuring a carbon footprint calculator, real-time climate data, community tools, and more.

## 🛠 Technology Stack

### Frontend
- **Next.js 14** — React framework with SSR/SSG
- **React 18** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Chart.js / D3.js** — Data visualization

### Backend
- **Node.js + Express.js** — REST API server
- **TypeScript** — Type safety
- **Helmet / CORS / Morgan** — Security & logging
- **Redis** — Caching (optional)

### DevOps
- **Docker + Docker Compose** — Containerization
- **GitHub Actions** — CI/CD pipeline
- **Vercel** — Frontend deployment
- **Heroku** — Backend deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/raju-bot-74/sustainable-climate-action.git
cd sustainable-climate-action

# Install frontend dependencies
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000

# In a new terminal — install backend
cd backend
npm install
npm run dev
# Backend runs at http://localhost:5000
```

## 📊 Features

- **Carbon Footprint Calculator** — Estimate your daily and yearly CO₂ emissions
- **Live Climate Stats** — Global temperature, CO₂ levels, sea rise, and more
- **Educational Content** — Articles, guides, and resources on sustainability
- **Community Platform** — Connect with climate advocates
- **UN SDGs Alignment** — Supporting Goals 7, 11, 12, 13, 14, 15
- **Interactive Maps** — Find local green businesses and NGOs

## 📁 Project Structure

```
sustainable-climate-action/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   └── styles/          # Global CSS
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/                  # Express.js API
│   ├── src/
│   │   └── index.ts         # Server entry
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD pipeline
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
└── DEPLOYMENT.md
```

## 🌐 Deployment

### Frontend → Vercel (Recommended, Free)
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project" → Import your GitHub repo
3. Set root directory to `frontend`
4. Deploy! Get a live URL instantly.

### Backend → Railway (Recommended, Free)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Set root directory to `backend`
4. Add environment variables from `.env.example`

See [DEPLOYMENT.md](DEPLOYMENT.md) for full instructions.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License

## 📞 Contact

- Email: hello@sustainableclimate.dev
- Website: https://sustainable-climate-action.vercel.app

Together, we can create a sustainable future! 🌱
