import React, {useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

const Cursor = () => {
  
  useEffect(() => {
    window.addEventListener("pointermove", (event: { clientX: number; clientY: number }) => {
      let cursors = document.getElementsByClassName('cursor')
      if(cursors){        
        let px=event.clientX;
        let py=event.clientY;
        gsap.to(cursors[0], 0.15, {delay:0.0, y:py-5, x:px-5});
        gsap.to(cursors[1], 0.15, {delay:0.15, y:py-25, x:px-25});
      }
    });
  }, []);

  return (
    <>
      <div className='fixed cursor w-[10px] h-[10px] left-0 top-0 bg-[#7cfc00] rounded-full pointer-events-none z-10'/>
      <div className='fixed cursor w-[50px] h-[50px] left-0 top-0 bg-transparent rounded-full border-2 border-[#7cfc00] pointer-events-none z-10'/>
    </>
  );
}

export default Cursor