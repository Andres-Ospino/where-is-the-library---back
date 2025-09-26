import { type ExceptionFilter, Catch, type ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common"
import type { Response } from "express"
import { DomainError } from "@/modules/shared/errors/domain.error"
import { NotFoundError } from "@/modules/shared/errors/not-found.error"
import { ValidationError } from "@/modules/shared/errors/validation.error"
import { ConflictError } from "@/modules/shared/errors/conflict.error"

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = "Internal server error"

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.message
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND
      message = exception.message
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST
      message = exception.message
    } else if (exception instanceof ConflictError) {
      status = HttpStatus.CONFLICT
      message = exception.message
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST
      message = exception.message
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    })
  }
}
