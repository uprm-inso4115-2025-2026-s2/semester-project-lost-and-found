import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { supabase } from '../supabaseClient.ts';

// ── Types ────────────────────────────────────────────────────────────────────

type Status = 'saving' | 'success' | 'error' | null;

interface OriginalData {
  username: string;
  phone: string;
}

interface ProfileErrors {
  username?: string | null;
  phone?: string | null;
}

interface UseProfileReturn {
  username: string;
  phone: string;
  avatarUrl: string;          
  avatarUploading: boolean;
  uploadedAt: Date | null;
  errors: ProfileErrors;
  status: Status;
  statusMsg: string;
  isDirty: boolean;
  handleUsernameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>; 
  handleSave: (e: FormEvent) => Promise<void>;
  handleCancel: () => void;
}

// ── Validators ───────────────────────────────────────────────────────────────

function validateUsername(value: string): string | null {
  if (!value || value.trim() === '') return 'Username is required.';
  if (value.length < 3) return 'Username must be at least 3 characters.';
  if (value.length > 32) return 'Username must be 32 characters or fewer.';
  if (!/^[a-zA-Z0-9_]+$/.test(value))
    return 'Username can only contain letters, numbers, and underscores.';
  return null;
}

function validatePhone(value: string): string | null {
  if (!value || value.trim() === '') return null;
  if (!/^[+\d\s\-().]{7,20}$/.test(value))
    return 'Enter a valid phone number.';
  return null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLogin(): UseProfileReturn {
  console.log('useLogin called'); 
  const [username, setUsername]           = useState<string>('');
  const [phone, setPhone]                 = useState<string>('');
  const [originalData, setOriginalData]   = useState<OriginalData>({ username: '', phone: '' });
  const [errors, setErrors]               = useState<ProfileErrors>({});
  const [status, setStatus]               = useState<Status>(null);
  const [statusMsg, setStatusMsg]         = useState<string>('');
  const [avatarUrl, setAvatarUrl]         = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState<boolean>(false);
  const [uploadedAt, setUploadedAt] = useState<Date | null>(null);

  useEffect(() => {
    console.log('useEffect ran');
    async function fetchProfile(): Promise<void> {
      console.log('fetchProfile called');

      const { data: { user } } = await supabase.auth.getUser();
    
      if (!user) {
        setStatus('error');
        setStatusMsg('You must be logged in.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/UserAccounts?select=Username,Phonenumber,avatar_url&User_ID=eq.${user.id}&limit=1`,
        {
            headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            }
        }
      );



      const data = await response.json();
      console.log('data:', data);

      if (data && data[0]) {
        setUsername(data[0].Username ?? '');
        setPhone(data[0].Phonenumber ?? '');
        setAvatarUrl(data[0].avatar_url ?? '');
        setOriginalData({ username: data[0].Username ?? '', phone: data[0].Phonenumber ?? '' });
      }
    }

    fetchProfile();
  }, []);

  const isDirty: boolean =
    username !== originalData.username ||
    phone !== (originalData.phone ?? '');

  function handleUsernameChange(e: ChangeEvent<HTMLInputElement>): void {
    const val = e.target.value;
    setUsername(val);
    setErrors(prev => ({ ...prev, username: validateUsername(val) }));
  }

  function handlePhoneChange(e: ChangeEvent<HTMLInputElement>): void {
    const val = e.target.value;
    setPhone(val);
    setErrors(prev => ({ ...prev, phone: validatePhone(val) }));
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setStatusMsg('Please upload an image file.');
      return;
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setStatus('error');
      setStatusMsg('Image must be under 2MB.');
      return;
    }

    setAvatarUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const userId = user.id;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload to Supabase Storage bucket called 'avatars'
    const uploadResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/avatars/${filePath}`,
      {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': file.type,
          'x-upsert': 'true', // overwrite if exists
        },
        body: file,
      }
    );

    if (!uploadResponse.ok) {
      const err = await uploadResponse.json();
      console.error('Upload error:', err);
      setStatus('error');
      setStatusMsg('Failed to upload image.');
      setAvatarUploading(false);
      return;
    }

    // Build the public URL
    const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;

    // Save the URL to the profiles table
    const patchResponse = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/UserAccounts?User_ID=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ avatar_url: publicUrl }),
      }
    );

    if (!patchResponse.ok) {
      setStatus('error');
      setStatusMsg('Uploaded image but failed to save URL.');
      setAvatarUploading(false);
      return;
    }

    setAvatarUrl(publicUrl);
    setUploadedAt(new Date());
    setStatus('success');
    setStatusMsg('Profile picture updated!');
    setTimeout(() => setStatus(null), 3000);
    setAvatarUploading(false);
  }

  async function handleSave(e: FormEvent): Promise<void> {
    e.preventDefault();

    const usernameErr = validateUsername(username);
    const phoneErr    = validatePhone(phone);
    if (usernameErr || phoneErr) {
      setErrors({ username: usernameErr, phone: phoneErr });
      return;
    }

    if (!isDirty) {
      setStatus('success');
      setStatusMsg('No changes to save.');
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    setStatus('saving');

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setStatus('error');
      setStatusMsg('You must be logged in.');
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/UserAccounts?User_ID=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          Username: username.trim(),
          Phonenumber: phone.trim() || null,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error('Save error:', err);
      if (err.code === '23505') {
        setErrors(prev => ({ ...prev, username: 'That username is already taken.' }));
        setStatus('error');
        setStatusMsg('Please choose a different username.');
      } else {
        setStatus('error');
        setStatusMsg('Something went wrong. Please try again.');
      }
      return;
    }

    setOriginalData({ username: username.trim(), phone: phone.trim() });
    setStatus('success');
    setStatusMsg('Profile updated successfully!');
    setTimeout(() => setStatus(null), 3000);
  }

  function handleCancel(): void {
    setUsername(originalData.username ?? '');
    setPhone(originalData.phone ?? '');
    setErrors({});
    setStatus(null);
  }

  return {
    username,
    phone,
    avatarUrl,
    avatarUploading,  
    uploadedAt,
    errors,
    status,
    statusMsg,
    isDirty,
    handleUsernameChange,
    handlePhoneChange,
    handleAvatarChange,
    handleSave,
    handleCancel,
  };
}