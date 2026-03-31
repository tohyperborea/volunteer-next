import { body as ShiftEmail } from './ShiftEmail';
import { htmlToText } from 'html-to-text';
import { sendEmail } from '@/email';

const templates = {
  ShiftEmail: ShiftEmail
} as const;

type TemplateName = keyof typeof templates;
type TemplateProps<T extends TemplateName> = React.ComponentProps<(typeof templates)[T]>;

export async function sendEmailWithTemplate<T extends TemplateName>(options: {
  to: string;
  template: T;
  props?: TemplateProps<T>;
}): Promise<SendEmailResult> {
  // dynamically import renderToStaticMarkup because NextJS gets angry otherwise (https://github.com/vercel/next.js/issues/43810#issuecomment-1341136525)
  const renderToStaticMarkup = (await import('react-dom/server')).renderToStaticMarkup;
  const { body, subject } = await import(`@/email/template/${options.template}`);
  const emailBody = renderToStaticMarkup(await body(options.props ?? {}));
  const emailSubject = await subject(options.props ?? {});
  return sendEmail({
    to: options.to,
    subject: emailSubject,
    html: emailBody,
    text: htmlToText(emailBody)
  });
}
