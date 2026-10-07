/* =====================================================
   FAYSAL PHARMACY
   DEMAND & PURCHASE ORDER APP

   VERSION 1
   GitHub-only / Local Storage

   Supabase will be connected later.
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const DEMAND_STORAGE_KEY = "faysal_pharmacy_demands_v1";
const ORDER_STORAGE_KEY = "faysal_pharmacy_orders_v1";


let demands = [];
let orders = [];

let selectedDemandType = "ended";

let currentOrderItems = [];


/* =====================================================
   START APP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  try {

    loadLocalData();

    setupTabs();

    setupDemandForm();

    setupOrderForm();

    setupModal();

    setDefaultDate();

    renderDemands();

    renderOrders();

    renderOrderItems();

    setLocalStatus();

  } catch (error) {

    console.error(error);

    showToast("App error. Please refresh the page.");

  }

});


/* =====================================================
   LOCAL STORAGE
===================================================== */

function loadLocalData() {

  const savedDemands =
    localStorage.getItem(DEMAND_STORAGE_KEY);

  const savedOrders =
    localStorage.getItem(ORDER_STORAGE_KEY);


  if (savedDemands) {

    try {

      demands = JSON.parse(savedDemands);

    } catch {

      demands = [];

    }

  }


  if (savedOrders) {

    try {

      orders = JSON.parse(savedOrders);

    } catch {

      orders = [];

    }

  }

}


function saveDemands() {

  localStorage.setItem(
    DEMAND_STORAGE_KEY,
    JSON.stringify(demands)
  );

}


function saveOrders() {

  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(orders)
  );

}


/* =====================================================
   STATUS
===================================================== */

function setLocalStatus() {

  const dot =
    document.getElementById("statusDot");

  const text =
    document.getElementById("statusText");


  if (dot) {

    dot.style.background = "#55a878";

  }


  if (text) {

    text.textContent = "Local";

  }

}


/* =====================================================
   TABS
===================================================== */

function setupTabs() {

  const tabs =
    document.querySelectorAll(".tab");


  tabs.forEach(function (tab) {

    tab.addEventListener("click", function () {

      const target =
        tab.getAttribute("data-tab");


      tabs.forEach(function (item) {

        item.classList.remove("active");

      });


      document
        .querySelectorAll(".tab-content")
        .forEach(function (content) {

          content.classList.remove("active");

        });


      tab.classList.add("active");


      const targetElement =
        document.getElementById(target);


      if (targetElement) {

        targetElement.classList.add("active");

      }

    });

  });

}


/* =====================================================
   DEMAND FORM
===================================================== */

function setupDemandForm() {

  const typeButtons =
    document.querySelectorAll(".choice-btn");


  typeButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      typeButtons.forEach(function (item) {

        item.classList.remove("selected");

      });


      button.classList.add("selected");


      selectedDemandType =
        button.getAttribute("data-type");

    });

  });


  const addButton =
    document.getElementById("addDemandBtn");


  if (addButton) {

    addButton.addEventListener(
      "click",
      addDemand
    );

  }


  const clearButton =
    document.getElementById("clearDemandsBtn");


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearAllDemands
    );

  }

}


/* =====================================================
   ADD DEMAND
===================================================== */

function addDemand() {

  const medicineInput =
    document.getElementById("medicineName");

  const companyInput =
    document.getElementById("companyName");

  const distributorInput =
    document.getElementById("distributorName");


  const medicineName =
    medicineInput.value.trim();

  const companyName =
    companyInput.value.trim();

  const distributorName =
    distributorInput.value.trim();


  if (!medicineName) {

    showToast("Enter medicine name.");

    medicineInput.focus();

    return;

  }


  const newDemand = {

    id: createId(),

    medicine_name: medicineName,

    company_name: companyName,

    distributor_name: distributorName,

    demand_type: selectedDemandType,

    created_at: new Date().toISOString()

  };


  demands.unshift(newDemand);


  saveDemands();

  renderDemands();


  medicineInput.value = "";

  companyInput.value = "";

  distributorInput.value = "";


  showToast("Demand added.");

}


/* =====================================================
   RENDER DEMANDS
===================================================== */

function renderDemands() {

  const list =
    document.getElementById("demandList");

  const count =
    document.getElementById("demandCount");


  if (!list) return;


  if (count) {

    count.textContent =
      demands.length +
      (demands.length === 1 ? " item" : " items");

  }


  if (demands.length === 0) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">📦</div>

        <h3>No demands yet</h3>

        <p>
          Add a medicine above when it is ended
          or running low.
        </p>

      </div>

    `;

    return;

  }


  list.innerHTML = "";


  demands.forEach(function (demand) {

    const card =
      document.createElement("div");

    card.className = "list-card";


    const typeClass =
      demand.demand_type === "ended"
        ? "badge-ended"
        : "badge-low";


    const typeText =
      demand.demand_type === "ended"
        ? "ENDED"
        : "LOW STOCK";


    card.innerHTML = `

      <div class="list-main">

        <div class="list-info">

          <div class="list-title">
            ${escapeHtml(demand.medicine_name)}
          </div>

          ${
            demand.company_name
              ? `<div class="list-meta">
                   Company: ${escapeHtml(demand.company_name)}
                 </div>`
              : ""
          }

          ${
            demand.distributor_name
              ? `<div class="list-meta">
                   Distributor: ${escapeHtml(demand.distributor_name)}
                 </div>`
              : ""
          }

          <span class="badge ${typeClass}">
            ${typeText}
          </span>

        </div>

      </div>


      <div class="list-actions">

        <button
          class="delete-btn"
          data-demand-id="${demand.id}"
        >
          Delete
        </button>

        <button
          class="copy-btn"
          data-order-demand-id="${demand.id}"
        >
          Add to Order
        </button>

      </div>

    `;


    const deleteButton =
      card.querySelector(".delete-btn");


    deleteButton.addEventListener(
      "click",
      function () {

        deleteDemand(demand.id);

      }
    );


    const orderButton =
      card.querySelector(".copy-btn");


    orderButton.addEventListener(
      "click",
      function () {

        addDemandDirectlyToOrder(demand.id);

      }
    );


    list.appendChild(card);

  });

}


/* =====================================================
   DELETE DEMAND
===================================================== */

function deleteDemand(id) {

  demands =
    demands.filter(function (item) {

      return item.id !== id;

    });


  saveDemands();

  renderDemands();

  showToast("Demand deleted.");

}


/* =====================================================
   CLEAR DEMANDS
===================================================== */

function clearAllDemands() {

  if (demands.length === 0) {

    showToast("No demands to clear.");

    return;

  }


  const confirmed =
    confirm(
      "Delete all current demands?"
    );


  if (!confirmed) return;


  demands = [];

  saveDemands();

  renderDemands();

  showToast("All demands cleared.");

}


/* =====================================================
   ORDER FORM
===================================================== */

function setupOrderForm() {

  const dateInput =
    document.getElementById("bookingDate");


  if (dateInput) {

    dateInput.addEventListener(
      "change",
      updateBookingDay
    );

  }


  const addManualButton =
    document.getElementById("addManualItemBtn");


  if (addManualButton) {

    addManualButton.addEventListener(
      "click",
      addManualOrderItem
    );

  }


  const addDemandButton =
    document.getElementById("addFromDemandBtn");


  if (addDemandButton) {

    addDemandButton.addEventListener(
      "click",
      openDemandModal
    );

  }


  const createButton =
    document.getElementById("createOrderBtn");


  if (createButton) {

    createButton.addEventListener(
      "click",
      createPurchaseOrder
    );

  }

}


/* =====================================================
   DEFAULT DATE
===================================================== */

function setDefaultDate() {

  const input =
    document.getElementById("bookingDate");


  if (!input) return;


  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");


  const day =
    String(today.getDate())
      .padStart(2, "0");


  input.value =
    `${year}-${month}-${day}`;


  updateBookingDay();

}


/* =====================================================
   BOOKING DAY
===================================================== */

function updateBookingDay() {

  const dateInput =
    document.getElementById("bookingDate");

  const dayInput =
    document.getElementById("bookingDay");


  if (!dateInput || !dayInput) return;


  if (!dateInput.value) {

    dayInput.value = "";

    return;

  }


  const parts =
    dateInput.value.split("-");


  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  const day =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long"
      }
    );


  dayInput.value = day;

}


/* =====================================================
   ADD MANUAL ORDER ITEM
===================================================== */

function addManualOrderItem() {

  const medicine =
    prompt("Enter medicine name:");


  if (!medicine) return;


  const cleanName =
    medicine.trim();


  if (!cleanName) return;


  currentOrderItems.push({

    id: createId(),

    demand_id: null,

    medicine_name: cleanName,

    company_name: "",

    quantity: 1

  });


  renderOrderItems();

}


/* =====================================================
   ADD DEMAND DIRECTLY TO ORDER
===================================================== */

function addDemandDirectlyToOrder(id) {

  const demand =
    demands.find(function (item) {

      return item.id === id;

    });


  if (!demand) return;


  const alreadyExists =
    currentOrderItems.some(function (item) {

      return item.demand_id === id;

    });


  if (alreadyExists) {

    showToast("Already added to order.");

    return;

  }


  currentOrderItems.push({

    id: createId(),

    demand_id: demand.id,

    medicine_name: demand.medicine_name,

    company_name: demand.company_name || "",

    quantity: 1

  });


  renderOrderItems();


  switchToOrdersTab();

  showToast("Added to purchase order.");

}


/* =====================================================
   DEMAND MODAL
===================================================== */

function setupModal() {

  const closeButton =
    document.getElementById("closeDemandModal");


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeDemandModal
    );

  }


  const modal =
    document.getElementById("demandModal");


  if (modal) {

    modal.addEventListener(
      "click",
      function (event) {

        if (event.target === modal) {

          closeDemandModal();

        }

      }
    );

  }

}


function openDemandModal() {

  const modal =
    document.getElementById("demandModal");

  const list =
    document.getElementById("modalDemandList");


  if (!modal || !list) return;


  if (demands.length === 0) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">📦</div>

        <h3>No current demands</h3>

        <p>
          Add a demand first.
        </p>

      </div>

    `;

  } else {

    list.innerHTML = "";


    demands.forEach(function (demand) {

      const button =
        document.createElement("button");


      button.className =
        "modal-demand";


      button.innerHTML = `

        <strong>
          ${escapeHtml(demand.medicine_name)}
        </strong>

        <span>
          ${
            demand.company_name
              ? escapeHtml(demand.company_name) + " • "
              : ""
          }

          ${
            demand.demand_type === "ended"
              ? "Ended"
              : "Low Stock"
          }
        </span>

      `;


      button.addEventListener(
        "click",
        function () {

          addDemandDirectlyToOrder(
            demand.id
          );

          closeDemandModal();

        }
      );


      list.appendChild(button);

    });

  }


  modal.classList.remove("hidden");

}


function closeDemandModal() {

  const modal =
    document.getElementById("demandModal");


  if (modal) {

    modal.classList.add("hidden");

  }

}


/* =====================================================
   ORDER ITEMS
===================================================== */

function renderOrderItems() {

  const container =
    document.getElementById("orderItems");


  if (!container) return;


  if (currentOrderItems.length === 0) {

    container.innerHTML = `

      <div class="empty-order">
        No medicines added yet.
      </div>

    `;

    return;

  }


  container.innerHTML = "";


  currentOrderItems.forEach(function (item) {

    const row =
      document.createElement("div");


    row.className =
      "order-item";


    row.innerHTML = `

      <div class="order-item-top">

        <div>

          <div class="order-item-name">
            ${escapeHtml(item.medicine_name)}
          </div>

          ${
            item.company_name
              ? `<div class="order-item-company">
                   ${escapeHtml(item.company_name)}
                 </div>`
              : ""
          }

        </div>

        <button
          class="delete-btn remove-order-item"
        >
          Remove
        </button>

      </div>


      <div class="quantity-row">

        <label>Quantity</label>

        <input
          class="quantity-input"
          type="number"
          min="1"
          value="${item.quantity}"
        >

      </div>

    `;


    const quantityInput =
      row.querySelector(".quantity-input");


    quantityInput.addEventListener(
      "input",
      function () {

        let value =
          Number(quantityInput.value);


        if (!value || value < 1) {

          value = 1;

        }


        item.quantity = value;

      }
    );


    const removeButton =
      row.querySelector(".remove-order-item");


    removeButton.addEventListener(
      "click",
      function () {

        currentOrderItems =
          currentOrderItems.filter(
            function (orderItem) {

              return orderItem.id !== item.id;

            }
          );


        renderOrderItems();

      }
    );


    container.appendChild(row);

  });

}


/* =====================================================
   CREATE PURCHASE ORDER
===================================================== */

function createPurchaseOrder() {

  const supplierInput =
    document.getElementById("supplierName");

  const dateInput =
    document.getElementById("bookingDate");

  const dayInput =
    document.getElementById("bookingDay");


  const supplier =
    supplierInput.value.trim();


  if (!supplier) {

    showToast("Enter supplier name.");

    supplierInput.focus();

    return;

  }


  if (currentOrderItems.length === 0) {

    showToast("Add at least one medicine.");

    return;

  }


  const order = {

    id: createId(),

    booking_date: dateInput.value,

    booking_day: dayInput.value,

    supplier_name: supplier,

    items: currentOrderItems.map(
      function (item) {

        return {

          medicine_name:
            item.medicine_name,

          company_name:
            item.company_name,

          quantity:
            Number(item.quantity),

          demand_id:
            item.demand_id

        };

      }
    ),

    created_at:
      new Date().toISOString()

  };


  orders.unshift(order);


  saveOrders();


  /*
    Remove demands that were included
    in this purchase order.
  */

  const orderedDemandIds =
    currentOrderItems
      .map(function (item) {

        return item.demand_id;

      })
      .filter(Boolean);


  if (orderedDemandIds.length > 0) {

    demands =
      demands.filter(function (demand) {

        return !orderedDemandIds.includes(
          demand.id
        );

      });


    saveDemands();

    renderDemands();

  }


  currentOrderItems = [];

  renderOrderItems();

  renderOrders();


  supplierInput.value = "";


  showToast("Purchase order created.");

}


/* =====================================================
   RENDER ORDERS
===================================================== */

function renderOrders() {

  const list =
    document.getElementById("ordersList");

  const count =
    document.getElementById("orderCount");


  if (!list) return;


  if (count) {

    count.textContent =
      orders.length +
      (orders.length === 1
        ? " order"
        : " orders");

  }


  if (orders.length === 0) {

    list.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">🧾</div>

        <h3>No purchase orders</h3>

        <p>
          Your completed orders will appear here.
        </p>

      </div>

    `;

    return;

  }


  list.innerHTML = "";


  orders.forEach(function (order) {

    const card =
      document.createElement("div");


    card.className =
      "list-card";


    const itemsText =
      order.items
        .map(function (item) {

          return (
            escapeHtml(item.medicine_name) +
            " × " +
            item.quantity
          );

        })
        .join("<br>");


    card.innerHTML = `

      <div class="list-main">

        <div class="list-info">

          <div class="list-title">
            ${escapeHtml(order.supplier_name)}
          </div>

          <div class="list-meta">

            ${escapeHtml(order.booking_day)},
            ${formatDate(order.booking_date)}

          </div>

          <div class="list-meta">

            ${itemsText}

          </div>

        </div>

      </div>


      <div class="list-actions">

        <button
          class="copy-btn copy-order"
        >
          Copy Order
        </button>

        <button
          class="delete-btn delete-order"
        >
          Delete
        </button>

      </div>

    `;


    card
      .querySelector(".copy-order")
      .addEventListener(
        "click",
        function () {

          copyOrder(order);

        }
      );


    card
      .querySelector(".delete-order")
      .addEventListener(
        "click",
        function () {

          deleteOrder(order.id);

        }
      );


    list.appendChi
