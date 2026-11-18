import React, { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { QRCodeSVG } from "qrcode.react";
import { PenIcon, PrinterIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Can from "@/components/Can";

interface Booking {
    id: number;
    ticket_code: string;
    customer_name: string;
    phone_number: string;
    group_type: string;
    base_price: number;
    play_game: boolean;
    game_price: number;
    total_price: number;
    booked_at: string;
    admin?: { name: string; role: string };
}

interface PaginatedBookings {
    data: Booking[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    bookings: PaginatedBookings;
    metrics: {
        total_revenue: number;
        daily_revenue: number;
        total_tickets: number;
    };
    filters: { search?: string; group_type?: string; date?: string };
    flash?: { success?: string };
}

export default function Index({ bookings, metrics, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [groupType, setGroupType] = useState(filters.group_type || "");
    const [date, setDate] = useState(filters.date || "");
    const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

    const formatNaira = (val: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(val);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            `/admin/bookings`,
            // route("booking.index"),
            { search, group_type: groupType, date },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this ticket?")) {
            router.delete(`/admin/bookings/${id}`, {
                onSuccess: () => toast.success("Ticket deleted successfully!"),
            });
            // router.delete(route("booking.destroy", id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
            <Head title="Admin - Pastor Blessing Bookings" />

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #modal-ticket, #modal-ticket * { visibility: visible; }
                    #modal-ticket { position: absolute; left: 0; top: 0; width: 100%; max-width: 400px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-6">
                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            MFM Pastor Blessing Ticketing Management
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage database bookings, revenue, and ticket
                            prints.
                        </p>
                    </div>
                    <Link
                        href={"/admin/bookings/create"}
                        // href={route("booking.create")}
                        className="w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm shadow transition"
                    >
                        + Issue New Ticket
                    </Link>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold uppercase text-slate-400">
                            Daily Revenue
                        </p>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                            {formatNaira(metrics.daily_revenue)}
                        </p>
                    </div>
                    <Can roles={["superadmin", "admin"]}>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-xs font-bold uppercase text-slate-400">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-extrabold text-slate-900 mt-1">
                                {formatNaira(metrics.total_revenue)}
                            </p>
                        </div>
                    </Can>
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <p className="text-xs font-bold uppercase text-slate-400">
                            Total Tickets
                        </p>
                        <p className="text-2xl font-extrabold text-red-600 mt-1">
                            {metrics.total_tickets}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200">
                    <form
                        onSubmit={handleFilter}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                    >
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Name, phone, code..."
                                className="w-full rounded-lg border-slate-300 text-sm border-2 py-2.5 px-3.5"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Group
                            </label>
                            <select
                                value={groupType}
                                onChange={(e) => setGroupType(e.target.value)}
                                className="w-full rounded-lg border-slate-300 text-sm border-2 py-2.5 px-3.5"
                            >
                                <option value="">All Groups</option>
                                <option value="adult">Adult</option>
                                <option value="teenage">Teenage</option>
                                <option value="children">Children</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-lg border-slate-300 text-sm border-2 py-2.5 px-3.5"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-slate-900 text-white font-medium py-2 px-3 rounded-lg text-sm"
                            >
                                Filter
                            </button>
                            <Link
                                href={"/admin/bookings"}
                                // href={route("booking.index")}
                                className="bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg text-sm text-center flex items-center justify-center"
                            >
                                Reset
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="py-3 px-4">Code</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Phone</th>
                                    <th className="py-3 px-4">Group</th>
                                    <th className="py-3 px-4">Game</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-sm">
                                {bookings.data.length > 0 ? (
                                    bookings.data.map((b) => (
                                        <tr
                                            key={b.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="py-3 px-4 font-mono font-bold text-red-600">
                                                {b.ticket_code}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-900">
                                                {b.customer_name}
                                            </td>
                                            <td className="py-3 px-4 text-slate-600">
                                                {b.phone_number}
                                            </td>
                                            <td className="py-3 px-4 capitalize font-semibold">
                                                {b.group_type}
                                            </td>
                                            <td className="py-3 px-4">
                                                {b.play_game
                                                    ? "✅ Yes"
                                                    : "❌ No"}
                                            </td>
                                            <td className="py-3 px-4 font-bold">
                                                {formatNaira(b.total_price)}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-slate-500">
                                                {new Date(
                                                    b.booked_at,
                                                ).toLocaleString("en-US", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <div className="flex space-x-2 justify-end items-center">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedTicket(b)
                                                        }
                                                        className="text-blue-600 hover:underline text-xs font-semibold"
                                                    >
                                                        <PrinterIcon className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/admin/bookings/${b.id}/edit`}
                                                        className="text-amber-600 hover:underline text-xs font-semibold"
                                                    >
                                                        <PenIcon className="w-4 h-4" />
                                                    </Link>
                                                    <Can
                                                        roles={[
                                                            "superadmin",
                                                            "admin",
                                                        ]}
                                                    >
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    b.id,
                                                                )
                                                            }
                                                            className="text-red-600 hover:underline text-xs font-semibold"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </Can>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="text-center py-8 text-slate-400"
                                        >
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bookings.links && bookings.links.length > 3 && (
                        <div className="p-4 sm:p-5 border-t border-slate-200 flex flex-wrap justify-center gap-1.5 bg-slate-50/50">
                            {bookings.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                                        link.active
                                            ? "bg-red-600 text-white border-red-600 shadow-sm"
                                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                    } ${!link.url ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Print Modal Preview */}
                {selectedTicket && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
                            <div
                                id="modal-ticket"
                                className="border-2 border-dashed border-slate-300 p-5 rounded-xl bg-white text-slate-800"
                            >
                                <div className="text-center border-b pb-3">
                                    <h2 className="font-extrabold text-red-900 uppercase">
                                        <div className="flex space-x-4 items-center justify-center">
                                            <img
                                                src="/images/logo.png"
                                                alt="Pastor Blessing"
                                                className="h-10 w-10 mx-auto"
                                            />
                                            <span>
                                                Pastor Blessing Ticket Pass{""}
                                            </span>
                                        </div>
                                    </h2>
                                    <h4 className="font-extrabold text-black text-sm">
                                        Venue: Open Grounds By Onike Market
                                        Andoyi Street, Onike, Yaba, Lagos
                                    </h4>
                                    <span className="text-xs font-mono font-bold">
                                        Ticket Code:{" "}
                                        {selectedTicket.ticket_code}
                                        {"-"}
                                        {new Date(
                                            selectedTicket.booked_at,
                                        ).getFullYear()}
                                    </span>
                                </div>
                                <div className="py-3 text-xs space-y-1.5 border-b">
                                    <div className="flex justify-between">
                                        <span>Customer:</span>
                                        <span className="font-semibold">
                                            {selectedTicket.customer_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phone:</span>
                                        <span className="font-semibold">
                                            {selectedTicket.phone_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Choice:</span>
                                        <span className="font-semibold capitalize">
                                            {selectedTicket.group_type}{" "}
                                            {selectedTicket.play_game
                                                ? "+ Game"
                                                : ""}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>
                                            {selectedTicket?.booked_at
                                                ? new Date(
                                                      selectedTicket.booked_at,
                                                  ).toLocaleString()
                                                : "N/A"}
                                        </span>
                                        {/* <span>{selectedTicket.booked_at}</span> */}
                                    </div>
                                </div>
                                <div className="py-3 flex justify-between items-center border-b">
                                    <span className="font-bold text-sm">
                                        TOTAL:
                                    </span>
                                    <span className="font-extrabold text-red-700 text-lg">
                                        {formatNaira(
                                            selectedTicket.total_price,
                                        )}
                                    </span>
                                </div>
                                <div className="pt-3 flex flex-col items-center">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            code: selectedTicket.ticket_code,
                                            name: selectedTicket.customer_name,
                                        })}
                                        size={100}
                                        level="H"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 no-print">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold"
                                >
                                    🖨️ Print
                                </button>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="bg-slate-200 text-slate-800 py-2 px-4 rounded-lg text-sm font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
