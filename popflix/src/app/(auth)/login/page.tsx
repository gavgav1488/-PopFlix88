import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Вход | PopFlix',
  description: 'Войдите в свой аккаунт PopFlix для получения персональных рекомендаций фильмов',
}

export default function LoginPage() {
  return <LoginForm />
}