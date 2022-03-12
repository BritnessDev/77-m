import React from "react"

const ColorAnimationText = (props:any) => {

  const goContact = () =>{
    const wrapper = document.getElementById('part-contact')
    if (wrapper){
      const offsetY = wrapper.offsetTop
      scroll({top:offsetY, behavior:'smooth'})
    }
  }

  return (
    <div >
      <span className="color-animation-text text-[30px] md:text-[50px] font-bold" style={{fontFamily: "'Iceberg', sans-serif"}}>
        <span>M</span>
        <span>a</span>
        <span>k</span>
        <span>i</span>
        <span>n</span>
        <span>g</span>&nbsp;
        <span>a</span>&nbsp;
        <span>P</span>
        <span>o</span>
        <span>s</span>
        <span>i</span>
        <span>t</span>
        <span>i</span>
        <span>v</span>
        <span>e</span>&nbsp;<br className="lg:hidden"/>
        <span>D</span>
        <span>i</span>
        <span>f</span>
        <span>f</span>
        <span>e</span>
        <span>r</span>
        <span>e</span>
        <span>n</span>
        <span>c</span>
        <span>e</span>&nbsp;
        <span>w</span>
        <span>i</span>
        <span>t</span>
        <span>h</span>&nbsp;<br className="sm:hidden"/>
        <span>I</span>
        <span>n</span>
        <span>t</span>
        <span>e</span>
        <span>g</span>
        <span>r</span>
        <span>i</span>
        <span>t</span>
        <span>y</span>
      </span>
    </div>
  );
};

export default ColorAnimationText;
