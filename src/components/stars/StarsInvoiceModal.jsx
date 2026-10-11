import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { StarsIcon } from '../Icons';
import { updateOrderStatus } from '../../services/starsService';
import { toPersianDigits, formatToman } from '../../utils/format';
import { sanitizeInput } from '../../utils/security';

export default function StarsInvoiceModal({ order, isOpen, onClose, onOrderUpdated }) {
  if (!isOpen || !order) return null;

  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [txHashInput, setTxHashInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.floor((order.expiresAt - Date.now()) / 1000);
    return Math.max(0, diff);
  });
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || currentStatus === 'completed') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentStatus]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(order.depositAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(order.pricing.cryptoAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const updated = updateOrderStatus(
        order.id, 
        'completed', 
        txHashInput.trim() || `0x${Math.random().toString(16).slice(2)}`
      );
      setCurrentStatus('completed');
      setIsVerifying(false);
      if (onOrderUpdated && updated) onOrderUpdated(updated);
    }, 2000);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div 
          className="w-full max-w-lg bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-scale-in max-h-[92vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
       
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accentSoft border border-accent/30 flex items-center justify-center text-accent">
                <StarsIcon size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-fg">فاکتور خرید استارز تلگرام</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-muted text-fgSubtle border border-border">
                    {order.id}
                  </span>
                </div>
                <p className="text-xs text-fgMuted">حساب دریافت‌کننده: <strong className="text-fg">{order.username}</strong></p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="p-1.5 rounded-lg text-fgSubtle hover:text-fg hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
            {/* Pricing Summary */}
            <div className="p-3 rounded-lg bg-accentSoft border border-accent/30 text-accent flex items-center gap-3 animate-fade-in">
              <Sparkles size={20} />
              <div>
                <p className="text-xs font-semibold">مبلغ دقیق جهت انتقال ({order.method.name}):</p>
                <p className="font-mono text-xl font-bold" dir="ltr">
                  {order.pricing.cryptoAmount} {order.method.symbol}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="flex items-center justify-between text-xs text-fgSubtle mb-2">
                <span className="font-semibold">زمان باقی‌مانده:</span>
                <span className="font-mono text-accent" dir="ltr">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / (20 * 60)) * 100}%` }}
                />
              </div>
            </div>

            {/* Deposit Address Box */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-fgSubtle">
                <span className="font-semibold">آدرس کیف‌پول مقصد ({order.method.network}):</span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1 rounded text-fgSubtle hover:text-accent"
                  title="کپی آدرس"
                >
                  {copiedAddr ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-card border border-border">
                <span className="font-mono text-xs text-fg truncate flex-1" dir="ltr">
                  {order.depositAddress}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="p-1.5 rounded bg-muted text-fgSubtle hover:text-fg"
                  title="کپی آدرس"
                >
                  {copiedAddr ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Amount to Send */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-fgSubtle">
                <span className="font-semibold">مبلغ انتقال:</span>
                <button
                  type="button"
                  onClick={handleCopyAmount}
                  className="p-1 rounded text-fgSubtle hover:text-accent"
                  title="کپی مقدار"
                >
                  {copiedAmount ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-bold text-fg" dir="ltr">
                  {order.pricing.cryptoAmount} {order.method.symbol}
                </span>
              </div>
            </div>

            {/* Telegram Link */}
            <a
              href={`https://t.me/${order.username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted border border-border text-sm font-semibold text-fg hover:bg-border transition-colors"
            >
              <ArrowRight size={16} />
              <span>انتقال به تلگرام جهت واریز استارز</span>
              <ExternalLink size={14} />
            </a>

            {/* Payment Confirmation */}
            {currentStatus === 'pending' ? (
              <div className="space-y-3 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="هش تراکنش (TX Hash) - اختیاری"
                  value={txHashInput}
                  onChange={(e) => setTxHashInput(sanitizeInput(e.target.value, 128))}
                  className="input"
                />
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="btn-primary w-full"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>در حال تایید...</span>
                    </>
                  ) : (
                    <span>تأیید پرداخت و تحویل استارز</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-accentSoft border border-accent/30 text-accent flex items-center justify-center gap-2 animate-fade-in">
                <CheckCircle2 size={20} />
                <span className="font-semibold">تراکنش تایید و استارز تحویل داده شد</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30 space-y-2 text-xs text-fgSubtle">
            <p>سفارش با مهلت <strong>۲۰ دقیقه</strong> اعتبار صادر شده است.</p>
            <p>پس از انتقال، روی دکمه «تأیید پرداخت» بزنید تا استارز به حساب شما واریز شود.</p>
          </div>
        </div>
      </div>
    );
  }
