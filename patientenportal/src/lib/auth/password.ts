import bcrypt from 'bcryptjs'

export async function hashPasswort(passwort: string): Promise<string> {
  return bcrypt.hash(passwort, 12)
}

export async function pruefePasswort(passwort: string, hash: string): Promise<boolean> {
  return bcrypt.compare(passwort, hash)
}

export function validierePasswortStaerke(passwort: string): string | null {
  if (passwort.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein.'
  if (!/[A-Z]/.test(passwort)) return 'Passwort muss mindestens einen Großbuchstaben enthalten.'
  if (!/[0-9]/.test(passwort)) return 'Passwort muss mindestens eine Zahl enthalten.'
  return null
}
