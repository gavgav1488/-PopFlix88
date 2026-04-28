import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            🍿 PopFlix
          </h1>
          <p className="text-muted-foreground">
            Персональные рекомендации фильмов
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}