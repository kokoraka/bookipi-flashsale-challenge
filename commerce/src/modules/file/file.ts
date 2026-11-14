
type ProvidedObject = {
  provider: string
}

export type FileObject = ProvidedObject & {
  file: File
}

export type File = {
  id?: string
  public_url?: string
}
