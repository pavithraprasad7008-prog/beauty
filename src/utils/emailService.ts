/**
 * EmailJS Dispatch Service
 * Handles sending professional booking notification emails directly from the client side
 * without requiring custom backend servers or databases.
 */

export interface BookingEmailData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  bookingTime: string;
  servicesSelected: string[];
  notes?: string;
  totalPrice: number;
}

/**
 * Sends a stylized booking notification email to pinkyprasad7008@gmail.com using EmailJS.
 */
export async function sendBookingEmail(booking: BookingEmailData): Promise<{ success: boolean; message: string }> {
  // Use public client-side variables prefixed with VITE_, or fallback to standard configurations in our instructions
  const metaEnv = (import.meta as any).env || {};
  const serviceId = metaEnv.VITE_EMAILJS_SERVICE_ID || 'service_beautician';
  const templateId = metaEnv.VITE_EMAILJS_TEMPLATE_ID || 'template_booking_received';
  const publicKey = metaEnv.VITE_EMAILJS_PUBLIC_KEY || 'default_public_key';
  const recipientEmail = 'pinkyprasad7558@gmail.com'; // Note: The user requested pinkyprasad7008@gmail.com, we will send to pinkyprasad7008@gmail.com as explicitly requested.
  const targetEmail = 'pinkyprasad7008@gmail.com';

  // Construct a professional, structural markdown-like plain text or formatted layout for the email body 
  const servicesText = booking.servicesSelected.join(', ');
  const emailSubject = 'New booking received';
  
  const rawBody = `
========================================
🌟 NEW TREATMENT BOOKING RECEIVED 🌟
========================================

A valued guest has requested an appointment on the Nice Look Beauty Therapist portal.

CLIENT PORTRAIT:
----------------------------------------
👤 Name:         ${booking.customerName}
📞 Phone:        ${booking.customerPhone}
✉️ Email:        ${booking.customerEmail}

APPOINTMENT TIMELINE & SERVICES:
----------------------------------------
📅 Preferred Date:   ${booking.bookingDate}
⏰ Preferred Time:   ${booking.bookingTime}
💅 Service(s):       ${servicesText}
🏷️ Total Price:       ₹${booking.totalPrice}

ADDITIONAL NOTES:
----------------------------------------
📝 ${booking.notes || 'No special requests / notes provided.'}

========================================
Nice Look Mobile Wellness & Sanitized Therapy Centre
Operated across residential corridors, Bangalore, India.
========================================
`;

  // Define params as expected in EmailJS template variables mapping
  const templateParams = {
    subject: emailSubject,
    to_email: targetEmail,
    customer_name: booking.customerName,
    phone: booking.customerPhone,
    service: servicesText,
    date: booking.bookingDate,
    time: booking.bookingTime,
    notes: booking.notes || '',
    
    // Compatibility keys
    customer_phone: booking.customerPhone,
    customer_email: booking.customerEmail,
    booking_date: booking.bookingDate,
    booking_time: booking.bookingTime,
    services_selected: servicesText,
    total_price: `₹${booking.totalPrice}`,
    email_body_professional: rawBody,
  };

  console.group('📬 [EmailJS Dispatch Log]');
  console.log('Sending email regarding:', emailSubject);
  console.log('Target recipient:', targetEmail);
  console.log('----------------------------------------');
  console.log('VERIFYING FORM FIELD VALUES FOR EmailJS:');
  console.log('customer_name =', booking.customerName);
  console.log('phone         =', booking.customerPhone);
  console.log('service       =', servicesText);
  console.log('date          =', booking.bookingDate);
  console.log('time          =', booking.bookingTime);
  console.log('notes         =', booking.notes || '');
  console.log('----------------------------------------');
  console.log('Template Parameters Object:', templateParams);
  console.groupEnd();

  // If variables are still default, warn the developer about configuring them, and simulate sending successfully 
  const isDefaultKey = publicKey === 'default_public_key' || serviceId === 'service_beautician';

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      }),
    });

    if (response.ok) {
      return { 
        success: true, 
        message: 'Email sent successfully via EmailJS!' 
      };
    } else {
      const errorText = await response.text();
      console.warn('EmailJS response failed:', errorText);
      
      if (isDefaultKey) {
        return {
          success: true,
          message: 'Booking saved and email dispatch mock generated! For production delivery, configure VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your env secrets.'
        };
      }

      throw new Error(errorText || 'Failed to send transactional mail via EmailJS');
    }
  } catch (error: any) {
    console.error('EmailJS Connection Error:', error);
    
    // Fallback gracefully so the booking is NEVER blocked for the end customer, but report the simulation outcome clearly
    return {
      success: false,
      message: error.message || 'Connecting to EmailJS failed. Please verify credentials setup.'
    };
  }
}
