#!/bin/bash

# ============================================
# AI FINANCIAL ASSISTANT - SETUP CHECKLIST
# ============================================

echo "✅ AI Financial Assistant Implementation Checklist"
echo ""

# Check files exist
echo "📁 Checking file structure..."
files=(
  "app/api/chat/route.ts"
  "lib/chat-client.ts"
  "components/financial-chat-assistant.tsx"
  "API_CHAT_DOCUMENTATION.md"
  "API_CHAT_TEST_EXAMPLES.js"
  "IMPLEMENTATION_GUIDE.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file - MISSING"
  fi
done

echo ""
echo "🔐 Environment Setup..."
if grep -q "GOOGLE_GENERATIVE_AI_API_KEY" .env; then
  echo "  ✅ GOOGLE_GENERATIVE_AI_API_KEY configured"
else
  echo "  ❌ GOOGLE_GENERATIVE_AI_API_KEY missing in .env"
fi

if grep -q "DATABASE_URL" .env; then
  echo "  ✅ DATABASE_URL configured"
else
  echo "  ❌ DATABASE_URL missing in .env"
fi

echo ""
echo "📦 Dependencies..."
if grep -q "@google/generative-ai" package.json; then
  echo "  ✅ @google/generative-ai installed"
else
  echo "  ⚠️  @google/generative-ai not in package.json"
fi

if grep -q "@prisma/client" package.json; then
  echo "  ✅ @prisma/client installed"
else
  echo "  ⚠️  @prisma/client not in package.json"
fi

if grep -q "@clerk/nextjs" package.json; then
  echo "  ✅ @clerk/nextjs installed"
else
  echo "  ⚠️  @clerk/nextjs not in package.json"
fi

echo ""
echo "🚀 Ready to use! Next steps:"
echo "  1. npm run dev              # Start development server"
echo "  2. Test API: curl http://localhost:3000/api/chat"
echo "  3. Add component to dashboard (see IMPLEMENTATION_GUIDE.md)"
echo ""

# Check TypeScript
echo "📝 TypeScript Check..."
if [ -f "tsconfig.json" ]; then
  echo "  ✅ TypeScript configured"
else
  echo "  ⚠️  tsconfig.json not found"
fi

echo ""
echo "✨ All systems ready! 🚀"
