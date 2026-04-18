import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';

const GardenPartyBookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    event_type: '',
    guest_count: 10,
    preferred_date: '',
    preferred_time: '',
    special_requests: '',
    catering_preferences: {
      pepperSoup: false,
      bbq: false,
      drinks: false,
      other: false
    }
  });

  const PACKAGE_PRICE = 100000;

  const handleCateringChange = (key) => {
    setFormData(prev => ({
      ...prev,
      catering_preferences: {
        ...prev.catering_preferences,
        [key]: !prev.catering_preferences[key]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        event_type: formData.event_type,
        guest_count: formData.guest_count,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        special_requests: formData.special_requests,
        catering_preferences: formData.catering_preferences,
        booking_status: 'pending',
        payment_status: 'pending',
        total_price: PACKAGE_PRICE
      };

      const record = await pb.collection('garden_bookings').create(bookingData, { $autoCancel: false });

      const paymentResponse = await apiServerClient.fetch('/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: PACKAGE_PRICE,
          currency: 'ngn',
          metadata: { bookingId: record.id, type: 'garden_booking' }
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="glass-panel-light rounded-2xl p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="heading-font text-2xl font-bold text-foreground">Private Garden Event</h2>
          <p className="text-muted-foreground">Package Price: ₦{PACKAGE_PRICE.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_type">Event Type</Label>
            <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })} required>
              <SelectTrigger className="mt-1 text-gray-900">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="Social Gathering">Social Gathering</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="preferred_date">Preferred Date</Label>
            <div className="relative mt-1">
              <Input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                required
                className="text-gray-900"
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="preferred_time">Preferred Time</Label>
            <div className="relative mt-1">
              <Input
                id="preferred_time"
                type="time"
                value={formData.preferred_time}
                onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                required
                className="text-gray-900"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Catering Preferences</Label>
          <div className="grid grid-cols-2 gap-4 bg-card p-4 rounded-xl border border-border">
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-pepper" checked={formData.catering_preferences.pepperSoup} onCheckedChange={() => handleCateringChange('pepperSoup')} />
              <Label htmlFor="cat-pepper" className="font-normal cursor-pointer">Pepper Soup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-bbq" checked={formData.catering_preferences.bbq} onCheckedChange={() => handleCateringChange('bbq')} />
              <Label htmlFor="cat-bbq" className="font-normal cursor-pointer">BBQ Setup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-drinks" checked={formData.catering_preferences.drinks} onCheckedChange={() => handleCateringChange('drinks')} />
              <Label htmlFor="cat-drinks" className="font-normal cursor-pointer">Drinks Package</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-other" checked={formData.catering_preferences.other} onCheckedChange={() => handleCateringChange('other')} />
              <Label htmlFor="cat-other" className="font-normal cursor-pointer">Other (Specify below)</Label>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="special_requests">Special Requests & Details</Label>
          <Textarea
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="Tell us more about your event..."
            className="mt-1 text-gray-900"
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-200 active:scale-[0.98]">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing booking...
          </>
        ) : (
          'Proceed to Payment (₦100,000)'
        )}
      </Button>
    </form>
  );
};

export default GardenPartyBookingForm;