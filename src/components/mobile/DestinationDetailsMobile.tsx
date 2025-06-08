'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Typography, Divider, List, ListItem, ListItemText } from '@mui/material';

export default function BottomSheet() {
  const MIN_HEIGHT = 100; // peek height visible when sheet "closed"
  const MAX_HEIGHT = typeof window !== 'undefined' ? window.innerHeight - 100 : 700;

  // Initial translateY to show peek height:
  // translateY = MAX_HEIGHT - MIN_HEIGHT means sheet is pulled down, only MIN_HEIGHT visible
  const y = useMotionValue(MAX_HEIGHT - MIN_HEIGHT);
  const [isDragging, setDragging] = useState(false);

  // Clamp y between 0 (fully opened) and maxTranslateY (closed)
  const maxTranslateY = MAX_HEIGHT - MIN_HEIGHT;

  // On drag end, snap y to 0 (open) or maxTranslateY (closed)
  const handleDragEnd = (_: any, info: { velocity: { y: number } }) => {
    const velocity = info.velocity.y;
    const current = y.get();

    let target = maxTranslateY;

    if (velocity < -500) {
      // Fast upward swipe → open full
      target = 0;
    } else if (velocity > 500) {
      // Fast downward swipe → close
      target = maxTranslateY;
    } else {
      // Snap to closest (open or closed)
      target = current < maxTranslateY / 2 ? 0 : maxTranslateY;
    }

    animate(y, target, { type: 'spring', bounce: 0.2 });
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: maxTranslateY }}
      dragElastic={0.1}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: MAX_HEIGHT,
        y,
        touchAction: 'none',
      }}
      onDragStart={() => setDragging(true)}
      onDragEnd={(e, info) => {
        setDragging(false);
        handleDragEnd(e, info);
      }}
      className="bg-white rounded-t-2xl shadow-lg z-50 flex flex-col"
    >
      {/* Drag handle */}
      <div className="p-3 flex justify-center">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-5">
        <Typography variant="h6" component="h3" className="mb-1">
          Nearby Places
        </Typography>
        <Divider />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <List>
          {Array.from({ length: 30 }).map((_, i) => (
            <ListItem key={i} divider>
              <ListItemText primary={`Place ${i + 1}`} secondary="Description here" />
            </ListItem>
          ))}
        </List>
      </div>
    </motion.div>
  );
}
