#!/bin/bash

# Run both backend and frontend servers locally

echo "🚀 Starting House Hunt Application..."
echo ""

# Start backend
echo "📦 Starting Django backend on http://localhost:8000"
cd backend
. venv/bin/activate
python manage.py runserver 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "⚛️  Starting Next.js frontend on http://localhost:3000"
cd house-hunt-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are running!"
echo ""
echo "Backend:  http://localhost:8000/admin"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
