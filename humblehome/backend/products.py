from flask import request, jsonify, current_app, Blueprint
from functools import wraps
from middleware import token_req
from db import get_db
from werkzeug.utils import secure_filename
import os

secretkey = 'supersecretkey'
products_bp = Blueprint('products', __name__)
ALLOWED_EXTENSIONS = {'stl'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@products_bp.route('/admin/add_product', methods=['POST'])
@token_req
def add_product(current_user):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    name = request.form.get('name')
    price = request.form.get('price')
    description = request.form.get('description')
    category = request.form.get('category')
    stock = request.form.get('stock')
    
    upload_folder = "uploads/models"
    
    # Handle file upload
    if 'model_file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['model_file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        cursor.execute(
            "INSERT INTO products (name, model_file, price, description, stock) VALUES (%s, %s, %s, %s, %s)",
            (name, file_path, price, description, stock)
        )
        db.commit()
        
        return jsonify({"message": "Product added successfully", "file_path": file_path}), 200
    
    return jsonify({"error": "Invalid file format"}), 400    

@products_bp.route('/api/products', methods=['get'])
def get_products():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    
    return jsonify(products), 200    

@products_bp.route('/test_upload_dir', methods=['GET'])
def test_upload_dir():
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    return jsonify({"message": f"Directory path: {upload_folder}", "exists": os.path.exists(upload_folder)})
    
    