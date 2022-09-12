var inv = {
  // (A) PROPERTIES
  hiWrap : null, // html items wrapper
  hiList : null, // html items list
  hfWrap : null, // html item form wrapper
  hfForm : null,  // html item form
  hmWrap : null, // html movement wrapper
  hmItem : null, // html movement current item
  hmForm : null, // html add movement form
  hmList : null, // html movement list
  csku : null, // current sku editing or show movement 
  mdirection : { I : "Receive", O : "Send", T : "Stock Take" },

  // (B) SUPPORT FUNCTION - FETCH
  fetch : (req, data, after) => {
    // (B1) FORM DATA
    let form;
    if (data instanceof FormData) { form = data; }
    else {
      form = new FormData();
      if (data != null) { for (let [k, v] of Object.entries(data)) {
        form.append(k, v);
      }}
    }

    // (B2) AJAX FETCH
    fetch("/req/"+req, { method: "post", body : form })
    .then(res => res.text())
    .then(txt => { after(txt); });
  },

  // (C) INIT
  init : () => {
    // (C1) GET HTML ELEMENTS
    inv.hiWrap = document.getElementById("itemWrap");
    inv.hiList = document.getElementById("itemList");
    inv.hfWrap = document.getElementById("iFormWrap");
    inv.hfForm = document.getElementById("iForm");
    inv.hmWrap = document.getElementById("moveWrap");
    inv.hmItem = document.getElementById("moveItem");
    inv.hmForm = document.getElementById("moveAdd");
    inv.hmList = document.getElementById("moveList");

    // (C2) LOAD ITEMS LIST
    inv.drawlist();
  },

  // (D) TOGGLE HTML INTERFACE
  toggle : (mode, sku) => {
    // (D1) ITEMS LIST
    if (mode == 1) {
      inv.hiWrap.classList.remove("hide");
      inv.hfWrap.classList.add("hide");
      inv.hmWrap.classList.add("hide");
    }

    // (D2) ADD/EDIT ITEM
    else if (mode == 2) {
      // (D2-1) HIDE MOVEMENT + SHOW ITEMS LIST
      inv.hiWrap.classList.remove("hide");
      inv.hmWrap.classList.add("hide");

      // (D2-2) CLOSE ITEM FORM
      if (sku == undefined) { inv.hfWrap.classList.add("hide"); }

      // (D2-3) ADD NEW ITEM
      else if (sku === true) {
        inv.csku = "";
        inv.hfForm.reset();
        inv.hfWrap.classList.remove("hide");
      }

      // (D2-4) EDIT ITEM
      else {
        inv.fetch("get", { sku: sku }, item => {
          let fields = inv.hfForm.querySelectorAll("input[type=text]");
          item = JSON.parse(item);
          inv.csku = sku;
          for (let i=0; i<fields.length; i++) {
            fields[i].value = item[i];
          }
          inv.hfWrap.classList.remove("hide");
        });
      }
    }

    // (D3) ITEM MOVEMENT
    else {
      inv.hiWrap.classList.add("hide");
      inv.hfWrap.classList.add("hide");
      inv.hmWrap.classList.remove("hide");
    }
  },

  // (E) DRAW HTML ITEMS LIST
  drawlist : () => {
    inv.toggle(1);
    inv.fetch("getall", null, items => {
      items = JSON.parse(items);
      inv.hiList.innerHTML = "";
      for (let i of items) {
        let row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<div class="info">
          <div><i class="mi">category</i>[${i[0]}] ${i[1]}</div>
          <div><i class="mi">tag</i>${i[3]} ${i[2]}</div>
        </div>
        <input type="button" class="mi" value="delete" onclick="inv.del('${i[0]}')">
        <input type="button" class="mi" value="edit" onclick="inv.toggle(2, '${i[0]}')">
        <input type="button" class="mi" value="zoom_in" onclick="inv.drawmvt('${i[0]}')">`;
        inv.hiList.appendChild(row);
      }
    });
  },

  // (F) SAVE ITEM
  save : () => {
    let form = new FormData(inv.hfForm);
    form.append("osku", inv.csku);
    inv.fetch("save", form, res => {
      if (res == "OK") {
        inv.drawlist();
        inv.toggle(2);
      } else { alert(res); }
    });
    return false;
  },

  // (G) DELETE ITEM
  del : (sku) => { if (confirm(`Delete ${sku}?`)) {
    inv.fetch("delete", { sku : sku }, (res)=>{
      if (res == "OK") { inv.drawlist(); }
      else { alert(res); }
    });
  }},

  // (H) DRAW MOVEMENT
  drawmvt : (sku) => {
    // (H1) "INIT"
    if (sku) { inv.csku = sku; }
    inv.hmItem.innerHTML = "";
    inv.hmList.innerHTML = "";
    inv.toggle(3);

    // (H2) LOAD ITEM
    inv.fetch("get", { sku: inv.csku }, item => {
      item = JSON.parse(item);
      inv.hmItem.innerHTML = `[${item[0]}] ${item[1]}`;
    });

    // (H3) LOAD HISTORY
    inv.fetch("getmvt", { sku: inv.csku }, rows => {
      rows = JSON.parse(rows);
      for (let r of rows) {
        let row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<div class="mqty mqty${r[2]}">
          ${inv.mdirection[r[2]]} ${r[3]}
        </div>
        <div class="minfo">
          <div class="mdate">
            <i class="mi">calendar_today</i> ${r[1]}
          </div>
          <div class="mnotes">
            <i class="mi">notes</i> ${r[4]}
          </div>
        </div>`;
        inv.hmList.appendChild(row);
      }
    });
  },
  
  // (I) SAVE MOVEMENT
  savemvt : () => {
    let form = new FormData(inv.hmForm);
    form.append("sku", inv.csku);
    inv.fetch("savemvt", form, res => {
      if (res == "OK") {
        inv.hmForm.reset();
        inv.drawmvt();
      } else { alert(res); }
    });
    return false;
  }
};
window.onload = inv.init;