#!/bin/bash

# Strategic Execution Assistant - Quick Start Script

echo "🎯 Starting Strategic Execution Assistant..."
echo ""

# Check if Python 3 is installed
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    python3 run_server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    python run_server.py
else
    echo "❌ Python not found. Please install Python 3."
    exit 1
fi
