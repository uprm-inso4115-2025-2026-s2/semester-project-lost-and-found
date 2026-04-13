

import { createClient } from '@supabase/supabase-js';
import type { UserAttributes } from '@supabase/supabase-js';



interface ExtendedUserAttributes extends UserAttributes {
  token?: string;
}

// Initialize Supabase client using Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Sends a password reset email to the user.
 * @param email 
 * @returns 
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL || ''}/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Password reset email sent successfully.' };
  } catch (err) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * Updates the user's password using a secure token.
 * @param token - The reset token provided in the email.
 * @param newPassword - The new password to set for the user.
 * @returns A promise resolving to the result of the password update.
 */
export async function updatePassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      token,
      password: newPassword,
    } as ExtendedUserAttributes);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Password updated successfully.' };
  } catch (err) {
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * Validates a reset token to ensure it is not expired or reused.
 * @param token - The reset token to validate.
 * @returns A promise resolving to the validation result.
 */
export async function validateResetToken(token: string): Promise<{ valid: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data) {
      return { valid: false, message: 'Invalid or expired token.' };
    }

    return { valid: true, message: 'Token is valid.' };
  } catch (err) {
    return { valid: false, message: 'An unexpected error occurred.' };
  }
}

// Function to handle password reset
export async function handlePasswordReset(email: string): Promise<void> {
  try {
    // Validate email input
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address. Please provide a valid email.');
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL || ''}/reset-password`, 
    });

    if (error) {
      console.error('Error sending password reset email:', error.message);
      throw new Error('Failed to send password reset email. Please try again.');
    }

    console.log('Password reset email sent successfully.');
  } catch (err) {
    console.error('An unexpected error occurred:', err);
    throw err;
  }
}
