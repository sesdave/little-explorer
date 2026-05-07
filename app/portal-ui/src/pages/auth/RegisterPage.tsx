// src/pages/auth/RegisterPage.tsx

import React from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { Zap } from 'lucide-react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  registerSchema,
  RegisterFormValues,
} from '@/schemas/register.schema';

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { PasswordStrength } from '@/components/auth/PasswordStrength';

import { useAuthStore } from '@/store/auth.store';

import { useNotificationStore } from '@/store/notification.store';

import api from '@/services/api';

export const RegisterPage = () => {
  const navigate = useNavigate();

  const { setAuth } = useAuthStore();

  const showNotification =
    useNotificationStore(
      (state) => state.show,
    );

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(
      registerSchema,
    ),

    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      whatsappNumber: '',
      phoneNumber: '',
      church: '',
      address: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (
    values: RegisterFormValues,
  ) => {
    try {
      const { data } = await api.post(
        '/v1/auth/register',
        {
          ...values,
          role: 'PARENT',
        },
      );

      setAuth(
        data.user,
        data.access_token,
      );

      showNotification(
        'Adventure started! Welcome.',
        'success',
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Registration failed';

      showNotification(
        message,
        'error',
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 lg:p-10">

      <div className="w-full max-w-6xl grid lg:grid-cols-[0.9fr_1.1fr] bg-white rounded-[2.5rem] border-4 border-slate-900 overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">

        {/* LEFT */}
        <div className="bg-emerald-500 text-white p-10 lg:p-14 border-b-4 lg:border-b-0 lg:border-r-4 border-slate-900 flex flex-col justify-center">

          <div className="w-fit bg-white text-emerald-500 p-5 rounded-[2rem] border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] mb-8">
            <Zap
              size={48}
              strokeWidth={3}
            />
          </div>

          <h1 className="text-5xl font-black italic leading-none tracking-tight">
            Begin the
            <br />
            Journey
          </h1>

          <p className="mt-6 text-emerald-950 font-bold max-w-sm leading-relaxed">
            Create your family account to
            manage registrations, classes,
            payments, and dismissal
            information.
          </p>

          <div className="mt-10 space-y-4">
            {[
              'Class Enrollment',
              'Secure Payments',
              'Dismissal Tracking',
              'Parent Dashboard',
            ].map((item) => (
              <div
                key={item}
                className="bg-emerald-400/40 border border-emerald-300 rounded-2xl px-4 py-3 font-black uppercase text-xs tracking-wider"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-8 lg:p-14">

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900">
              Create Account
            </h2>

            <p className="text-slate-500 font-bold mt-2">
              Parent/Guardian registration
            </p>
          </div>

          <form
            onSubmit={handleSubmit(
              onSubmit,
            )}
            className="space-y-8"
          >

            {/* ACCOUNT */}
            <section className="space-y-5">

              <div>
                <Input
                  label="Full Name"
                  {...register('name')}
                />

                {errors.name && (
                  <p className="text-xs font-bold text-rose-500 mt-1">
                    {
                      errors.name.message
                    }
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  {...register('email')}
                />

                {errors.email && (
                  <p className="text-xs font-bold text-rose-500 mt-1">
                    {
                      errors.email
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  {...register('password')}
                />

                {/* 👇 ONLY show when user types */}
                {password?.length > 0 && (
                  <div className="mt-2 transition-all duration-300">
                    <PasswordStrength password={password} />
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs font-bold text-rose-500 mt-2">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  {...register('confirmPassword')}
                />

                {errors.confirmPassword && (
                  <p className="text-xs font-bold text-rose-500 mt-2">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </section>

            {/* OPTIONAL INFO */}
            <section className="border-t-4 border-slate-100 pt-8">

              <div className="mb-5">
                <h3 className="font-black uppercase text-sm tracking-widest">
                  Additional Information
                </h3>

                <p className="text-xs text-slate-400 font-bold mt-1">
                  Optional but recommended
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">

                <Input
                  label="WhatsApp Number"
                  {...register(
                    'whatsappNumber',
                  )}
                />

                <Input
                  label="Regular Call Number"
                  {...register(
                    'phoneNumber',
                  )}
                />

                <Input
                  label="Affiliated Church"
                  {...register(
                    'church',
                  )}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Home Address"
                    {...register(
                      'address',
                    )}
                  />
                </div>
              </div>
            </section>

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white"
            >
              Create Parent Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
            Already registered?{' '}

            <Link
              to="/login"
              className="text-sky-500 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};