import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured in environment variables');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Initialize Resend with API key
    const resend = new Resend(apiKey);

    // Sanitize input to prevent XSS
    const sanitizeHtml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const sanitizedName = sanitizeHtml(name);
    const sanitizedEmail = sanitizeHtml(email);
    const sanitizedMessage = sanitizeHtml(message).replace(/\n/g, '<br>');

    // Send email using Resend
    console.log('Attempting to send email via Resend...');
    const emailResult = await resend.emails.send({
      from: 'AICBOLT Contact <info@aicbolt.com>', // Using your verified domain
      to: ['info@aicbolt.com'],
      subject: `New Contact Form Submission from ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 10px 0;"><strong style="color: #374151;">Name:</strong> <span style="color: #111827;">${sanitizedName}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #374151;">Email:</strong> <span style="color: #111827;">${sanitizedEmail}</span></p>
            <p style="margin: 10px 0;"><strong style="color: #374151;">Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px; color: #111827; white-space: pre-wrap;">${sanitizedMessage}</div>
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
            This email was sent from the AICBOLT contact form.
          </p>
        </div>
      `,
      replyTo: email,
    });

    console.log('Resend response:', JSON.stringify(emailResult, null, 2));

    // Check for Resend errors
    if (emailResult.error) {
      console.error('Resend error detected:', emailResult.error);
      throw new Error(emailResult.error.message || 'Failed to send email');
    }

    console.log('Email sent successfully! Response:', emailResult);

    return NextResponse.json(
      { 
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Contact form error:', error);
    console.error('Error details:', {
      message: error?.message,
      response: error?.response,
      status: error?.status,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send message. Please try again later.';
    if (error?.message) {
      if (error.message.includes('API key')) {
        errorMessage = 'Email service configuration error. Please contact support.';
      } else if (error.message.includes('domain')) {
        errorMessage = 'Email domain not verified. Please contact support.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

