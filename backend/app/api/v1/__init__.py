from fastapi import APIRouter
from app.api.v1 import auth, users, todos

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(todos.router, prefix="/todos", tags=["Todos"])