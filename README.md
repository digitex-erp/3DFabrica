# 3DFabrica MVP - Beta Launch

3DFabrica is a specialized 3D visualization platform for the textile industry, focusing on upholstery and curtain fabrics. It allows users to upload fabric images, map them onto 3D furniture models in real-time, and export professional technical sheets.

## 🚀 Quick Links
- **Production URL**: [https://3-d-fabrica.vercel.app](https://3-d-fabrica.vercel.app)
- **Beta Guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 🛠 Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Account (for Auth & Storage)

### Local Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/digitex-erp-bell24h/3DFabrica.git
   cd 3DFabrica
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables Required
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project anonymous API key |

## 📦 Deployment Steps (Vercel)
1. Push your changes to GitHub.
2. Connect your repository to Vercel.
3. Add the Environment Variables in the Vercel dashboard.
4. Vercel will automatically detect the Vite config and deploy.
5. **Important**: Ensure `vercel.json` is present for SPA routing support.

## 🧪 Tech Stack
- **Frontend**: React + TypeScript + Vite
- **3D Engine**: Three.js + React Three Fiber + Drei
- **Backend/Auth**: Supabase (PKCE Flow)
- **Styling**: Tailwind CSS + Shadcn UI
- **Deployment**: Vercel
