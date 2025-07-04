from flask import request, jsonify, current_app
from functools import wraps
import jwt
from db import get_db
import logging
# logging for this yet to be done

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
            cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
            current_user = cursor.fetchone()
            if not current_user:
                logger.error("User not found for given token")
                return jsonify({'message':'User not found'}), 404
            
            return f(current_user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            # Token Expired
            return jsonify({'message':'Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message':'Token is invalid.'}), 401
        
    return decorated