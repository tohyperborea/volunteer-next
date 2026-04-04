/**
 * Server-side utility functions for Qualifications
 * @since 2026-03-10
 * @author Michael Townsend <@continuities>
 */

'use server';

import {
  getQualificationsForEvent,
  getQualificationsForTeams
} from '@/service/qualification-service';
import { hasEventEnded } from '@/utils/date';
import { deduplicateBy } from '@/utils/list';

/**
 * Determines which qualifications the current user is authorised to manage (assign/remove/edit) based on their roles.
 * @param event - The current event
 * @param isAdmin - Whether the user has the 'admin' role
 * @param organisesEvent - Whether the user is an organiser for the current event
 * @param leadsTeams - List of team IDs that the user is a lead for
 * @returns List of Qualifications that the current user is authorised to manage (assign/remove)
 */
export async function getManagedQualifications({
  event,
  isAdmin,
  organisesEvent,
  leadsTeams
}: {
  event: EventInfo;
  isAdmin: boolean;
  organisesEvent: boolean;
  leadsTeams: TeamId[];
}): Promise<QualificationInfo[]> {
  'use server';
  const qualifications: QualificationInfo[] = [];
  if (hasEventEnded(event)) {
    // No qualifications can be managed for past events
    return qualifications;
  }
  if (isAdmin || organisesEvent) {
    // Admins and organisers can assign any qual the event
    const quals = await getQualificationsForEvent(event.id);
    qualifications.push(...quals);
  } else if (leadsTeams.length > 0) {
    // Team leads can assign quals from their teams
    const quals = await getQualificationsForTeams(leadsTeams);
    qualifications.push(...quals);
  }
  return deduplicateBy(qualifications, ({ id }) => id);
}
