/**
 * Higher-level email utilities
 * @since 2026-03-31
 * @author Michael Townsend <@continuities>
 */

import { sendEmailWithTemplate } from '@/email/template';

/**
 * Send an email to a user about their volunteer shifts for an event
 * @param props.event - EventInfo for the event the user is volunteering for
 * @param props.user - User to send the email to
 * @param props.shifts - ShiftInfo[] for the shifts the user is signed up for
 * @param props.teams - TeamInfo[] for the teams the user is volunteering with
 * @returns SendEmailResult from the email sending attempt
 */
export const sendUserShiftEmail = async ({
  event,
  user,
  shifts,
  teams
}: {
  event: EventInfo;
  user: User;
  shifts: ShiftInfo[];
  teams: TeamInfo[];
}): Promise<SendEmailResult> =>
  sendEmailWithTemplate({
    key: `ShiftEmail:${event.slug}:${user.id}}`,
    to: user.email,
    template: 'ShiftEmail',
    props: {
      name: user.chosenName,
      event,
      shifts,
      teams
    }
  });
