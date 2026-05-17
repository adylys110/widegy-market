'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(
  () => import('@/components/landing/Navbar').then(m => ({ default: m.Navbar })),
  { ssr: false }
)

const Hero = dynamic(
  () => import('@/components/landing/Hero').then(m => ({ default: m.Hero })),
  { ssr: false }
)

import { Features } from '@/components/landing/Features'
import { Categories } from '@/components/landing/Categories'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Testimonials } from '@/components/landing/Testimonials'
import { Pricing } from '@/components/landing/Pricing'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f8f5f0]">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
