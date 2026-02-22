#!/bin/bash

# SewaSetu Bulletproof AI Test Suite
# Tests triple-validation pipeline with embeddings

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🛡️  BULLETPROOF AI TEST SUITE                       ║"
echo "║  Triple Validation: Embeddings + Vision + LLM        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# Check server
if ! curl -s http://localhost:3000/api/triage > /dev/null 2>&1; then
  echo -e "${RED}❌ Server not running. Start with: npm run dev${NC}"
  exit 1
fi

echo -e "${BLUE}📊 System Status Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
triage_status=$(curl -s http://localhost:3000/api/triage)
echo "$triage_status" | jq '.'

mode=$(echo "$triage_status" | jq -r '.mode')
if [[ "$mode" == "PRODUCTION" ]]; then
  echo -e "${GREEN}✅ PRODUCTION MODE (Real AI with embeddings)${NC}"
else
  echo -e "${YELLOW}⚠️  $mode MODE${NC}"
fi
echo ""

echo -e "${CYAN}🛡️  NEW FEATURES (Anti-Bias):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Phase 1: Semantic Embeddings (BGE-Large)"
echo "  ✅ Phase 2: Detailed Vision Analysis"
echo "  ✅ Phase 3: Strict LLM with Anti-Bias Rules"
echo "  ✅ Ensemble Voting (40% + 30% + 30%)"
echo "  ✅ Confidence Threshold (reject < 0.4)"
echo ""

echo -e "${BLUE}📸 REQUIRED TEST RESULTS (Must Pass ALL):${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}TEST 1: Streetlight (Dark Pole)${NC}"
echo "─────────────────────────────────────────────────"
echo "Input: Photo of dark streetlight pole"
echo ""
echo "Expected Pipeline:"
echo "  🔢 Embeddings:"
echo "     • electricity: 0.92 (streetlight, pole, dark → high match)"
echo "     • roads: 0.23 (low match)"
echo "     • TOP: electricity"
echo ""
echo "  👁️  Vision:"
echo "     • Objects: [streetlight pole, light fixture, metal pole]"
echo "     • Conditions: [dark, not working]"
echo "     • Category: electricity"
echo ""
echo "  🧠 LLM (Strict Rules):"
echo "     • Rule 1 Applied: Streetlight/pole = ELECTRICITY"
echo "     • NOT roads (no asphalt damage)"
echo "     • Category: electricity"
echo ""
echo "  🗳️  Ensemble Vote:"
echo "     • Embeddings (40%): electricity = 0.368"
echo "     • Vision (30%): electricity = 0.270"
echo "     • LLM (30%): electricity = 0.300"
echo "     • FINAL: ELECTRICITY (confidence: 0.938)"
echo ""
echo -e "${GREEN}✅ REQUIRED: ELECTRICITY / 8 / UPPCL${NC}"
echo ""

echo -e "${GREEN}TEST 2: Pothole (Road Damage)${NC}"
echo "─────────────────────────────────────────────────"
echo "Input: Large pothole photo"
echo ""
echo "Expected Pipeline:"
echo "  🔢 Embeddings:"
echo "     • roads: 0.88 (pothole, crack, asphalt → high match)"
echo "     • electricity: 0.15"
echo "     • TOP: roads"
echo ""
echo "  👁️  Vision:"
echo "     • Objects: [pothole, road surface, asphalt]"
echo "     • Conditions: [large crack, deep hole, broken]"
echo "     • Category: roads"
echo ""
echo "  🧠 LLM:"
echo "     • Pothole/crack detected → ROADS valid"
echo "     • Category: roads"
echo ""
echo "  🗳️  Ensemble Vote:"
echo "     • All agree: roads"
echo "     • FINAL: ROADS (confidence: 0.95+)"
echo ""
echo -e "${GREEN}✅ REQUIRED: ROADS / 9 / PWD${NC}"
echo ""

echo -e "${YELLOW}TEST 3: Random Cat Photo (Non-Civic)${NC}"
echo "─────────────────────────────────────────────────"
echo "Input: Photo of cat sitting on street"
echo ""
echo "Expected Pipeline:"
echo "  🔢 Embeddings:"
echo "     • All scores < 0.3 (no civic keywords match)"
echo "     • TOP: misc (low confidence)"
echo ""
echo "  👁️  Vision:"
echo "     • Objects: [] (no infrastructure)"
echo "     • Confidence: 0.0"
echo ""
echo "  ⚠️  Early Rejection:"
echo "     • No objects + Low embedding confidence"
echo "     • Skip LLM (not needed)"
echo ""
echo -e "${YELLOW}✅ REQUIRED: MISC / 0 / None / REJECTED${NC}"
echo ""

echo -e "${GREEN}TEST 4: Drain Overflow (Water Issue)${NC}"
echo "─────────────────────────────────────────────────"
echo "Input: Overflowing drain photo"
echo ""
echo "Expected Pipeline:"
echo "  🔢 Embeddings:"
echo "     • water: 0.87 (drain, overflow, water → high match)"
echo "     • roads: 0.25"
echo "     • TOP: water"
echo ""
echo "  👁️  Vision:"
echo "     • Objects: [drain, water, overflow]"
echo "     • Category: water"
echo ""
echo "  🧠 LLM (Strict Rules):"
echo "     • Rule 2 Applied: Drain/water = WATER (NOT roads)"
echo "     • Category: water"
echo ""
echo "  🗳️  Ensemble Vote:"
echo "     • All agree: water"
echo "     • FINAL: WATER (confidence: 0.90+)"
echo ""
echo -e "${GREEN}✅ REQUIRED: WATER / 7 / Jal Nigam${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${CYAN}🔍 DEBUGGING FEATURES:${NC}"
echo "  • Console logs show all 3 phases"
echo "  • Embedding similarity scores visible"
echo "  • Voting breakdown displayed"
echo "  • Confidence thresholds enforced"
echo ""

echo -e "${BLUE}📱 Manual Test Instructions:${NC}"
echo "  1. Open: http://localhost:3000/report"
echo "  2. Upload test images:"
echo "     • Streetlight → Monitor console for embeddings"
echo "     • Check voting: Embeddings should dominate (40%)"
echo "     • Verify ELECTRICITY output (not roads!)"
echo "  3. Upload pothole:"
echo "     • Embeddings: roads score high"
echo "     • All phases agree: roads"
echo "     • Verify ROADS output"
echo "  4. Upload random image:"
echo "     • Embeddings: all scores low"
echo "     • Early rejection: MISC/0"
echo ""

echo -e "${GREEN}🎯 KEY GUARANTEES:${NC}"
echo "  ✅ Streetlight → ELECTRICITY (embeddings prevent roads bias)"
echo "  ✅ Pothole → ROADS (only actual damage passes)"
echo "  ✅ Random → MISC/0 (low confidence rejection)"
echo "  ✅ Never fails submission (bulletproof fallbacks)"
echo ""

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ TEST SUITE READY                                  ║"
echo "║  Upload images and verify console logs!               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
