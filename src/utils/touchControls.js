export const handleTouchStart = (e, setTouchStart) => {
  setTouchStart({
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  });
};

export const handleTouchMove = (e, touchStart, handleSwipe, setTouchStart) => {
  if (!touchStart) return;
  
  const touchEnd = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
  
  const diffX = touchStart.x - touchEnd.x;
  const diffY = touchStart.y - touchEnd.y;
  
  const minSwipeDistance = 30;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
      setTouchStart(null);
    }
  } else {
    if (Math.abs(diffY) > minSwipeDistance) {
      if (diffY > 0) {
        handleSwipe('up');
      } else {
        handleSwipe('down');
      }
      setTouchStart(null);
    }
  }
};

export const handleTouchEnd = (setTouchStart) => {
  setTouchStart(null);
};

