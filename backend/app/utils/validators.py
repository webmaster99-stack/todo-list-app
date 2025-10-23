import re
from typing import Tuple


def validate_username(username: str) -> Tuple[bool, str]:
    """
    Validate username according to requirements.
    
    Requirements:
        - 3-50 characters
        - Alphanumeric, underscore, and hyphen only
        - Must start with alphanumeric character
    
    Args:
        username: Username to validate
        
    Returns:
        Tuple of (is_valid, error_message)
        
    Example:
        >>> validate_username("alice")
        (True, "")
        >>> validate_username("ab")
        (False, "Username must be between 3 and 50 characters")
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(username) > 50:
        return False, "Username must be at most 50 characters"
    
    # Check if starts with alphanumeric and contains only valid characters
    pattern = r'^[a-zA-Z0-9][a-zA-Z0-9_-]*$'
    if not re.match(pattern, username):
        return False, "Username must start with a letter or number and contain only letters, numbers, underscores, and hyphens"
    
    return True, ""


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password according to requirements.
    
    Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
        
    Example:
        >>> validate_password("Password123")
        (True, "")
        >>> validate_password("weak")
        (False, "Password must be at least 8 characters")
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, ""
