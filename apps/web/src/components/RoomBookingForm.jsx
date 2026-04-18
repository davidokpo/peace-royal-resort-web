import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Upload, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { submitBookingRequest } from '@/lib/bookingSubmission';
import { redirectToCheckout } from '@/lib/paymentCheckout';

const RoomBookingForm = ({ roomType, price }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    check_in_date: '',
    check_out_date: '',
    room_type: roomType || '',
    identity_document: null
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, identity_document: file });
    }
  };

  const calculateNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const roomPrice = formData.room_type === 'Executive Suite' ? 30000 : 25000;
    return nights * roomPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.identity_document) {
        toast.error('Please upload your identity document');
        setLoading(false);
        return;
      }

      const totalPrice = calculateTotal();
      const uploadNote = formData.identity_document
        ? `Identity document uploaded: ${formData.identity_document.name}`
        : '';

      const { mode, record } = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'room',
          data: {
            guest_name: formData.guest_name,
            email: formData.email,
            phone: formData.phone,
            check_in_date: formData.check_in_date,
            check_out_date: formData.check_out_date,
            room_type: formData.room_type,
            booking_status: 'pending',
            total_price: totalPrice,
            notes: uploadNote,
          },
        },
        fallbackRecord: {
          guest_name: formData.guest_name,
          email: formData.email,
          phone: formData.phone,
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          room_type: formData.room_type,
          booking_status: 'pending',
          total_price: totalPrice,
          notes: uploadNote,
        },
      });

      if (mode === 'local_backup') {
        navigate('/payment-success', { state: { booking: record, submissionMode: mode } });
        return;
      }

      await redirectToCheckout({
        amount: totalPrice,
        bookingId: record.id,
        productName: `${formData.room_type} booking`,
        customerEmail: formData.email,
        state: { booking: record, submissionMode: mode },
      });
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
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-medium">Payment required before service. Secure booking guaranteed.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guest_name">Full name</Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              required
              className="mt-1 text-gray-900"
              placeholder="Enter your full name"
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
            <Label htmlFor="room_type">Room type</Label>
            <Select value={formData.room_type} onValueChange={(value) => setFormData({ ...formData, room_type: value })} required>
              <SelectTrigger className="mt-1 text-gray-900">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Executive Suite">Executive Suite (₦30,000/night)</SelectItem>
                <SelectItem value="Deluxe Room">Deluxe Room (₦25,000/night)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="check_in_date">Check-in date</Label>
            <div className="relative mt-1">
              <Input
                id="check_in_date"
                type="date"
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                required
                className="text-gray-900"
                min={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <Label htmlFor="check_out_date">Check-out date</Label>
            <div className="relative mt-1">
              <Input
                id="check_out_date"
                type="date"
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                required
                className="text-gray-900"
                min={formData.check_in_date || new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="identity_document">Identity verification (NIN/Passport/Driver's License)</Label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors duration-200">
            <input
              id="identity_document"
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
              required
            />
            <label htmlFor="identity_document" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {formData.identity_document ? formData.identity_document.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 10MB</p>
            </label>
          </div>
        </div>

        {calculateNights() > 0 && (
          <div className="bg-muted rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Number of nights:</span>
              <span className="font-semibold text-foreground">{calculateNights()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per night:</span>
              <span className="font-semibold text-foreground">₦{formData.room_type === 'Executive Suite' ? '30,000' : '25,000'}</span>
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

export default RoomBookingForm;
