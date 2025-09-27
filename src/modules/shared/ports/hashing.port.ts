export const HASHING_SERVICE_TOKEN = Symbol("HashingService")

export interface HashingPort {
  hash(password: string): Promise<string>
  compare(password: string, hashed: string): Promise<boolean>
}
