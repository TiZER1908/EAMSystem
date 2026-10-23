export interface PersonName {
  lastName: string
  firstName: string
  middleName: string | null
}

export function formatFIO(person: PersonName): string {
  if (!person) return ''

  const lastName = person.lastName || ''
  const firstName = person.firstName || ''
  const middleName = person.middleName || ''

  return [lastName, firstName, middleName].filter(Boolean).join(' ')
}

export function formatShortFIO(person: PersonName): string {
  if (!person) return ''

  const lastName = person.lastName || ''
  const firstName = person.firstName ? `${person.firstName.charAt(0)}.` : ''
  const middleName = person.middleName ? `${person.middleName.charAt(0)}.` : ''

  return [lastName, firstName, middleName].filter(Boolean).join(' ')
}
