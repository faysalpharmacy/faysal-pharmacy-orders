/* =====================================================
   FAYSAL PHARMACY
   SUPABASE CLOUD VERSION
===================================================== */


/* =====================================================
   SUPABASE CONNECTION
===================================================== */

const SUPABASE_URL =
  "https://gfmgatbqbjyjfklbxoli.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_G6suoz5uwyCWHOgqTsqL6w_n0B1U4F8";


const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =====================================================
   APP STATE
===================================================== */

let demands = [];

let orders = [];

let orderItems = [];

let selectedType = "ended";

let messageTimer;


/* =====================================================
   START APP
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    setToday();

    updateTabs();

    await loadDemands();

    await loadOrders();

    startRealtime();

  }
);


/* =====================================================
   PAGE SWITCHING
===================================================== */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });


  const page =
    document.getElementById(pageId);


  if (page) {

    page.classList.remove("hidden");

  }


  updateTabs(pageId);

}


/* =====================================================
   TAB STATUS
===================================================== */

function updateTabs(pageId) {

  const demandTab =
    document.getElementById("demandTab");

  const orderTab =
    document.getElementById("orderTab");


  if (!demandTab || !orderTab) {
    return;
  }


  demandTab.classList.remove("active");

  orderTab.classList.remove("active");


  if (
    !pageId ||
    pageId === "demandPage"
  ) {

    demandTab.classList.add("active");

  } else {

    orderTab.classList.add("active");

  }

}


/* =====================================================
   DEMAND TYPE
===================================================== */

function selectType(type) {

  selectedType = type;


  const endedButton =
    document.getElementById(
      "endedButton"
    );


  const lowButton =
    document.getElementById(
      "lowButton"
    );


  endedButton.classList.remove(
    "active"
  );

  lowButton.classList.remove(
    "active"
  );


  if (type === "ended") {

    endedButton.classList.add(
      "active"
    );

  } else {

    lowButton.classList.add(
      "active"
    );

  }

}


/* =====================================================
   ADD DEMAND
===================================================== */

async function addDemand() {

  const medicine =
    document
      .getElementById("medicineName")
      .value
      .trim();


  const company =
    document
      .getElementById("companyName")
      .value
      .trim();


  const distributor =
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


  const result =
    await db
      .from("demands")
      .insert({

        medicine_name:
          medicine,

        company_name:
          company || null,

        distributor_name:
          distributor || null,

        demand_type:
          selectedType

      });


  if (result.error) {

    console.error(
      "ADD DEMAND ERROR:",
      result.error
    );


    showMessage(
      "Could not add demand."
    );

    return;

  }


  document
    .getElementById("medicineName")
    .value = "";


  document
    .getElementById("companyName")
    .value = "";


  document
    .getElementById("distributorName")
    .value = "";


  showMessage(
    "Demand added."
  );

}


/* =====================================================
   LOAD DEMANDS
===================================================== */

async function loadDemands() {

  const result =
    await db
      .from("demands")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (result.error) {

    console.error(
      "LOAD DEMANDS ERROR:",
      result.error
    );


    setConnectionStatus(
      false
    );


    showMessage(
      "Could not load demands."
    );

    return;

  }


  demands =
    result.data || [];


  renderDemands();

}


/* =====================================================
   RENDER DEMANDS
===================================================== */

function renderDemands() {

  const list =
    document.getElementById(
      "demandList"
    );


  const count =
    document.getElementById(
      "demandCount"
    );


  count.textContent =
    demands.length +
    (
      demands.length === 1
        ? " item"
        : " items"
    );


  if (
    demands.length === 0
  ) {

    list.innerHTML =
      '<div class="item empty">' +
      'No current demands.' +
      '</div>';

    return;

  }


  list.innerHTML = "";


  demands.forEach(
    function(demand) {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "item";


      const badgeClass =
        demand.demand_type === "ended"
          ? "ended"
          : "low";


      const badgeText =
        demand.demand_type === "ended"
          ? "ENDED"
          : "LOW STOCK";


      div.innerHTML =

        '<div class="itemName">' +

        escapeHtml(
          demand.medicine_name
        ) +

        '</div>' +


        (
          demand.company_name

            ? '<div class="meta">' +
              'Company: ' +
              escapeHtml(
                demand.company_name
              ) +
              '</div>'

            : ''
        ) +


        (
          demand.distributor_name

            ? '<div class="meta">' +
              'Distributor: ' +
              escapeHtml(
                demand.distributor_name
              ) +
              '</div>'

            : ''
        ) +


        '<span class="badge ' +
        badgeClass +
        '">' +

        badgeText +

        '</span>' +


        '<div class="actions">' +


        '<button ' +
        'class="orderButton" ' +
        'onclick="addDemandToOrder(' +
        demand.id +
        ')">' +

        'Add to Order' +

        '</button>' +


        '<button ' +
        'class="delete" ' +
        'onclick="deleteDemand(' +
        demand.id +
        ')">' +

        'Delete' +

        '</button>' +


        '</div>';


      list.appendChild(div);

    }
  );

}


/* =====================================================
   DELETE DEMAND
===================================================== */

async function deleteDemand(id) {

  const result =
    await db
      .from("demands")
      .delete()
      .eq(
        "id",
        id
      );


  if (result.error) {

    console.error(
      "DELETE DEMAND ERROR:",
      result.error
    );


    showMessage(
      "Could not delete demand."
    );

    return;

  }


  showMessage(
    "Demand deleted."
  );

}


/* =====================================================
   CLEAR ALL DEMANDS
===================================================== */

async function clearDemands() {

  if (
    demands.length === 0
  ) {

    showMessage(
      "No demands."
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


  const result =
    await db
      .from("demands")
      .delete()
      .neq(
        "id",
        0
      );


  if (result.error) {

    console.error(
      "CLEAR DEMANDS ERROR:",
      result.error
    );


    showMessage(
      "Could not clear demands."
    );

    return;

  }


  showMessage(
    "All demands cleared."
  );

}


/* =====================================================
   ADD DEMAND TO PURCHASE ORDER
===================================================== */

function addDemandToOrder(id) {

  const demand =
    demands.find(
      function(item) {

        return item.id === id;

      }
    );


  if (!demand) {

    return;

  }


  const alreadyAdded =
    orderItems.some(
      function(item) {

        return item.demandId === id;

      }
    );


  if (alreadyAdded) {

    showMessage(
      "Already added to order."
    );


    showPage(
      "orderPage"
    );


    return;

  }


  orderItems.push({

    localId:
      Date.now() +
      Math.random(),

    demandId:
      demand.id,

    medicine:
      demand.medicine_name,

    company:
      demand.company_name || "",

    quantity:
      1

  });


  renderOrderItems();


  showPage(
    "orderPage"
  );


  showMessage(
    "Added to order."
  );

}


/* =====================================================
   MANUAL ORDER ITEM
===================================================== */

function addManualItem() {

  const medicine =
    prompt(
      "Enter medicine name:"
    );


  if (!medicine) {

    return;

  }


  const cleanMedicine =
    medicine.trim();


  if (!cleanMedicine) {

    return;

  }


  orderItems.push({

    localId:
      Date.now() +
      Math.random(),

    demandId:
      null,

    medicine:
      cleanMedicine,

    company:
      "",

    quantity:
      1

  });


  renderOrderItems();

}


/* =====================================================
   RENDER ORDER ITEMS
===================================================== */

function renderOrderItems() {

  const list =
    document.getElementById(
      "orderItems"
    );


  if (
    orderItems.length === 0
  ) {

    list.innerHTML =
      '<p class="empty">' +
      'No medicines added.' +
      '</p>';

    return;

  }


  list.innerHTML = "";


  orderItems.forEach(
    function(item) {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "orderItem";


      div.innerHTML =

        '<div class="orderItemTop">' +


        '<div class="orderMedicine">' +

        escapeHtml(
          item.medicine
        ) +


        (
          item.company

            ? '<div class="meta">' +
              escapeHtml(
                item.company
              ) +
              '</div>'

            : ''
        ) +


        '</div>' +


        '<button ' +
        'class="delete" ' +
        'onclick="removeOrderItem(' +
        item.localId +
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
        item.localId +
        ', this.value)">';


      list.appendChild(div);

    }
  );

}


/* =====================================================
   CHANGE QUANTITY
===================================================== */

function changeQuantity(
  id,
  value
) {

  const item =
    orderItems.find(
      function(item) {

        return item.localId === id;

      }
    );


  if (!item) {

    return;

  }


  item.quantity =
    Math.max(
      1,
      parseInt(value) || 1
    );

}


/* =====================================================
   REMOVE ORDER ITEM
===================================================== */

function removeOrderItem(id) {

  orderItems =
    orderItems.filter(
      function(item) {

        return item.localId !== id;

      }
    );


  renderOrderItems();

}


/* =====================================================
   DATE
===================================================== */

function setToday() {

  const input =
    document.getElementById(
      "bookingDate"
    );


  const today =
    new Date();


  input.value =
    today.getFullYear() +
    "-" +

    String(
      today.getMonth() + 1
    ).padStart(
      2,
      "0"
    ) +

    "-" +

    String(
      today.getDate()
    ).padStart(
      2,
      "0"
    );


  updateDay();

}


/* =====================================================
   UPDATE BOOKING DAY
===================================================== */

function updateDay() {

  const value =
    document
      .getElementById(
        "bookingDate"
      )
      .value;


  if (!value) {

    return;

  }


  const parts =
    value.split("-");


  const date =
    new Date(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2])
    );


  document
    .getElementById(
      "bookingDay"
    )
    .value =

    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long"
      }
    );

}


/* =====================================================
   DEMAND SELECTOR
===================================================== */

function openDemandSelector() {

  const modal =
    document.getElementById(
      "demandModal"
    );


  const list =
    document.getElementById(
      "selectorList"
    );


  list.innerHTML = "";


  if (
    demands.length === 0
  ) {

    list.innerHTML =
      '<p class="empty">' +
      'No current demands.' +
      '</p>';

  }


  demands.forEach(
    function(demand) {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "selectorItem";


      button.innerHTML =

        '<strong>' +

        escapeHtml(
          demand.medicine_name
        ) +

        '</strong>' +


        '<small>' +

        (
          demand.company_name

            ? escapeHtml(
                demand.company_name
              ) +
              " — "

            : ''
        ) +


        (
          demand.demand_type === "ended"

            ? "Ended"

            : "Low Stock"

        ) +

        '</small>';


      button.onclick =
        function() {

          addDemandToOrder(
            demand.id
          );


          closeDemandSelector();

        };


      list.appendChild(
        button
      );

    }
  );


  modal.classList.remove(
    "hidden"
  );

}


/* =====================================================
   CLOSE DEMAND SELECTOR
===================================================== */

function closeDemandSelector() {

  document
    .getElementById(
      "demandModal"
    )
    .classList.add(
      "hidden"
    );

}


/* =====================================================
   CREATE PURCHASE ORDER
===================================================== */

async function createOrder() {

  const supplier =
    document
      .getElementById(
        "supplierName"
      )
      .value
      .trim();


  const date =
    document
      .getElementById(
        "bookingDate"
      )
      .value;


  const day =
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


  if (
    orderItems.length === 0
  ) {

    showMessage(
      "Add at least one medicine."
    );

    return;

  }


  /*
    STEP 1:
    Create order
  */

  const orderResult =
    await db
      .from("orders")
      .insert({

        booking_date:
          date,

        booking_day:
          day,

        supplier_name:
          supplier

      })
      .select()
      .single();


  if (
    orderResult.error
  ) {

    console.error(
      "CREATE ORDER ERROR:",
      orderResult.error
    );


    showMessage(
      "Could not create order."
    );

    return;

  }


  const orderId =
    orderResult.data.id;


  /*
    STEP 2:
    Create order items
  */

  const rows =
    orderItems.map(
      function(item) {

        return {

          order_id:
            orderId,

          demand_id:
            item.demandId,

          medicine_name:
            item.medicine,

          company_name:
            item.company || null,

          quantity:
            Number(
              item.quantity
            )

        };

      }
    );


  const itemResult =
    await db
      .from("order_items")
      .insert(
        rows
      );


  if (
    itemResult.error
  ) {

    console.error(
      "ORDER ITEMS ERROR:",
      itemResult.error
    );


    /*
      Roll back the order
    */

    await db
      .from("orders")
      .delete()
      .eq(
        "id",
        orderId
      );


    showMessage(
      "Could not save order items."
    );

    return;

  }


  /*
    STEP 3:
    Remove demands that were ordered
  */

  const demandIds =
    orderItems
      .map(
        function(item) {

          return item.demandId;

        }
      )
      .filter(
        function(id) {

          return id !== null;

        }
      );


  if (
    demandIds.length > 0
  ) {

    const deleteResult =
      await db
        .from("demands")
        .delete()
        .in(
          "id",
          demandIds
        );


    if (
      deleteResult.error
    ) {

      console.error(
        "DEMAND DELETE ERROR:",
        deleteResult.error
      );

    }

  }


  /*
    STEP 4:
    Clear local order builder
  */

  orderItems = [];


  renderOrderItems();


  document
    .getElementById(
      "supplierName"
    )
    .value = "";


  showMessage(
    "Purchase order created."
  );

}


/* =====================================================
   LOAD PURCHASE ORDERS
===================================================== */

async function loadOrders() {

  const result =
    await db
      .from("orders")
      .select(`
        *,
        order_items (*)
      `)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (
    result.error
  ) {

    console.error(
      "LOAD ORDERS ERROR:",
      result.error
    );


    setConnectionStatus(
      false
    );


    showMessage(
      "Could not load orders."
    );

    return;

  }


  orders =
    result.data || [];


  renderOrders();

}


/* =====================================================
   RENDER PURCHASE ORDERS
===================================================== */

function renderOrders() {

  const list =
    document.getElementById(
      "ordersList"
    );


  const count =
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


  if (
    orders.length === 0
  ) {

    list.innerHTML =
      '<div class="item empty">' +
      'No purchase orders yet.' +
      '</div>';

    return;

  }


  list.innerHTML = "";


  orders.forEach(
    function(order) {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "item";


      const itemText =
        (
          order.order_items || []
        )
        .map(
          function(item, index) {

            return (

              (index + 1) +

              ". " +

              escapeHtml(
                item.medicine_name
              ) +

              " — Qty " +

              item.quantity

            );

          }
        )
        .join(
          "<br>"
        );


      div.innerHTML =

        '<div class="itemName">' +

        escapeHtml(
          order.supplier_name
        ) +

        '</div>' +


        '<div class="meta">' +

        escapeHtml(
          order.booking_day
        ) +

        ', ' +

        formatDate(
          order.booking_date
        ) +

        '</div>' +


        '<div class="meta">' +

        itemText +

        '</div>' +


        '<div class="actions">' +


        '<button ' +
        'class="orderButton" ' +
        'onclick="copyOrder(' +
        order.id +
        ')">' +

        'Copy Order' +

        '</button>' +


        '<button ' +
        'class="whatsappButton" ' +
        'onclick="sendWhatsApp(' +
        order.id +
        ')">' +

        'WhatsApp' +

   
