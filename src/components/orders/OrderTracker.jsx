import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight, 
  RefreshCw 
} from 'lucide-react';
import { StarsIcon } from '../Icons';
import { getOrderHistory } from '../../services/starsService';
import { toPersianDigits, formatToman } from '../../utils/format';
import StarsInvoiceModal from '../stars/StarsInvoiceModal';
import { Stepper } from '@/components/ui/stepper';
import { Price } from '@/components/ui/price';
import { DatePicker } from '@/components/ui/date-picker';
import { formatJalali, formatJalaliNumeric } from '@/lib/jalali';

export default function OrderTracker() {
  const [searchId, setSearchId] = useState('');
  const [orders, setOrders] = useState([]);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [dateFilter, setDateFilter] = useState();

  const loadHistory = () => {
    const list = getOrderHistory();
    setOrders(list);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredOrders = orders.filter(ord => {
    if (!dateFilter) return true;
    const orderDate = new Date(ord.createdAt || Date.now());
    return (
      orderDate.getFullYear() === dateFilter.getFullYear() &&
      orderDate.getMonth() === dateFilter.getMonth() &&
      orderDate.getDate() === dateFilter.getDate()
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setNotFound(false);
    const id = searchId.trim().toUpperCase();
    if (!id) return;

    const found = orders.find(o => o.id.toUpperCase() === id);
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setNotFound(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accentSoft border border-accent/30 text-accent flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>تکمیل و تحویل شده</span>
          </span>
        );
      case 'paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center gap-1">
            <RefreshCw size={13} className="animate-spin" />
            <span>در حال تأیید شبکه</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
            <Clock size={13} />
            <span>در انتظار پرداخت</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      
      {/* Search Header Card */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="text-center max-w-md mx-auto space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-foreground">سامانه هوشمند پیگیری سفارشات</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            کد سفارش (Order ID) دریافتی هنگام خرید استارز یا سواپ را وارد کنید تا آخرین وضعیت انتقال را مشاهده نمایید.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="مثال: JS-STARS-491823"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent font-mono"
              dir="ltr"
            />
            <Search size={16} className="absolute right-3 top-3 text-muted-foreground" />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-accent hover:bg-emerald-600 text-background font-bold text-xs sm:text-sm transition-all shadow-sm shrink-0"
          >
            استعلام
          </button>
        </form>

        {/* Not Found Alert */}
        {notFound && (
          <div className="p-3 rounded-xl bg-destructiveSoft border border-destructive/30 text-red-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle size={15} className="text-destructive shrink-0" />
            <span>سفارشی با این شناسه یافت نشد. لطفاً در درج حروف و ارقام دقت فرمایید.</span>
          </div>
        )}
      </div>

      {/* Searched Order Result Card */}
      {searchedOrder && (
        <div className="bg-card border border-accent/40 rounded-2xl p-5 shadow-sm animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">{searchedOrder.id}</span>
                {getStatusBadge(searchedOrder.status)}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                اکانت دریافت‌کننده: <strong className="text-foreground">{searchedOrder.username}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveInvoice(searchedOrder)}
              className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-bold text-foreground hover:bg-muted/80 flex items-center gap-1.5 self-start transition-colors"
            >
              <span>مشاهده پیش‌فاکتور</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* VibeFarsi RTL Stepper */}
          <div className="py-2">
            <Stepper
              current={searchedOrder.status === 'completed' ? 2 : searchedOrder.status === 'paid' ? 1 : 0}
              steps={[
                { label: 'ثبت فاکتور', description: 'انجام شد ✓' },
                { 
                  label: 'تایید تراکنش', 
                  description: searchedOrder.status === 'completed' || searchedOrder.status === 'paid' ? 'تایید شبکه ✓' : 'در انتظار واریز' 
                },
                { 
                  label: 'تحویل استارز', 
                  description: searchedOrder.status === 'completed' ? 'تکمیل شد 🎉' : 'پس از تایید' 
                }
              ]}
            />
          </div>
        </div>
      )}

      {/* Recent Orders List Card */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-accent" />
            <h3 className="text-xs sm:text-sm font-bold text-foreground">سوابق سفارشات اخیر</h3>
          </div>
          
          <div className="flex items-center gap-2.5">
            <DatePicker
              value={dateFilter}
              onChange={setDateFilter}
              placeholder="فیلتر تقویم شمسی..."
              className="w-44 text-xs"
            />
            <span className="text-xs text-muted-foreground font-mono shrink-0">{toPersianDigits(filteredOrders.length)} سفارش</span>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-border/60">
            {filteredOrders.map((ord) => (
              <div 
                key={ord.id}
                className="py-3 flex items-center justify-between gap-3 text-right hover:bg-muted/40 p-2 rounded-xl transition-colors cursor-pointer"
                onClick={() => setActiveInvoice(ord)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                    <StarsIcon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground" dir="ltr">{ord.id}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-sans">
                        {toPersianDigits(ord.stars)} استارز
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>برای: <span className="font-mono text-foreground">{ord.username}</span></span>
                      <span>•</span>
                      <Price amount={ord.pricing?.totalToman || 0} size="sm" />
                      <span>•</span>
                      <span className="text-[11px] font-sans text-accent">
                        {formatJalali(new Date(ord.createdAt || Date.now()), { weekday: false, year: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(ord.status)}
                  <ArrowRight size={14} className="text-muted-foreground rotate-180" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            {dateFilter ? 'سفارشی در این تاریخ شمسی ثبت نشده است.' : 'هنوز سفارشی در این مرورگر ثبت نشده است.'}
          </div>
        )}
      </div>

      {/* Invoice Modal Reopen */}
      <StarsInvoiceModal
        order={activeInvoice}
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        onOrderUpdated={() => loadHistory()}
      />

    </div>
  );
}
