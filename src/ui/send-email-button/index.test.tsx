import { render, fireEvent } from '@testing-library/react';
import { act } from 'react';
import SendEmailButton from '.';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({}),
  useLocale: () => 'en'
}));

describe('SendEmailButton', () => {
  it('renders the button', () => {
    const { getByRole } = render(
      <SendEmailButton
        sendEmail={jest.fn()}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
      />
    );
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('disables the button while sending', async () => {
    let completeSend: () => void;
    const sendEmailMock = jest.fn(
      () =>
        new Promise<SendEmailResult>((resolve) => {
          completeSend = () => resolve({ status: 'sent' });
        })
    );
    const { getByRole } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
      />
    );

    const button = getByRole('button');
    await act(() => fireEvent.click(button));
    expect(button).toBeDisabled();
    await act(async () => completeSend());
    expect(button).not.toBeDisabled();
  });

  it('shows success dialog on successful email send', async () => {
    const sendEmailMock = jest.fn(() => Promise.resolve<SendEmailResult>({ status: 'sent' }));
    const { getByRole, findByText } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
      />
    );

    fireEvent.click(getByRole('button'));
    expect(await findByText('Success')).toBeInTheDocument();
    expect(await findByText('Email sent successfully')).toBeInTheDocument();
  });

  it('shows failure dialog on failed email send', async () => {
    const sendEmailMock = jest.fn(() =>
      Promise.resolve<SendEmailResult>({ status: 'failed', error: 'error' })
    );
    const { getByRole, findByText } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
      />
    );

    fireEvent.click(getByRole('button'));
    expect(await findByText('Failure')).toBeInTheDocument();
    expect(await findByText('Failed to send email')).toBeInTheDocument();
  });

  it('closes the dialog when the close button is clicked', async () => {
    const sendEmailMock = jest.fn(() => Promise.resolve<SendEmailResult>({ status: 'sent' }));
    const { getByRole, findByText, queryByText } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
      />
    );

    fireEvent.click(getByRole('button'));
    expect(await findByText('Success')).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: /close/i }));
    expect(queryByText('Success')).not.toBeInTheDocument();
  });

  it('renders the customisation dialog when customisable is true', () => {
    const { getByRole, queryByText } = render(
      <SendEmailButton
        sendEmail={jest.fn()}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
        customisable
        numEmails={5}
        emailContext="test context"
      />
    );

    expect(queryByText('notifyAll')).not.toBeInTheDocument();
    fireEvent.click(getByRole('button'));
    expect(queryByText('notifyAll')).toBeInTheDocument();
  });

  it('sends a customised email and shows success dialog', async () => {
    const sendEmailMock = jest.fn(() => Promise.resolve<SendEmailResult>({ status: 'sent' }));
    const { getByRole, getByPlaceholderText, getByLabelText, findByText } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
        customisable
        numEmails={5}
        emailContext="test context"
      />
    );

    fireEvent.click(getByRole('button'));
    fireEvent.change(getByPlaceholderText('emailSubject'), { target: { value: 'Test Subject' } });
    fireEvent.change(getByPlaceholderText('emailBody'), { target: { value: 'Test Body' } });
    fireEvent.click(getByRole('checkbox'));
    fireEvent.click(getByRole('button', { name: 'send' }));

    expect(await findByText('Success')).toBeInTheDocument();
    expect(await findByText('Email sent successfully')).toBeInTheDocument();
    expect(sendEmailMock).toHaveBeenCalledWith({
      subject: 'Test Subject',
      body: 'Test Body',
      includeShifts: true
    });
  });

  it('shows failure dialog when customised email fails', async () => {
    const sendEmailMock = jest.fn(() =>
      Promise.resolve<SendEmailResult>({ status: 'failed', error: 'error' })
    );
    const { getByRole, getByPlaceholderText, findByText } = render(
      <SendEmailButton
        sendEmail={sendEmailMock}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
        customisable
        numEmails={5}
        emailContext="test context"
      />
    );

    fireEvent.click(getByRole('button'));
    fireEvent.change(getByPlaceholderText('emailSubject'), { target: { value: 'Test Subject' } });
    fireEvent.change(getByPlaceholderText('emailBody'), { target: { value: 'Test Body' } });
    fireEvent.click(getByRole('button', { name: 'send' }));

    expect(await findByText('Failure')).toBeInTheDocument();
    expect(await findByText('Failed to send email')).toBeInTheDocument();
  });

  it('closes the customisation dialog when the cancel button is clicked', () => {
    const { getByRole, queryByText } = render(
      <SendEmailButton
        sendEmail={jest.fn()}
        successTitle="Success"
        successMessage="Email sent successfully"
        failureTitle="Failure"
        failureMessage="Failed to send email"
        customisable
        numEmails={5}
        emailContext="test context"
      />
    );

    fireEvent.click(getByRole('button'));
    expect(queryByText('notifyAll')).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: /cancel/i }));
    expect(queryByText('notifyAll')).not.toBeInTheDocument();
  });
});
