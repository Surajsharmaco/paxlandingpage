import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { CLINIC_DETAILS } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  phone: z.string().regex(/^[6-9][0-9]{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  service: z.string().min(1, 'Please select a service'),
  preferredDate: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatPreferredDate(value: string) {
  if (!value) return 'Not specified';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function buildWhatsAppUrl(data: FormValues) {
  const message = [
    'Hello Punar Axis Therapy,',
    '',
    'I would like to book a consultation.',
    '',
    `Full Name: ${data.name}`,
    `Phone Number: ${data.phone}`,
    `Service Interested In: ${data.service}`,
    `Preferred Date: ${formatPreferredDate(data.preferredDate ?? '')}`,
    `Message: ${data.message?.trim() || 'Not provided'}`,
    '',
    'Please let me know the available consultation slot.',
  ].join('\n');

  const whatsappNumberUrl = CLINIC_DETAILS.whatsappUrl.split('?')[0];
  return `${whatsappNumberUrl}?text=${encodeURIComponent(message)}`;
}

function openWhatsAppAppointment(data: FormValues) {
  const whatsappUrl = buildWhatsAppUrl(data);
  const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  if (!whatsappWindow) {
    window.location.assign(whatsappUrl);
  }
}

export const ConsultationForm = () => {
  const [submitError, setSubmitError] = useState('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      service: '',
      preferredDate: '',
      message: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    setSubmitError('');
    try {
      openWhatsAppAppointment(data);
    } catch {
      setSubmitError('WhatsApp could not be opened. Please use the WhatsApp button above or call 087965 20257 to book now.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input autoComplete="name" placeholder="Your full name" className="h-12 rounded-xl bg-[#fcfbf7]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="10-digit mobile number" className="h-12 rounded-xl bg-[#fcfbf7]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Interested In</FormLabel>
                <FormControl>
                  <select
                    className="flex h-12 w-full appearance-none rounded-xl border border-input bg-[#fcfbf7] px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                  >
                    <option value="">Select a service</option>
                    <option value="Ayurveda">Ayurveda</option>
                    <option value="Physiotherapy">Physiotherapy</option>
                    <option value="Rehabilitation">Rehab</option>
                    <option value="Other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Date</FormLabel>
              <FormControl>
                <Input type="date" className="h-12 rounded-xl bg-[#fcfbf7]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us how we can help" className="min-h-28 rounded-xl bg-[#fcfbf7]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p role="alert" className="rounded-xl border border-[#c58a18]/25 bg-[#c58a18]/8 px-4 py-3 text-sm leading-6 text-[#60420d]">
            {submitError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="h-14 w-full rounded-full bg-[#063b28] text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-[#0b4a35]">
          {form.formState.isSubmitting ? 'Opening WhatsApp…' : 'Book my appointment'}
        </Button>
        <p className="text-center text-xs leading-5 text-[#66716b]">Your details will be prepared in WhatsApp for you to review before sending.</p>
      </form>
    </Form>
  );
};
