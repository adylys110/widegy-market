export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10MB
const MAX_FILE_SIZE  = 500 * 1024 * 1024  // 500MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    const isImage = file.type.startsWith('image/')
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE

    if (file.size > maxSize) {
      return NextResponse.json({
        error: `File terlalu besar. Maks ${isImage ? '10MB' : '500MB'}`,
      }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext      = (file.name.split('.').pop() ?? 'bin').toLowerCase()
    const filename = `${randomUUID()}.${ext}`
    const subDir   = isImage ? 'images' : 'files'
    const uploadDir = join(process.cwd(), 'public', 'uploads', subDir)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    return NextResponse.json({
      url:      `/uploads/${subDir}/${filename}`,
      filename,
      size:     file.size,
      type:     file.type,
    })
  } catch (err) {
    console.error('[UPLOAD]', err)
    return NextResponse.json({ error: 'Upload gagal' }, { status: 500 })
  }
}

