#!/bin/bash

echo "🚀 Preparing Oura Dashboard for Vercel Deployment..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing globally..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready!"
echo ""

echo "🔧 Project structure:"
echo "   ✅ vercel.json - Deployment configuration"
echo "   ✅ api/oura-proxy.js - Serverless API function"  
echo "   ✅ package.json - Project metadata"
echo "   ✅ index.html - Dashboard frontend"
echo "   ✅ CSS & JS files - Styling and functionality"
echo ""

echo "🌐 Ready to deploy to Vercel!"
echo ""
echo "Choose your deployment method:"
echo ""
echo "1. 🖱️  DRAG & DROP (Easiest):"
echo "   - Go to https://vercel.com/new"
echo "   - Drag this entire folder to the upload area"
echo "   - Click Deploy!"
echo ""
echo "2. 💻 CLI DEPLOYMENT (Recommended):"
echo "   - Run: vercel"
echo "   - Follow the prompts"
echo "   - Get instant global URL!"
echo ""
echo "3. 🔗 GITHUB INTEGRATION:"
echo "   - Push this code to GitHub"
echo "   - Connect repository to Vercel"
echo "   - Automatic deployments!"
echo ""

read -p "Press Enter to start CLI deployment, or Ctrl+C to exit and use drag & drop..."

echo ""
echo "🚀 Starting Vercel deployment..."
vercel