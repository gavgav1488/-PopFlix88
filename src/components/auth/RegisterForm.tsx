"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks/useAuth";
import { fetchWithRetry } from "@/lib/fetch/client";
import { type RegisterFormData, registerSchema } from "@/lib/validations/auth";

function translateRegisterError(message: string): string {
  if (message.includes("User already registered")) {
    return "Пользователь с таким email уже существует. Попробуйте войти.";
  }

  if (message.includes("Password should be at least")) {
    return "Пароль слишком короткий.";
  }

  if (message.includes("Unable to validate email address")) {
    return "Не удалось проверить email. Проверьте адрес и попробуйте ещё раз.";
  }

  if (message.includes("Signup is disabled")) {
    return "Регистрация временно недоступна.";
  }

  if (message.includes("already been registered")) {
    return "Пользователь с таким email уже существует. Попробуйте войти.";
  }

  return message;
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setFormError(null);
      const normalizedFullName = data.fullName.trim();
      const registerResponse = await fetchWithRetry("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: normalizedFullName === "" ? undefined : normalizedFullName,
        }),
      });
      const registerData = (await registerResponse.json()) as {
        error?: string;
      };

      if (!registerResponse.ok) {
        throw new Error(registerData.error || "Ошибка регистрации");
      }

      await signIn(data.email, data.password);
      router.push("/onboarding");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ошибка регистрации";
      setFormError(translateRegisterError(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Регистрация в PopFlix
        </CardTitle>
        <CardDescription className="text-center">
          Создайте аккаунт для персональных рекомендаций
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Полное имя (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ваше имя"
                      autoComplete="name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formError && (
              <p className="text-sm text-destructive text-center">
                {formError}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
