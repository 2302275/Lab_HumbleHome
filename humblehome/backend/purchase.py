from flask import request, jsonify, current_app, Blueprint, send_from_directory
from functools import wraps
from middleware import token_req
from db import get_db
from werkzeug.utils import secure_filename
import os
import json

purchases_bp = Blueprint('purchases', __name__)

# TODO: Add to order_items & orders
@purchases_bp.route('/api/checkout', methods = ['POST'])
def checkout():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    try:
        data = request.get_json()
        customer_id = data.get("customer_id")
        cart = data.get("cart")
        shipping_address = data.get('shipping_address')
        payment_method = data.get("payment_method")
        
        if not customer_id or not cart or not shipping_address or not payment_method:
            return jsonify({"error": "Missing required fields"}), 400
        
        total_amount = sum(item['quantity'] * item['price'] for item in cart)
        
        cursor.execute("""
            INSERT INTO orders (user_id, order_date, status, total_amount, shipping_address, payment_method)
            VALUES (%s, NOW(), %s, %s, %s, %s)
        """, (customer_id, "Processing", total_amount, shipping_address, payment_method))
        
        order_id = cursor.lastrowid
        
        for item in cart:
            cursor.execute("""
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item["product_id"], item["quantity"], item["price"]))

        db.commit()
    
        return jsonify({
            "message": "Order placed successfully",
            "order_id": order_id,
            "total_amount": total_amount
        }), 201
        
    except Exception as e:
        # db.rollback()
        print("Checkout Error:", e)
        # return jsonify({"error": "Something went wrong during checkout"}), 500
        return jsonify({"error": str(e), "data": data}), 500