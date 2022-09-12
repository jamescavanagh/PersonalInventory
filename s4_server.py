# (A) INIT
# (A1) LOAD MODULES
from flask import Flask, render_template, request, make_response
import sqlite3, json
import s3_lib as invlib

# (A2) FLASK SETTINGS + INIT
HOST_NAME = "localhost"
HOST_PORT = 8058
DBFILE = "inventory.db"
app = Flask(__name__)
# app.debug = True

# (B) APP PAGE
@app.route("/")
def index():
  return render_template("s5_main.html")

# (C) AJAX REQUESTS
# (C1) GET ALL ITEMS
@app.route("/req/getall/", methods=["POST"])
def rGetAll():
  return json.dumps(invlib.getAll())

# (C2) GET ITEM
@app.route("/req/get/", methods=["POST"])
def rGet():
  data = dict(request.form)
  return json.dumps(invlib.get(data["sku"]))

# (C3) SAVE ITEM
@app.route("/req/save/", methods=["POST"])
def rSave():
  data = dict(request.form)
  print(data)
  invlib.save(data["sku"], data["name"], data["cat"], data["osku"])
  return "OK"

# (C4) DELETE ITEM
@app.route("/req/delete/", methods=["POST"])
def rDelete():
  data = dict(request.form)
  invlib.delete(data["sku"])
  return "OK"

# (C5) GET ITEM MOVEMENT
@app.route("/req/getmvt/", methods=["POST"])
def rGetMvt():
  data = dict(request.form)
  return json.dumps(invlib.getMvt(data["sku"]))

# (C6) SAVE ITEM MOVEMENT
@app.route("/req/savemvt/", methods=["POST"])
def rSaveMvt():
  data = dict(request.form)
  invlib.saveMV(data["sku"], data["direction"], data["qty"], data["notes"])
  return "OK"

# (D) START
if __name__ == "__main__":
  app.run(HOST_NAME, HOST_PORT)
