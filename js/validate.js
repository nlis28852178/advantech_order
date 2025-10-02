// validate.js
console.log('validate.js loaded');

document.addEventListener('DOMContentLoaded', function () {
  var nextBtn = document.querySelector('.btn-next');
  if (!nextBtn) {
    console.warn('Next button not found');
    return;
  }

  // 找出必填列：label 內含 <span class="req"> 的 .field-inline
  function getRequiredRows() {
    return Array.from(document.querySelectorAll('.field-inline'))
      .filter(function (row) {
        var label = row.querySelector('label');
        return label && label.querySelector('.req');
      });
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  function showError(row, field, msg) {
    row.classList.add('has-error');

    // 紅框僅對可視邊框的欄位有效（input/select/textarea）
    if (field) {
      field.classList.add('vt-invalid');
      field.setAttribute('aria-invalid', 'true');
    }

    // 統一在 .field-inline 內處理錯誤訊息，避免放進 .radio-group 造成定位混亂
    var old = row.querySelector('.vt-error');
    if (old) old.remove();

    var div = document.createElement('div');
    div.className = 'vt-error';
    div.setAttribute('role', 'alert');
    div.textContent = msg;

    // 直接附加到該列（.field-inline）末端，讓 CSS 對齊到欄位左下
    row.appendChild(div);
  }

  function clearError(row, field) {
    row.classList.remove('has-error');

    if (field) {
      field.classList.remove('vt-invalid');
      field.removeAttribute('aria-invalid');
    }

    var old = row.querySelector('.vt-error');
    if (old) old.remove();
  }

  function isEmpty(val) {
    return val == null || String(val).trim() === '';
  }

  // 針對 .field-inline 取得「代表欄位」：文字/選擇/多行；radio 則回傳群組資訊
  function getFieldInfo(row) {
    // radio 群組？
    var radios = row.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
      var name = radios[0].name;
      var group = Array.from(row.querySelectorAll('input[type="radio"][name="' + CSS.escape(name) + '"]'));
      return { type: 'radio', group: group, name: name };
    }
    // 其他：select / input / textarea
    var field = row.querySelector('select, input, textarea');
    if (field) {
      var tag = field.tagName;
      var isEmailField =
        (row.querySelector('label')?.textContent.toLowerCase().includes('email')) ||
        (tag === 'INPUT' && field.type === 'email');
      return { type: 'single', field: field, isEmail: !!isEmailField };
    }
    return null;
  }

  nextBtn.addEventListener('click', function () {
    var rows = getRequiredRows();
    var firstInvalid = null;

    rows.forEach(function (row) {
      var info = getFieldInfo(row);
      if (!info) return;

      var invalid = false;
      var message = 'Required field';
      var focusField = null;

      if (info.type === 'radio') {
        // radio 規則：同 name 的群組內，至少要有一個 checked
        var anyChecked = info.group.some(function (r) { return r.checked; });
        if (!anyChecked) {
          invalid = true;
          message = 'Required field';
          // radio 沒有邊框，不加 .vt-invalid 也可；聚焦第一顆即可
          focusField = info.group[0];
        } else {
          // 通過：移除群組中任何一顆的錯誤框線（若曾加過）
          info.group.forEach(function (r) { r.classList.remove('vt-invalid'); r.removeAttribute('aria-invalid'); });
        }
      } else {
        var field = info.field;
        var val = (field.value || '').trim();

        // select 的預設狀態（空值 / 第 1 個選項 / 文字為 Select 視為未填）
        var isSelect = field.tagName === 'SELECT';
        var isDefaultSelect =
          isSelect &&
          (isEmpty(val) ||
            field.selectedIndex === 0 ||
            (field.options[field.selectedIndex]?.text || '').trim().toLowerCase() === 'select');

        if (info.isEmail) {
          if (isEmpty(val) || !emailRe.test(val)) {
            invalid = true;
            message = 'Email format is incorrect.';
          }
        } else if (isSelect ? isDefaultSelect : isEmpty(val)) {
          invalid = true;
          message = 'Required field';
        }

        if (invalid) {
          focusField = field; // 文字/選擇/多行 → 聚焦本欄
        }
      }

      if (invalid) {
        // 對 radio：傳入 focusField（群組第一顆）；對其他：傳入該欄位
        showError(row, focusField || (info.field || null), message);
        if (!firstInvalid) firstInvalid = focusField || info.field || null;
      } else {
        clearError(row, info.field || row);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    console.log('All required fields valid!');
    // TODO: 全部通過後，如需進入下一步在此接流程
  });
});

(function () {
  function initDateField(root) {
    var input = root.querySelector('.ui-date');
    var placeholder = root.querySelector('.date-placeholder');
    var trigger = root.querySelector('.date-trigger');

    // 初始化 placeholder 顯示狀態
    function syncState() {
      if (input.value && input.value.trim() !== '') {
        root.classList.add('has-value');
      } else {
        root.classList.remove('has-value');
      }
    }
    syncState();

    // 任何輸入/變更都同步
    input.addEventListener('change', syncState);
    input.addEventListener('input', syncState);

    // 點擊 icon → 可靠喚起原生日曆
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        try { input.click(); } catch (err) { }
      }
    });
  }

  // 自動套用到頁面上所有 .date-field
  document.querySelectorAll('.date-field').forEach(initDateField);
})();
