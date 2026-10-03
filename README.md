# پروتکل پیوند | Peyvand Protocol ⚡

> **پروتکل مبادله غیرحضانتی چندزنجیره‌ای (Multi-Chain DEX) و توکن‌های محرمانه**  
> دامنه رسمی: [https://javadnode.top](https://javadnode.top)

---

## 🌟 قابلیت‌های کلیدی

1. **سواپ ۱۰۰٪ غیرحضانتی (Non-Custodial):**
   - هیچ کلید خصوصی یا دارایی توسط پلتفرم ذخیره نمی‌شود؛ کاربر با کیف‌پول شخصی تراکنش‌ها را مستقیماً در استخرهای نقدینگی امضا می‌کند.
   - **پوشش ۱۵ زنجیره برتر دیفای:**
     - 💎 **شبکه تون (The Open Network / TON):** استخرهای STON.fi و DeDust
     - 🟣 **سولانا (Solana):** روتینگ پرسرعت Jupiter و Raydium
     - 🔷 **اتریوم و زنجیره‌های EVM:** روتر هوشمند Uniswap v3، آربیتروم، بیس، بایننس چین، پالیگان، آوالانچ، آپتیمیزم، زد‌کی‌سینک و لینیا
     - 🛡️ **توکن‌های محرمانه (Privacy Coins):** شبکه زی‌کش (Zcash Shielded) بر پایه zk-SNARKs و کیف‌پول‌های Zodl و Noir
     - 🔴 **ترون (TRON):** پروتکل نقدینگی SunSwap v2
2. **سپر ضد فریز و قطع ردپای آن‌چین (Anti-Taint Shield):**
   - راهنمای گام‌به‌گام دور زدن ردیابی و فلگ تتر، معرفی استیبل‌کوین‌های غیرقابل فریز (LUSD و DAI) و مسیر امن خروج سرمایه.
3. **میز مستقیم استارز تلگرام (Telegram Stars & TON Desk):**
   - خرید استارز تلگرام و کوین GRAM با پرداخت مستقیم ارزهای TON, USDT, SOL, TRX.
   - فروش و نقد کردن استارز و دریافت ریالی در حساب بانکی ایران یا کیف‌پول شخصی.
4. **سامانه رهگیری لحظه‌ای سفارشات (Order Tracker):**
   - امکان پیگیری وضعیت مرحله‌به‌مرحله با شناسه سفارش آن‌چین.
5. **طراحی لوکس کریپتویی به زبان فارسی (RTL):**
   - تایپوگرافی رسمی وزیرمتن (Vazirmatn)، تم تیره سایبرپانک با رنگ‌های زمردی و سایان، واکنش‌گرا برای تمامی گوشی‌ها و تبلت‌ها.

---

## 🛠️ ساختار فنی (Tech Stack)

* **فرانت‌اند:** React 19 + Vite 6 + Tailwind CSS + VibeFarsi
* **آیکون‌ها:** Lucide React + آیکون‌های وکتور رسمی شبکه‌ها و پرچم شیر و خورشید ایران
* **معماری ابری:** Cloudflare Pages با توابع لبه‌ای (Cloudflare Functions) جهت پروکسی امن APIها بدون مشکل CORS و تحریم

---

## 🚀 راهنمای راه‌اندازی و توسعه محلی

```bash
# کلون پروژه
git clone https://github.com/mjavadz/peyvand.git
cd peyvand

# نصب پکیج‌ها
npm install

# اجرای سرور توسعه محلی
npm run dev

# ساخت نسخه پروداکشن
npm run build
```

---

## 🌐 نحوه دیپلوی روی Cloudflare Pages و اتصال به `javadnode.top`

1. وارد داشبورد کلودفلر ([dash.cloudflare.com](https://dash.cloudflare.com)) شوید.
2. به بخش **Workers & Pages ➔ Create application ➔ Pages ➔ Connect to Git** بروید.
3. ریپازیتوری `mjavadz/jswap-farsi` را انتخاب کنید.
4. تنظیمات بیلد را به صورت زیر قرار دهید:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. پس از دیپلوی، به تب **Custom domains** بروید و دامنه `javadnode.top` را اضافه کنید؛ کلودفلر به صورت خودکار گواهینامه SSL رایگان Universal را فعال می‌کند.
