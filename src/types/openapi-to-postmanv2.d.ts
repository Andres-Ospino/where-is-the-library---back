declare module "openapi-to-postmanv2" {
  interface ConverterInput {
    type: string
    data: unknown
  }

  interface ConverterOptions {
    folderStrategy?: string
    [key: string]: unknown
  }

  interface ConverterOutput {
    type: string
    data: unknown
  }

  interface ConversionResult {
    result: boolean
    reason?: string
    output?: ConverterOutput[]
  }

  type ConverterCallback = (
    error: Error | null,
    conversion?: ConversionResult,
  ) => void

  export function convert(
    input: ConverterInput,
    options: ConverterOptions,
    callback: ConverterCallback,
  ): void
}
