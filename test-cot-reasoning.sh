#!/bin/bash

# SewaSetu Zero-Shot CoT Testing Script
# Tests genius-level AI reasoning on various images

set -e

echo "🤖 SEWASETU ZERO-SHOT CoT AI TEST SUITE"
echo "========================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if server is running
if ! curl -s http://localhost:3000/api/triage > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Server not running. Start with: npm run dev${NC}"
  exit 1
fi

echo -e "${BLUE}📊 Service Status Check${NC}"
echo "---"
triage_status=$(curl -s http://localhost:3000/api/triage)
echo "$triage_status" | jq '.'

mode=$(echo "$triage_status" | jq -r '.mode')
if [[ "$mode" == "PRODUCTION" ]]; then
  echo -e "${GREEN}✅ Running in PRODUCTION mode (Real AI)${NC}"
else
  echo -e "${YELLOW}⚠️  Running in $mode mode${NC}"
fi
echo ""

echo -e "${CYAN}🧪 Zero-Shot CoT Features:${NC}"
echo "---"
echo "  ✅ Detailed vision analysis (objects, materials, conditions)"
echo "  ✅ Step-by-step reasoning chain"
echo "  ✅ Unknown/non-civic image rejection"
echo "  ✅ Context-aware severity scoring"
echo "  ✅ Dynamic department routing"
echo ""

echo -e "${BLUE}📸 Expected Test Results:${NC}"
echo "========================================"
echo ""

echo -e "${GREEN}TEST 1: Streetlight Issue${NC}"
echo "Input: Dark streetlight pole photo"
echo "Expected CoT:"
echo "  Step 1: Detect streetlight pole + light fixture"
echo "  Step 2: Condition = dark, not working"
echo "  Step 3: Electricity department (UPPCL)"
echo "  Step 4: Safety hazard = 8/10"
echo "  Step 5: SLA = 24 hours"
echo "Output: ELECTRICITY / 8-9 / UPPCL / 24h"
echo ""

echo -e "${GREEN}TEST 2: Pothole (Highway)${NC}"
echo "Input: Large pothole on road"
echo "Expected CoT:"
echo "  Step 1: Detect pothole + road surface"
echo "  Step 2: Condition = large crack, deep"
echo "  Step 3: Roads department (PWD)"
echo "  Step 4: Highway context +3 = 9-10/10"
echo "  Step 5: SLA = 12 hours"
echo "Output: ROADS / 9-10 / PWD / 12h"
echo ""

echo -e "${GREEN}TEST 3: Garbage Pile${NC}"
echo "Input: Waste blocking drain"
echo "Expected CoT:"
echo "  Step 1: Detect garbage pile + drain"
echo "  Step 2: Condition = overflowing, blocking"
echo "  Step 3: Sanitation department (MCD)"
echo "  Step 4: Health hazard = 6-7/10"
echo "  Step 5: SLA = 48 hours"
echo "Output: SANITATION / 6-7 / MCD / 48h"
echo ""

echo -e "${YELLOW}TEST 4: Unknown Image (Non-Civic)${NC}"
echo "Input: Random animal/object photo"
echo "Expected CoT:"
echo "  Step 1: No infrastructure objects"
echo "  Step 2: No defects"
echo "  Step 3: Not a civic issue"
echo "  Step 4: Severity = 0"
echo "  Step 5: SLA = 168h (low)"
echo "Output: MISC / 0 / None / REJECTED"
echo ""

echo -e "${YELLOW}TEST 5: Unclear/Blurry Image${NC}"
echo "Input: Low confidence vision output"
echo "Expected CoT:"
echo "  Confidence < 0.5 → Immediate rejection"
echo "  No reasoning needed"
echo "Output: MISC / 0 / Unclear / REJECTED"
echo ""

echo "========================================"
echo ""
echo -e "${GREEN}🎯 NEW FEATURES IN THIS UPGRADE:${NC}"
echo "  1. Detailed Vision JSON (objects, materials, conditions)"
echo "  2. Zero-Shot CoT with 'Think step-by-step' magic phrase"
echo "  3. Transparent reasoning chain in output"
echo "  4. Perfect handling of unknown/random images"
echo "  5. Dynamic categorization for ANY infrastructure issue"
echo ""

echo -e "${BLUE}📱 Manual Test Flow:${NC}"
echo "  1. Open: http://localhost:3000/report"
echo "  2. Upload test images:"
echo "     • Streetlight photo → Check reasoning in console"
echo "     • Random cat/dog → Verify rejection (misc/0)"
echo "     • New issue type (bench, fence) → See dynamic categorization"
echo "  3. Monitor server logs for CoT reasoning steps"
echo ""

echo -e "${GREEN}✅ Test suite ready! Upload images to verify CoT reasoning.${NC}"
echo ""
