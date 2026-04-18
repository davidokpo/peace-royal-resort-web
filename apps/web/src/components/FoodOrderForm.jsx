import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { submitBookingRequest } from '@/lib/bookingSubmission';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout';

const menuItems = [
  { id: 1, name: 'Jollof Rice with Chicken', price: 3500, description: 'Spicy Nigerian jollof rice with grilled chicken' },
  { id: 2, name: 'Egusi Soup with Pounded Yam', price: 4200, description: 'Traditional melon seed soup with smooth pounded yam' },
  { id: 3, name: 'Suya Platter', price: 2800, description: 'Spicy grilled beef skewers with onions and peppers' },
  { id: 4, name: 'Pepper Soup (Goat)', price: 3800, description: 'Spicy goat meat pepper soup' },
  { id: 5, name: 'Fried Rice with Fish', price: 3200, description: 'Nigerian-style fried rice with grilled fish' },
  { id: 6, name: 'Afang Soup with Eba', price: 4500, description: 'Vegetable soup with cassava fufu' }
];

const FoodOrderForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    allergies: '',
    dietary_requirements: '',
    delivery_type: 'delivery',
    delivery_address: ''
  });
  const [cart, setCart] = useState({});

  const updateQuantity = (itemId, change) => {
    setCart((prev) => {
      const newQuantity = (prev[itemId] || 0) + change;
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === parseInt(itemId));
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (Object.keys(cart).length === 0) {
        toast.error('Please add items to your order');
        setLoading(false);
        return;
      }

      if (hasAllergies && !formData.allergies.trim()) {
        toast.error('Please specify your allergies');
        setLoading(false);
        return;
      }

      const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
        const item = menuItems.find((m) => m.id === parseInt(itemId));
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity
        };
      });

      const totalPrice = calculateTotal();
      const orderData = {
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        menu_items: orderItems,
        allergies: hasAllergies ? formData.allergies : 'None',
        dietary_requirements: formData.dietary_requirements || 'None',
        delivery_type: formData.delivery_type,
        delivery_address: formData.delivery_type === 'delivery' ? formData.delivery_address : 'N/A',
        order_status: 'pending',
        total_price: totalPrice
      };

      const { mode, record } = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'restaurant',
          data: orderData,
        },
        fallbackRecord: orderData,
      });

      if (mode === 'local_backup') {
        navigate('/payment-success', { state: { order: record, submissionMode: mode } });
        return;
      }

      const checkout = await startCheckoutOrShowPending({
        navigate,
        amount: totalPrice,
        bookingId: record.id,
        productName: 'Restaurant order',
        customerEmail: formData.email,
        state: { order: record, submissionMode: mode },
      });

      if (!checkout.started) {
        toast.warning('Your request was saved, but payment could not be started automatically. Please contact the hotel to complete payment.');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-panel-light rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="heading-font text-xl font-semibold mb-4 text-foreground">Select menu items</h3>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm font-semibold text-primary mt-1">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={!cart[item.id]}
                    className="h-8 w-8 transition-all duration-200 active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-foreground">{cart[item.id] || 0}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="h-8 w-8 transition-all duration-200 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer_name">Full name</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
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
        </div>

        <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
          <Checkbox
            id="allergies"
            checked={hasAllergies}
            onCheckedChange={setHasAllergies}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="allergies" className="flex items-center gap-2 cursor-pointer">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="font-medium text-foreground">I have food allergies</span>
            </Label>
            {hasAllergies && (
              <Textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Please specify your allergies (e.g., peanuts, shellfish, dairy)"
                className="mt-2 text-gray-900"
                rows={2}
              />
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="dietary_requirements">Special dietary requirements (optional)</Label>
          <Textarea
            id="dietary_requirements"
            value={formData.dietary_requirements}
            onChange={(e) => setFormData({ ...formData, dietary_requirements: e.target.value })}
            placeholder="E.g., vegetarian, halal, low-sodium"
            className="mt-1 text-gray-900"
            rows={2}
          />
        </div>

        <div>
          <Label>Delivery option</Label>
          <RadioGroup value={formData.delivery_type} onValueChange={(value) => setFormData({ ...formData, delivery_type: value })} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="font-normal cursor-pointer text-foreground">Delivery</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="font-normal cursor-pointer text-foreground">Pickup</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.delivery_type === 'delivery' && (
          <div>
            <Label htmlFor="delivery_address">Delivery address</Label>
            <Textarea
              id="delivery_address"
              value={formData.delivery_address}
              onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
              required
              placeholder="Enter your full delivery address"
              className="mt-1 text-gray-900"
              rows={3}
            />
          </div>
        )}

        {Object.keys(cart).length > 0 && (
          <div className="bg-primary/5 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-foreground">Order summary</h4>
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = menuItems.find((m) => m.id === parseInt(itemId));
              return (
                <div key={itemId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item?.name} × {quantity}
                  </span>
                  <span className="font-semibold text-foreground">₦{((item?.price || 0) * quantity).toLocaleString()}</span>
                </div>
              );
            })}
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
            Processing order...
          </>
        ) : (
          'Submit Order Request'
        )}
      </Button>
    </form>
  );
};

export default FoodOrderForm;
