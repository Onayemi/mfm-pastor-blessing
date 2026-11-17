import React, { useMemo } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";

type GroupType = "adult" | "teenage" | "children";

interface Booking {
    id: number;
    customer_name: string;
    phone_number?: string;
    group_type: GroupType;
    play_game: boolean;
}

interface Props {
    booking: Booking;
    pricing: {
        groups: Record<GroupType, number>;
        game: number;
    };
}

export default function Edit({ booking, pricing }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        customer_name: booking.customer_name,
        phone_number: booking.phone_number,
        group_type: booking.group_type,
        play_game: booking.play_game,
    });

    const formatNaira = (val: number) =>
        new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(val);

    const calculatedTotal2 = useMemo(() => {
        const base = pricing.groups[data.group_type] ?? 0;
        const game = data.play_game ? pricing.game : 0;
        return base + game;
    }, [data.group_type, data.play_game, pricing]);

    const calculatedTotal = useMemo(() => {
        const base = Number(pricing?.groups?.[data.group_type]) || 0;
        const gameFee = data.play_game ? Number(pricing?.game) || 0 : 0;
        return base + gameFee;
    }, [data.group_type, data.play_game, pricing]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/bookings/${booking.id}`, {
            onSuccess: () => toast.success("Booking updated successfully!"),
            onError: () => toast.error("Please check the form for errors."),
        });
        // put(route("booking.update", booking.id));
    };

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
            <Head
                title={`Edit Ticket #${booking.id} - Pastor Blessing Admin`}
            />

            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8 border border-slate-200">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-red-700">
                            🎅 Edit Ticket #{booking.id}
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Admin Booking Portal
                        </p>
                    </div>
                    <Link
                        href={"/admin/bookings"}
                        // href={route("admin.xmas.index")}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                    >
                        ← Back to List
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Customer Full Name
                        </label>
                        <input
                            type="text"
                            value={data.customer_name}
                            onChange={(e) =>
                                setData("customer_name", e.target.value)
                            }
                            className="w-full rounded-xl border-slate-300 border-2 py-2.5 px-3.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                            required
                        />
                        {errors.customer_name && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Phone Number (optional)
                        </label>
                        <input
                            type="tel"
                            value={data.phone_number}
                            onChange={(e) =>
                                setData("phone_number", e.target.value)
                            }
                            className="w-full rounded-xl border-slate-300 border-2 py-2.5 px-3.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                        />
                        {errors.phone_number && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.phone_number}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Select Group Category
                            </label>
                            <select
                                value={data.group_type}
                                onChange={(e) =>
                                    setData(
                                        "group_type",
                                        e.target.value as GroupType,
                                    )
                                }
                                className="w-full rounded-xl border-slate-300 border-2 py-2.5 px-3.5 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                            >
                                <option value="adult">
                                    Adult — {formatNaira(pricing.groups.adult)}
                                </option>
                                <option value="teenage">
                                    Teenage —{" "}
                                    {formatNaira(pricing.groups.teenage)}
                                </option>
                                <option value="children">
                                    Children —{" "}
                                    {formatNaira(pricing.groups.children)}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Locked Total Price
                            </label>
                            <input
                                type="text"
                                value={formatNaira(calculatedTotal)}
                                readOnly
                                disabled
                                tabIndex={-1}
                                className="w-full rounded-xl border-slate-300 border-2 bg-slate-100 py-2.5 px-3.5 text-slate-800 font-bold text-sm cursor-not-allowed select-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.play_game}
                                onChange={(e) =>
                                    setData("play_game", e.target.checked)
                                }
                                className="h-5 w-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <div>
                                <span className="font-semibold text-slate-800 text-sm block">
                                    Include Game Pass (+
                                    {formatNaira(pricing.game)})
                                </span>
                                <span className="text-xs text-slate-500">
                                    Adds game access fee to the selected group
                                    ticket
                                </span>
                            </div>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-sm"
                    >
                        {processing ? "Saving Changes..." : "Update Booking"}
                    </button>
                </form>
            </div>
        </div>
    );
}
