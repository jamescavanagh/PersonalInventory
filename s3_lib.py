# (A) LOAD SQLITE MODULE
import sqlite3
from datetime import datetime
DBFILE = "inventory.db"

# (B) HELPER - RUN SQL QUERY
def query (sql, data):
  conn = sqlite3.connect(DBFILE)
  cursor = conn.cursor()
  cursor.execute(sql, data)
  conn.commit()
  conn.close()

# (C) HELPER - FETCH ALL
def select (sql, data=[]):
  conn = sqlite3.connect(DBFILE)
  cursor = conn.cursor()
  cursor.execute(sql, data)
  results = cursor.fetchall()
  conn.close()
  return results

# (D) GET ALL ITEMS
def getAll ():
  res = []
  for row in select("SELECT * FROM `items`"):
    res.append(row)
  return res

# (E) GET ITEM
def get (sku):
  item = select("SELECT * FROM `items` WHERE `item_sku`=?", [sku])
  return item[0] if bool(item) else ()

# (F) GET ITEM MOVEMENT
def getMvt (sku):
  res = []
  for row in select("SELECT * FROM `item_mvt` WHERE `item_sku`=?", [sku]):
    res.append(row)
  return res

# (G) SAVE ITEM
def save (sku, name, unit, osku=""):
  # (G1) ADD NEW
  if (osku==""):
    query(
      """INSERT INTO `items` 
      (`item_sku`, `item_name`, `item_unit`, `item_qty`) 
      VALUES (?, ?, ?, 0)""",
      [sku, name, unit]
    )

  # (G2) UPDATE
  else :
    # (G2-1) ITEM ITSELF
    query(
      """UPDATE `items` SET
      `item_sku`=?, `item_name`=?, `item_unit`=?
      WHERE `item_sku`=?""",
      [sku, name, unit, osku]
    )

    # (G2-2) SKU FOR MOVEMENT HISTORY
    if sku != osku:
      query(
        "UPDATE `item_mvt` SET `item_sku`=? WHERE `item_sku`=?",
        [sku, osku]
      )
  return True

# (H) DELETE ITEM
def delete (sku):
  # (H1) DELETE ITEM
  query("DELETE FROM `items` WHERE `item_sku`=?", [sku])

  # (H2) DELETE ITEM MOVEMENT
  query("DELETE FROM `item_mvt` WHERE `item_sku`=?", [sku])
  return True

# (I) SAVE MOVEMENT
def saveMV (sku, direction, qty, notes):
  # (I1) MOVEMENT ENTRY
  query(
    """INSERT INTO `item_mvt` 
    (`item_sku`, `mvt_date`, `mvt_direction`, `mvt_qty`, `mvt_notes`) 
    VALUES (?, ?, ?, ?, ?)""",
    [sku, datetime.now().isoformat(), direction, qty, notes]
  )

  # (I2) UPDATE QUANTITY
  sql = "UPDATE `items` SET `item_qty`="
  if direction=="I":
    sql += "`item_qty`+?"
  elif direction=="O":
    sql += "`item_qty`-?"
  else:
    sql += "?"
  sql += " WHERE `item_sku`=?";
  query(sql,[qty, sku])
  return True