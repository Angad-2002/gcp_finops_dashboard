# GCP FinOps Dashboard - Frontend

Modern Next.js frontend for the GCP FinOps Dashboard, providing real-time visualization of Google Cloud Platform costs and optimization recommendations.

## Features

- 📊 **Real-time Cost Dashboard** - Live cost monitoring and trends
- 💰 **Cost Analysis** - Detailed breakdown by service and resource
- 🔍 **Resource Auditing** - Track idle, untagged, and over-provisioned resources
- 💡 **Optimization Recommendations** - AI-powered cost-saving suggestions
- ⚙️ **Easy Configuration** - Simple setup for GCP projects
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode support

## Prerequisites

- Node.js 18+ or compatible runtime
- npm, pnpm, or yarn
- Running GCP FinOps API backend (see backend setup)

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

### 4. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
gcp-finops/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Dashboard home page
│   ├── cost-analysis/       # Cost analysis page
│   ├── resources/           # Resources audit page
│   ├── settings/            # Configuration page
│   ├── budgets/            # Budgets page (to be implemented)
│   ├── trends/             # Trends page (to be implemented)
│   └── reports/            # Reports page (to be implemented)
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   └── layout/             # Layout components (sidebar, topbar)
├── lib/                     # Utility functions and API client
│   ├── api-client.ts       # Backend API client
│   ├── utils.ts            # Utility functions
│   └── sample-data.ts      # Sample data for fallback
├── public/                  # Static assets
├── styles/                  # Global styles
└── package.json            # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

### Environment Variables

Create `.env.local` with:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Backend Connection

The frontend connects to the FastAPI backend via the API client (`lib/api-client.ts`).

Ensure the backend is running before starting the frontend:

```bash
# In another terminal, start the backend
cd ../
python start-api.py
```

## Pages

### Dashboard (`/`)

Main overview showing:
- Current month spend
- Month-over-month change
- Potential savings
- Active resources
- Cost by service (pie chart)
- 6-month cost trend
- Year-to-date spending

### Resources (`/resources`)

Resource audit showing:
- Total resources
- Running vs idle resources
- Untagged resources
- Detailed audit results by resource type

### Cost Analysis (`/cost-analysis`)

Detailed cost breakdown with:
- Service-by-service costs
- Bar chart visualization
- Percentage breakdown
- Cost trends

### Settings (`/settings`)

Configuration interface for:
- GCP project ID
- BigQuery billing dataset
- Billing table prefix
- Regions to audit
- API connection status

## API Integration

The frontend uses a centralized API client to communicate with the backend.

### Example Usage

```typescript
import { apiClient } from "@/lib/api-client"

// Get dashboard summary
const response = await apiClient.getSummary()
if (response.error) {
  console.error("Error:", response.error)
} else {
  console.log("Summary:", response.data)
}

// Get recommendations
const recs = await apiClient.getRecommendations({
  priority: "high",
  limit: 10
})
```

### Available API Methods

- `healthCheck()` - Check API status
- `getConfig()` / `updateConfig()` - Manage configuration
- `getSummary()` - Get cost summary
- `getServiceCosts()` - Get costs by service
- `getCostTrend()` - Get 6-month trend
- `getAudits()` - Get all audit results
- `getAudit(type)` - Get specific audit
- `getRecommendations()` - Get optimization tips
- `getResourcesSummary()` - Get resource stats
- `getDashboard()` - Get complete dashboard data
- `refreshData()` - Force data refresh

## Styling

The project uses:
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Unstyled, accessible component primitives
- **Recharts** - Composable charting library

### Theme

Supports light and dark mode out of the box. Theme can be toggled via the UI.

To customize colors, edit `styles/globals.css`:

```css
:root {
  --color-chart-1: ...;
  --color-chart-2: ...;
  /* ... */
}
```

## Components

### UI Components (`components/ui/`)

Pre-built components from shadcn/ui:
- `button`, `card`, `badge`, `input`, `select`, etc.
- Fully customizable and accessible
- Can be modified in `components/ui/`

### Layout Components (`components/layout/`)

- `shell.tsx` - Main layout wrapper
- `sidebar.tsx` - Navigation sidebar
- `topbar.tsx` - Top navigation bar

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your production API URL
4. Deploy

```bash
vercel deploy --prod
```

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t gcp-finops-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:8000 gcp-finops-frontend
```

### Static Export

For static hosting:

1. Update `next.config.mjs`:
   ```javascript
   const nextConfig = {
     output: 'export',
   }
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Deploy `out/` directory to any static host

## Troubleshooting

### "Failed to fetch" errors

- Ensure backend is running on the correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is configured in the backend

### Blank dashboard

- Check browser console for errors
- Verify API is returning data (test at http://localhost:8000/docs)
- Ensure GCP configuration is set in Settings page

### Styling issues

- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Tailwind configuration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

See LICENSE file in the root directory.

## Support

For help and support:
- Check the [API Integration Guide](../API_INTEGRATION.md)
- Review the [main README](../README.md)
- Open an issue on GitHub

## Related Documentation

- [API Integration Guide](../API_INTEGRATION.md)
- [Backend README](../README.md)
- [Quick Start Guide](../QUICKSTART.md)

