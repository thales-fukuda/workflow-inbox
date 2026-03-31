#!/bin/bash
set -e

echo "Running tests..."

# Run frontend tests
npm test

echo "All tests passed!"
