from flask import Flask, Blueprint, jsonify, request
from flask_mysqldb import MySQL
from flask_cors import CORS

# Initialize the app and MySQL
app = Flask(__name__)
mysql = MySQL()

# Enable CORS for the entire app with methods
CORS(app, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT", "DELETE"], supports_credentials=True)

# Create a Blueprint for user-related routes
user_bp = Blueprint('user', __name__)

@user_bp.route('/api/user-details', methods=['GET'])
def get_user_details():
    # Retrieve user_id from the query parameters
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    cursor = None

    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Fetch user details
        cursor.execute("SELECT name, pet_name, contact_number FROM user_info WHERE user_id = %s", (user_id,))
        user_info = cursor.fetchone()

        if not user_info:
            return jsonify({"error": "User details not found."}), 404

        name, pet_name, contact_number = user_info

        # Fetch pet details
        cursor.execute("SELECT sex, breed, age FROM pets_info WHERE user_id = %s", (user_id,))
        pet_info = cursor.fetchone()

        if not pet_info:
            return jsonify({"error": "Pet details not found."}), 404

        sex, breed, age = pet_info

        return jsonify({
            "name": name,
            "pet_name": pet_name,
            "contact_number": contact_number,
            "pet_info": {
                "sex": sex,
                "breed": breed,
                "age": age
            }
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()

@user_bp.route('/api/user-details', methods=['PUT'])
def update_user_details():
    data = request.get_json()
    
    # Retrieve user_id from the request body
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    name = data.get('name')
    pet_name = data.get('pet_name')
    contact_number = data.get('contact_number')
    sex = data.get('sex')
    breed = data.get('breed')
    age = data.get('age')

    cursor = None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Update user_info table
        cursor.execute("""
            UPDATE user_info
            SET name = %s, pet_name = %s, contact_number = %s
            WHERE user_id = %s
        """, (name, pet_name, contact_number, user_id))

        # Update pets_info table
        cursor.execute("""
            UPDATE pets_info
            SET sex = %s, breed = %s, age = %s
            WHERE user_id = %s
        """, (sex, breed, age, user_id))

        conn.commit()

        return jsonify({
            "name": name,
            "pet_name": pet_name,
            "contact_number": contact_number,
            "pet_info": {
                "sex": sex,
                "breed": breed,
                "age": age
            }
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()

