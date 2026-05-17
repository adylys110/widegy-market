'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowDownToLine, Clock, CheckCircle2, XCircle,
  Building2, Loader2, Info
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { WithdrawStatus } from '@prisma/client'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<WithdrawStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: 'Pending',     color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
  APPROVED:   { label: 'Disetujui',  color: '#06B6D4', bg: '#ECFEFF', icon: CheckCircle2 },
  PROCESSING: { label: 'Diproses',   color: '#8B5CF6', bg: '#F5F3FF', icon: Loader2 },
  COMPLETED:  { label: 'Selesai',    color: '#10B981', bg: '#ECFDF5', icon: CheckCircle2 },
  REJECTED:   { label: 'Ditolak',    color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
}

const BANKS = [
  'BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB Niaga', 'Permata', 'Danamon',
  'Bukopin', 'BTN', 'Maybank', 'OCBC NISP', 'Panin', 'OVO', 'GoPay', 'Dana'
]

const MIN_WITHDRAW = 50_000

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function WithdrawalModal({ balance, bankName, bankAccountName, bankAccountNo, onClose, onSuccess }: {
  balance: number; bankName: string | null; bankAccountName: string | null; bankAccountNo: string | null;
  onClose: () => void; onSuccess: (w: any) => void
}) {
  const [amount, setAmount] = useState('')
  const [bank, setBank] = useState(bankName ?? '')
  const [accName, setAccName] = useState(bankAccountName ?? '')
  const [accNo, setAccNo] = useState(bankAccountNo ?? '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt < MIN_WITHDRAW) { toast.error(`Minimum penarikan ${formatCurrency(MIN_WITHDRAW)}`); return }
    if (amt > balance) { toast.error('Saldo tidak mencukupi'); return }
    if (!bank || !accName || !accNo) { toast.error('Lengkapi data rekening bank'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/affiliates/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, bankName: bank, bankAccountName: accName, bankAccountNo: accNo }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Gagal mengajukan penarikan')
      }
      const data = await res.json()
      toast.success('Pengajuan penarikan berhasil!')
      onSuccess(data.withdrawal)
      onClose()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="font-display font-extrabold text-foreground text-lg">Tarik Komisi</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Saldo tersedia: <span className="font-bold text-foreground">{formatCurrency(balance)}</span>
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">
              Jumlah Penarikan <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="flex gap-2 mt-2">
              {[100_000, 500_000, 1_000_000].map(v => (
                <button key={v} onClick={() => setAmount(Math.min(v, balance).toString())}
                  className="flex-1 text-xs font-semibold py-1 rounded-lg border border-border hover:border-primary hover:text-primary transition-all">
                  {formatCurrency(v)}
                </button>
              ))}
              <button onClick={() => setAmount(balance.toString())}
                className="flex-1 text-xs font-semibold py-1 rounded-lg border border-border hover:border-primary hover:text-primary transition-all">
                Semua
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">Min. {formatCurrency(MIN_WITHDRAW)}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground block mb-1.5">Bank <span className="text-destructive">*</span></label>
            <select value={bank} onChange={e => setBank(e.target.value)}
              className={cn("w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
                !bank && 'text-muted-foreground/60')}>
              <option value="" disabled>Pilih bank</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Nama Rekening <span className="text-destructive">*</span></label>
              <input value={accName} onChange={e => setAccName(e.target.value)}
                placeholder="NAMA SESUAI REKENING"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase placeholder:normal-case placeholder:text-muted-foreground/60" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-1.5">Nomor Rekening <span className="text-destructive">*</span></label>
              <input value={accNo} onChange={e => setAccNo(e.target.value)}
                placeholder="1234567890"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">Proses transfer 1-3 hari kerja. Hanya komisi dengan status "Selesai" yang bisa ditarik.</p>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
            Ajukan Penarikan
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function AffiliatorWithdrawalsClient({ data }: { data: any }) {
  const [showModal, setShowModal] = useState(false)
  const [balance, setBalance] = useState(data.balance)
  const [withdrawals, setWithdrawals] = useState(data.withdrawals)

  const handleSuccess = (w: any) => {
    setWithdrawals((prev: any[]) => [w, ...prev])
    setBalance((prev: number) => prev - w.amount)
  }

  const totalWithdrawn = withdrawals
    .filter((w: any) => w.status === 'COMPLETED')
    .reduce((s: number, w: any) => s + w.amount, 0)

  const pendingAmount = withdrawals
    .filter((w: any) => ['PENDING', 'APPROVED', 'PROCESSING'].includes(w.status))
    .reduce((s: number, w: any) => s + w.amount, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-4xl">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Penarikan Komisi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Tarik komisi affiliasi ke rekening bank kamu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={balance < MIN_WITHDRAW}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
          <ArrowDownToLine className="w-4 h-4" /> Tarik Komisi
        </button>
      </motion.div>

      {/* Balance cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-5 text-white">
          <Wallet className="w-7 h-7 mb-3 text-white/70" />
          <p className="text-sm font-semibold text-white/80">Saldo Tersedia</p>
          <p className="text-2xl font-display font-extrabold mt-1">{formatCurrency(balance)}</p>
          {balance < MIN_WITHDRAW && (
            <p className="text-[10px] text-white/60 mt-1">Min. {formatCurrency(MIN_WITHDRAW)} untuk tarik</p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <Clock className="w-7 h-7 mb-3 text-amber-500" />
          <p className="text-sm text-muted-foreground">Sedang Diproses</p>
          <p className="text-2xl font-display font-extrabold text-foreground mt-1">{formatCurrency(pendingAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border">
          <CheckCircle2 className="w-7 h-7 mb-3 text-green-500" />
          <p className="text-sm text-muted-foreground">Total Ditarik</p>
          <p className="text-2xl font-display font-extrabold text-foreground mt-1">{formatCurrency(totalWithdrawn)}</p>
        </div>
      </motion.div>

      {/* Bank info */}
      {(data.bankName || data.bankAccountNo) && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{data.bankName}</p>
              <p className="text-xs text-muted-foreground">{data.bankAccountName} · {data.bankAccountNo}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground">Riwayat Penarikan</h2>
        </div>
        <div className="divide-y divide-border">
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <ArrowDownToLine className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Belum ada penarikan</p>
              <p className="text-xs text-muted-foreground">Kumpulkan komisi dan tarik ke rekening kamu</p>
            </div>
          ) : withdrawals.map((w: any) => {
            const status = STATUS_CONFIG[w.status as WithdrawStatus]
            const StatusIcon = status.icon
            return (
              <div key={w.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: status.bg }}>
                  <StatusIcon className="w-5 h-5" style={{ color: status.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{w.bankName} · {w.bankAccountNo}</p>
                  <p className="text-xs text-muted-foreground">{w.bankAccountName} · {formatDate(w.createdAt)}</p>
                  {w.adminNote && <p className="text-xs text-destructive mt-0.5">{w.adminNote}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(w.amount)}</p>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: status.color, backgroundColor: status.bg }}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <WithdrawalModal
            balance={balance}
            bankName={data.bankName}
            bankAccountName={data.bankAccountName}
            bankAccountNo={data.bankAccountNo}
            onClose={() => setShowModal(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
