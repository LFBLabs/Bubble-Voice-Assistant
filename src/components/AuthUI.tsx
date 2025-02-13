import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/utils/authErrors';
import AuthHeader from './auth/AuthHeader';
import AuthForm from './auth/AuthForm';
const AuthUI = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/', {
          replace: true
        });
      }
      if (event === 'USER_UPDATED') {
        const {
          error
        } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
      if (event === 'SIGNED_OUT') {
        setErrorMessage('');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return <div className="container flex min-h-screen items-center justify-center bg-[#F5F6F7] rounded-3xl">
      <div className="w-full max-w-md">
        <AuthHeader />
        <AuthForm errorMessage={errorMessage} className="bg-gray-50" />
      </div>
    </div>;
};
export default AuthUI;