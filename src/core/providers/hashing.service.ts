import { Injectable } from "@nestjs/common"
import { randomBytes, pbkdf2 as pbkdf2Callback, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

import type { HashingPort } from "@/modules/shared/ports/hashing.port"

const pbkdf2 = promisify(pbkdf2Callback)
const ALGORITHM_PREFIX = "pbkdf2"

@Injectable()
export class HashingService implements HashingPort {
  private readonly iterations = 310000
  private readonly keyLength = 64
  private readonly digest = "sha512"

  async hash(password: string): Promise<string> {
    if (!password || password.trim().length === 0) {
      throw new Error("Password cannot be empty")
    }

    const salt = randomBytes(16).toString("hex")
    const derivedKey = await pbkdf2(password, salt, this.iterations, this.keyLength, this.digest)
    return `${ALGORITHM_PREFIX}:${this.digest}:${this.iterations}:${salt}:${derivedKey.toString("hex")}`
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    if (!hashed) {
      return false
    }

    const parts = hashed.split(":")
    if (parts.length !== 5) {
      return false
    }

    const [prefix, digest, iterationsStr, salt, storedHash] = parts
    if (prefix !== ALGORITHM_PREFIX) {
      return false
    }

    const iterations = Number.parseInt(iterationsStr, 10)
    if (!Number.isFinite(iterations) || iterations <= 0) {
      return false
    }

    const storedBuffer = Buffer.from(storedHash, "hex")
    const derivedKey = await pbkdf2(password, salt, iterations, storedBuffer.length, digest)

    if (storedBuffer.length !== derivedKey.length) {
      return false
    }

    return timingSafeEqual(storedBuffer, derivedKey)
  }
}
