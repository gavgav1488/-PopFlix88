import { Metadata } from 'next'
import { OnboardingForm } from '@/components/auth/OnboardingForm'

export const metadata: Metadata = {
  title: 'Настройка предпочтений | PopFlix',
  description: 'Настройте свои предпочтения для получения персональных рекомендаций фильмов',
}

export default function OnboardingPage() {
  return <OnboardingForm />
}