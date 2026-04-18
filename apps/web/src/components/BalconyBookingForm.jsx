import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitBookingRequest } from '@/lib/bookingSubmission';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout';

const breakfastPackages = [
  { name: 'Therapeutic Morning Tea + Pastries', price: 8500 },
  { name: 'Coffee + Fresh Juice + Breakfast Plate', price: 12000 },
  { name: 'Sunrise Breakfast Bundle', price: 15000 }
];

const BalconyBookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    booking_date: '',
    booking_time: '',
    breakfast_package: '',
    guest_count: 2,
    special_requests: ''
  });

  const getSelectedPackagePrice = () => {
    const pkg = breakfastPackages.find(p => p.name === formData.breakfast_package);
    return pkg ? pkg.price * formData.guest_count : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = getSelectedPackagePrice();
      const bookingData = {
        guest_name: formData.guest_name,
        email: formData.email,
        phone: formData.phone,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        breakfast_package: formData.breakfast_package,
        guest_count: formData.guest_count,
        special_requests: formData.special_requests,
        booking_status: 'pending',
        payment_status: 'pending',
        total_price: totalPrice
      };

      const { mode, record } = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'balcony',
          data: bookingData,
        },
        fallbackRecord: bookingData,
      });

      if (mode === 'local_backup') {
        navigate('/payment-success', { state: { booking: record, submissionMode: mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        amount: totalPrice,
        bookingId: record.id,
        productName: 'Balcony breakfast booking',
        customerEmail: formData.email,
        state: { booking: record, submissionMode: mode },
      });

      if (!checkout.started) {
        toast.warning('Your request was saved, but payment could not be started automatically. Please contact the hotel to complete payment.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="glass-panel-light rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guest_name">Full Name</Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              required
              className="mt-1 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="mt-1 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="guest_count">Number of Guests</Label>
            <Input
              id="guest_count"
              type="number"
              min="1"
              value={formData.guest_count}
              onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) || 1 })}
              required
              className="mt-1 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="booking_date">Date</Label>
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
            <Label htmlFor="booking_time">Time</Label>
            <div className="relative mt-1">
              <Input
                id="booking_time"
                type="time"
                value={formData.booking_time}
                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                required
                className="text-gray-900"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="breakfast_package">Breakfast Package</Label>
            <Select value={formData.breakfast_package} onValueChange={(value) => setFormData({ ...formData, breakfast_package: value })} required>
              <SelectTrigger className="mt-1 text-gray-900">
                <SelectValue placeholder="Select a package" />
              </SelectTrigger>
              <SelectContent>
                {breakfastPackages.map(pkg => (
                  <SelectItem key={pkg.name} value={pkg.name}>
                    {pkg.name} (₦{pkg.price.toLocaleString()} per person)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="special_requests">Special Requests</Label>
            <Textarea
              id="special_requests"
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              placeholder="Any dietary requirements or special setup?"
              className="mt-1 text-gray-900"
              rows={3}
            />
          </div>
        </div>

        {formData.breakfast_package && (
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Package:</span>
              <span className="font-semibold text-foreground">{formData.breakfast_package}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guests:</span>
              <span className="font-semibold text-foreground">{formData.guest_count}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-semibold text-foreground">Total amount:</span>
              <span className="text-xl font-bold text-primary">₦{getSelectedPackagePrice().toLocaleString()}</span>
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
          'Submit Booking Request'
        )}
      </Button>
    </form>
  );
};

export default BalconyBookingForm;
