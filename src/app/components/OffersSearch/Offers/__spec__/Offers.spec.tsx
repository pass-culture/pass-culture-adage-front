import { render, screen } from "@testing-library/react"
import React from "react"

import * as pcapi from "repository/pcapi/pcapi"
import { OfferType, ResultType, Role } from "utils/types"

import { Offers } from "../Offers"

jest.mock("repository/pcapi/pcapi", () => ({
  getOffer: jest.fn(),
}))

const mockedPcapi = pcapi as jest.Mocked<typeof pcapi>

const appSearchFakeResults: ResultType[] = [
  {
    venue_name: {
      raw: "Le Petit Rintintin 25",
    },
    thumb_url: {
      raw: "/storage/thumbs/mediations/AFXA",
    },
    name: {
      raw: "Une chouette à la mer",
    },
    venue_public_name: {
      raw: "Le Petit Rintintin 25",
    },
    dates: {
      raw: ["2021-09-29T13:54:30+00:00"],
    },
    id: {
      raw: "479",
    },
  },
  {
    venue_name: {
      raw: "Le Petit Coco",
    },
    thumb_url: {
      raw: "",
    },
    name: {
      raw: "Coco channel",
    },
    venue_public_name: {
      raw: "Le Petit Coco",
    },
    dates: {
      raw: ["2021-09-29T13:54:30+00:00"],
    },
    id: {
      raw: "480",
    },
  },
]

describe("offers", () => {
  let offerInParis: OfferType
  let offerInCayenne: OfferType

  beforeEach(() => {
    offerInParis = {
      id: 479,
      name: "Une chouette à la mer",
      description: "Une offre vraiment chouette",
      category: {
        label: "Cinéma",
      },
      stocks: [
        {
          id: 825,
          beginningDatetime: new Date("2022-09-16T00:00:00Z"),
          isBookable: true,
          price: 140000,
        },
      ],
      venue: {
        address: "1 boulevard Poissonnière",
        city: "Paris",
        name: "Le Petit Rintintin 33",
        postalCode: "75000",
        publicName: "Le Petit Rintintin 33",
        coordinates: {
          latitude: 48.87004,
          longitude: 2.3785,
        },
      },
      isSoldOut: false,
      isExpired: false,
    }

    offerInCayenne = {
      id: 480,
      description: "Une offre vraiment coco",
      name: "Coco channel",
      category: {
        label: "Cinéma",
      },
      stocks: [
        {
          id: 825,
          beginningDatetime: new Date("2021-09-25T22:00:00Z"),
          isBookable: true,
          price: 80000,
        },
      ],
      venue: {
        address: "1 boulevard Poissonnière",
        city: "Paris",
        name: "Le Petit Rintintin 33",
        postalCode: "97300",
        publicName: "Le Petit Rintintin 33",
        coordinates: {
          latitude: 48.87004,
          longitude: 2.3785,
        },
      },
      isSoldOut: false,
      isExpired: false,
    }
  })

  it("should display two offers with their respective stocks when two bookable offers", async () => {
    // Given
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInParis)
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInCayenne)

    // When
    render(<Offers
      results={appSearchFakeResults}
      userRole={Role.redactor}
           />)
    // Then
    const listItemsInOffer = await screen.findAllByRole("listitem")
    expect(listItemsInOffer).toHaveLength(4)
    expect(screen.getByText(offerInParis.name)).toBeInTheDocument()
    expect(screen.getByText(offerInCayenne.name)).toBeInTheDocument()
  })

  it("should display only non sold-out offers", async () => {
    // Given
    offerInParis.isSoldOut = true
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInParis)
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInCayenne)

    // When
    render(<Offers
      results={appSearchFakeResults}
      userRole={Role.redactor}
           />)

    // Then
    const listItemsInOffer = await screen.findAllByRole("listitem")
    expect(listItemsInOffer).toHaveLength(2)
    expect(screen.getByText(offerInCayenne.name)).toBeInTheDocument()
  })

  it("should not display expired offer", async () => {
    // Given
    offerInParis.isExpired = true
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInParis)
    mockedPcapi.getOffer.mockResolvedValueOnce(offerInCayenne)

    // When
    render(<Offers
      results={appSearchFakeResults}
      userRole={Role.redactor}
           />)

    // Then
    const listItemsInOffer = await screen.findAllByRole("listitem")
    expect(listItemsInOffer).toHaveLength(2)
    expect(screen.getByText(offerInCayenne.name)).toBeInTheDocument()
  })

  describe("should display no results page", () => {
    it("when there are no results", async () => {
      // When
      render(<Offers
        results={[]}
        userRole={Role.redactor}
             />)

      // Then
      const errorMessage = await screen.findByText(
        "Aucun résultat trouvé pour cette recherche."
      )
      expect(errorMessage).toBeInTheDocument()
      const listItemsInOffer = screen.queryAllByRole("listitem")
      expect(listItemsInOffer).toHaveLength(0)
    })

    it("when all offers are not bookable", async () => {
      // Given
      offerInParis.isExpired = true
      offerInCayenne.isSoldOut = true
      mockedPcapi.getOffer.mockResolvedValueOnce(offerInParis)
      mockedPcapi.getOffer.mockResolvedValueOnce(offerInCayenne)

      // When
      render(
        <Offers
          results={appSearchFakeResults}
          userRole={Role.redactor}
        />
      )

      // Then
      const errorMessage = await screen.findByText(
        "Aucun résultat trouvé pour cette recherche."
      )
      expect(errorMessage).toBeInTheDocument()
      const listItemsInOffer = screen.queryAllByRole("listitem")
      expect(listItemsInOffer).toHaveLength(0)
    })

    it("when offers are not found", async () => {
      // Given
      mockedPcapi.getOffer.mockRejectedValue("Offre inconnue")
      mockedPcapi.getOffer.mockRejectedValue("Offre inconnue")

      // When
      render(
        <Offers
          results={appSearchFakeResults}
          userRole={Role.redactor}
        />
      )

      // Then
      const errorMessage = await screen.findByText(
        "Aucun résultat trouvé pour cette recherche."
      )
      expect(errorMessage).toBeInTheDocument()
      const listItemsInOffer = screen.queryAllByRole("listitem")
      expect(listItemsInOffer).toHaveLength(0)
    })
  })
})
