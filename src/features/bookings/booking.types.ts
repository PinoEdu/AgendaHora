export type CreateBookingInput = {
  businessId: string
  customerId: string
  serviceId: string
  resourceId: string
  startsAt: Date
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

export type ValidateBookingAvailabilityInput = {
  businessId: string
  customerId: string
  serviceId: string
  resourceId: string
  startsAt: Date
}

export type ValidateBookingAvailabilityOutput = {
  startsAt: Date
  endsAt: Date
  serviceDurationMinutes: number
}

export type BookingAvailabilityErrorCode =
  | "BUSINESS_NOT_FOUND"
  | "BUSINESS_NOT_ACTIVE"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_NOT_ACTIVE"
  | "RESOURCE_NOT_FOUND"
  | "RESOURCE_NOT_ACTIVE"
  | "RESOURCE_SERVICE_MISMATCH"
  | "BOOKING_IN_PAST"
  | "OUTSIDE_AVAILABILITY"
  | "BLOCKED_TIME_CONFLICT"
  | "BOOKING_CONFLICT"

export type AvailabilityWindow = {
  startMinute: number
  endMinute: number
}
