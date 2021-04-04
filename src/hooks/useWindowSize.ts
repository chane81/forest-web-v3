import { useState, useEffect } from 'react';

/** window 사이즈 hooks*/
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  });

  useEffect(() => {
    // 리사이즈 핸들러
    const handleResize = () =>
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });

    // window 에 resize 이벤트 핸들러 등록
    window.addEventListener('resize', handleResize);

    // 처음 로딩시 handleResize 수행
    handleResize();

    // 컴포넌트 해제시 리사이즈 이벤트 핸들러 해제
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export { useWindowSize };
