import fs from 'fs'
import path from 'path'

const UPLOADS_DIR = process.env.UPLOADS_PATH ?? path.join(process.cwd(), 'data', 'uploads')

export function sicherstellenUploadVerzeichnis(patientId: string): string {
  const verzeichnis = path.join(UPLOADS_DIR, patientId)
  if (!fs.existsSync(verzeichnis)) {
    fs.mkdirSync(verzeichnis, { recursive: true })
  }
  return verzeichnis
}

export function dateipfadFuerUpload(patientId: string, dateiname: string): string {
  const timestamp = Date.now()
  const sichererName = dateiname.replace(/[^a-zA-Z0-9._-]/g, '_')
  return path.join(patientId, `${timestamp}-${sichererName}`)
}

export function absoluterPfad(relativerPfad: string): string {
  return path.join(UPLOADS_DIR, relativerPfad)
}

export function loescheDatei(relativerPfad: string): void {
  const absPath = absoluterPfad(relativerPfad)
  if (fs.existsSync(absPath)) {
    fs.unlinkSync(absPath)
  }
}

export async function speichereDatei(
  puffer: Buffer,
  relativerPfad: string
): Promise<void> {
  const absPath = absoluterPfad(relativerPfad)
  const verzeichnis = path.dirname(absPath)

  if (!fs.existsSync(verzeichnis)) {
    fs.mkdirSync(verzeichnis, { recursive: true })
  }

  fs.writeFileSync(absPath, puffer)
}

export function leseDatei(relativerPfad: string): Buffer {
  return fs.readFileSync(absoluterPfad(relativerPfad))
}

export function dateiExistiert(relativerPfad: string): boolean {
  return fs.existsSync(absoluterPfad(relativerPfad))
}
