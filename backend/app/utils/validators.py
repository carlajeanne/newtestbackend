import re

def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def validate_password(password):
    return len(password) >= 8 and re.search(r"[0-9!@#$%^&*]", password)
