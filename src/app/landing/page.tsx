import React from 'react'
import Image from 'next/image'

const page = () => {
  return (
    <div id="layout" className="relative flex  justify-center items-center min-h-dvh  h-screen w-full overflow-hidden">
      <div className="relative w-full max-w-3xl mx-auto px-[1rem] sm:px-[2rem] md:px-[3rem] lg:px-[4rem]">
        <Image
          src="/images/landingDog.png"
          alt="imgLanding"
          width={824}
          height={1105}
          className="block relative z-10"
        />
      </div>
      </div>
  )
}

export default page