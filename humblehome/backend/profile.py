from flask import Blueprint, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
from db import get_db
from middleware import token_req
from PIL import Image, UnidentifiedImageError

profile_bp = Blueprint('profile', __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static', 'uploads')
ALLOWED_EXTS = {'png', 'jpg', 'jpeg', 'gif'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTS

@profile_bp.route('/update-profile', methods=['PUT'])
@token_req
def updateProfile(current_user):
    data = request.json
    fullname = data['fullname']
    phonenumber = data['phonenumber']
    address = data['address']
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("UPDATE users SET full_name = %s, phone_number = %s, address = %s WHERE user_id = %s", (fullname, phonenumber, address, current_user['user_id']))
    db.commit()
    
    return jsonify({'message': 'Profile updated successfully'}), 200

@profile_bp.route('/upload-profile-image', methods = ['POST'])
@token_req
def upload_pic(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in req'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file submitted'}), 400
    
    # Check file size (3MB limit)
    max_size = 3 * 1024 * 1024  # 3MB in bytes
    file.seek(0, os.SEEK_END)  # Move cursor to end of file
    file_length = file.tell()  # Get file size
    file.seek(0)  # Reset cursor position
    
    if file_length > max_size:
        return jsonify({'error': 'File size exceeds 3MB limit'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
    # File Validation (Backend)
        try:
            with Image.open(filepath) as img:
                img.verify()  
            
        except (UnidentifiedImageError, ValueError, OSError):
            os.remove(filepath)
            return jsonify({'error': 'Invalid or corrupted image file'}), 400

        
        db = get_db()
        cursor = db.cursor()
        cursor.execute("UPDATE users SET profile_pic = %s WHERE user_id = %s", (filename, current_user['user_id']))
        db.commit()
        
        return jsonify({
            'message': 'Profile image uploaded successfully!',
            'filename': filename  # or whatever variable holds the filename
        }), 200
    
    return jsonify({'error': 'Image submitted is invalid'}), 200

@profile_bp.route('/profile-image/<filename>')
def get_profile_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)