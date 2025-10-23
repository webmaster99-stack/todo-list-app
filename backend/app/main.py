from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api.v1 import api_router

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG,
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup."""
    init_db()
    print(f"✅ {settings.APP_NAME} started successfully")
    print(f"📊 Database: {settings.DATABASE_URL}")
    print(f"🐛 Debug mode: {settings.DEBUG}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Todo List API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "app_name": settings.APP_NAME
    }


app.include_router(api_router, prefix="/api")