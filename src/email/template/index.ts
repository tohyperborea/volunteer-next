import type { body as ShiftEmail } from './ShiftEmail';
import { htmlToText } from 'html-to-text';
import { sendEmail } from '@/email';
import { queueEmail } from '@/service/email-service';

type Templates = {
  ShiftEmail: typeof ShiftEmail;
};

type TemplateName = keyof Templates;
type TemplateProps<T extends TemplateName> = React.ComponentProps<Templates[T]>;

export async function sendEmailWithTemplate<T extends TemplateName>(options: {
  to: string;
  template: T;
  props: TemplateProps<T>;
  key?: string;
  sendAfter?: Date;
}): Promise<SendEmailResult> {
  // dynamically import renderToStaticMarkup because NextJS gets angry otherwise (https://github.com/vercel/next.js/issues/43810#issuecomment-1341136525)
  const renderToStaticMarkup = (await import('react-dom/server')).renderToStaticMarkup;
  const { body, subject } = await import(`@/email/template/${options.template}`);
  const emailBody = renderToStaticMarkup(await body(options.props));
  const emailSubject = await subject(options.props);
  if (process.env.USE_EMAIL_QUEUE === 'true') {
    await queueEmail({
      to: options.to,
      subject: emailSubject,
      body: emailBody,
      key: options.key,
      sendAfter: options.sendAfter
    });
    return { status: 'queued' };
  } else {
    return sendEmail({
      to: options.to,
      subject: emailSubject,
      html: emailBody,
      text: htmlToText(emailBody)
    });
  }
}
