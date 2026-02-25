#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

echo "------------------------------------------------"
echo "  🚀 REACH - Enterprise Outreach Engine"
echo "  Mindset: Apple - Performance: Ultra"
echo "------------------------------------------------"

# Kill any existing processes on port 3000 to avoid conflicts
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start the development server in the background
echo "⚡ Starting Next.js Development Server..."
npm run dev > server.log 2>&1 &

# Wait for the server to be ready
echo "⏳ Waiting for Reach to be ready (http://localhost:3000)..."
until curl -s -f http://localhost:3000 > /dev/null; do
  sleep 1
done

echo "✅ Reach Engine is ONLINE."
echo "🌐 Launching your command center in your browser..."

# Open Google Chrome (if available) or Safari
if [ -d "/Applications/Google Chrome.app" ]; then
  open -a "Google Chrome" http://localhost:3000
else
  open http://localhost:3000
fi

echo "🎬 System operational. Keep this window open."
echo "------------------------------------------------"

# Keep the script running to keep the background server alive
wait
