// 1. Create a new file called StarBackground.jsx in your components folder
// components/StarBackground.jsx
"use client";
import React, { useEffect, useState } from "react";

// Function to generate multiple box shadows for stars
function generateBoxShadows(count, maxX, maxY) {
  let shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(", ");
}

export default function StarBackground() {
  // Generate box shadows once when component mounts
  const [boxShadows, setBoxShadows] = useState({
    small: "",
    medium: "",
    big: "",
  });

  useEffect(() => {
    setBoxShadows({
      small: generateBoxShadows(700, 2000, 2000),
      medium: generateBoxShadows(200, 2000, 2000),
      big: generateBoxShadows(100, 2000, 2000),
    });
  }, []);

  return (
    <div className="star-background">
      {/* Small stars */}
      <div
        id="stars"
        style={{
          boxShadow: boxShadows.small,
        }}
      ></div>

      {/* Medium stars */}
      <div
        id="stars2"
        style={{
          boxShadow: boxShadows.medium,
        }}
      ></div>

      {/* Large stars */}
      <div
        id="stars3"
        style={{
          boxShadow: boxShadows.big,
        }}
      ></div>
    </div>
  );
}
