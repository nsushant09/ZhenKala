---
description: How to redeploy the frontend to Cloudflare Pages
---

To deploy your latest changes to the live site, follow these steps:

1. **Navigate to the client directory**:
```bash
cd client
```

2. **Build the project**:
This generates the optimized production files in the `dist` folder.
```bash
npm run build
```

3. **Deploy using Wrangler**:
This uploads the built files to Cloudflare Pages.
// turbo
```bash
npx wrangler pages deploy dist --project-name zhenkala
```

> [!NOTE]
> If it's your first time in a new session, you might be asked to log in to Cloudflare again through a browser link.
