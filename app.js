/* =========================================
   FAYSAL PHARMACY
   SIMPLE GITHUB VERSION
========================================= */


var demands = [];
var orders = [];

var selectedType = "ended";

var orderItems = [];


/* =========================================
   START
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  loadData();

  setToday();

  renderDemands();

  renderOrders();

  renderOrderItems();

});


/* =========================================
   PAGE SWITCHING
========================================= */

function showPage(pageId) {

  var pages =
    document.querySelectorAll(".page");

  pages.forEach(function (page) {

    page.classList.add("hidden");

  });


  var selected =
    document.getElementById(pageId);


  if (selected) {

    selected.classList.remove("hidden");

  }

}


/* =========================================
   DEMAND TYPE
========================================= */

function selectType(type) {

  selectedType = type;


  document
    .getElementById("endedButton")
    .classList.remove("active");


  document
    .getElementById("lowButton")
    .classList.remove("active");


  if (type === "ended") {

    document
      .getElementById("endedButton")
      .classList.add("active");

  } else {

    document
      .getElementById("lowButton")
      .classList.add("active");

  }

}


/* =========================================
   ADD DEMAND
========================================= */

function addDemand() {

  var medicine =
    document
      .getElementById("medicineName")
      .value
      .trim();


  var company =
    document
      .getElementById("companyName")
      .value
      .trim();


  var distributor =
    document
      .getElementById("distributorName")
      .value
      .trim();


  if (!medicine) {

    showMessage(
      "Please enter medicine name."
    );

    return;

  }


  var demand = {

    id: Date.now(),

    medicine: medicine,

    company: company,

    distributor: distributor,

    type: selectedType

  };


  demands.unshift(demand);


  saveData();

  renderDemands();


  document.getElementById(
    "medicineName"
  ).value = "";


  document.getElementById(
    "companyName"
  ).value = "";


  document.getElementById(
    "distributorName"
  ).value = "";


  showMessage(
    "Demand added successfully."
  );

}


/* =========================================
   RENDER DEMANDS
========================================= */

function renderDemands() {

  var container =
    document.getElementById("demandList");


  var count =
    document.getElementById("demandCount");


  count.textContent =
    demands.length +
    (demands.length === 1
      ? " item"
      : " items");


  if (demands.length === 0) {

    container.innerHTML =
      '<div class="item empty">' +
      'No current demands.' +
      '</div>';

    return;

  }


  container.innerHTML = "";


  demands.forEach(function (demand) {

    var div =
      document.createElement("div");


    div.className = "item";


    var badgeClass =
      demand.type === "ended"
        ? "ended"
        : "low";


    var badgeText =
      demand.type === "ended"
        ? "ENDED"
        : "LOW STOCK";


    div.innerHTML =

      '<div class="itemName">' +
      escapeHtml(demand.medicine) +
      '</div>' +

      (
        demand.company
          ? '<div class="meta">Company: ' +
            escapeHtml(demand.company) +
            '</div>'
          : ''
      ) +

      (
        demand.distributor
          ? '<div class="meta">Distributor: ' +
            escapeHtml(demand.distributor) +
            '</div>'
          : ''
      ) +

      '<span class="badge ' +
      badgeClass +
      '">' +
      badgeText +
      '</span>' +

      '<div class="actions">' +

      '<button class="delete" ' +
      'onclick="deleteDemand(' +
      demand.id +
      ')">' +
      'Delete' +
      '</button>' +

      '<button class="orderButton" ' +
      'onclick="addDemandToOrder(' +
      demand.id +
      ')">' +
      'Add to Order' +
      '</button>' +

      '</div>';


    container.appendChild(div);

  });

}


/* =========================================
   DELETE DEMAND
========================================= */

function deleteDemand(id) {

  demands =
    demands.filter(function (item) {

      return item.id !== id;

    });


  saveData();

  renderDemands();

  showMessage(
    "Demand deleted."
  );

}


/* =========================================
   CLEAR DEMANDS
========================================= */

function clearDemands() {

  if (demands.length === 0) {

    showMessage(
      "There are no demands."
    );

    return;

  }


  if (
    !confirm(
      "Delete all current demands?"
    )
  ) {

    return;

  }


  demands = [];

  saveData();

  renderDemands();

  showMessage(
    "All demands cleared."
  );

}


/* =========================================
   ADD DEMAND TO ORDER
========================================= */

function addDemandToOrder(id) {

  var demand =
    demands.find(function (item) {

      return item.id === id;

    });


  if (!demand) return;


  var exists =
    orderItems.some(function (item) {

      return item.demandId === id;

    });


  if (exists) {

    showMessage(
      "This medicine is already in the order."
    );

    showPage("orderPage");

    return;

  }


  orderItems.push({

    id: Date.now(),

    demandId: id,

    medicine: demand.medicine,

    company: demand.company,

    quantity: 1

  });


  renderOrderItems();

  showPage("orderPage");

  showMessage(
    "Added to purchase order."
  );

}


/* =========================================
   MANUAL ORDER ITEM
========================================= */

function addManualItem() {

  var medicine =
    prompt(
      "Enter medicine name:"
    );


  if (!medicine) return;


  var clean =
    medicine.trim();


  if (!clean) return;


  orderItems.push({

    id: Date.now(),

    demandId: null,

    medicine: clean,

    company: "",

    quantity: 1

  });


  renderOrderItems();

}


/* =========================================
   RENDER ORDER ITEMS
========================================= */

function renderOrderItems() {

  var container =
    document.getElementById(
      "orderItems"
    );


  if (orderItems.length === 0) {

    container.innerHTML =
      '<p class="empty">' +
      'No medicines added.' +
      '</p>';

    return;

  }


  container.innerHTML = "";


  orderItems.forEach(function (item) {

    var div =
      document.createElement("div");


    div.className =
      "orderItem";


    div.innerHTML =

      '<div class="orderItemTop">' +

      '<div>' +

      '<div class="orderMedicine">' +
      escapeHtml(item.medicine) +
      '</div>' +

      (
        item.company
          ? '<div class="meta">' +
            escapeHtml(item.company) +
            '</div>'
          : ''
      ) +

      '</div>' +

      '<button class="delete" ' +
      'onclick="removeOrderItem(' +
      item.id +
      ')">' +
      'Remove' +
      '</button>' +

      '</div>' +

      '<label>Quantity</label>' +

      '<input ' +
      'class="quantity" ' +
      'type="number" ' +
      'min="1" ' +
      'value="' +
      item.quantity +
      '" ' +
      'onchange="changeQuantity(' +
      item.id +
      ', this.value)">' ;


    container.appendChild(div);

  });

}


/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(id, value) {

  var item =
    orderItems.find(function (item) {

      return item.id === id;

    });


  if (!item) return;


  var quantity =
    parseInt(value);


  if (!quantity || quantity < 1) {

    quantity = 1;

  }


  item.quantity = quantity;

}


/* =========================================
   REMOVE ORDER ITEM
========================================= */

function removeOrderItem(id) {

  orderItems =
    orderItems.filter(function (item) {

      return item.id !== id;

    });


  renderOrderItems();

}


/* =========================================
   DATE
========================================= */

function setToday() {

  var input =
    document.getElementById(
      "bookingDate"
    );


  var today =
    new Date();


  var year =
    today.getFullYear();


  var month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");


  var day =
    String(
      today.getDate()
    ).padStart(2, "0");


  input.value =
    year +
    "-" +
    month +
    "-" +
    day;


  updateDay();

}


/* =========================================
   DAY
========================================= */

function updateDay() {

  var value =
    document.getElementById(
      "bookingDate"
    ).value;


  if (!value) return;


  var parts =
    value.split("-");


  var date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  document.getElementById(
    "bookingDay"
  ).value =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long"
      }
    );

}


/* =========================================
   DEMAND SELECTOR
========================================= */

function openDemandSelector() {

  var modal =
    document.getElementById(
      "demandModal"
    );


  var list =
    document.getElementById(
      "selectorList"
    );


  list.innerHTML = "";


  if (demands.length === 0) {

    list.innerHTML =
      '<p class="empty">' +
      'No current demands.' +
      '</p>';

  }


  demands.forEach(function (demand) {

    var button =
      document.createElement(
        "button"
      );


    button.className =
      "selectorItem";


    button.innerHTML =

      '<strong>' +
      escapeHtml(demand.medicine) +
      '</strong>' +

      '<small>' +

      (
        demand.company
          ? escapeHtml(demand.company)
          : ''
      ) +

      ' — ' +

      (
        demand.type === "ended"
          ? "Ended"
          : "Low Stock"
      ) +

      '</small>';


    button.onclick =
      function () {

        addDemandToOrder(
          demand.id
        );

        closeDemandSelector();

      };


    list.appendChild(button);

  });


  modal.classList.remove(
    "hidden"
  );

}


/* =========================================
   CLOSE SELECTOR
========================================= */

function closeDemandSelector() {

  document
    .getElementById(
      "demandModal"
    )
    .classList.add(
      "hidden"
    );

}


/* =========================================
   CREATE ORDER
========================================= */

function createOrder() {

  var supplier =
    document
      .getElementById(
        "supplierName"
      )
      .value
      .trim();


  var date =
    document
      .getElementById(
        "bookingDate"
      )
      .value;


  var day =
    document
      .getElementById(
        "bookingDay"
      )
      .value;


  if (!supplier) {

    showMessage(
      "Enter supplier name."
    );

    return;

  }


  if (orderItems.length === 0) {

    showMessage(
      "Add at least one medicine."
    );

    return;

  }


  var order = {

    id: Date.now(),

    supplier: supplier,

    date: date,

    day: day,

    items: orderItems.map(
      function (item) {

        return {

          medicine:
            item.medicine,

          company:
            item.company,

          quantity:
            item.quantity,

          demandId:
            item.demandId

        };

      }
    )

  };


  orders.unshift(order);


  /*
    Remove demands included
    in the purchase order.
  */

  orderItems.forEach(
    function (item) {

      if (item.demandId) {

        demands =
          demands.filter(
            function (demand) {

              return demand.id !==
                item.demandId;

            }
          );

      }

    }
  );


  orderItems = [];


  saveData();

  renderDemands();

  renderOrders();

  renderOrderItems();


  document.getElementById(
    "supplierName"
  ).value = "";


  showMessage(
    "Purchase order created."
  );

}


/* =========================================
   RENDER ORDERS
========================================= */

function renderOrders() {

  var container =
    document.getElementById(
      "ordersList"
    );


  var count =
    document.getElementById(
      "orderCount"
    );


  count.textContent =
    orders.length +
    (
      orders.length === 1
        ? " order"
        : " orders"
    );


  if (orders.length === 0) {

    container.innerHTML =
      '<div class="item empty">' +
      'No purchase orders yet.' +
      '</div>';

    return;

  }


  container.innerHTML = "";


  orders.forEach(function (order) {

    var div =
      document.createElement(
        "div"
      );


    div.className =
      "item";


    var itemText =
      order.items.map(
        function (item, index) {

          return (
            (index + 1) +
            ". " +
            escapeHtml(item.medicine) +
            " — Qty " +
            item.quantity
          );

        }
      ).join("<br>");


    div.innerHTML =

      '<div class="itemName">' +
      escapeHtml(order.supplier) +
      '</div>' +

      '<div class="meta">' +
      escapeHtml(order.day) +
      ', ' +
      formatDate(order.date) +
      '</div>' +

      '<div class="meta">' +
      itemText +
      '</div>' +

      '<div class="actions">' +

      '<button class="orderButton" ' +
      'onclick="copyOrder(' +
      order.id +
      ')">' +
      'Copy Order' +
      '</button>' +

      '<button class="delete" ' +
      'onclick="deleteOrder(' +
      order.id +
      ')">' +
      'Delete' +
      '</button>' +

      '</div>';


    container.appendChild(div);

  });

}


/* =========================================
   COPY ORDER
========================================= */

function copyOrder(id) {

  var order =
    orders.find(function (item) {

      return item.id === id;

    });


  if (!order) return;


  var text =
    "Faysal Pharmacy\n" +
    "Purchase Order\n\n" +
    "Supplier: " +
    order.supplier +
    "\n" +
    "Booking: " +
    order.day +
    ", " +
    formatDate(order.date) +
    "\n\n";


  order.items.forEach(
    function (item, index) {

      text +=
        (index + 1) +
        ". " +
        item.medicine +
        " — Qty " +
        item.quantity +
        "\n";

    }
  );


  copyText(text);

}


/* =========================================
   COPY TEXT
========================================= */

function copyText(text) {

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(text)
      .then(function () {

        showMessage(
          "Order copied. Paste into WhatsApp."
        );

      })
      .catch(function () {

        oldCopy(text);

      });

  } else {

    oldCopy(text);

  }

}


function oldCopy(text) {

  var area =
    document.createElement(
      "textarea"
    );


  area.value = text;

  document.body.appendChild(area);

  area.select();

  document.execCommand(
    "copy"
  );

  document.body.removeChild(area);


  showMessage(
    "Order copied."
  );

}


/* =========================================
   DELETE ORDER
========================================= */

function deleteOrder(id) {

  if (
    !confirm(
      "Delete this purchase order?"
    )
  ) {

    return;

  }


  orders =
    orders.filter(function (order) {

      return order.id !== id;

    });


  saveData();

  renderOrders();

  showMessage(
    "Order deleted."
  );

}


/* =========================================
   LOCAL STORAGE
========================================= */

function saveData() {

  localStorage.setItem(
    "faysal_demands",
    JSON.stringify(demands)
  );


  localStorage.setItem(
    "faysal_orders",
    JSON.stringify(orders)
  );

}


function loadData() {

  try {

    var savedDemands =
      localStorage.getItem(
        "faysal_demands"
      );


    var savedOrders =
      localStorage.getItem(
        "faysal_orders"
      );


    if (savedDemands) {

      demands =
        JSON.parse(savedDemands);

    }


    if (savedOrders) {

      orders =
        JSON.parse(savedOrders);

    }

  } catch (error) {

    demands = [];

    orders = [];

  }

}


/* =========================================
   MESSAGE
========================================= */

var messageTimer;


function showMessage(text) {

  var box =
    document.getElementById(
      "message"
    );


  box.textContent = text;

  box.style.display = "block";


  clearTimeout(messageTimer);


  messageTimer =
    setTimeout(function () {

      box.style.display = "none";

    }, 2500);

}


/* =========================================
   SECURITY
========================================= */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(value) {

  if (!value) return "";


  var parts =
    value.split("-");


  if (parts.length !== 3) {

    return value;

  }


  return (
    parts[2] +
    "-" +
    parts[1] +
    "-" +
    parts[0]
  );

      }
