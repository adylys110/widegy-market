import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@widegy.com'
  const password = 'admin123'

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      email,
      name: 'Admin Widegy',
      password: hashed,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin created:', user.email)
  console.log('📧 Email   :', email)
  console.log('🔑 Password:', password)
}

main().catch(console.error).finally(() => prisma.$disconnect())
