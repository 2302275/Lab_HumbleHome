from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from db import get_db
from middleware import token_req

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
    
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({'message': 'User already exists.'}), 400
    
    hashed_pw = generate_password_hash(password)
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, hashed_pw))
    db.commit()
    return jsonify({'message':'User registered successfully..'}), 201

@auth_bp.route('/login', methods = ['POST'])
def login():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    formData = request.json
    loginInput = formData['login']
    password = formData['password']
    
    print(loginInput)
    cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (loginInput, loginInput))
    user = cursor.fetchone()
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid creds'}), 401
    
    token = jwt.encode(
        {'email': user['email'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
        secretkey,
        algorithm='HS256'
    )
    
    return jsonify({'token': token}), 200

@auth_bp.route('/logout')
@token_req
def logout():
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/me', methods=['GET'])
@token_req
def get_profile(current_user):
    return jsonify({'user':current_user}), 200