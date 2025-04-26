from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import mysql
from app.utils.validators import validate_email, validate_password
import uuid
import smtplib
from email.mime.text import MIMEText

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# GET method to retrieve all users
@auth_bp.route('/users', methods=['GET'])
def get_all_users():
    try:
        conn = mysql.connection
        cursor = conn.cursor()

        cursor.execute("USE doggo")
        cursor.execute("SELECT id, email, created_at FROM users")
        users = cursor.fetchall()

        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    real_name = data.get('realName')
    contact_number = data.get('contactNumber')
    pet_name = data.get('petName')
    pet_sex = data.get('petSex')
    pet_breed = data.get('petBreed')
    pet_age = data.get('petAge')
    is_verified = 0  # Default to not verified on registration

    # Validate inputs
    if not validate_email(email):
        return jsonify({"error": "Invalid email address."}), 400

    if not validate_password(password):
        return jsonify({"error": "Password must be at least 8 characters long and contain a number or special character."}), 400

    if not real_name or not contact_number or not pet_name or not pet_sex or not pet_breed or not pet_age:
        return jsonify({"error": "All fields are required."}), 400

    cursor = None  # Initialize cursor to None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Check if the email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered."}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Insert user into the users table
        cursor.execute(
            "INSERT INTO users (email, password, is_verified, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
            (email, hashed_password, is_verified)
        )
        conn.commit()

        # Get the newly inserted user's ID
        user_id = cursor.lastrowid

        # Insert additional user info (real_name, contact_number) into the user_info table
        cursor.execute(
            "INSERT INTO user_info (user_id, name, contact_number, pet_name) VALUES (%s, %s, %s, %s)",
            (user_id, real_name, contact_number, pet_name)
        )
        conn.commit()

        # Insert pet info into the pets_info table
        cursor.execute(
            "INSERT INTO pets_info (user_id, sex, breed, age) VALUES (%s, %s, %s, %s)",
            (user_id, pet_sex, pet_breed, pet_age)
        )
        conn.commit()

        # Return user_id in the response
        return jsonify({"message": "Registration successful. Please verify your account.", "user_id": user_id}), 201
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:  # Ensure cursor is not None before closing
            cursor.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Retrieve user by email
        cursor.execute("SELECT id, password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password."}), 401

        user_id, hashed_password = user

        # Check password
        if not check_password_hash(hashed_password, password):
            return jsonify({"error": "Invalid email or password."}), 401

        # Generate access token
        access_token = create_access_token(identity=user_id)

        return jsonify({"access_token": access_token, "id": user_id}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200