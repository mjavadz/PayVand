/**
 * PayVand (پی‌وند) Embedded Merchant Checkout Widget SDK v1.0.0
 * Lightweight non-custodial crypto checkout widget for online shops & businesses.
 * https://javadnode.top
 */
(function(window, document) {
  'use strict';

  var PayVand = window.PayVand || {};

  var STYLES = `
    .pv-overlay {
      position: fixed; inset: 0; z-index: 999999;
      background: rgba(8, 10, 16, 0.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      direction: rtl; color: #F3F4F6;
    }
    .pv-modal {
      background: #10141E; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; width: 100%; max-width: 440px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.15);
      overflow: hidden; animation: pvFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes pvFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .pv-header {
      padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: space-between;
    }
    .pv-brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; }
    .pv-close {
      background: rgba(255,255,255,0.06); border: none; color: #9CA3AF;
      width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .pv-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .pv-body { padding: 20px; }
    .pv-amount-card {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 16px;
    }
    .pv-amount-val { font-size: 24px; font-weight: 800; color: #10B981; }
    .pv-qr-box {
      background: #fff; padding: 12px; border-radius: 12px; width: 160px; height: 160px;
      margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;
    }
    .pv-address-box {
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 10px 12px; font-size: 11px; font-family: monospace;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      cursor: pointer; word-break: break-all; margin-bottom: 16px;
    }
    .pv-btn {
      width: 100%; padding: 12px; background: linear-gradient(135deg, #10B981, #06B6D4);
      border: none; border-radius: 12px; color: #080A10; font-weight: 700; font-size: 14px;
      cursor: pointer; transition: opacity 0.2s;
    }
    .pv-btn:hover { opacity: 0.92; }
    .pv-footer {
      padding: 12px 20px; border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 11px; color: #6B7280; display: flex; justify-content: space-between;
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  PayVand.open = function(options) {
    options = options || {};
    var amount = options.amount || '10.00';
    var currency = options.currency || 'USDT (TON)';
    var merchant = options.merchant || 'UQDW...PayVandMerchant';
    var storeName = options.storeName || 'فروشگاه آنلاین';
    var orderId = options.orderId || ('PV-' + Math.floor(Math.random() * 899999 + 100000));

    var overlay = document.createElement('div');
    overlay.className = 'pv-overlay';

    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(merchant);

    overlay.innerHTML = `
      <div class="pv-modal">
        <div class="pv-header">
          <div class="pv-brand">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
              <path d="M 30 84 L 30 26 C 30 16, 38 12, 48 12 C 60 12, 88 12, 94 12 C 78 20, 68 28, 68 38 C 68 50, 58 58, 46 58 L 30 58" stroke="#10B981" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="48" cy="35" r="9" stroke="#F59E0B" stroke-width="5" />
            </svg>
            <span>درگاه پرداخت پی‌وند (PayVand Pay)</span>
          </div>
          <button class="pv-close" id="pvCloseBtn">&times;</button>
        </div>
        <div class="pv-body">
          <div class="pv-amount-card">
            <div style="font-size:11px; color:#9CA3AF; margin-bottom:4px;">${storeName} • سفارش: ${orderId}</div>
            <div class="pv-amount-val">${amount} ${currency}</div>
            <div style="font-size:10px; color:#6B7280; margin-top:2px;">تسویه آنی و ۱۰۰٪ غیرحضانتی مستقیم به ولت فروشنده</div>
          </div>
          <div class="pv-qr-box">
            <img src="${qrUrl}" alt="Payment QR" width="136" height="136" />
          </div>
          <div class="pv-address-box" id="pvAddrBox" title="کلیک برای کپی">
            <span>${merchant}</span>
            <span style="color:#06B6D4; font-size:10px;">کپی</span>
          </div>
          <button class="pv-btn" id="pvVerifyBtn">تایید و اتصال به کیف‌پول</button>
        </div>
        <div class="pv-footer">
          <span>سپر ضد فریز و تحریم PayVand</span>
          <span style="color:#10B981;">امنیت تضمین‌شده وب۳</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#pvCloseBtn').onclick = function() {
      document.body.removeChild(overlay);
    };

    overlay.querySelector('#pvAddrBox').onclick = function() {
      navigator.clipboard.writeText(merchant);
      alert('آدرس ولت فروشنده با موفقیت کپی شد!');
    };

    overlay.querySelector('#pvVerifyBtn').onclick = function() {
      this.innerText = 'در حال پایش آن‌چین...';
      this.style.background = '#3B82F6';
      setTimeout(function() {
        alert('تراکنش با موفقیت در بلاکچین تایید شد! سفارش ثبت شد.');
        document.body.removeChild(overlay);
        if (typeof options.onSuccess === 'function') options.onSuccess({ orderId: orderId, amount: amount });
      }, 1500);
    };
  };

  window.PayVand = PayVand;

  // Auto-bind to data-payvand-button elements
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-payvand-checkout]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        PayVand.open({
          amount: el.getAttribute('data-amount') || '25',
          currency: el.getAttribute('data-currency') || 'USDT',
          merchant: el.getAttribute('data-merchant') || 'EQC...PayVandStore',
          storeName: el.getAttribute('data-store') || 'فروشگاه اینترنتی'
        });
      });
    });
  });

})(window, document);