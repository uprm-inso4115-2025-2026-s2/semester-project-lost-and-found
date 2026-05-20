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
  errors: ProfileErrors;
  status: Status;
  statusMsg: string;
  isDirty: boolean;
  handleUsernameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: ChangeEvent<HTMLInputElement>) => void;
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

  useEffect(() => {
    console.log('useEffect ran');
    async function fetchProfile(): Promise<void> {
      console.log('fetchProfile called');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?select=username,phone_number&user_id=eq.13d7aa90-b377-4a4f-84d2-78692f969a0a&limit=1`,
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
        setUsername(data[0].username ?? '');
        setPhone(data[0].phone_number ?? '');
        setOriginalData({ username: data[0].username ?? '', phone: data[0].phone_number ?? '' });
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

    const user = { id: '13d7aa90-b377-4a4f-84d2-78692f969a0a' };

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          username: username.trim(),
          phone_number: phone.trim() || null,
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
    errors,
    status,
    statusMsg,
    isDirty,
    handleUsernameChange,
    handlePhoneChange,
    handleSave,
    handleCancel,
  };
}

// import { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient';

// function validateUsername(value) {
//   if (!value || value.trim() === '') return 'Username is required.';
//   if (value.length < 3) return 'Username must be at least 3 characters.';
//   if (value.length > 32) return 'Username must be 32 characters or fewer.';
//   if (!/^[a-zA-Z0-9_]+$/.test(value))
//     return 'Username can only contain letters, numbers, and underscores.';
//   return null;
// }

// function validatePhone(value) {
//   if (!value || value.trim() === '') return null;
//   if (!/^[+\d\s\-().]{7,20}$/.test(value))
//     return 'Enter a valid phone number.';
//   return null;
// }

// export function useLogin() {
//   const [username, setUsername]         = useState('');
//   const [phone, setPhone]               = useState('');
//   const [originalData, setOriginalData] = useState({});
//   const [errors, setErrors]             = useState({});
//   const [status, setStatus]             = useState(null); // 'saving' | 'success' | 'error'
//   const [statusMsg, setStatusMsg]       = useState('');

//   useEffect(() => {
//     async function fetchProfile() {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       const { data, error } = await supabase
//         .from('profiles')
//         .select('username, phone_number')
//         .eq('user_id', user.id)
//         .single();

//       if (error && error.code !== 'PGRST116') {
//         console.error('Error fetching profile:', error);
//         return;
//       }

//       if (data) {
//         setUsername(data.username ?? '');
//         setPhone(data.phone_number ?? '');
//         setOriginalData({ username: data.username ?? '', phone: data.phone_number ?? '' });
//       }
//     }

//     fetchProfile();
//   }, []);

//   const isDirty =
//     username !== originalData.username ||
//     phone !== (originalData.phone ?? '');

//   function handleUsernameChange(e) {
//     const val = e.target.value;
//     setUsername(val);
//     setErrors(prev => ({ ...prev, username: validateUsername(val) }));
//   }

//   function handlePhoneChange(e) {
//     const val = e.target.value;
//     setPhone(val);
//     setErrors(prev => ({ ...prev, phone: validatePhone(val) }));
//   }

//   async function handleSave(e) {
//     e.preventDefault();

//     const usernameErr = validateUsername(username);
//     const phoneErr    = validatePhone(phone);
//     if (usernameErr || phoneErr) {
//       setErrors({ username: usernameErr, phone: phoneErr });
//       return;
//     }

//     if (!isDirty) {
//       setStatus('success');
//       setStatusMsg('No changes to save.');
//       setTimeout(() => setStatus(null), 3000);
//       return;
//     }

//     setStatus('saving');

//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       setStatus('error');
//       setStatusMsg('You must be logged in to update your profile.');
//       return;
//     }

//     const { error } = await supabase
//       .from('profiles')
//       .upsert({
//         user_id: user.id,
//         username: username.trim(),
//         phone_number: phone.trim() || null,
//       });

//     if (error) {
//       if (error.code === '23505') {
//         setErrors(prev => ({ ...prev, username: 'That username is already taken.' }));
//         setStatus('error');
//         setStatusMsg('Please choose a different username.');
//       } else {
//         setStatus('error');
//         setStatusMsg('Something went wrong. Please try again.');
//         console.error(error);
//       }
//       return;
//     }

//     setOriginalData({ username: username.trim(), phone: phone.trim() });
//     setStatus('success');
//     setStatusMsg('Profile updated successfully!');
//     setTimeout(() => setStatus(null), 3000);
//   }

//   function handleCancel() {
//     setUsername(originalData.username ?? '');
//     setPhone(originalData.phone ?? '');
//     setErrors({});
//     setStatus(null);
//   }

//   return {
//     // field values
//     username,
//     phone,
//     // state
//     errors,
//     status,
//     statusMsg,
//     isDirty,
//     // handlers
//     handleUsernameChange,
//     handlePhoneChange,
//     handleSave,
//     handleCancel,
//   };
// }