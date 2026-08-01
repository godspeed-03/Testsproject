import { redirect } from 'next/navigation';

export default function MonthsRedirectPage() {
  redirect('/tracker/calendar');
}
