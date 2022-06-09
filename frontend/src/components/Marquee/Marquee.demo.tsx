import React from "react"
import Demo from "../Demo/Demo";
import Marquee from "./Marquee";

const MarqueeDemo = () => {
  return <Demo title={"Marquee"}>
    <Marquee>
      {new Array(10).fill(undefined).map((item, index) => <div
        key={`marque-demo-${index}`}>🐛🐛 watch me scroll 🐛🐛</div>)}
    </Marquee>
  </Demo>
}

export default MarqueeDemo
