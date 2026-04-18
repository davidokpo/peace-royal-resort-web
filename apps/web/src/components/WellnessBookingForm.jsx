import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const classTypes = [
  { value: 'Yoga', label: 'Yoga Class', price: 5000, description: 'Morning yoga session with certified instructor' },
  { value: 'Meditation', label: 'Meditation Session', price: 4000, description: 'Guided meditation in our garden sanctuary' },
  { value: 'Wellness Package', label: 'Full Wellness Package', price: 12000, description: 'Yoga + Meditation + Spa treatment' }
];

const timeSlots = [
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
  '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
];

const WellnessBookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    participant_name: '',
    email: '',
    phone: '',
    class_type: '',
    booking_date: '',
    booking_time: '',
    participants_count: 1
  });

  const getSelectedClassPrice = () => {
    const selectedClass = classTypes.find((c) => c.value === formData.class_type);
    return selectedClass?.price || 0;
  };

  const calculateTotal = () => {
    return getSelectedClassPrice() * formData.participants_count;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = calculateTotal();
      const bookingData = {
        participant_name: formData.participant_name,
        email: formData.email,
        phone: formData.phone,
        class_type: formData.class_type,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        participants_count: formData.participants_count,
        booking_status: 'pending',
        total_price: totalPrice
      };

      const record = await pb.collection('wellness_bookings').create(bookingData, { $autoCancel: false });

      const paymentResponse = await apiServerClient.fetch('/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          currency: 'ngn',
          metadata: { bookingId: record.id, type: 'wellness_booking' }
        })
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment initialization failed');
      }

      const paymentData = await paymentResponse.json();
      navigate('/payment-success', { state: { booking: record, clientSecret: paymentData.clientSecret } });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel-light rounded-2xl p-6 space-y-4">
        <div>
          <Label htmlFor="class_type">Class/Package type</Label>
          <Select value={formData.class_type} onValueChange={(value) => setFormData({ ...formData, class_type: value })} required>
            <SelectTrigger className="mt-1 text-gray-900">
              <SelectValue placeholder="Select class type" />
            </SelectTrigger>
            <SelectContent>
              {classTypes.map((classType) => (
                <SelectItem key={classType.value} value={classType.value}>
                  {classType.label} (₦{classType.price.toLocaleString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.class_type && (
            <p className="text-sm text-muted-foreground mt-2">
              {classTypes.find((c) => c.value === formData.class_type)?.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="participant_name">Full name</Label>
            <Input
              id="participant_name"
              value={formData.participant_name}
              onChange={(e) => setFormData({ ...formData, participant_name: e.target.value })}
              required
              className="mt-1 text-gray-900"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1 text-gray-900"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="mt-1 text-gray-900"
              placeholder="+234 XXX XXX XXXX"
            />
          </div>

          <div>
            <Label htmlFor="participants_count">Number of participants</Label>
            <Input
              id="participants_count"
              type="number"
              min="1"
              max="10"
              value={formData.participants_count}
              onChange={(e) => setFormData({ ...formData, participants_count: parseInt(e.target.value) || 1 })}
              required
              className="mt-1 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="booking_date">Booking date</Label>
            <div className="relative mt-1">
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                required
                className="text-gray-900"
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="booking_time">Preferred time</Label>
            <Select value={formData.booking_time} onValueChange={(value) => setFormData({ ...formData, booking_time: value })} required>
              <SelectTrigger className="mt-1 text-gray-900">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.class_type && formData.participants_count > 0 && (
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Class type:</span>
              <span className="font-semibold text-foreground">{classTypes.find((c) => c.value === formData.class_type)?.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per participant:</span>
              <span className="font-semibold text-foreground">₦{getSelectedClassPrice().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of participants:</span>
              <span className="font-semibold text-foreground">{formData.participants_count}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Total amount:</span>
              <span className="text-xl font-bold text-primary">₦{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 active:scale-[0.98]">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing booking...
          </>
        ) : (
          'Proceed to payment'
        )}
      </Button>
    </form>
  );
};

export default WellnessBookingForm;