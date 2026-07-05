export type BusinessActionState = {
  error?: string
}

export type BusinessFormCategory = {
  id: string
  name: string
}

export type BusinessFormValues = {
  id?: string
  name: string
  categoryId: string
  description: string
  phone: string
  email: string
  address: string
  city: string
  country: string
  timezone: string
  status: string
}
