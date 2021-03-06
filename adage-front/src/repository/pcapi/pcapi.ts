import { client } from "repository/pcapi/pcapiClient"
import { OfferType, Role, VenueFilterType } from "utils/types"

export const authenticate = async (): Promise<Role> => {
  return client
    .get("/adage-iframe/authenticate")
    .then(({ role }: { role: string }) => Role[role])
}

export const getOffer = async (
  offerId: number | string
): Promise<OfferType> => {
  return client.get(`/adage-iframe/offer/${offerId}`)
}

export const getVenueBySiret = async (
  siret: string
): Promise<VenueFilterType> => {
  return client.get(`/adage-iframe/venues/${siret}`)
}

export const preBookStock = async (stockId: number): Promise<number> => {
  return client.post("/adage-iframe/bookings", { stockId })
}
