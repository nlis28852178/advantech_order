document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 動態建立 Modal ---------- */
  const modal = document.createElement("div");
  modal.className = "file-modal";
  modal.innerHTML = `
    <div class="file-modal__card" role="dialog" aria-modal="true" aria-label="Upload File">
      <button class="file-modal__close" id="closeModalBtn" type="button" aria-label="Close">✖</button>
      <div class="file-modal__body">
        <div class="file-dropzone" id="dropzone" aria-label="Upload area">
          <div class="file-cloud" aria-hidden="true">

<svg width="52" height="34" viewBox="0 0 52 34" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M42.23 10.99C40.06 4.79 33.72 0 26 0C18.28 0 11.94 4.79 9.77 10.99C4.09 11.75 0 16.32 0 21.67C0 27.61 4.48 32.5 10 32.5H42C47.52 32.5 52 27.61 52 21.67C52 16.32 47.91 11.75 42.23 10.99Z" fill="#004280"/>
<path d="M22 15.5V27.5H30V15.5H37L26 7.5L15 15.5H22Z" fill="#FFFFFF"/>
</svg>

          </div>
          <p class="dz-title">Drag and drop file here to upload</p>
          <p class="dz-sep">Or</p>
          <button class="file-btn file-btn--pill" id="chooseFileBtn" type="button">Select File</button>
          <input type="file" id="hiddenFileInput" style="display:none" />
        </div>
        <div class="file-error" id="fileError" role="alert" aria-live="assertive"></div>
        <div class="file-info">
          <div>Maximum file upload size :5MB</div>
          <div>Accepted file types: DOC, DOCX, XLS, XLSX, PDF, JPG, PNG</div>
        </div>
      </div>
      <div class="file-modal__footer">
        <div  id="closeModalBtnFooter"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const dropzone          = modal.querySelector("#dropzone");
  const chooseFileBtn     = modal.querySelector("#chooseFileBtn");
  const hiddenFileInput   = modal.querySelector("#hiddenFileInput");
  const fileError         = modal.querySelector("#fileError");
  const closeModalBtnX    = modal.querySelector("#closeModalBtn");
  const closeModalBtnFoot = modal.querySelector("#closeModalBtnFooter");

  // 指向同一列的 .file-upload 與 .field-inline（為了切換預設/有檔狀態）
  let currentDisplayContainer = null;
  let currentRow = null;

  /* ---------- 設定驗證 ---------- */
  const allowedTypes = ["doc", "docx", "xls", "xlsx", "pdf", "jpg", "jpeg", "png"];
  const maxSizeMB    = 5;

  /* ---------- 開啟/關閉 Modal ---------- */
  function openModal() {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    fileError.textContent = "";
    hiddenFileInput.value = "";
  }

  [closeModalBtnX, closeModalBtnFoot].forEach(btn => btn.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(); // 點背景關閉
  });

  /* ---------- 綁定頁面上的 Select File（外部按鈕） ---------- */
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-upload")) {
      currentRow = e.target.closest(".field-inline") || null;
      currentDisplayContainer = currentRow ? currentRow.querySelector(".file-upload") : null;
      openModal();
    }
  });

  /* ---------- Modal 內選檔 ---------- */
  chooseFileBtn.addEventListener("click", () => hiddenFileInput.click());
  hiddenFileInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
  });

  /* ---------- 拖放 ---------- */
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  });

  /* ---------- 驗證與回填 ---------- */
  function handleFile(file) {
    if (!file) return;

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedTypes.includes(ext)) {
      fileError.textContent = "File format or size is incorrect.";
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      fileError.textContent = "File format or size is incorrect.";
      return;
    }

    // 驗證 OK
    fileError.textContent = "";
    closeModal();

    if (currentDisplayContainer) {
      // 清掉舊顯示
      currentDisplayContainer.innerHTML = "";

      // 建立新的檔案資訊（藍色區塊內）
      const display = document.createElement("div");
      display.className = "file-display";
      display.innerHTML = `
        <span class="file-name">${file.name}</span>
        <div class="file-actions">
          <button class="file-icon" type="button" title="Preview" aria-label="Preview"><i class="fas fa-eye"></i></button>
          <button class="file-icon" type="button" title="Delete" aria-label="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;
      currentDisplayContainer.appendChild(display);

      // 切換為「有檔案」狀態：讓藍色列顯示、按鈕留在下方
      if (currentRow) currentRow.classList.add("has-file");

      // 預覽
      const previewEl = display.querySelector('[title="Preview"]');
      previewEl.addEventListener("click", () => {
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, "_blank");
      });

      // 刪除 → 回到預設（只顯示 Select File）
      const deleteEl = display.querySelector('[title="Delete"]');
      deleteEl.addEventListener("click", () => {
        currentDisplayContainer.innerHTML = "";
        if (currentRow) currentRow.classList.remove("has-file");
      });
    }
  }
});
