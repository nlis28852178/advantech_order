(function () {
  const modalHtml = `
  <div class="myA-modal" id="myACompanyModal" role="dialog" aria-modal="true" aria-labelledby="myACompanyTitle">
    <div class="myA-modal__card">
      <div class="myA-modal__header">
        <h2 class="myA-modal__title" id="myACompanyTitle">&emsp;&emsp;</h2>
        <span class="myA-modal__close" data-modal-close aria-label="Close dialog">
          <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-labelledby="closeTitle"
          xmlns="http://www.w3.org/2000/svg">
            <title id="closeTitle">Close</title>
            <line x1="6" y1="6" x2="18" y2="18" stroke="#004280" stroke-width="2" stroke-linecap="round"/>
            <line x1="18" y1="6" x2="6" y2="18" stroke="#004280" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
      <div class="myA-modal__body">
        <div class="myA-search">
          <label for="myAFieldName">Company Name</label>
          <input class="myA-input" type="text" id="myAFieldName" placeholder="Type a name…">
          <label for="myAFieldId">ID</label>
          <input class="myA-input--id" type="text" id="myAFieldId" placeholder="ID…">
          <button class="myA-btn" id="myASearchBtn" type="button">Search</button>
        </div>
        <div class="myA-list" id="myAList" role="listbox" aria-label="Company list"></div>
      </div>
    </div>
  </div>`;

  document.addEventListener("DOMContentLoaded", () => {
    // 建立 Modal
    if (!document.getElementById("myACompanyModal")) {
      document.body.insertAdjacentHTML("beforeend", modalHtml);
    }

    const modal    = document.getElementById("myACompanyModal");
    const listEl   = document.getElementById("myAList");
    const btnClose = modal.querySelector("[data-modal-close]");
    const searchN  = document.getElementById("myAFieldName");
    const searchI  = document.getElementById("myAFieldId");
    const btnFind  = document.getElementById("myASearchBtn");

    let currentTarget = null; // 目前操作的卡片（.recipient-info 或 .customer-info）
    let currentData   = [];

    // 假資料
    const companiesBase = [
      { name: "Microsoft Corporation", contact: "Robin Brown",  phone: "(555) 555-1234", addr: "One Microsoft Way, Redmond, WA 98052-6399, USA", id: "ASPA001" },
      { name: "Apple Inc.",            contact: "Sophia Martin", phone: "(408) 555-6789", addr: "One Apple Park Way, Cupertino, CA 95014, USA",    id: "ASPA002" },
      { name: "Google LLC",            contact: "Daniel Chen",   phone: "(650) 555-4321", addr: "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA", id: "ASPA003" },
      { name: "Amazon.com, Inc.",      contact: "Robin Brown",   phone: "(555) 555-1111", addr: "410 Terry Ave N, Seattle, WA 98109, USA", id: "ASPA004" },
      { name: "Meta Platforms, Inc.",  contact: "Sophia Martin", phone: "(650) 555-2222", addr: "1 Hacker Way, Menlo Park, CA 94025, USA", id: "ASPA005" }
    ];

    /* ========== 工具：判斷是否「不可 Clear」(Shipping) ========== */
    function isNoClearCard(targetEl) {
      // 依照你的 HTML 結構：.recipient-info/.customer-info -> .form-group（有 data-no-clear）
      const group = targetEl ? targetEl.closest(".form-group") : null;
      return !!(group && group.hasAttribute("data-no-clear"));
    }

    /* ========== Render + State ========== */
    function renderList(data) {
      listEl.innerHTML = data.map(c => `
        <div class="myA-row" role="option" data-company-id="${c.id}">
          <div class="myA-info">
            <strong>${c.name}</strong><br>
            ${c.contact}<br>
            ${c.phone}<br>
            ${c.addr}<br>
            ID: ${c.id}
          </div>
          <button class="myA-pill" type="button" aria-pressed="false" aria-label="Select this company">Select</button>
        </div>
      `).join("");

      // 預設第一筆套用 Hover/Selected 視覺
      applyHoverState(listEl.querySelector(".myA-row"));
    }

    function applyHoverState(rowEl) {
      Array.from(listEl.querySelectorAll(".myA-row")).forEach(r => {
        r.classList.remove("is-hover");
        const b = r.querySelector(".myA-pill");
        if (b) {
          b.classList.remove("is-selected");
          b.textContent = "Select";
          b.setAttribute("aria-pressed", "false");
        }
      });
      if (rowEl) {
        rowEl.classList.add("is-hover");
        const btn = rowEl.querySelector(".myA-pill");
        if (btn) {
          btn.classList.add("is-selected");
          btn.textContent = "Selected";
          btn.setAttribute("aria-pressed", "true");
        }
      }
    }

    /* ========== Open / Close ========== */
    function openModal(openerBtn) {
      currentTarget = openerBtn?.closest(".recipient-info, .customer-info") || null;
      currentData = companiesBase.slice(0);
      renderList(currentData);
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
      modal.querySelector(".myA-modal__title")?.focus?.();
    }
    function closeModal() {
      modal.style.display = "none";
      document.body.style.overflow = "";
      currentTarget = null;
    }

    btnClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.style.display === "flex") closeModal(); });

    /* ========== Search ========== */
    function doSearch() {
      const nameQ = (searchN.value || "").trim().toLowerCase();
      const idQ   = (searchI.value || "").trim().toLowerCase();
      currentData = companiesBase.filter(c => {
        const okN = nameQ ? c.name.toLowerCase().includes(nameQ) : true;
        const okI = idQ   ? c.id.toLowerCase().includes(idQ)     : true;
        return okN && okI;
      });
      renderList(currentData);
    }
    btnFind.addEventListener("click", doSearch);

    /* ========== Interactions ========== */
    // 開啟 Modal（沿用 .btn-address；只在文字是 Select 時開啟）
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("button.btn-address");
      if (!opener) return;
      if (opener.textContent.trim() !== "Select") return;
      openModal(opener);
    });

    // 選公司（列表右側按鈕）
    listEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".myA-pill");
      if (!btn || !currentTarget) return;

      const row = e.target.closest(".myA-row");
      if (row) applyHoverState(row);

      const pickedId = row?.dataset.companyId;
      const picked   = currentData.find(c => c.id === pickedId);
      if (!picked) return;

      // 回填到卡片
      let nameEl = currentTarget.querySelector(".recipient-name");
      if (!nameEl) {
        nameEl = document.createElement("div");
        nameEl.className = "recipient-name";
        currentTarget.appendChild(nameEl);
      }
      nameEl.textContent = picked.name || "";

      let details = currentTarget.querySelectorAll(".recipient-details");
      for (let i = details.length; i < 3; i++) {
        const d = document.createElement("div");
        d.className = "recipient-details";
        currentTarget.appendChild(d);
      }
      details = currentTarget.querySelectorAll(".recipient-details");
      details[0].textContent = picked.contact || "";
      details[1].textContent = picked.phone || "";
      details[2].textContent = picked.addr || "";

      let actions = currentTarget.querySelector(".card-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "card-actions";
        currentTarget.appendChild(actions);
      }

      // 是否禁止 Clear（例如 Shipping Recipient 的 .form-group 具有 data-no-clear）
      const noClear = isNoClearCard(currentTarget);

      actions.innerHTML = `
        <button class="btn-address" type="button">Select</button>
        ${noClear ? "" : '<button class="btn-address2" type="button">Clear</button>'}
      `;

      closeModal();
    });

    // Clear（回到預設 Select 畫面）
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button.btn-address2");
      if (!btn) return;

      const box = btn.closest(".recipient-info, .customer-info");
      if (!box) return;

      // 清空欄位
      const nameEl = box.querySelector(".recipient-name");
      const detailEls = box.querySelectorAll(".recipient-details");
      if (nameEl) nameEl.textContent = "";
      detailEls.forEach(d => d.textContent = "");

      // 重設按鈕（只留 Select）
      let actions = box.querySelector(".card-actions");
      if (!actions) {
        actions = document.createElement("div");
        actions.className = "card-actions";
        box.appendChild(actions);
      }
      actions.innerHTML = '<button class="btn-address" type="button">Select</button>';
    });

    // 點整列也先標記選中（不關閉）
    listEl.addEventListener("click", (e) => {
      const row = e.target.closest(".myA-row");
      if (!row) return;
      if (!e.target.classList.contains("myA-pill")) {
        applyHoverState(row);
      }
    });
  });
})();
