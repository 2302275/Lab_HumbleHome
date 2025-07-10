from flask import g
import mysql.connector

# This file is for connecting to the database.


def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(
            host="db",
            user="webapp",
            password="webapp_p@ssw0rd",
            database="humblehome"
        )
    return g.db


def close_db(err):
    db = g.pop('db', None)
    if db:
        db.close()
