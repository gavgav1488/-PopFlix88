import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Регистрация | PopFlix',
  description: 'Создайте аккаунт PopFlix для получения персональных рекомендаций фильмов',
}

export default function RegisterPage() {
  return <RegisterForm />
}