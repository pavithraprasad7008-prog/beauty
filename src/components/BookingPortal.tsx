import React, { useState, useMemo } from 'react';
import { Service, Booking, AppNotification } from '../types';
import { Clock, MapPin, Map, Receipt, CheckCircle, Percent, Sliders, Bell } from 'lucide-react';
import { sendBookingEmail } from '../utils/emailService';

export const SERVICE_HUBS = [
  { 
    id: 'koramangala', 
    name: 'Koramangala', 
    keywords: ['koramangala', 'kormangla', 'ejipura', 'tavarekere', 'madivala', 'madiwala', 'sg palya', 's.g. palya', 'vivek nagar', 'domlur', 'wilson garden', 'adugodi', 'neelasandra', 'shanthi nagar', 'st. johns', 'st johns', 'lakkasandra'], 
    lat: 12.9343, 
    lng: 77.6322 
  },
  { 
    id: 'begur', 
    name: 'Begur', 
    keywords: ['begur', 'begur road', 'devarachikkanahalli', 'akshayanagar', 'akshaya nagar', 'yelenahalli', 'hongasandra', 'hulimavu', 'gottigere', 'basapura', 'nobonagar', 'nobonagar main road'], 
    lat: 12.8797, 
    lng: 77.6253 
  },
  { 
    id: 'hosa_road', 
    name: 'Hosa Road', 
    keywords: ['hosa road', 'hosa_road', 'choodasandra', 'naganathapura', 'rayasandra', 'doddathogur', 'electronic city', 'electronic_city', 'e-city', 'ecity', 'chikka togur', 'pragathi nagar', 'husky forest'], 
    lat: 12.8727, 
    lng: 77.6582 
  },
  { 
    id: 'hsr_layout', 
    name: 'HSR Layout', 
    keywords: ['hsr layout', 'hsr', 'hsr sector', 'agara', 'agara lake', 'mangammanapalya', 'somasundarapalya', 'somasundara palya', 'teachers colony', 'teacher\'s colony', 'venkatapura', 'sector 1', 'sector 2', 'sector 3', 'sector 4', 'sector 5', 'sector 6', 'sector 7'], 
    lat: 12.9116, 
    lng: 77.6388 
  },
  { 
    id: 'harlur_road', 
    name: 'Harlur Road', 
    keywords: ['harlur road', 'harlur', 'kudlu gate', 'kudlu', 'bellandur', 'bellandur gate', 'kaikondrahalli', 'ibblur', 'ibblur lake', 'ambalipura', 'sarjapur road', 'sarjapur_road', 'lakedew residency', 'reliable residency', 'choodasandra road'], 
    lat: 12.9026, 
    lng: 77.6621 
  },
  { 
    id: 'bommanahalli', 
    name: 'Bommanahalli', 
    keywords: ['bommanahalli', 'garvebhavipalya', 'garvebhavi palya', 'roopena agrahara', 'roopena_agrahara', 'bilekahalli', 'kodichikkanahalli', 'kodi chikkanahalli', 'devarachikkanahalli lake', 'silver county'], 
    lat: 12.9030, 
    lng: 77.6242 
  },
  { 
    id: 'kasavanahalli', 
    name: 'Kasavanahalli', 
    keywords: ['kasavanhalli', 'kasavanahalli', 'aecs layout', 'aecs_layout', 'junnasandra', 'carmelaram', 'doddakannelli', 'doddakanneli', 'chikkabellandur', 'chikka bellandur', 'sarjapur wipro', 'wipro gate'], 
    lat: 12.9079, 
    lng: 77.6749 
  },
  { 
    id: 'btm_layout', 
    name: 'BTM Layout', 
    keywords: ['btm layout', 'btm', 'btm 1st stage', 'btm 2nd stage', 'jp nagar', 'j.p. nagar', 'jayanagar', 'gurappanapalya', 'gurappana palya', 'tilak nagar', 'ns palya', 'n.s. palya', 'dollar colony'], 
    lat: 12.9165, 
    lng: 77.6101 
  }
];

export function getHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface CoverageCheckResult {
  isCovered: boolean;
  matchedHubName: string;
  distanceKm: number;
  message: string;
  resolvedCoords: { lat: number; lng: number } | null;
}

export function checkServiceCoverage(addressText: string, gpsCoords: { lat: number; lng: number } | null): CoverageCheckResult {
  const addrLower = addressText.toLowerCase();

  // 1. If GPS coordinates are provided, check physical distance first to see if within 10km of ANY hub
  if (gpsCoords) {
    let closestHub = null;
    let minDistance = Infinity;

    for (const hub of SERVICE_HUBS) {
      const distance = getHaversineDistance(gpsCoords.lat, gpsCoords.lng, hub.lat, hub.lng);
      if (distance < minDistance) {
        minDistance = distance;
        closestHub = hub;
      }
    }

    if (closestHub && minDistance <= 10.0) {
      return {
        isCovered: true,
        matchedHubName: closestHub.name,
        distanceKm: parseFloat(minDistance.toFixed(2)),
        message: `Validated by GPS pin: located ${minDistance.toFixed(1)} km from our ${closestHub.name} active hub.`,
        resolvedCoords: gpsCoords
      };
    }
  }

  // 2. Screening the address for explicitly typed keywords
  for (const hub of SERVICE_HUBS) {
    for (const kw of hub.keywords) {
      if (addrLower.includes(kw)) {
        // Since they typed the key name, they are matching this hub coverage zone.
        const resCoords = gpsCoords || {
          lat: hub.lat + (Math.random() * 0.005 - 0.0025),
          lng: hub.lng + (Math.random() * 0.005 - 0.0025)
        };
        return {
          isCovered: true,
          matchedHubName: hub.name,
          distanceKm: gpsCoords ? parseFloat(getHaversineDistance(gpsCoords.lat, gpsCoords.lng, hub.lat, hub.lng).toFixed(2)) : 0,
          message: `Service address matched with ${hub.name} active hub coverage.`,
          resolvedCoords: resCoords
        };
      }
    }
  }

  // 3. Fallback: if coordinates were matched but distance exceeds 10km from all hubs
  if (gpsCoords) {
    return {
      isCovered: false,
      matchedHubName: '',
      distanceKm: 0,
      message: `The matched GPS location is completely out of range (greater than 10km from any of our 8 authorized service hubs).`,
      resolvedCoords: null
    };
  }

  return {
    isCovered: false,
    matchedHubName: '',
    distanceKm: 0,
    message: `Not covered. Services are exclusively available within a 10km radius of Koramangala, Begur, Hosa Road, HSR Layout, Harlur Road, Bommanahalli, Kasavanahalli, or BTM Layout.`,
    resolvedCoords: null
  };
}

interface BookingPortalProps {
  services: Service[];
  selectedServiceIds: string[];
  onToggleServiceSelection: (id: string) => void;
  onClearCart: () => void;
  existingBookings: Booking[];
  holidays: string[]; // List of YYYY-MM-DD
  onCreateBooking: (newBooking: Booking) => void;
  onAddNotification: (notification: AppNotification) => void;
}

export default function BookingPortal({
  services,
  selectedServiceIds,
  onToggleServiceSelection,
  onClearCart,
  existingBookings,
  holidays,
  onCreateBooking,
  onAddNotification,
}: BookingPortalProps) {
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Geolocation & Manual Pin States
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [bookingDate, setBookingDate] = useState(() => {
    // Default to tomorrow in Indian Standard Time (IST)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const dateStr = formatter.format(new Date());
    const todayIST = new Date(dateStr + 'T00:00:00');
    const tomorrowIST = new Date(todayIST.getTime() + 24 * 60 * 60 * 1000);
    return formatter.format(tomorrowIST);
  });
  const [bookingSlot, setBookingSlot] = useState('');
  const [isNewVisitor, setIsNewVisitor] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState<'Post-Service Cash' | 'Post-Service Card/UPI'>('Post-Service Card/UPI');

  // Push Permission State
  const [pushEnabled, setPushEnabled] = useState(true);

  // Real-time Service Hub Coverage Check
  const coverageCheck = useMemo(() => {
    if (!address && !coords) return null;
    return checkServiceCoverage(address, coords);
  }, [address, coords]);

  // Trigger GPS sharing logic
  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your current browser or device.");
      return;
    }
    setIsSharingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setIsSharingLocation(false);
        
        // Formulate a beautiful India / Bangalore address suggestion from Coordinates
        const updatedAddress = address 
          ? `${address} (📍 Shared GPS Coords: ${latitude.toFixed(5)}, ${longitude.toFixed(5)})` 
          : `Shared Location Pin (📍 Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}), Bengaluru, India`;
        
        setAddress(updatedAddress);

        // Notify client
        onAddNotification({
          id: `gps-auto-${Date.now()}`,
          title: '📍 Live Coordinates Shared',
          message: `Your current physical location has been tagged successfully (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) for the assigned Beautician dispatch.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
          type: 'system',
          read: false
        });
      },
      (error) => {
        setIsSharingLocation(false);
        let msg = "Unable to read coordinates because permission was not granted or was timed out. Please type your home address details manually on the right-hand form.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission request was denied. Please allow location access or type your home address manually on the right-hand form.";
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Check if chosen date is marked as Holiday
  const isDateAHoliday = useMemo(() => {
    return holidays.includes(bookingDate);
  }, [bookingDate, holidays]);

  // Allowed hours 7 AM to 9 PM
  const allTimeSlots = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
    '07:00 PM', '08:00 PM', '09:00 PM'
  ];

  // Map each slot and check if booked already (Limit max 1 slot per therapist)
  const slotAvailability = useMemo(() => {
    const table: { [slot: string]: boolean } = {};
    allTimeSlots.forEach((slot) => {
      // Find database match on selected date and slot
      const isBooked = existingBookings.some(
        (b) => b.date === bookingDate && b.timeSlot === slot && b.status !== 'Cancelled'
      );
      table[slot] = !isBooked;
    });
    return table;
  }, [bookingDate, existingBookings]);

  // Selected Services objects
  const cartServices = useMemo(() => {
    return services.filter((s) => selectedServiceIds.includes(s.id));
  }, [selectedServiceIds, services]);

  // Pricing calculations
  const mathCalculations = useMemo(() => {
    const baseSubtotal = cartServices.reduce((acc, curr) => acc + curr.price, 0);
    const totalMinutes = cartServices.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    // 10% Visitor Discount
    const newVisitorDiscount = isNewVisitor ? Math.round(baseSubtotal * 0.1) : 0;

    // 5% Combo discount if > ₹2000
    const over2000Discount = baseSubtotal > 2000 ? Math.round((baseSubtotal - newVisitorDiscount) * 0.05) : 0;

    const totalDiscount = newVisitorDiscount + over2000Discount;

    // Add GDP Tax (Goods-and-services tax equivalent - 18%) according to price
    const gdpTaxRate = 0.18;
    const netBase = Math.max(0, baseSubtotal - totalDiscount);
    const gdpTaxApplied = Math.round(netBase * gdpTaxRate);

    const grandTotalPrice = netBase + gdpTaxApplied;

    return {
      baseSubtotal,
      totalMinutes,
      newVisitorDiscount,
      over2000Discount,
      totalDiscount,
      gdpTaxApplied,
      grandTotalPrice,
    };
  }, [cartServices, isNewVisitor]);

  // Submit Treatment Form
  const handlePlaceBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartServices.length === 0) {
      alert('Your treatmenet cart is empty. Please select services from the menu first!');
      return;
    }

    if (isDateAHoliday) {
      alert('Selected date is a Salon Holiday! Kindly choose another day.');
      return;
    }

    if (!bookingSlot) {
      alert('Please select a valid time slot for your appointment.');
      return;
    }

    if (!slotAvailability[bookingSlot]) {
      alert('This slot is already booked. Please choose an open timing.');
      return;
    }

    const bookingId = `book-${Date.now().toString().slice(-6)}`;

    // Check service coverage for Bangalore hubs (10km radius of specified locations)
    const coverage = checkServiceCoverage(address, coords);
    if (!coverage.isCovered) {
      alert(`⚠️ Service Unavailable in Your Location!\n\nWe only accept home salon bookings from or within 10km of our 8 active hubs:\n• Koramangala\n• Begur\n• Hosa Road\n• HSR Layout\n• Harlur Road\n• Bommanahalli\n• Kasavanahalli\n• BTM Layout\n\nPlease adjust your booking address or coordinate pin to proceed.`);
      return;
    }

    const finalCoords = coverage.resolvedCoords || undefined;

    const newRecord: Booking = {
      id: bookingId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address || 'Address Shared',
      serviceIds: selectedServiceIds,
      date: bookingDate,
      timeSlot: bookingSlot,
      discountApplied: mathCalculations.totalDiscount,
      gdpTaxApplied: mathCalculations.gdpTaxApplied,
      totalPrice: mathCalculations.grandTotalPrice,
      paymentType,
      notes,
      status: 'Confirmed', // Confirmed instantly
      customerCoords: finalCoords,
    };

    // Construct pre-filled WhatsApp dispatch text containing customer name, phone number, service, date and time
    const servicesText = cartServices.map(s => s.name).join(', ');
    const whatsappMsg = `*New Booking Request (Nice Look Beauty Therapist)*\n\n` +
      `👤 *Customer Name:* ${name}\n` +
      `📞 *Phone Number:* ${phone}\n` +
      `💅 *Service(s):* ${servicesText}\n` +
      `📅 *Date:* ${bookingDate}\n` +
      `⏰ *Time:* ${bookingSlot}\n` +
      `🏡 *Address:* ${address || 'Address Shared'}\n` +
      `📝 *Notes:* ${notes || 'None'}\n` +
      `🏷️ *Total Price:* ₹${mathCalculations.grandTotalPrice}`;

    const whatsappUrl = `https://wa.me/919008024916?text=${encodeURIComponent(whatsappMsg)}`;

    // Create EmailJS custom transactional delivery parcel
    const emailData = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      bookingDate: bookingDate,
      bookingTime: bookingSlot,
      servicesSelected: cartServices.map(s => s.name),
      notes: notes || undefined,
      totalPrice: mathCalculations.grandTotalPrice,
    };

    onCreateBooking(newRecord);

    // Asynchronously dispatch EmailJS request without blocking instant booking response
    sendBookingEmail(emailData).then((res) => {
      if (res.success) {
        onAddNotification({
          id: `notif-email-${Date.now()}`,
          title: '📧 EmailJS Booking Sent!',
          message: `Beautiful! Transactional booking mail successfully generated for pinkyprasad7008@gmail.com with subject "New booking received"!`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
          type: 'booking',
          read: false
        });
      } else {
        onAddNotification({
          id: `notif-email-notice-${Date.now()}`,
          title: '📬 EmailJS Dispatch Guidance',
          message: res.message,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }),
          type: 'system',
          read: false
        });
      }
    }).catch((err) => {
      console.error('EmailJS flow failed:', err);
    });

    // Synchronously open WhatsApp preset message link to +919008024916
    try {
      const waLink = document.createElement('a');
      waLink.href = whatsappUrl;
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      document.body.appendChild(waLink);
      waLink.click();
      document.body.removeChild(waLink);
    } catch (e) {
      console.error('Failed to trigger WhatsApp redirect', e);
    }

    // Reset Form
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setBookingSlot('');
    onClearCart();
    setCoords(null);

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getWhatsAppDraftUrl = () => {
    const servicesText = cartServices.map(s => s.name).join(', ') || 'General Treatment Consultation';
    const draftMsg = `*Inquiry / Custom Booking via Nice Look Online*\n\n` +
      `👤 *Customer Name:* ${name || 'Not provided yet'}\n` +
      `📞 *Phone Number:* ${phone || 'Not provided yet'}\n` +
      `💅 *Service(s):* ${servicesText}\n` +
      `📅 *Date Choice:* ${bookingDate || 'Not selected yet'}\n` +
      `⏰ *Time Slot:* ${bookingSlot || 'Not selected yet'}\n` +
      `🏡 *Address Setup:* ${address || 'Not provided yet'}\n` +
      `📝 *Allergies/Notes:* ${notes || 'None'}\n` +
      `🏷️ *Estimated Total:* ₹${mathCalculations.grandTotalPrice}`;
    return `https://wa.me/919008024916?text=${encodeURIComponent(draftMsg)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="booking-portal">
      
      {/* LEFT: Complete Cart Summary & Pricing */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800/60 pb-4">
            <div>
              <h3 className="text-lg font-serif font-medium text-stone-900 dark:text-stone-100">
                Your Treatment Cart
              </h3>
              <p className="text-xs text-stone-550 dark:text-stone-400">
                {cartServices.length} Luxury choices selected
              </p>
            </div>
            {cartServices.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-mono hover:underline text-sage dark:text-sage-400 cursor-pointer"
              >
                Clear Cart
              </button>
            )}
          </div>

          {cartServices.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="h-8 w-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 dark:text-stone-400 font-serif italic">
                Add beauty services from the Menu to initialize your premium session pricing template.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {cartServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center gap-3 p-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800/30 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#CD7F6D]/20 hover:shadow-xs"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-stone-850 dark:text-stone-200 line-clamp-1">
                        {service.name}
                      </h4>
                      <p className="text-[10px] font-mono text-stone-400 mt-0.5">
                        {service.durationMinutes} mins • {service.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-300">
                        ₹{service.price}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleServiceSelection(service.id)}
                        className="text-stone-400 hover:text-red-500 text-[10px] font-bold cursor-pointer px-1.5"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown Card with gentle luxury scaling */}
              <div className="pricing-card-scale bg-stone-50 dark:bg-stone-950 rounded-2xl p-4.5 border border-stone-100 dark:border-stone-800/50 space-y-3">
                <h4 className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 uppercase tracking-widest flex items-center gap-1">
                  <Receipt className="h-3.5 w-3.5" />
                  Price Summary
                </h4>

                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-350">
                  <div className="flex justify-between">
                    <span>Menu items subtotal</span>
                    <span>₹{mathCalculations.baseSubtotal}</span>
                  </div>

                  {/* 10% Discount */}
                  {isNewVisitor && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span className="flex items-center gap-1 p-0.5 bg-emerald-50 dark:bg-emerald-900/10 rounded">
                        <Percent className="h-3 w-3" />
                        First Visitor Offer (-10%)
                      </span>
                      <span>-₹{mathCalculations.newVisitorDiscount}</span>
                    </div>
                  )}

                  {/* >₹2000 Combo Discount */}
                  {mathCalculations.baseSubtotal > 2000 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span className="flex items-center gap-1 p-0.5 bg-emerald-50 dark:bg-emerald-900/10 rounded">
                        <CheckCircle className="h-3 w-3" />
                        Loyalty treatment combo (-5%)
                      </span>
                      <span>-₹{mathCalculations.over2000Discount}</span>
                    </div>
                  )}

                  {/* Taxes Line */}
                  <div className="flex justify-between text-[11px] text-stone-450 italic">
                    <span>GST &amp; Service GDP Levy (18%)</span>
                    <span>+₹{mathCalculations.gdpTaxApplied}</span>
                  </div>

                  <div className="h-[1px] bg-stone-200 dark:bg-stone-800 my-2" />

                  <div className="flex justify-between items-center text-stone-900 dark:text-stone-100 serif">
                    <span className="font-semibold text-sm">Post-Care Total Payable</span>
                    <span className="text-lg font-bold text-terracotta dark:text-[#E2B79A]">
                      ₹{mathCalculations.grandTotalPrice}
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-stone-500">
                    <span>Estimated Therapist Session time:</span>
                    <span>
                      {Math.floor(mathCalculations.totalMinutes / 60)}h {mathCalculations.totalMinutes % 60}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE COVERAGE MAP PANEL */}
        <div className="bg-white dark:bg-stone-900 border border-[#EAE2D5] dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-sage" />
            <h3 className="text-md serif font-medium text-stone-900 dark:text-stone-100">
              Interactive Coverage Map
            </h3>
          </div>
          
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Verify coverage in your neighborhood or locate your specific dispatch point below. Share your live coordinates so our beautician can navigate straight to your doorstep without delay.
          </p>

          <button
            type="button"
            onClick={shareLocation}
            disabled={isSharingLocation}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold tracking-wider text-center border transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSharingLocation
                ? 'bg-stone-100 dark:bg-stone-950 text-stone-400 border-stone-200 dark:border-stone-800 cursor-wait'
                : 'bg-sage border-sage text-white hover:bg-sage-600 shadow-sm'
            }`}
          >
            {isSharingLocation ? (
              <>
                <div className="h-3 w-3 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                FETCHING LIVE GPS COORDINATES...
              </>
            ) : (
              <>
                📍 USE MY CURRENT LOCATION TO PIN MAP
              </>
            )}
          </button>

          {/* Map canvas simulation */}
          <div className="relative h-48 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-amber-900/10 overflow-hidden flex items-center justify-center">
            {/* Grid background simulation resembling a stylized minimalist map */}
            <div className="absolute inset-0 bg-stone-200 dark:bg-stone-950 opacity-25 grid grid-cols-6 grid-rows-4 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border-r border-b border-stone-300 dark:border-stone-800" />
              ))}
            </div>

            {/* Simulated green parks and cream-colored roads */}
            <div className="absolute top-10 left-4 w-16 h-8 bg-emerald-100/30 dark:bg-emerald-950/20 rounded-full blur-sm pointer-events-none" />
            <div className="absolute bottom-6 right-12 w-24 h-12 bg-emerald-100/30 dark:bg-emerald-955/20 rounded-full blur-sm pointer-events-none" />
            
            {/* Styled map roads */}
            <div className="absolute w-[2px] h-full bg-white dark:bg-stone-900/45 left-1/3 opacity-80 pointer-events-none" />
            <div className="absolute h-[2px] w-full bg-white dark:bg-stone-900/45 top-1/2 opacity-80 pointer-events-none" />
            <div className="absolute w-[2px] h-full bg-white dark:bg-stone-900/45 right-1/4 rotate-12 opacity-80 pointer-events-none" />

            {/* Marker rendering based on location-sharing / address typing status */}
            {coords || address ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 select-none">
                {/* Visual bouncing map pin representing customer */}
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-sage/30 rounded-full animate-ping pointer-events-none" />
                  <div className="bg-sage text-white rounded-full p-2.5 shadow-md relative">
                    <MapPin className="h-5 w-5 animate-pulse" />
                  </div>
                </div>
                
                {/* Floating summary of verified address */}
                <div className="mt-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur border border-stone-200 dark:border-stone-850 rounded-xl px-3 py-2 shadow-lg max-w-[90%] pointer-events-none animate-fadeIn">
                  <p className="text-[10px] font-mono font-bold text-stone-800 dark:text-stone-100 truncate">
                    📍 LOCATED ON COVERAGE MAP
                  </p>
                  <p className="text-[9px] text-stone-450 dark:text-stone-400 mt-0.5 line-clamp-1 italic">
                    "{address || 'Current Shared Coordinates'}"
                  </p>
                  {coords && (
                    <p className="text-[8px] font-mono text-sage dark:text-sage-300 font-bold mt-0.5">
                      Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-4 z-10 space-y-1.5 pointer-events-none">
                <div className="bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur border border-stone-200 dark:border-stone-800 p-3 rounded-2xl inline-block shadow-sm">
                  <MapPin className="h-6 w-6 text-stone-400 mx-auto animate-bounce" />
                </div>
                <p className="text-[11px] font-mono font-bold text-stone-600 dark:text-stone-400">
                  Coverage Map Standby
                </p>
                <p className="text-[10px] text-stone-450 dark:text-stone-500 max-w-xs mx-auto">
                  Type your address manually or share GPS to view active beautician coordination.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Booking Scheduler & Form Details */}
      <div className="lg:col-span-7">
        <form onSubmit={handlePlaceBooking} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-medium text-stone-900 dark:text-stone-100">
                  Scheduler &amp; Client Details
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Fill and submit the appointment booking sheet below. Note: Payment is payable after the customer receives the services.
                </p>
              </div>
              <div className="bg-[#FAF1EC] dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 rounded-2xl p-2.5 text-left sm:text-right shrink-0">
                <p className="text-[10px] font-mono leading-none text-[#CD7F6D] dark:text-[#E2B79A] uppercase tracking-wider font-semibold">
                  Appointment Desk
                </p>
                <p className="text-[13px] font-mono font-bold text-stone-800 dark:text-stone-100 mt-1">
                  📞 9008024916
                </p>
              </div>
            </div>
          </div>

          {/* ⚡ DIRECT WHATSAPP INSTANT ACTION BANNER */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/25 dark:border-emerald-500/15 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fadeIn">
            <div className="flex gap-3.5 items-start">
              <div className="bg-emerald-500 text-white p-2.5 rounded-xl shrink-0 shadow-sm mt-0.5">
                <svg className="h-5.5 w-5.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.627 0-12 5.373-12 12 0 2.112.546 4.148 1.587 5.946l-1.587 6.054 6.163-1.587c1.787 1.029 3.821 1.587 5.837 1.587 6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 1.644c5.71 0 10.356 4.646 10.356 10.356 0 2.373-.807 4.613-2.274 6.309l-.155.177 1.398 3.633-3.621-.991-.177.155c-1.696 1.467-3.936 2.274-6.309 2.274-5.71 0-10.356-4.646-10.356-10.356 0-2.373.807-4.613 2.274-6.309l.155-.177-1.398-3.633 3.621.991.177-.155c1.696-1.467 3.936-2.274 6.309-2.274zm-2.834 4.542c-.221-.008-.431-.004-.619.004-.155.009-.431.066-.658.309l-.456.456c-.765.765-.765 2.01 0 2.775.122.122.387.414.78.807 1.001 1.001 2.203 2.203 3.204 3.204.393.393.685.658.807.78.365.365.867.574 1.387.574.52 0 1.022-.209 1.387-.574l.456-.456c.243-.243.3-.508.309-.658.008-.188.012-.398.004-.619-.009-.155-.066-.431-.309-.658l-.907-.907c-.155-.155-.387-.221-.619-.204s-.423.111-.57.258l-.133.133c-.155.155-.376.19-.575.088a5.53 5.53 0 01-1.549-1.221c-.482-.482-.871-1.027-1.221-1.549-.102-.199-.067-.42.088-.575l.133-.133c.148-.148.241-.338.258-.57s-.049-.464-.204-.619l-.907-.907c-.155-.155-.387-.221-.619-.204z"/>
                </svg>
              </div>
              <div className="space-y-0.5 animate-fadeIn">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 leading-snug">
                  Need Quick Direct Booking or Inquiry?
                </p>
                <p className="text-[11px] text-stone-605 dark:text-stone-400 leading-relaxed font-sans mt-0.5">
                  No form steps, no hassle! Chat directly with <strong>Beautician Pinky Prasad</strong> to share custom style references, address coordinates, or lock a priority home appointment.
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/919008024916?text=Hello+Pinky%21+I+am+on+the+Nice+Look+Booking+desk+and+would+like+to+discuss+booking+a+home+beauty+treatment."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-mono font-extrabold tracking-widest rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer box-border"
              id="whatsapp-direct-top-consult"
            >
              💬 CHAT &amp; ENQUIRY
            </a>
          </div>

          {/* Form rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                id="booking-name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                WhatsApp / Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 99000 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                id="booking-phone"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                Personal Email *
              </label>
              <input
                type="email"
                required
                placeholder="receive receipt confirmation copy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                id="booking-email"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 animate-fadeIn">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 flex flex-col gap-1">
                <span>Home Booking Address * (Type manually or locate on coverage map)</span>
                <span className="text-[10px] text-stone-450 dark:text-stone-500 font-normal leading-normal">
                  Our professional therapist dispatch is restricted <strong>only</strong> to these 8 designated Bangalore hubs and their surrounding 10km radius: <em>Koramangala, Begur, Hosa Road, HSR Layout, Harlur Road, Bommanahalli, Kasavanahalli, BTM Layout</em>.
                </span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Type your address details manually (include your hub neighborhood name e.g. 'HSR Layout' or 'Koramangala 4th Block')"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                id="booking-address"
              />
              {/* Dynamic Service Coverage Verification feedback */}
              {coverageCheck && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fadeIn transition-all duration-300 ${
                  coverageCheck.isCovered
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-450'
                    : 'bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400'
                }`}>
                  <div className="flex gap-2.5 items-start">
                    <span className="text-sm select-none leading-none mt-0.5">{coverageCheck.isCovered ? '🟢' : '❌'}</span>
                    <div>
                      <p className="font-bold uppercase tracking-wider font-mono text-[9px] leading-tight">
                        {coverageCheck.isCovered ? 'Home Salon Coverage Verified' : 'Outside Active Service Radius'}
                      </p>
                      <p className="mt-1 text-[11px]">
                        {coverageCheck.message}
                      </p>
                      {coverageCheck.isCovered && coverageCheck.matchedHubName && (
                        <p className="text-[10px] font-mono mt-1 font-bold text-[#CD7F6D] dark:text-[#E2B79A]">
                          📍 Assigned Dispatch Point: {coverageCheck.matchedHubName} Hub
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-stone-200 dark:bg-stone-800" />

          {/* DATE & TIME SCHEDULING SECTION */}
          <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 uppercase tracking-widest">
              📅 Appointment Lock-In Room
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  min={(() => {
                    const options: Intl.DateTimeFormatOptions = {
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    };
                    const formatter = new Intl.DateTimeFormat('en-CA', options);
                    return formatter.format(new Date());
                  })()}
                  value={bookingDate}
                  onChange={(e) => {
                    setBookingDate(e.target.value);
                    setBookingSlot(''); // Reset slot choice when date alters
                  }}
                  className="w-full px-4 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                  id="booking-date"
                />
              </div>

              {/* Holiday Alert Panel */}
              <div className="flex items-center">
                {isDateAHoliday ? (
                  <div className="bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-950 text-red-700 dark:text-red-400 text-xs p-3 rounded-xl w-full">
                    ⚠️ <strong>HOLIDAY OBSERVED!</strong>
                    <p className="mt-1 text-[11px] leading-snug">
                      Our therapists are off on vacation. Customer bookings are disabled for this complete date. Please try another day!
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-400 text-xs p-3 rounded-xl w-full">
                    ✅ <strong>THERAPISTS ACTIVE!</strong>
                    <p className="mt-1 text-[11px] leading-snug">
                      Active slots between 7:00 AM and 9:00 PM are fully available for your custom treatment combo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timings Grid (morning 7 AM to 9 PM) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                Hourly Booking Timings Selection (Strict Single Seats Only)
              </label>

              {isDateAHoliday ? (
                <div className="text-center py-6 text-xs text-stone-500 dark:text-stone-400 italic">
                  No slots available because this date is a marked Holiday.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {allTimeSlots.map((slot) => {
                    const isAvailable = slotAvailability[slot];
                    const isChosen = bookingSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setBookingSlot(slot)}
                        className={`text-xs py-2 px-1.5 font-semibold font-mono rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                          !isAvailable
                            ? 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400 cursor-not-allowed line-through'
                            : isChosen
                            ? 'bg-[#CD7F6D] border-[#CD7F6D] text-white shadow-md scale-[1.03]'
                            : 'bg-white dark:bg-stone-900 border border-[#ECE0DA] dark:border-stone-805 text-stone-800 dark:text-stone-200 hover:border-[#CD7F6D] hover:bg-[#FAF1EC]/40 hover:scale-[1.02] luxury-btn-glow'
                        }`}
                        id={`slot-${slot.replace(/\s/g, '-')}`}
                      >
                        {slot}
                        {!isAvailable && <span className="block text-[9px] font-sans font-normal">Booked</span>}
                        {isAvailable && isChosen && <span className="block text-[9px] font-sans font-normal">Chosen</span>}
                        {isAvailable && !isChosen && <span className="block text-[9px] font-sans font-normal text-emerald-600 dark:text-emerald-400">Open</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* NEW VISITOR / PAYMENT / NOTES PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex items-start gap-3">
              <input
                type="checkbox"
                id="is-new-visitor"
                checked={isNewVisitor}
                onChange={(e) => setIsNewVisitor(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 dark:border-stone-800 text-sage focus:ring-sage cursor-pointer"
              />
              <div>
                <label htmlFor="is-new-visitor" className="text-xs font-bold text-stone-800 dark:text-stone-200 cursor-pointer flex items-center gap-1.5">
                  🎟 First-Time Customer Offer
                </label>
                <p className="text-[11px] text-stone-500 mt-1">
                  Check this box if you are a new visitor of Nice Look! Gives you a flat **10% OFF** discount instantly on your treatment sheet.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                Post-Service Payment Choice
              </label>
              <select
                value={paymentType}
                onChange={(e: any) => setPaymentType(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage text-stone-800 dark:text-stone-200"
                id="booking-payment-type"
              >
                <option value="Post-Service Card/UPI">Post-Service UPI Scanner / Debit Card</option>
                <option value="Post-Service Cash">Post-Service Cash Payment</option>
              </select>
              <p className="text-[10px] text-stone-400 italic">
                *Booking holds for ₹0 today. Pay our expert directly after receiving services safely.
              </p>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                Therapist Notes / Custom Style Preferences (Optional)
              </label>
              <input
                type="text"
                placeholder="Mention allergies, pressure preferences, skin triggers etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none text-stone-800 dark:text-stone-200"
                id="booking-notes"
              />
            </div>
          </div>

          {/* WEBPUSH NOTIFICATION ENABLEMENT TOGGLE */}
          <div className="p-4 bg-sage/10 border border-sage/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="h-4.5 w-4.5 text-sage animate-swing" />
              <div>
                <p className="text-xs font-bold text-stone-800 dark:text-sage-300">
                  Simulated In-App Live Push Alerts
                </p>
                <p className="text-[10px] text-stone-500">
                  Receive live alerts, upcoming therapist reminders, and hot promotional events.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPushEnabled(!pushEnabled)}
              className={`p-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer ${
                pushEnabled ? 'bg-sage text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600'
              }`}
            >
              {pushEnabled ? 'Alerts On' : 'Alerts Blocked'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="luxury-btn-glow flex-[5] py-4 text-xs font-extrabold font-mono tracking-widest text-center bg-[#CD7F6D] hover:bg-[#B06351] text-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer uppercase"
              id="submit-booking-action"
            >
              ⭐ CONFIRM APPOINTMENT &amp; LOCK SEAT (₹{mathCalculations.grandTotalPrice})
            </button>

            <a
              href={getWhatsAppDraftUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[4] py-4 text-xs font-bold font-mono tracking-widest text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer uppercase flex items-center justify-center gap-1.5"
              id="submit-whatsapp-booking-draft"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.005 5.319 5.324.001 11.859.001c3.168.001 6.147 1.234 8.39 3.477 2.243 2.243 3.473 5.225 3.471 8.392-.004 6.538-5.323 11.855-11.858 11.855-2.007-.001-3.982-.511-5.741-1.48L0 24zm6.59-4.846c1.666.988 3.311 1.485 5.253 1.486 5.513 0 10.002-4.489 10.005-10.002.002-2.67-1.037-5.18-2.92-7.065C17.001 1.686 14.5 1.644 11.856 1.644c-5.517 0-10.006 4.489-10.01 10.003-.001 1.841.482 3.633 1.398 5.217l-.991 3.621 3.804-.987zm11.387-5.068c-.265-.133-1.564-.772-1.808-.86-.243-.088-.419-.133-.596.133-.176.265-.684.86-.838 1.037-.154.177-.309.199-.575.066-.265-.133-1.12-.413-2.133-1.317-.788-.702-1.32-1.569-1.474-1.834-.155-.265-.017-.409.116-.541.12-.119.265-.309.398-.464.133-.155.177-.265.265-.442.088-.176.044-.331-.022-.464-.066-.133-.596-1.436-.817-1.967-.215-.518-.431-.448-.596-.456l-.508-.009c-.177 0-.464.066-.707.331-.243.265-.928.905-.928 2.21 0 1.303.95 2.562 1.082 2.739.133.177 1.87 2.854 4.53 4.002.633.273 1.127.436 1.512.559.635.202 1.212.174 1.669.107.51-.077 1.564-.64 1.785-1.258.221-.619.221-1.15.154-1.258-.066-.109-.243-.177-.508-.309z"/>
              </svg>
              <span>💬 QUICK WhatsApp BOOK</span>
            </a>
          </div>

          {/* Assigned Beautician Quick Info Panel */}
          <div className="bg-[#FAF1EC] dark:bg-stone-950 border border-[#ECE0DA] dark:border-stone-850 rounded-2xl p-4 text-xs space-y-1.5 mt-4">
            <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
              📞 Assigned Beautician Support Line: <span className="font-mono text-[#CD7F6D] dark:text-[#E2B79A] font-bold bg-[#FCF6F3]/50 dark:bg-stone-900/40 px-2 py-0.5 rounded border border-[#ECE0DA]/40">+91 9008024916</span>
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
              Upon session lock-in, please save the phone number (+91 9008024916) of Beautician Support. Feel free to directly reach out or ping on WhatsApp for route updates or timings rescheduling.
            </p>
          </div>
        </form>
      </div>

    </div>
  );
}
