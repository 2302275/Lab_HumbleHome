from flask import request, jsonify, current_app, Blueprint, send_from_directory
from functools import wraps
from middleware import token_req
from db import get_db
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest
import os
import json

purchases_bp = Blueprint('purchases', __name__)

def is_valid_cart(cart):
    if not isinstance(cart, list):
        return False
    for item in cart:
        if not all(k in item for k in ["product_id", "quantity", "price"]):
            return False
        if not isinstance(item["product_id"], int) or item["product_id"] <= 0:
            return False
        if not isinstance(item["quantity"], int) or item["quantity"] <= 0:
            return False
        if not isinstance(item["price"], (int, float)) or item["price"] < 0:
            return False
    return True

# TODO: Add to order_items & orders
@purchases_bp.route('/api/checkout', methods=['POST'])
@token_req
def checkout(current_user):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        data = request.get_json(force=True)
        user_id = current_user["user_id"]
        cart = data.get("cart")
        shipping_address = data.get("shipping_address")
        payment_method = data.get("payment_method")

        # Input validation
        if not isinstance(user_id, int):
            raise BadRequest("Invalid customer ID.")
        if not is_valid_cart(cart):
            raise BadRequest("Invalid cart format.")
        if not isinstance(shipping_address, str) or not shipping_address.strip():
            raise BadRequest("Invalid address.")
        if payment_method not in ["card", "paypal"]:
            raise BadRequest("Invalid payment method.")

        total_amount = sum(item['quantity'] * item['price'] for item in cart)

        cursor.execute("""
            INSERT INTO orders (user_id, order_date, status, total_amount, shipping_address, payment_method)
            VALUES (%s, NOW(), %s, %s, %s, %s)
        """, (user_id, "pending", total_amount, shipping_address, payment_method))

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

    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"error": "Something went wrong during checkout"}), 500

    
@purchases_bp.route('/api/purchase-history', methods=['GET'])
@token_req
def get_purchase_history(current_user):
    user_id = current_user["user_id"]

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT o.order_id AS order_id, o.order_date, o.status, o.total_amount,
               oi.product_id, p.name AS product_name, oi.quantity, oi.price_at_purchase
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = %s
        ORDER BY o.order_date DESC
    """, (user_id,))
    
    rows = cursor.fetchall()

    orders = {}
    for row in rows:
        order_id = row["order_id"]
        item = {
            "product_id": row["product_id"],
            "product_name": row["product_name"],
            "quantity": row["quantity"],
            "price_at_purchase": float(row["price_at_purchase"])
        }

        if order_id not in orders:
            orders[order_id] = {
                "order_id": order_id,
                "order_date": row["order_date"],
                "status": row["status"],
                "total_amount": float(row["total_amount"]),
                "items": [item]
            }
        else:
            orders[order_id]["items"].append(item)

    return jsonify(list(orders.values())), 200