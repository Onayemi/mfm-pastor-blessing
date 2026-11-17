<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {
        // KPI Metrics
        $totalRevenue = Booking::sum('total_price');
        $dailyRevenue = Booking::whereDate('booked_at', now()->toDateString())->sum('total_price');
        $totalTickets = Booking::count();

        // Category Breakdown (Adult, Teenage, Children)
        $categoryCounts = [
            'adult' => Booking::where('group_type', 'adult')->count(),
            'teenage' => Booking::where('group_type', 'teenage')->count(),
            'children' => Booking::where('group_type', 'children')->count(),
        ];

        // 7-Day Revenue Trend for Line Chart
        $revenueTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $sum = Booking::whereDate('booked_at', $date->toDateString())->sum('total_price');
            $revenueTrend[] = [
                'date' => $date->format('M j'),
                'revenue' => (float) $sum,
            ];
        }

        // Recent Bookings
        $recentBookings = Booking::with('admin')
            ->latest('booked_at')
            ->take(6)
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => [
                'total_revenue' => $totalRevenue,
                'daily_revenue' => $dailyRevenue,
                'total_tickets' => $totalTickets,
            ],
            'categoryCounts' => $categoryCounts,
            'revenueTrend' => $revenueTrend,
            'recentBookings' => $recentBookings,
        ]);
    }
}
