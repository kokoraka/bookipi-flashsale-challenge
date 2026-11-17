import { describe, expect, it, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"

import { Meta, MetaProvider } from "./Meta"

const helmetSpy = vi.fn()

vi.mock("react-helmet-async", () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Helmet: (props: unknown) => {
    helmetSpy(props)
    return null
  },
}))

describe("MetaProvider", () => {
  it("renders its children", () => {
    const { getByText } = render(
      <MetaProvider meta={{}}>
        <div>Hello</div>
      </MetaProvider>,
    )

    expect(getByText("Hello")).toBeInTheDocument()
  })
})

describe("Meta", () => {
  beforeEach(() => {
    helmetSpy.mockClear()
  })

  it("uses fallback values", () => {
    render(
      <MetaProvider
        meta={{
          titleFallback: "Fallback",
          descriptionFallback: "Description",
          keywordsFallback: "react,typescript",
          typeFallback: "website",
          urlFallback: "https://example.com",
          imageFallback: "image.png",
        }}
      >
        <Meta />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.defaultTitle).toBe("Fallback")
    expect(props.titleTemplate).toBeUndefined()

    expect(props.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "title",
          content: "Fallback",
        }),
        expect.objectContaining({
          name: "description",
          content: "Description",
        }),
        expect.objectContaining({
          name: "keywords",
          content: "react,typescript",
        }),
        expect.objectContaining({
          property: "og:type",
          content: "website",
        }),
        expect.objectContaining({
          property: "og:url",
          content: "https://example.com",
        }),
        expect.objectContaining({
          property: "og:image",
          content: "image.png",
        }),
      ]),
    )
  })

  it("uses provided values instead of fallbacks", () => {
    render(
      <MetaProvider
        meta={{
          titleFallback: "Fallback",
          descriptionFallback: "Fallback Description",
        }}
      >
        <Meta
          children={{
            title: "Home",
            description: "Real Description",
          }}
        />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.title).toBe("Home")

    expect(props.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "description",
          content: "Real Description",
        }),
      ]),
    )
  })

  it("applies the title template", () => {
    render(
      <MetaProvider
        meta={{
          titleTemplate: "%s | My Site",
        }}
      >
        <Meta
          children={{
            title: "About",
          }}
        />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.titleTemplate).toBe("%s | My Site")

    expect(props.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "title",
          content: "About | My Site",
        }),
      ]),
    )
  })

  it("disables the title template", () => {
    render(
      <MetaProvider
        meta={{
          titleTemplate: "%s | My Site",
        }}
      >
        <Meta
          disableTemplate
          children={{
            title: "About",
          }}
        />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.titleTemplate).toBeUndefined()

    expect(props.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "title",
          content: "About",
        }),
      ]),
    )
  })

  it("renders twitter schema", () => {
    render(
      <MetaProvider meta={{}}>
        <Meta
          children={{
            twitterSchema: {
              card: "summary_large_image",
              creator: "@john",
            },
          }}
        />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: "twitter:card",
          content: "summary_large_image",
        }),
        expect.objectContaining({
          property: "twitter:creator",
          content: "@john",
        }),
      ]),
    )
  })

  it("renders markup schema", () => {
    render(
      <MetaProvider meta={{}}>
        <Meta
          children={{
            markupSchema: {
              "@context": "https://schema.org",
              "@type": "WebSite",
            },
          }}
        />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.script).toEqual([
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
        }),
      },
    ])
  })

  it("does not render metas or scripts when no values are provided", () => {
    render(
      <MetaProvider meta={{}}>
        <Meta />
      </MetaProvider>,
    )

    const props = helmetSpy.mock.calls[0][0]

    expect(props.meta).toEqual([])
    expect(props.script).toEqual([])
  })
})