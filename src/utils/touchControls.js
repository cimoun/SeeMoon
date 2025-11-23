export const handleTouchStart = (e, setTouchStart) => {
  setTouchStart({
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
    time: Date.now()
  });
};

export const handleTouchMove = (e, touchStart, handleSwipe, setTouchStart) => {
  if (!touchStart) return;
  
  const touchCurrent = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
  
  const diffX = touchStart.x - touchCurrent.x;
  const diffY = touchStart.y - touchCurrent.y;
  
  const minSwipeDistance = 25;
  const maxSwipeTime = 300;
  const swipeTime = Date.now() - touchStart.time;
  
  if (swipeTime > maxSwipeTime) {
    setTouchStart(null);
    return;
  }
  
  const absX = Math.abs(diffX);
  const absY = Math.abs(diffY);
  
  if (absX > minSwipeDistance || absY > minSwipeDistance) {
    if (absX > absY) {
      if (diffX > 0) {
        handleSwipe('left');
      } else {
        handleSwipe('right');
      }
      setTouchStart(null);
    } else {
      if (diffY > 0) {
        handleSwipe('up');
      } else {
        handleSwipe('down');
      }
      setTouchStart(null);
    }
  }
};

export const handleTouchEnd = (touchStart, handleSwipe, setTouchStart) => {
  if (!touchStart) return;
  
  const swipeTime = Date.now() - touchStart.time;
  const minSwipeTime = 50;
  
  if (swipeTime < minSwipeTime) {
    setTouchStart(null);
    return;
  }
  
  setTouchStart(null);
};
