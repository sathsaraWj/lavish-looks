export interface District {
  name: string
  fee: number
}

/**
 * Flat delivery fee per district, grouped loosely by distance from the
 * Meegoda salon: nearby Western Province districts, then major regional
 * cities, then the rest of the island.
 */
export const districts: District[] = [
  { name: 'Colombo', fee: 300 },
  { name: 'Gampaha', fee: 300 },
  { name: 'Kalutara', fee: 300 },
  { name: 'Kandy', fee: 550 },
  { name: 'Galle', fee: 550 },
  { name: 'Matara', fee: 550 },
  { name: 'Kurunegala', fee: 550 },
  { name: 'Kegalle', fee: 550 },
  { name: 'Ratnapura', fee: 550 },
  { name: 'Puttalam', fee: 550 },
  { name: 'Hambantota', fee: 550 },
  { name: 'Ampara', fee: 950 },
  { name: 'Anuradhapura', fee: 950 },
  { name: 'Badulla', fee: 950 },
  { name: 'Batticaloa', fee: 950 },
  { name: 'Jaffna', fee: 950 },
  { name: 'Kilinochchi', fee: 950 },
  { name: 'Mannar', fee: 950 },
  { name: 'Matale', fee: 950 },
  { name: 'Monaragala', fee: 950 },
  { name: 'Mullaitivu', fee: 950 },
  { name: 'Nuwara Eliya', fee: 950 },
  { name: 'Polonnaruwa', fee: 950 },
  { name: 'Trincomalee', fee: 950 },
  { name: 'Vavuniya', fee: 950 },
]

const DEFAULT_FEE = 950

export function getDeliveryFee(districtName: string): number {
  return districts.find((d) => d.name === districtName)?.fee ?? DEFAULT_FEE
}
