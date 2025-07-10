from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime, re, secrets
from db import get_db
from middleware import token_req
import smtplib
from email.mime.text import MIMEText
import logging, threading
import uuid

logger = logging.getLogger('humblehome_logger')  # Custom logger
secretkey = 'supersecretkey'
auth_bp = Blueprint('auth', __name__)

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USERNAME = 'ictssd4321@gmail.com'
SMTP_PASSWORD = 'qhuy iszs sgql bipm'  # Consider loading from env vars
FROM_EMAIL = 'noreply@yourdomain.com'

# Configuration - should be in environment variables
RESET_TOKEN_EXPIRY = 3600  # 1 hour in seconds

def generate_tokens(user, secretkey):
    # Short-lived access token (15 min)
    access_token = jwt.encode({
        'user_id': user['user_id'],
        'email': user['email'],
        'type': 'access',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, secretkey, algorithm='HS256')

    # Long-lived refresh token (7 days)
    refresh_token = jwt.encode({
        'user_id': user['user_id'],
        'type': 'refresh',
        'jti': str(uuid.uuid4()),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, secretkey, algorithm='HS256')

    return access_token, refresh_token

def send_otp_email(recipient_email, otp_code):
    email_body = f"""
    Your 2FA verification code is: {otp_code}

    This code will expire in 5 minutes. If you did not try to log in, you can ignore this message.
    """

    msg = MIMEText(email_body)
    msg['Subject'] = 'Your 2FA Verification Code'
    msg['From'] = FROM_EMAIL
    msg['To'] = recipient_email

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            logger.info(f"2FA code sent to {recipient_email} for login")
    except Exception as e:
        print(f"[Email Error] Failed to send 2FA code to {recipient_email}: {e}") # in what circumstances would this happen?
        logger.error(f"Failed to send 2FA code to {recipient_email}: {e}")

def is_password_complex(password):
    # At least 1 uppercase, 1 number, 1 special char, min 8 chars
    pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\'":\\|,.<>\/?]).{8,}$'
    return re.fullmatch(pattern, password) is not None

@auth_bp.route('/api/register', methods=['POST'])
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
    
    # Validate password complexity
    if not is_password_complex(password):
        return jsonify({'message': 'Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character.'}), 400
    
    hashed_pw = generate_password_hash(password)
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", (username, email, hashed_pw))
    db.commit()
    logger.info(f"New account has been registered with email: {email}")
    return jsonify({'message':'User registered successfully..'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    formData = request.json

    login_source = formData.get('login_source', 'user')  # default to 'user' if missing
    loginInput = formData['login']
    password = formData['password']
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]

    cursor.execute("SELECT * FROM users WHERE email = %s OR username = %s", (loginInput, loginInput))
    user = cursor.fetchone()

    if not user or not check_password_hash(user['password_hash'], password):
        logger.warning(f"Failed login attempt for \"{loginInput}\"")
        return jsonify({'message': 'Invalid credentials.'}), 401

    # 🔒 1. Enforce admin access only from admin login page
    if user['role'] == 'admin' and login_source != 'admin':
        logger.warning(f"Blocked admin login from user portal for \"{user['email']}\"")
        return jsonify({'message': 'Invalid Credentials.'}), 403

    # 🔒 2. Enforce that regular users cannot use admin login page
    if user['role'] != 'admin' and login_source == 'admin':
        logger.warning(f"Blocked non-admin user \"{user['email']}\" from accessing admin portal")
        return jsonify({'message': 'Invalid credentials.'}), 403

    stored_ip = user.get('last_ip')
    if stored_ip != ip and user['role'] != 'admin': # Skip 2FA for admin users
        # IP is new — trigger 2FA
        otp_code = ''.join(secrets.choice('0123456789') for _ in range(6))
        expires_at = datetime.datetime.now() + datetime.timedelta(minutes=5)

        cursor.execute(
            "INSERT INTO two_factor_codes (user_id, otp_code, expires_at) VALUES (%s, %s, %s)",
            (user['user_id'], otp_code, expires_at)
        )
        db.commit()

        threading.Thread(target=send_otp_email, args=(user['email'], otp_code)).start()
        return jsonify({'message': 'OTP sent to email', 'user_id': user['user_id']}), 200
    else:
        # IP matches — skip 2FA
        access_token, refresh_token = generate_tokens(user, secretkey)

        user_info = {
            'id': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'role': user.get('role', 'user'),
            'profile_pic': user.get('profile_pic')
        }

        logger.info(f"User \"{user['username']}\" logged in successfully")
        return jsonify({'access_token': access_token, 'refresh_token': refresh_token,'user': user_info}), 200


@auth_bp.route('/api/logout', methods=['POST'])
@token_req
def logout(current_user):
    token = request.headers.get('Authorization', '').split(' ')[1]
    
    try:
        payload = jwt.decode(token, secretkey, algorithms=['HS256'])
        expires_at = datetime.datetime.utcfromtimestamp(payload['exp'])
    except Exception:
        expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO token_blacklist (token, user_id, expires_at, reason) VALUES (%s, %s, %s, %s)",
        (token, current_user['user_id'], expires_at, 'logout')
    )
    db.commit()
    
    logger.info(f"User \"{current_user['username']}\" logged out successfully")
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/api/me', methods=['GET'])
@token_req
def get_profile(current_user):
    return jsonify({'user':current_user}), 200

@auth_bp.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    user_id = data.get('user_id')
    input_otp = data.get('otp')

    # intput_otp validation
    if not re.fullmatch(r"\d{6}", str(input_otp)):
        return jsonify({'message': 'Invalid OTP format'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True, buffered=True)

    #Get latest unexpired code
    # cursor.execute(
    #     "SELECT * FROM two_factor_codes WHERE user_id = %s AND is_used = 0 ORDER BY created_at DESC",
    #     (user_id)
    # )
    
    cursor.execute("""
        SELECT two_factor_codes.*, users.username 
        FROM two_factor_codes
        JOIN users ON two_factor_codes.user_id = users.user_id
        WHERE two_factor_codes.user_id = %s AND two_factor_codes.is_used = 0
        ORDER BY two_factor_codes.created_at DESC
    """, (user_id,))

    record = cursor.fetchone()

    if not record or datetime.datetime.now() > record['expires_at']:
        return jsonify({'message': 'Invalid or expired OTP'}), 401

    if record['otp_code'] != input_otp:
        attempts = record['attempts_left'] - 1
        cursor.execute("UPDATE two_factor_codes SET attempts_left = %s WHERE id = %s", (attempts, record['id']))
        db.commit()

        if attempts <= 0:
            logger.warning(f"User \"{record['username']}\" has exceeded OTP attempts")
            return jsonify({'message': 'Too many incorrect attempts'}), 403
        logger.warning(f"User \"{record['username']}\" entered incorrect OTP. Attempts left: {attempts}")
        return jsonify({'message': 'Incorrect OTP'}), 401

    # Mark OTP used
    cursor.execute("UPDATE two_factor_codes SET is_used = 1 WHERE id = %s", (record['id'],))
    db.commit()

    # Issue final JWT
    cursor.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()
    
    access_token, refresh_token = generate_tokens(user, secretkey)

    user_info = {
        'id': user['user_id'],
        'username': user['username'],
        'email': user['email'],
        'role': user.get('role', 'user'),
        'profile_pic': user.get('profile_pic')
    }

    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]
    cursor.execute("UPDATE users SET last_ip = %s WHERE user_id = %s", (request.remote_addr, user_id))
    db.commit()
    
    logger.info(f"User \"{user['username']}\" logged in successfully")

    return jsonify({'access_token': access_token, 'refresh_token': refresh_token,'user': user_info}), 200

@auth_bp.route('/api/resend-otp', methods=['POST', 'OPTIONS'])
def resend_otp():
    if request.method == 'OPTIONS':
        return '', 204  # respond to preflight without processing
    
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'message': 'Missing user ID'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    otp_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    expires_at = datetime.datetime.now() + datetime.timedelta(minutes=5)

    cursor.execute(
        "INSERT INTO two_factor_codes (user_id, otp_code, expires_at) VALUES (%s, %s, %s)",
        (user_id, otp_code, expires_at)
    )
    db.commit()

    # Send OTP
    threading.Thread(target=send_otp_email, args=(user['email'], otp_code)).start()

    logger.info(f"Resent OTP to \"{user['email']}\"")

    return jsonify({'message': 'OTP resent to your email'}), 200

@auth_bp.route('/api/resetpassword', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')
    
    if not token or not new_password:
        return jsonify({'message': 'New password is required', 'success': False}), 400

    if not is_password_complex(new_password):
        return jsonify({
            'message': 'Password must be at least 8 characters long and include 1 uppercase letter, 1 number, and 1 special character.',
            'success': False
        }), 400
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        db.start_transaction()
        
        # Check token validity and lock the row
        cursor.execute("""
            SELECT user_id, used 
            FROM password_reset_tokens 
            WHERE token = %s 
            AND expires_at > NOW()
            FOR UPDATE
        """, (token,))
        token_record = cursor.fetchone()
        
        if not token_record:
            return jsonify({
                'message': 'Invalid or expired token',
                'success': False
            }), 400
            
        if token_record['used']:
            return jsonify({
                'message': 'This token has already been used',
                'success': False
            }), 400
        
        # Update password
        hashed_password = generate_password_hash(new_password)
        cursor.execute(
            "UPDATE users SET password_hash = %s WHERE user_id = %s",
            (hashed_password, token_record['user_id'])
        )
        
        # Mark token as used
        cursor.execute("""
            UPDATE password_reset_tokens 
            SET used = TRUE 
            WHERE token = %s
        """, (token,))
        
        db.commit()
        
        return jsonify({
            'message': 'Password updated successfully',
            'success': True
        }), 200
        
    except Exception as e:
        db.rollback()
        logging.error(f"Error resetting password: {str(e)}")
        return jsonify({
            'message': 'An error occurred while resetting password',
            'success': False
        }), 500
    finally:
        cursor.close()
        
@auth_bp.route('/api/forgotpassword', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # 1. Check if email exists in database
    cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    if not user:
        # For security, don't reveal if email doesn't exist
        return jsonify({'message': 'If this email exists in our system, you will receive a password reset link'}), 200
        # An email password reset link has been sent to your email address.
    
    # 2. Generate reset token and expiry
    reset_token = secrets.token_urlsafe(32)
    expiry = datetime.datetime.now() + datetime.timedelta(seconds=RESET_TOKEN_EXPIRY)
    
    # 3. Store token in database
    cursor.execute(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user['user_id'], reset_token, expiry)
    )
    db.commit()
    
    # 4. Send email
    reset_link = f"http://localhost/reset-password?token={reset_token}"
    email_body = f"""
    You are receiving this message because you have requested a password reset on HumbleHome.
    Please click the link below to reset your password:
    
    {reset_link}
    
    This link will expire in 1 hour. If you did not request this, please ignore this email.
    
    HumbleHome Team
    """
    
    msg = MIMEText(email_body)
    msg['Subject'] = 'Password Reset Request'
    msg['From'] = FROM_EMAIL
    msg['To'] = email
    
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        # Log this error properly
        return jsonify({'message': 'Failed to send reset email'}), 500
    
    return jsonify({'message': 'Password reset link sent to your email'}), 200


@auth_bp.route('/api/refresh', methods=['POST'])
def refresh():
    """Endpoint to refresh access tokens using a refresh token"""
    data = request.get_json()
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({'message': 'Refresh token required'}), 400
    
    try:
        # Decode refresh token
        payload = jwt.decode(refresh_token, secretkey, algorithms=['HS256'])
        
        # Verify it's a refresh token
        if payload.get('type') != 'refresh':
            logger.warning(f"Invalid token type used in refresh attempt")
            return jsonify({'message': 'Please log in again.'}), 401
        
        # Check if blacklisted
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT * FROM token_blacklist WHERE token = %s", (refresh_token,))
        if cursor.fetchone():
            logger.warning(f"Attempted to use blacklisted refresh token")
            return jsonify({'message': 'Please log in again.'}), 401
        
        # Get user info
        cursor.execute("SELECT * FROM users WHERE user_id = %s", (payload['user_id'],))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Generate new access token
        new_access_token = jwt.encode({
            'user_id': user['user_id'],
            'email': user['email'],
            'type': 'access',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
        }, secretkey, algorithm='HS256')
        
        logger.info(f"Access token refreshed for user \"{user['username']}\"")
        
        return jsonify({'access_token': new_access_token}), 200
            
    except jwt.ExpiredSignatureError:
        logger.info(f"Expired refresh token used")
        return jsonify({'message': 'Please log in again.'}), 401
    except jwt.InvalidTokenError:
        logger.warning(f"Invalid refresh token used")
        return jsonify({'message': 'Please log in again.'}), 401