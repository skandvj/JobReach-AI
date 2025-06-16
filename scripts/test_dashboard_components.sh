#!/bin/bash

echo "🧪 Testing Dashboard Components..."

# Check if all dashboard components exist and have content
DASHBOARD_DIR="frontend/src/components/screens/dashboard"

components=(
  "DashboardScreen.tsx"
  "WelcomeHeader.tsx"
  "QuickStats.tsx"
  "PrimaryActions.tsx"
  "OnboardingChecklist.tsx"
  "QuotaSidebar.tsx"
  "RecentActivity.tsx"
)

echo "📋 Checking dashboard components..."

for component in "${components[@]}"; do
  file_path="$DASHBOARD_DIR/$component"
  if [ -f "$file_path" ]; then
    size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path" 2>/dev/null)
    if [ "$size" -gt 1000 ]; then
      echo "✅ $component - OK ($size bytes)"
    else
      echo "⚠️  $component - Small file ($size bytes)"
    fi
  else
    echo "❌ $component - Missing"
  fi
done

echo ""
echo "📦 Checking frontend dependencies..."
cd frontend

if npm list date-fns > /dev/null 2>&1; then
  echo "✅ date-fns installed"
else
  echo "⚠️  date-fns missing - installing..."
  npm install date-fns
fi

if npm list framer-motion > /dev/null 2>&1; then
  echo "✅ framer-motion installed"
else
  echo "⚠️  framer-motion missing - installing..."
  npm install framer-motion
fi

cd ..

echo ""
echo "🔨 Testing build..."
cd frontend
if npm run build > /dev/null 2>&1; then
  echo "✅ Build successful"
else
  echo "❌ Build failed - check for errors"
  npm run build
fi
cd ..

echo ""
echo "✅ Dashboard components check complete!"
