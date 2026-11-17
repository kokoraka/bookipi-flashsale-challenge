
type ValidationError = {
  code: string
  message: string
  params?: { [key: string]: string[] }
}