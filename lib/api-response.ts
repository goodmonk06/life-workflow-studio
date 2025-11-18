import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

export function errorResponse(
  message: string,
  status = 500,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  )
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues || []
    return errorResponse(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      issues.map((e: any) => ({
        path: e.path ? e.path.join('.') : 'unknown',
        message: e.message,
      }))
    )
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any }
    
    if (prismaError.code === 'P2002') {
      return errorResponse('A record with this value already exists', 409, 'DUPLICATE_ERROR')
    }
    
    if (prismaError.code === 'P2025') {
      return errorResponse('Record not found', 404, 'NOT_FOUND')
    }
  }

  // Standard errors
  if (error instanceof Error) {
    return errorResponse(error.message, 500, 'INTERNAL_ERROR')
  }

  // Unknown errors
  return errorResponse('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
}
