'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import SaveButton from './SaveButton';
import FormatButton from './FormatButton';

interface DbUser {
  id: number;
  username: string;
  email: string;
  contact?: string;
  institution?: string;
  role?: string;
}

interface PersonalInfoProps {
  onProfileUpdated?: (data: { name: string; email: string; role: string }) => void;
}

export default function PersonalInfo({ onProfileUpdated }: PersonalInfoProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [contact, setContact] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const token = Cookies.get('bgai_auth_token');
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }

        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data user');
        }

        const data = await response.json();
        setDbUser(data);

        const userEmail = data.email || data.username || '';
        setEmail(userEmail);
        setFirstName(userEmail.substring(0, 6));
        setContact(data.contact || '');
        setInstitution(data.institution || '');
        setRole(data.role || '');
        setDbUser(data);

        if (onProfileUpdated) {
          onProfileUpdated({
            name: data.username || userEmail.substring(0, 6),
            email: userEmail,
            role: data.role || 'User',
          });
        }
      } catch (err) {
        console.error('[PersonalInfo] ', err);
        if (user) {
          const fallbackEmail = user.email || user.name || '';
          setEmail(fallbackEmail);
          setFirstName(fallbackEmail.substring(0, 6));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [user]);

  if (loading) {
    return <div>Mengambil data pengguna...</div>;
  }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        👤 Informasi Pribadi
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Nama Depan</label>
          <input readOnly value={firstName} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Email</label>
          <input readOnly value={email} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>No. HP / WA</label>
          <input value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} placeholder="Masukkan nomor HP / WA" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Institusi / Instansi</label>
          <input value={institution} onChange={(e) => setInstitution(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }} placeholder="Masukkan institusi" />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px', letterSpacing: '.5px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Peran / Jabatan</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none' }}>
          <option value="Admin Sistem & AI Engineer">Admin Sistem & AI Engineer</option>
          <option value="Petugas Pengawas Vendor MBG">Petugas Pengawas Vendor MBG</option>
          <option value="Ahli Gizi / Tenaga Kesehatan">Ahli Gizi / Tenaga Kesehatan</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
        <div style={{ color: status.startsWith('Berhasil') ? 'var(--teal)' : 'var(--red)', minHeight: '18px', fontSize: '13px' }}>{status}</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <SaveButton
            loading={status === 'Menyimpan perubahan...'}
            onClick={async () => {
              try {
                setStatus('Menyimpan perubahan...');
                const token = Cookies.get('bgai_auth_token');
                if (!token) throw new Error('Token tidak ditemukan');

                const res = await fetch('/api/auth/me', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ contact, institution, role }),
                });

                if (!res.ok) {
                  const err = await res.json().catch(() => ({ error: 'Gagal menyimpan' }));
                  throw new Error(err.error || 'Gagal menyimpan');
                }

                const updated = await res.json();
                setDbUser(updated);
                setContact(updated.contact ?? '');
                setInstitution(updated.institution ?? '');
                setRole(updated.role ?? '');

                if (onProfileUpdated) {
                  onProfileUpdated({
                    name: updated.username || updated.email || '',
                    email: updated.email || '',
                    role: updated.role || 'User',
                  });
                }

                setStatus('Berhasil menyimpan perubahan.');
              } catch (err: any) {
                console.error('[PersonalInfo.save]', err);
                setStatus(`Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`);
              }
            }}
          />

          <FormatButton
            onClick={() => {
              const revertedName = (dbUser?.email ?? '').substring(0, 6);
              const revertedEmail = dbUser?.email ?? '';
              const revertedRole = dbUser?.role ?? 'User';

              setEmail(revertedEmail);
              setFirstName(revertedName);
              setContact(dbUser?.contact ?? '');
              setInstitution(dbUser?.institution ?? '');
              setRole(revertedRole);

              if (onProfileUpdated) {
                onProfileUpdated({ name: revertedName, email: revertedEmail, role: revertedRole });
              }

              setStatus('Awesome! Perubahan telah di-reset.');
            }}
          />
        </div>
      </div>
    </div>
  );
}
