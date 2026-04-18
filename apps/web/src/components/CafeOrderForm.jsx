import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Loader2, AlertCircle, Moon, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { submitBookingRequest } from '@/lib/bookingSubmission';
import { startCheckoutOrShowPending } from '@/lib/paymentCheckout';

const beverageItems = [
  { id: 1, name: 'Chamomile Tea', price: 1200, description: 'Calming herbal tea perfect for evening relaxation', nightMode: true },
  { id: 2, name: 'Espresso', price: 800, description: 'Rich, bold Italian espresso' },
  { id: 3, name: 'Cappuccino', price: 1500, description: 'Classic espresso with steamed milk foam' },
  { id: 4, name: 'Latte', price: 1600, description: 'Smooth espresso with steamed milk' },
  { id: 5, name: 'Green Tea', price: 1000, description: 'Refreshing antioxidant-rich green tea' },
  { id: 6, name: 'Iced Coffee', price: 1400, description: 'Cold brew coffee over ice' }
];

const CafeOrderForm = ({ isGameNight = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [isFridayGameNight, setIsFridayGameNight] = useState(isGameNight);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    allergies: '',
    special_requests: '',
    delivery_type: isGameNight ? 'pickup' : 'pickup',
    board_game_selection: '',
    player_count: 2,
    game_time_slot: '18:00'
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
      const item = beverageItems.find((m) => m.id === parseInt(itemId));
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

      if (isFridayGameNight && calculateTotal() < 3000) {
        toast.error('Friday Game Night requires a minimum order of ₦3,000');
        setLoading(false);
        return;
      }

      if (hasAllergies && !formData.allergies.trim()) {
        toast.error('Please specify your allergies');
        setLoading(false);
        return;
      }

      const orderItems = Object.entries(cart).map(([itemId, quantity]) => {
        const item = beverageItems.find((m) => m.id === parseInt(itemId));
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
        beverage_items: orderItems,
        allergies: hasAllergies ? formData.allergies : 'None',
        special_requests: formData.special_requests || 'None',
        delivery_type: formData.delivery_type,
        order_status: 'pending',
        total_price: totalPrice,
        friday_game_night: isFridayGameNight,
        board_game_selection: isFridayGameNight ? formData.board_game_selection : '',
        player_count: isFridayGameNight ? formData.player_count : null,
        game_time_slot: isFridayGameNight ? formData.game_time_slot : '',
        reserved_table_number: isFridayGameNight ? `TBL-${Math.floor(Math.random() * 20) + 1}` : ''
      };

      const { mode, record } = await submitBookingRequest({
        endpoint: '/bookings/intake',
        payload: {
          bookingType: 'cafe',
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
        productName: isFridayGameNight ? 'Cafe order and game night' : 'Cafe order',
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
        
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Friday Game Night</h4>
              <p className="text-sm text-muted-foreground">Reserve a table for board games (Min order ₦3,000)</p>
            </div>
          </div>
          <Checkbox 
            checked={isFridayGameNight} 
            onCheckedChange={setIsFridayGameNight}
            className="w-6 h-6"
          />
        </div>

        {isFridayGameNight && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-xl border border-border">
            <div>
              <Label htmlFor="board_game_selection">Select Game</Label>
              <Select value={formData.board_game_selection} onValueChange={(value) => setFormData({ ...formData, board_game_selection: value })} required={isFridayGameNight}>
                <SelectTrigger className="mt-1 text-gray-900">
                  <SelectValue placeholder="Choose game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chess">Chess</SelectItem>
                  <SelectItem value="Monopoly">Monopoly</SelectItem>
                  <SelectItem value="Scrabble">Scrabble</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="player_count">Players</Label>
              <Input
                id="player_count"
                type="number"
                min="1"
                max="6"
                value={formData.player_count}
                onChange={(e) => setFormData({ ...formData, player_count: parseInt(e.target.value) || 1 })}
                required={isFridayGameNight}
                className="mt-1 text-gray-900"
              />
            </div>
            <div>
              <Label htmlFor="game_time_slot">Time Slot</Label>
              <Select value={formData.game_time_slot} onValueChange={(value) => setFormData({ ...formData, game_time_slot: value })} required={isFridayGameNight}>
                <SelectTrigger className="mt-1 text-gray-900">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div>
          <h3 className="heading-font text-xl font-semibold mb-4 text-foreground">Select beverages</h3>
          <div className="space-y-3">
            {beverageItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{item.name}</h4>
                    {item.nightMode && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg neon-glow-green">
                        <Moon className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">Night Mode</span>
                      </div>
                    )}
                  </div>
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
              <span className="font-medium text-foreground">I have allergies</span>
            </Label>
            {hasAllergies && (
              <Textarea
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Please specify your allergies (e.g., dairy, nuts)"
                className="mt-2 text-gray-900"
                rows={2}
              />
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="special_requests">Special requests (optional)</Label>
          <Textarea
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="E.g., extra hot, less sugar, oat milk"
            className="mt-1 text-gray-900"
            rows={2}
          />
        </div>

        {!isFridayGameNight && (
          <div>
            <Label>Order option</Label>
            <RadioGroup value={formData.delivery_type} onValueChange={(value) => setFormData({ ...formData, delivery_type: value })} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="font-normal cursor-pointer text-foreground">Delivery to room</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="font-normal cursor-pointer text-foreground">Pickup at cafe</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {Object.keys(cart).length > 0 && (
          <div className="bg-primary/5 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-foreground">Order summary</h4>
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = beverageItems.find((m) => m.id === parseInt(itemId));
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

export default CafeOrderForm;
