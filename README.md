# Razorpay AI Seller Agent

AI-powered platform that provides intelligent growth recommendations to e-commerce merchants using autonomous Claude AI agents, powered by Razorpay APIs.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square)](https://www.postgresql.org/)
[![Claude API](https://img.shields.io/badge/Claude%20API-3.5%20Sonnet-orange?style=flat-square)](https://www.anthropic.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

## 🎯 Problem Statement

E-commerce merchants struggle to optimize their growth without data-driven guidance. They need:
- Intelligent analysis of sales patterns
- Actionable recommendations (pricing, inventory, promotions)
- Human oversight to ensure recommendations are sound
- Audit trail for compliance and learning

## ✨ Solution

An autonomous AI agent that:
1. **Analyzes** merchant sales data and identifies trends
2. **Recommends** specific actions (price adjustments, stock rebalancing, promotional strategies)
3. **Submits** recommendations for merchant approval
4. **Logs** every decision in audit trail for transparency

## 🚀 Key Features

- **🤖 Autonomous Claude AI Agent**: Analyzes merchant data and generates growth recommendations
- **💳 Razorpay Integration**: Real payment processing and merchant transaction data
- **📊 Real-time Dashboard**: View merchant sales metrics, trends, and AI recommendations
- **🔐 Secure Authentication**: NextAuth.js with role-based access control
- **✅ Human-Gated Approvals**: Merchants review and approve AI recommendations before execution
- **📝 Audit Trail**: Complete logs of all AI recommendations and merchant decisions
- **⚡ Production Ready**: Built with TypeScript, tested, and deployed on Vercel

## 🛠 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL 15, Prisma ORM |
| **AI** | Anthropic Claude API (claude-3.5-sonnet) |
| **Auth** | NextAuth.js v5 |
| **Payments** | Razorpay SDK |
| **Deployment** | Vercel |

## 📋 Project Structure

```
razorpay-ai-seller-agent/
├── app/
│   ├── api/              # API routes (auth, recommendations, merchants)
│   ├── dashboard/        # Merchant dashboard pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable React components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── claude.ts         # Claude AI agent logic
│   └── db.ts             # Prisma client
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # DB migrations
├── .env.example          # Environment variables template
├── tsconfig.json         # TypeScript config
└── package.json
```

## 🔧 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/razorpay-ai-seller-agent.git
cd razorpay-ai-seller-agent
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

**Required API Keys**:
- `ANTHROPIC_API_KEY`: Get from [Anthropic Console](https://console.anthropic.com/)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Get from [Razorpay Dashboard](https://dashboard.razorpay.com/)
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

### 4. Set Up Database
```bash
npx prisma migrate dev
npx prisma db seed  # Optional: load sample data
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### For Merchants
1. **Sign Up**: Create account and link Razorpay
2. **Add Products**: Upload product catalog with pricing
3. **Log Sales**: Connect sales data (automatic via Razorpay webhook)
4. **Review Recommendations**: AI generates growth suggestions
5. **Approve & Execute**: Accept recommendations to implement

### Example Recommendations
- "Reduce price on low-velocity items by 15% to boost sales"
- "Increase inventory of top 3 products by 30%"
- "Launch promotional bundle: Product A + B at 20% discount"
- "Premium customers: Personalized offers for 5% uplift"

## 🧠 How the AI Agent Works

```
Sales Data → Claude AI Agent → Analysis → Recommendations → Merchant Approval → Execution
                ↓
        [Audit Trail Logs Everything]
```

The agent:
1. Receives real-time sales data from Razorpay webhooks
2. Performs statistical analysis (growth rate, seasonality, velocity)
3. Generates 2-3 strategic recommendations using Claude
4. Submits recommendations for merchant review
5. Logs all decisions (approved, rejected, or modified)

**Prompt Engineering**: Optimized prompts ensure AI recommends practical, implementable actions (not generic advice).

## 🔐 Security Features

- ✅ **NextAuth.js**: Secure session management and CSRF protection
- ✅ **Environment Secrets**: API keys never exposed in code or frontend
- ✅ **Database Encryption**: Sensitive data encrypted at rest
- ✅ **Audit Logging**: Every AI action logged with timestamp and merchant ID
- ✅ **Human Oversight**: Merchants approve recommendations before execution
- ✅ **Razorpay Webhook Verification**: Validates incoming payments

## 📊 Performance Metrics

- ⚡ **Time to Recommendation**: < 5 seconds
- 📈 **Dashboard Load**: < 2 seconds
- 💾 **Database Queries**: Optimized with Prisma
- 🚀 **Deployment**: Vercel edge functions for global distribution

## 🚢 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

Follow prompts to:
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy database (use Vercel Postgres or AWS RDS)

**Live Demo**: [https://razorpay-ai-seller-agent.vercel.app](https://razorpay-ai-seller-agent.vercel.app)

## 📚 API Documentation

### POST `/api/recommendations/generate`
Generates AI recommendations for a merchant
```json
{
  "merchantId": "uuid",
  "salesData": { /* last 30 days sales */ }
}
```

### GET `/api/recommendations/history`
Fetches recommendation history with approval status

### POST `/api/recommendations/approve`
Merchant approves a recommendation for execution

See `API.md` for full documentation.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🎓 Key Learnings

Building this project taught me:
- ✅ Full-stack application architecture with TypeScript
- ✅ Integrating LLMs (Claude) into production applications
- ✅ Database design for complex business logic
- ✅ Secure authentication and authorization
- ✅ Third-party payment API integration
- ✅ Balancing automation with human oversight
- ✅ Production deployment and monitoring

## 📞 Contact

- **Author**: Medha Jha
- **Email**: [jhamedha5002@example.com]
- 
- **GitHub**: [@medha-j](https://github.com/medha-j)

---

**Built for Razorpay Buildathon 2026 | Track 01: AI Growth & Agentic Commerce**
