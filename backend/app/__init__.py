from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mysql
from .routes import auth
from flask_jwt_extended import JWTManager
from .routes.auth import auth_bp 
from .routes.user_blueprint import user_bp 
import os

jwt = JWTManager()

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object('app.config.Config')

    app.config['DEBUG'] = True

    # Initialize JWT
    jwt.init_app(app)

    # Initialize extensions
    mysql.init_app(app)

    # Enable CORS for the whole app and the specific blueprint
    CORS(app, origins=["http://localhost:5173"], methods=["GET", "POST", "OPTIONS"])
    CORS(user_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "OPTIONS"])  # Enable CORS for user blueprint
    CORS(auth_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "OPTIONS"])  # Enable CORS for auth blueprint

    # Ensure that the connection uses the specified database
    app.config['MYSQL_DATABASE'] = 'doggo'

    # Register blueprints
    app.register_blueprint(auth_bp)  # Register auth blueprint
    app.register_blueprint(user_bp)  # Register user blueprint

    return app
