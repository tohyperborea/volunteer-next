import metadata from '@/i18n/metadata';
import { getTeamBySlug } from '@/service/team-service';
import { getTranslations } from 'next-intl/server';

const PAGE_KEY = 'TeamPage.VolunteersTab';

export const generateMetadata = metadata(PAGE_KEY, {
  title: async (params) => {
    const t = await getTranslations(PAGE_KEY);
    const { eventSlug, teamSlug } = params;
    const team = !eventSlug || !teamSlug ? null : await getTeamBySlug(eventSlug, teamSlug);
    return `${t('title')} | ${team?.name ?? ''}`;
  }
});

interface Props {}

export default function TeamVolunteers({}: Props) {
  return <div>TODO: Team Volunteers</div>;
}
