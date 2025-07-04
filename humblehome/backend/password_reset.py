from flask import Blueprint,request, jsonify
from db import get_db
from werkzeug.security import generate_password_hash

password_reset_bp = Blueprint('password_reset', __name__)

@password_reset_bp.route('/resetpassword', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required'}), 400
    
    # Validate password strength here
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # 1. Check if token is valid and not expired
    cursor.execute("""
        SELECT user_id 
        FROM password_reset_tokens 
        WHERE token = %s 
        AND expires_at > NOW() 
        AND used = FALSE
    """, (token,))
    token_record = cursor.fetchone()
    
    if not token_record:
        return jsonify({'message': 'Invalid or expired token'}), 400
    
    # 2. Update user password
    # In production, hash the password properly!
    hashed_password = generate_password_hash(new_password)
    cursor.execute(
        "UPDATE users SET password_hash = %s WHERE user_id = %s",
        (hashed_password, token_record['user_id'])
    )
    
    # 3. Mark token as used
    cursor.execute(
        "UPDATE password_reset_tokens SET used = TRUE WHERE token = %s",
        (token,)
    )
    
    db.commit()
    
    return jsonify({'message': 'Password updated successfully'}), 200