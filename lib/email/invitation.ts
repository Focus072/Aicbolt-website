// Simple email invitation system
// In production, you would integrate with services like SendGrid, AWS SES, etc.

export interface InvitationEmailData {
  to: string;
  inviterName: string;
  teamName: string;
  inviteLink: string;
  role: string;
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
  try {
    // For development, we'll just log the email data
    // In production, replace this with actual email service
    console.log('📧 Email Invitation:', {
      to: data.to,
      subject: `You're invited to join ${data.teamName}`,
      body: `
Hello!

${data.inviterName} has invited you to join ${data.teamName} as a ${data.role}.

Click the link below to create your account and set up your password:
${data.inviteLink}

This invitation will expire in 7 days.

Best regards,
The ${data.teamName} Team
      `.trim()
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}

export function generateInviteLink(invitationId: number, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/sign-up?inviteId=${invitationId}`;
}
