#!/bin/bash

# AICBOLT Vercel Deployment Script
echo "🚀 Starting AICBOLT deployment to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the saas-starter directory."
    exit 1
fi

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -f run-*.js
rm -f test-*.js
rm -f check-*.js
rm -f debug-*.js
rm -f revert-*.js

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - ready for Vercel deployment"
fi

# Test build
echo "🔨 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up your database in Vercel dashboard"
echo "2. Add environment variables in Vercel project settings"
echo "3. Run database migrations"
echo "4. Test your deployed application"
echo ""
echo "See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions."
