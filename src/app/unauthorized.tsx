import { getDashboardPath } from '@/utils/path';
import { redirect } from 'next/navigation';

export default function unauthorized(): never {
  redirect(getDashboardPath());
}
