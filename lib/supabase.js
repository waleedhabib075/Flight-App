import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Directly use the hardcoded values
const supabaseUrl = "https://eihupmlwneaxnlvchais.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpaHVwbWx3bmVheG5sdmNoYWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjA5MzAsImV4cCI6MjA2NzE5NjkzMH0.yiIt7uv_6Cdgykd5TpM7TR_JMSQp6kcjyhnJK0nYpps";

// Error messages map
const ERROR_MESSAGES = {
  'invalid_credentials': 'Invalid email or password',
  'email_not_confirmed': 'Please confirm your email before signing in',
  'user_already_registered': 'An account with this email already exists',
  'weak_password': 'Password should be at least 6 characters',
  'invalid_email': 'Please enter a valid email address',
  'network_error': 'Network error. Please check your connection',
  'rate_limit_exceeded': 'Too many attempts. Please try again later',
  'default': 'An unexpected error occurred. Please try again.'
};

// Helper function to get user-friendly error message
const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES['default'];
  
  // Check for network errors
  if (error.message?.includes('Network request failed')) {
    return ERROR_MESSAGES['network_error'];
  }
  
  // Check for specific error codes
  const errorCode = error.status || error.code;
  if (errorCode) {
    const code = typeof errorCode === 'number' 
      ? String(errorCode) 
      : errorCode.toLowerCase();
      
    if (code.includes('invalid_credentials') || code === '400') {
      return ERROR_MESSAGES['invalid_credentials'];
    }
    if (code.includes('email_not_confirmed') || code === '401') {
      return ERROR_MESSAGES['email_not_confirmed'];
    }
    if (code.includes('user_already_exists') || code === '422') {
      return ERROR_MESSAGES['user_already_registered'];
    }
    if (code.includes('weak_password')) {
      return ERROR_MESSAGES['weak_password'];
    }
    if (code.includes('rate_limit_exceeded') || code === '429') {
      return ERROR_MESSAGES['rate_limit_exceeded'];
    }
  }
  
  // Check for common error messages
  const errorMessage = error.message?.toLowerCase() || '';
  if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
    return ERROR_MESSAGES['invalid_email'];
  }
  
  // Default to the error message or a generic one
  return error.message || ERROR_MESSAGES['default'];
};

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for authentication
export const signUp = async (email, password, name) => {
  // Input validation
  if (!email || !password || !name) {
    return {
      data: null,
      error: { message: 'Please fill in all fields' }
    };
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return {
      data: null,
      error: { message: ERROR_MESSAGES['invalid_email'] }
    };
  }

  if (password.length < 6) {
    return {
      data: null,
      error: { message: ERROR_MESSAGES['weak_password'] }
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: 'flightapp://welcome',
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return {
        data: null,
        error: { message: getErrorMessage(error) }
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected sign up error:', error);
    return {
      data: null,
      error: { message: getErrorMessage(error) }
    };
  }
};

export const signIn = async (email, password) => {
  // Input validation
  if (!email || !password) {
    return {
      data: null,
      error: { message: 'Please enter both email and password' }
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      return {
        data: null,
        error: { message: getErrorMessage(error) }
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected sign in error:', error);
    return {
      data: null,
      error: { message: getErrorMessage(error) }
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      return { error: { message: getErrorMessage(error) } };
    }
    return { error: null };
  } catch (error) {
    console.error('Unexpected sign out error:', error);
    return { error: { message: getErrorMessage(error) } };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      // Return a more user-friendly message for common scenarios
      if (error.message?.includes('JWT expired') || error.message?.includes('Invalid token')) {
        return { 
          user: null, 
          error: { 
            message: 'Your session has expired. Please sign in again.' 
          } 
        };
      }
      
      if (error.message?.includes('network')) {
        return { 
          user: null, 
          error: { 
            message: 'Unable to connect to the server. Please check your internet connection and try again.' 
          } 
        };
      }
      
      // Default error message
      return { 
        user: null, 
        error: { 
          message: 'We encountered an issue loading your profile. Please try again shortly.' 
        } 
      };
    }

    // If no user is found, return a friendly message
    if (!user) {
      return { 
        user: null, 
        error: { 
          message: 'No user is currently signed in.' 
        } 
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return { 
      user: null, 
      error: { 
        message: 'We encountered an unexpected error. Please try again or restart the app if the issue persists.' 
      } 
    };
  }
};

export const resetPassword = async (email) => {
  if (!email) {
    return {
      error: { message: 'Please enter your email address' }
    };
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return {
      error: { message: ERROR_MESSAGES['invalid_email'] }
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'flightapp://reset-password',
    });

    if (error) {
      console.error('Password reset error:', error);
      return { error: { message: getErrorMessage(error) } };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected password reset error:', error);
    return { error: { message: getErrorMessage(error) } };
  }
};
