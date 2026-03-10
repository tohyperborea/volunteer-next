/**
 * Server-side utility functions for Qualifications
 * @since 2026-03-10
 * @author Michael Townsend <@continuities>
 */

'use server';

import { getEvents } from '@/service/event-service';
import {
  getQualificationsForEvents,
  getQualificationsForTeams
} from '@/service/qualification-service';
import { deduplicateBy } from '@/utils/list';

/**
 * Determines which qualifications the current user is authorised to manage (assign/remove/edit) based on their roles.
 * @returns Set of QualificationIds that the current user is authorised to manage (assign/remove)
 */
export async function getManagedQualifications({
  isAdmin,
  organisesEvents,
  leadsTeams
}: {
  isAdmin: boolean;
  organisesEvents: EventId[];
  leadsTeams: TeamId[];
}): Promise<QualificationInfo[]> {
  'use server';
  const qualifications: QualificationInfo[] = [];
  if (isAdmin) {
    // Admins can assign any qual from all active events
    const events = await getEvents();
    const quals = await getQualificationsForEvents(events.map((event) => event.id));
    qualifications.push(...quals);
  } else {
    if (organisesEvents.length > 0) {
      // Organisers can assign quals from their events
      const quals = await getQualificationsForEvents(organisesEvents);
      qualifications.push(...quals);
    }
    if (leadsTeams.length > 0) {
      // Team leads can assign quals from their teams
      const quals = await getQualificationsForTeams(leadsTeams);
      qualifications.push(...quals);
    }
  }
  return deduplicateBy(qualifications, ({ id }) => id);
}
