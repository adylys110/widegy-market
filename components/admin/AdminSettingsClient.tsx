'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Globe, DollarSign, Bell, Shield } from 'lucide-react'
import { toast } from 'sonner'

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }

export function AdminSettingsClient({ data }: { data: any }) {
  const [settings, setSettings] = useState<Record<string, string>>(data.settings)
  const [saving, setSaving] = useState(false)

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) toast.success('Pengaturan disimpan!')
      else toast.error('Gagal menyimpan pengaturan')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const settingGroups = [
    {
      label: 'Umum',
      icon: Globe,
      fields: [
        { key: 'site_name', label: 'Nama Platform', type: 'text', placeholder: 'Widegy' },
        { key: 'site_tagline', label: 'Tagline', type: 'text', placeholder: 'Digital Marketplace' },
        { key: 'site_email', label: 'Email Platform', type: 'email', placeholder: 'hello@widegy.com' },
        { key: 'maintenance_mode', label: 'Mode Maintenance', type: 'select', options: [{ v: 'false', l: 'Nonaktif' }, { v: 'true', l: 'Aktif' }] },
      ],
    },
    {
      label: 'Komisi & Keuangan',
      icon: DollarSign,
      fields: [
        { key: 'platform_commission', label: 'Komisi Platform (%)', type: 'number', placeholder: '10' },
        { key: 'default_affiliate_commission', label: 'Komisi Affiliator Default (%)', type: 'number', placeholder: '10' },
        { key: 'min_withdrawal', label: 'Minimum Penarikan (Rp)', type: 'number', placeholder: '50000' },
        { key: 'withdrawal_fee', label: 'Biaya Penarikan (Rp)', type: 'number', placeholder: '0' },
      ],
    },
    {
      label: 'Keamanan',
      icon: Shield,
      fields: [
        { key: 'require_email_verification', label: 'Verifikasi Email', type: 'select', options: [{ v: 'false', l: 'Tidak Wajib' }, { v: 'true', l: 'Wajib' }] },
        { key: 'allow_registration', label: 'Pendaftaran', type: 'select', options: [{ v: 'true', l: 'Dibuka' }, { v: 'false', l: 'Ditutup' }] },
        { key: 'auto_approve_products', label: 'Auto Approve Produk', type: 'select', options: [{ v: 'false', l: 'Manual Review' }, { v: 'true', l: 'Otomatis' }] },
      ],
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> Pengaturan Platform
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Konfigurasi global Widegy</p>
        </div>
        <button onClick={saveSettings} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </motion.div>

      {settingGroups.map(group => (
        <motion.div key={group.label} variants={itemVariants} className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <group.icon className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-foreground">{group.label}</h2>
          </div>
          <div className="p-5 space-y-4">
            {group.fields.map(field => (
              <div key={field.key} className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <label className="text-sm font-medium text-foreground">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={settings[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {field.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={settings[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="px-3 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
