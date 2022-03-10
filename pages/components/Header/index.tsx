import { useEffect } from 'react'
import {TweenMax, gsap} from 'gsap'
import {FaMailBulk, FaInstagram, FaLinkedinIn, FaTwitter, FaBars } from "react-icons/fa"

const Header = () => {

  useEffect(() => {
    if(typeof document !== "undefined"){
      let logo = document.getElementById('77logo')
      if(logo){
        TweenMax.to(logo, 0, {x:200, y:-500, scale:5, rotate:720, delay:1});
        TweenMax.to(logo, 1.5, {ease: 'Power4.easeOut', x:200, y:400, scale:5, delay:1});
        TweenMax.to(logo, 1, {ease: 'Power4.easeInOut', x:0, y:0, scale:1, delay:2.5, rotate:0});
      }
    }
  }, [])

  const followerCursorHidden = () => {
    if(typeof window !== "undefined"){
      let cursors = document.getElementsByClassName('cursor')
      if(cursors){
        gsap.to(cursors[0], 0.3, {opacity:0, scale:20});
        gsap.to(cursors[1], 0.3, {opacity:0, scale:20});
      }
    }
  }

  const followerCursorShow = () => {
    if(typeof window !== "undefined"){
      let cursors = document.getElementsByClassName('cursor')
      if(cursors){
        gsap.to(cursors[0], 0.3, {opacity:1, scale:1});
        gsap.to(cursors[1], 0.3, {opacity:1, scale:1});
      }
    }
  }

  return (
    <>
      <div id='header' className='fixed top-0 left-0 flex justify-between items-center w-full'>
        <div className='flex justify-between items-center w-full px-8 py-8 text-white mx-auto max-w-[1440px]'>
          <div className='h-auto flex items-center' id='77logo'>
            <button onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}>
              <img src='/images/logos/77WideLogo.png' className='w-[120px] md:w-[170px]'/>
            </button>
          </div>
          <div className='hidden md:block'>
            <button className='mx-3' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}>Home</button>
            <button className='mx-3' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}>Team</button>
            <button className='mx-3' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}>Contact</button>            
          </div>
          <div className='hidden md:block'>
            <button className='mx-2 text-[20px]' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}><FaMailBulk/></button>
            <button className='mx-2 text-[20px]' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}><FaInstagram/></button>
            <button className='mx-2 text-[20px]' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}><FaLinkedinIn/></button> 
            <button className='mx-2 text-[20px]' onMouseEnter={()=>followerCursorHidden()} onMouseLeave={()=>followerCursorShow()}><FaTwitter/></button>            
          </div>
          <div className='md:hidden'>
            <button className='mx-2 text-[20px]'><FaBars/></button>          
          </div>
        </div>
      </div>
    </>
  )
}

export default Header