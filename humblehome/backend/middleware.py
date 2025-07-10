from flask import request, jsonify, current_app
from functools import wraps
import jwt
from db import get_db
import logging
# logging for this yet to be done, not sure how to do it and what to add

logger = logging.getLogger('humblehome_logger')  # Custom logger
secretkey = 'supersecretkey'

def token_req(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({'message':'Token is missing.'}), 401
        
        try:
            data = jwt.decode(token, secretkey, algorithms=['HS256'])
            db = get_db()
            cursor = db.cursor(dictionary=True)
<<<<<<< HEAD
            cursor.execute("SELECT * FROM refresh_token_blacklist WHERE token = %s", (token,))
            if cursor.fetchone():
                logger.warning(f"Attempted use of blacklisted token")
                return jsonify({'message':'Please log in again.'}), 401

            # Decode token if it's not blacklisted
            data = jwt.decode(token, secretkey, algorithms=['HS256'])
            
            # Check token type (only accept access tokens)
            if data.get('type') == 'refresh':
                logger.warning(f"Attempted to use refresh token for API access")
                return jsonify({'message':'Please log in again.'}), 401
            

=======
>>>>>>> parent of 1313c46 (Secure Session Management)
            cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
            current_user = cursor.fetchone()
            if not current_user:
                logger.error(f"Attempted access with invalid token or user not found. -- with email:{data['email']}")
                return jsonify({'message':'User not found'}), 404
            
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            # Token Expired
            return jsonify({'message':'Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message':'Token is invalid.'}), 401
        
    return decorated