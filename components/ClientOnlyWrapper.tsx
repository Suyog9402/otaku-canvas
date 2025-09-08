'use client'

import { useClientOnly } from '@/lib/use-client-only'
import { ReactNode } from 'react'

interface ClientOnlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const isClient = useClientOnly()

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
