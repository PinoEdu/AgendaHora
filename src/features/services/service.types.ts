export type ServiceActionState = {
  error?: string
}

export type ServiceFormValues = {
  id?: string
  name: string
  description: string
  durationMinutes: number
  price: string
  isActive: boolean
}
