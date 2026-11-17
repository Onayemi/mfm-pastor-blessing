<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Pricing;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BookingController extends Controller
{
    private function getPrices()
    {
        // $dbPrices = Pricing::all()->pluck('amount', 'key');
        $dbPrices = Pricing::all()->pluck('price', 'group_type');
        return [
            'groups' => [
                'adult'    => $dbPrices['adult'] ?? 15000,
                'teenage'  => $dbPrices['teenage'] ?? 12000,
                'children' => $dbPrices['children'] ?? 10000,
            ],
            'game' => $dbPrices['game'] ?? 1000,
        ];
    }

    public function index(Request $request)
    {
        $query = Booking::with('admin');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('ticket_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('group_type')) {
            $query->where('group_type', $request->input('group_type'));
        }

        if ($request->filled('date')) {
            $query->whereDate('booked_at', $request->input('date'));
        }

        $bookings = $query->latest('booked_at')->paginate(25)->withQueryString();

        return Inertia::render('admin/Booking/Index', [
            'bookings' => $bookings,
            'metrics' => [
                'total_revenue' => Booking::sum('total_price'),
                'daily_revenue' => Booking::whereDate('booked_at', now()->toDateString())->sum('total_price'),
                'total_tickets' => Booking::count(),
            ],
            'filters' => $request->only(['search', 'group_type', 'date']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Booking/Create', [
            'pricing' => $this->getPrices(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'phone_number'  => ['required', 'string', 'max:20'],
            'group_type'    => ['required', 'in:adult,teenage,children'],
            'play_game'     => ['required', 'boolean'],
        ]);

        $pricing = $this->getPrices();
        $basePrice  = $pricing['groups'][$validated['group_type']];
        $gamePrice  = $validated['play_game'] ? $pricing['game'] : 0;
        $totalPrice = $basePrice + $gamePrice;

        $booking = Booking::create([
            'ticket_code' => 'FTB-' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT),
            // 'ticket_code'   => 'FTB-' . strtoupper(Str::random(8)),
            'customer_name' => $validated['customer_name'],
            'phone_number'  => $validated['phone_number'],
            'group_type'    => $validated['group_type'],
            'base_price'    => $basePrice,
            'play_game'     => $validated['play_game'],
            'game_price'    => $gamePrice,
            'total_price'   => $totalPrice,
            'booked_at'     => now(),
            'processed_by'  => auth()->id(),
        ]);

        return redirect()->route('booking.index')->with('success', 'Ticket successfully issued: ' . $booking->ticket_code);
    }

    public function edit(Booking $booking)
    {
        return Inertia::render('admin/Booking/Edit', [
            'booking' => $booking,
            'pricing' => $this->getPrices(),
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'phone_number'  => ['required', 'string', 'max:20'],
            'group_type'    => ['required', 'in:adult,teenage,children'],
            'play_game'     => ['required', 'boolean'],
        ]);

        $pricing = $this->getPrices();
        $basePrice  = $pricing['groups'][$validated['group_type']];
        $gamePrice  = $validated['play_game'] ? $pricing['game'] : 0;
        $totalPrice = $basePrice + $gamePrice;

        $booking->update([
            'customer_name' => $validated['customer_name'],
            'phone_number'  => $validated['phone_number'],
            'group_type'    => $validated['group_type'],
            'base_price'    => $basePrice,
            'play_game'     => $validated['play_game'],
            'game_price'    => $gamePrice,
            'total_price'   => $totalPrice,
        ]);

        return redirect()->route('booking.index')->with('success', 'Ticket updated successfully.');
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return redirect()->route('booking.index')->with('success', 'Ticket deleted successfully.');
    }
}
