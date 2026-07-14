'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CONTACT_EMAIL } from '@/lib/config/site';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const subject = String(formData.get('subject') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    const mailtoSubject = encodeURIComponent(subject || `Message from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-6 text-center">
        <h3 className="mb-2 text-lg font-bold text-slate-900">Thank you for reaching out</h3>
        <p className="text-slate-700">
          Your email client should open with a pre-filled message. If it does not, please email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" type="text" placeholder="How can we help?" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} placeholder="Tell us more..." required />
      </div>
      <p className="text-xs text-slate-500">
        By submitting this form, you agree that we may use the information you provide to respond to your inquiry. See our{' '}
        <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a> for details.
      </p>
      <Button type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
}
