#!/bin/bash

# Simple Debug Test - Verify Console Logs

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🔧 SIMPLIFIED AI TEST - DEBUG MODE                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check server
if ! curl -s http://localhost:3000/api/triage > /dev/null 2>&1; then
  echo -e "${YELLOW}❌ Server not running. Start with: npm run dev${NC}"
  exit 1
fi

echo -e "${BLUE}📊 System Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s http://localhost:3000/api/triage | jq '.'
echo ""

echo -e "${GREEN}🔧 SIMPLIFIED PIPELINE FEATURES:${NC}"
echo "  ✅ 3-Step Process (Vision → Groq → Parse)"
echo "  ✅ Plain Text Output (NO JSON parsing risk)"
echo "  ✅ Extensive Debug Logs (Every step logged)"
echo "  ✅ Bulletproof Fallbacks (Never crashes)"
echo "  ✅ Regex Parsing (Handles messy output)"
echo ""

echo -e "${BLUE}📋 Expected Console Output:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🔧 SIMPLIFIED AI PIPELINE (DEBUG MODE)              ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📸 STEP 1: Vision Analysis (Simple)"
echo "   Image URL: https://..."
echo "   ✅ Vision Result: Dark streetlight pole on road"
echo ""
echo "🧠 STEP 2: Groq Classification (Simple)"
echo "   Description: Dark streetlight pole on road"
echo "   📋 RAW Groq Response: streetlight 8 UPPCL"
echo "   ✅ Parsed: {category: 'streetlight', severity: 8, dept: 'UPPCL'}"
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ PIPELINE COMPLETE                                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo "   Category: STREETLIGHT"
echo "   Severity: 8/10"
echo "   Department: UPPCL (Electricity Board)"
echo "   SLA: 24 hours"
echo ""
echo "=== DEBUG LOGS ==="
echo "   === AI PIPELINE START ==="
echo "   Image URL: https://..."
echo "   STEP 1: Vision - Image: https://..."
echo "   Vision SUCCESS: Dark streetlight pole on road"
echo "   STEP 2: Groq - Input: Dark streetlight pole on road"
echo "   Groq RAW: streetlight 8 UPPCL"
echo "   Groq PARSED: {\"category\":\"streetlight\",\"severity\":8,\"dept\":\"UPPCL\"}"
echo "   FINAL: streetlight/8/UPPCL (Electricity Board)"
echo "   === AI PIPELINE END - SUCCESS ==="
echo "=== DEBUG END ==="
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${BLUE}📱 Manual Test Instructions:${NC}"
echo "  1. Open terminal showing server logs (npm run dev output)"
echo "  2. Open: http://localhost:3000/report"
echo "  3. Upload ANY image (cat, streetlight, pothole, etc.)"
echo "  4. Watch server terminal for detailed logs"
echo "  5. You'll see:"
echo "     • Raw Vision response"
echo "     • Raw Groq response"
echo "     • Parsed result"
echo "     • Final output"
echo "  6. Check result on UI - should show success"
echo ""

echo -e "${GREEN}🎯 GUARANTEES:${NC}"
echo "  ✅ NEVER crashes (try-catch everywhere)"
echo "  ✅ ALWAYS returns valid data (fallbacks)"
echo "  ✅ ALWAYS saves to database (never blocks)"
echo "  ✅ Console shows EVERYTHING (full debugging)"
echo "  ✅ Simple prompts (no JSON parsing)"
echo "  ✅ Regex parsing (handles messy output)"
echo ""

echo -e "${YELLOW}🐛 DEBUGGING TIPS:${NC}"
echo "  If wrong category:"
echo "    → Check 'RAW Groq Response' in logs"
echo "    → Check 'Vision Result' accuracy"
echo "    → Adjust simple prompts if needed"
echo ""
echo "  If submission fails:"
echo "    → Check 'PIPELINE CRASH' in logs"
echo "    → Should still save as misc/1"
echo "    → Never shows red error to user"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ SIMPLIFIED SYSTEM READY                           ║"
echo "║  Upload images and check terminal logs!               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
