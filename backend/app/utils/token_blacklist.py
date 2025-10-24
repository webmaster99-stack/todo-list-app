from typing import Set
from datetime import datetime, timedelta, timezone
from threading import Lock

class TokenBlacklist:
    """
    In-memory token blacklist for logout functionality.
    
    In production, this should be replaced with Redis or a database table.
    This implementation is thread-safe and includes automatic cleanup of expired tokens.
    """
    
    def __init__(self):
        self._blacklist: Set[str] = set()
        self._lock = Lock()
        self._expiry_times: dict[str, datetime] = {}
    
    def add(self, token: str, expires_at: datetime) -> None:
        """
        Add a token to the blacklist.
        
        Args:
            token: JWT token string to blacklist
            expires_at: When the token expires (for cleanup)
        """
        with self._lock:
            self._blacklist.add(token)
            self._expiry_times[token] = expires_at
    
    def is_blacklisted(self, token: str) -> bool:
        """
        Check if a token is blacklisted.
        
        Args:
            token: JWT token string to check
            
        Returns:
            True if token is blacklisted, False otherwise
        """
        with self._lock:
            return token in self._blacklist
    
    def cleanup_expired(self) -> int:
        """
        Remove expired tokens from blacklist to save memory.
        
        Returns:
            Number of tokens removed
        """
        with self._lock:
            now = datetime.now(timezone.utc)
            expired_tokens = [
                token for token, expiry in self._expiry_times.items()
                if expiry < now
            ]
            
            for token in expired_tokens:
                self._blacklist.discard(token)
                del self._expiry_times[token]
            
            return len(expired_tokens)
    
    def size(self) -> int:
        """
        Get the current size of the blacklist.
        
        Returns:
            Number of blacklisted tokens
        """
        with self._lock:
            return len(self._blacklist)
    
    def clear(self) -> None:
        """Clear all tokens from blacklist (useful for testing)."""
        with self._lock:
            self._blacklist.clear()
            self._expiry_times.clear()


# Global blacklist instance
token_blacklist = TokenBlacklist()