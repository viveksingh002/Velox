"use client";

import { useEffect, useState } from "react";

export default function BookingList() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/booking")
      .then((res) => res.json())
      .then((res) => setData(res));
  }, []);

  return (
    <div>
      <h2>All Bookings</h2>

      {data.map((item: any, i) => (
        <div key={i} className="border p-2 m-2">
          <p>Pickup: {item.pickup}</p>
          <p>Drop: {item.drop}</p>
          <p>Vehicle: {item.vehicle}</p>
          <p>Price: {item.price}</p>
        </div>
      ))}
    </div>
  );
}