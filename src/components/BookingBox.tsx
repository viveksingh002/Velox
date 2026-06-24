"use client";

import { useState } from "react";

export default function BookingBox() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const handleBooking = async () => {
    const res = await fetch("http://localhost:5000/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup,
        drop,
        vehicle: "SUV",
        price: 500,
      }),
    });

    await res.json();
    alert("Booking Done 🚗");
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="bg-white text-black p-6 rounded-xl shadow-lg flex gap-3">
        <input
          className="border p-2"
          placeholder="Pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />

        <input
          className="border p-2"
          placeholder="Drop"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
        />

        <button
          onClick={handleBooking}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book
        </button>
      </div>
    </div>
  );
}