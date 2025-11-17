#!/bin/bash

# Assistant Desktop App - Setup Verification Script
# This script checks if all prerequisites are installed

echo "🔍 Verifying Assistant Desktop App Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "  Install from: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check Rust
echo -n "Checking Rust... "
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓${NC} Found $RUST_VERSION"
else
    echo -e "${RED}✗${NC} Rust not found"
    echo "  Install with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "  Then run: source ~/.cargo/env"
    ERRORS=$((ERRORS + 1))
fi

# Check cargo
echo -n "Checking Cargo... "
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "${GREEN}✓${NC} Found $CARGO_VERSION"
else
    echo -e "${RED}✗${NC} Cargo not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check project structure
echo "Checking project structure..."

echo -n "  client/package.json... "
if [ -f "client/package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  server/package.json... "
if [ -f "server/package.json" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo -n "  client/src-tauri/... "
if [ -d "client/src-tauri" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check dependencies
echo "Checking if dependencies are installed..."

echo -n "  client/node_modules... "
if [ -d "client/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}!${NC} Not installed. Run: cd client && npm install"
fi

echo -n "  server/node_modules... "
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}!${NC} Not installed. Run: cd server && npm install"
fi

echo ""

# Check .env file
echo -n "Checking server/.env file... "
if [ -f "server/.env" ]; then
    if grep -q "KEY=" server/.env && ! grep -q "your_openai_api_key_here" server/.env; then
        echo -e "${GREEN}✓${NC} Found"
    else
        echo -e "${YELLOW}!${NC} Found but needs configuration"
        echo "  Add your OpenAI API key to server/.env"
    fi
else
    echo -e "${YELLOW}!${NC} Not found"
    echo "  Create server/.env with: KEY=your_openai_api_key_here"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All prerequisites are installed!${NC}"
    echo ""
    echo "You're ready to run:"
    echo "  cd client"
    echo "  npm run tauri:dev"
else
    echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
    echo ""
    echo "Please install the missing prerequisites and try again."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"




