from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import mysql.connector


app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'
CORS(app) 

def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host="db",
            user="root",
            password="secret",
            database="humblehome"
        )
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db:
        db.close()

@app.route('/register', methods=['POST'])
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
    return jsonify({'message':'User registered successfully.'}), 201

@app.route('/login', methods = ['POST'])
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
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({'token': token}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)