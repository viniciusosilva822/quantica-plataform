import { cookies } from 'next/headers';
import { api } from './api';

export const serverApi = async <T>(path: string) => {
  const cookieStore = cookies();
  const all = cookieStore.getAll();
  const cookieHeader = all.map((c) => `${c.name}=${c.value}`).join('; ');
  return api<T>(path, { cookieHeader });
};
