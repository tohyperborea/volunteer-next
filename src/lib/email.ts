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
    key: `ShiftEmail:${event.slug}:${user.id}`,
    to: user.email,
    template: 'ShiftEmail',
    props: {
      name: user.chosenName,
      event,
      shifts,
      teams
    }
  });

/**
 * Gets a server action for sending a notification email to volunteers
 * @param param.volunteers - list of volunteers to send the email to
 * @param param.shiftsByVolunteerId - mapping of volunteer ID to their shifts
 * @param param.event - event info for the event the volunteers are signed up for
 * @param param.teams - list of teams for the event (used if including shifts in the email)
 * @returns a server action that takes email customisation options and sends the email to the volunteers
 */
export const getNotifyVolunteersAction =
  ({
    volunteers,
    shiftsByVolunteerId,
    event,
    teams
  }: {
    volunteers: VolunteerInfo[];
    shiftsByVolunteerId: Record<UserId, ShiftInfo[]>;
    event: EventInfo;
    teams: TeamInfo[];
  }) =>
  async ({ subject, body, includeShifts }: EmailCustomisation): Promise<SendEmailResult> => {
    'use server';
    const baseProps = { subject, body };
    volunteers
      .filter((v) => v.email)
      .map((volunteer) => {
        const shifts = [...(shiftsByVolunteerId[volunteer.id] || [])].sort((a, b) => {
          if (a.eventDay !== b.eventDay) {
            return a.eventDay - b.eventDay;
          }
          return a.startTime.localeCompare(b.startTime);
        });
        const props = includeShifts
          ? {
              ...baseProps,
              event,
              shifts,
              teams
            }
          : baseProps;
        sendEmailWithTemplate({
          to: volunteer.email!, // we filtered out the ones without emails
          template: 'NotifyEmail',
          props
        });
      });
    return { status: 'sent' };
  };
