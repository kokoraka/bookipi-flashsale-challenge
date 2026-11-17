
export enum ContainerSize {
  FULL = "full",
  XXLARGE = "2xl",
  XLARGE = "xl",
  LARGE = "lg",
  MEDIUM = "md",
  SMALL = "sm",
}

export type ContainerSizeProps = "full" | "2xl" | "xl" | "lg" | "md" | "sm"

export enum ContainerTheme {
  DEFAULT = ""
}

export type ContainerThemeProps = ""

const themes = new Map<string, Map<string, string>>()

const defaultTheme = new Map<string, string>()

defaultTheme.set(`size`, "w-full px-6 xl:px-0 mx-auto")
defaultTheme.set(`size-${ContainerSize.FULL}`, "")
defaultTheme.set(`size-${ContainerSize.XXLARGE}`, "max-w-[1800px]")
defaultTheme.set(`size-${ContainerSize.XLARGE}`, "max-w-[1600px]")
defaultTheme.set(`size-${ContainerSize.LARGE}`, "max-w-[1400px]")
defaultTheme.set(`size-${ContainerSize.MEDIUM}`, "max-w-[1200px]")
defaultTheme.set(`size-${ContainerSize.SMALL}`, "max-w-[1200px]")

themes.set("", defaultTheme)

export class ContainerStyle {
  private theme: string = ""
  private size: string = ""
  private appendedClassNames: string = ""

  public build(): string {
    let style = ""

    const theme = themes.get(this.theme)
    if (!theme) {
      return style
    }

    if (theme.has(`size`)) {
      style += theme.get(`size`)
    }

    if (theme.has(`size-${this.size}`)) {
      style += " " + theme.get(`size-${this.size}`)
    }

    if (this.appendedClassNames !== "") {
      style += " " + this.appendedClassNames
    }

    return style.trim()
  }

  public setTheme(theme: string): this {
    this.theme = theme
    return this
  }

  public setSize(size: string): this {
    this.size = size
    return this
  }

  public appendClassNames(classNames?: string): this {
    this.appendedClassNames = classNames || ""
    return this
  }

}
