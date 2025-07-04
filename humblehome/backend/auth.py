from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from db import get_db
from middleware import token_req
import logging

logger = logging.getLogger('humblehome_logger')  # Custom logger
secretkey = 'supersecretkey'
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    formData = request.json
    username = formData['username']
    email = formData['email']
    password = formData['password']
    
    if not username:
        return jsonify({'message': 'Username is required.'}), 400
    
    if not email:
        return jsonify({'message': 'Email is required.'}), 400
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({'message': 'Email already registered.'}), 400
    
    # Check if username exists
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    if cursor.fetchone():
        return jsonify({'message': 'Username already taken.'}), 400
    
    hashed_pw = generate_password_hash(password)
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, hashed_pw))
    db.commit()
    logger.info(f"New account has been registered with email: {email}")
    return jsonify({'message':'User registered successfully..'}), 201

@auth_bp.route('/login', methods = ['POST'])
def login():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    formData = request.json
    loginInput = formData['login']
    password = formData['password']
    
    cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (loginInput, loginInput))
    user = cursor.fetchone()
    
    if not user or not check_password_hash(user['password_hash'], password):
        logger.warning(f"Failed login for user {user['username']}") # might log the user email instead
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode(
        {'email': user['email'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        secretkey,
        algorithm='HS256'
    )
    
    user_info = {
        'id': user['user_id'],
        'username': user['username'],
        'email': user['email'],
        'role': user.get('role', 'user'),
        'profile_pic': user.get('profile_pic')
    }

    logger.info(f"User \"{user['username']}\" logged in successfully")

    return jsonify({'token': token, 'user': user_info}), 200

@auth_bp.route('/logout', methods=['POST'])
@token_req
def logout(current_user):
    logger.info(f"User \"{current_user['username']}\" logged out successfully")
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/me', methods=['GET'])
@token_req
def get_profile(current_user):
    return jsonify({'user':current_user}), 200