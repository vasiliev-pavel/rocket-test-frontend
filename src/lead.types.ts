export interface Lead {
  key: string
  name: string
  price: string
  status: {
    id: string
    name: string
    color: string
  }
  responsible: string
  created_at: string
  contacts: Contact[]
}

export interface Contact {
  id: string
  name: string
  phone?: string
  email?: string
}
