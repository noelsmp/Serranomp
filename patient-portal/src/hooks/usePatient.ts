import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Patient } from '../types/database';

export function usePatient() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPatient(null);
      setLoading(false);
      return;
    }

    supabase
      .from('patienten')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setPatient(data ?? null);
        setLoading(false);
      });
  }, [user]);

  return { patient, loading };
}
