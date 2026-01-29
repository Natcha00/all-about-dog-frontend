'use client';

import { Button } from "@/components/ui/Button"
import {
  Card,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import data from '../data/dataPreviewLanding.json'
import Image from "next/image";
import { useRouter } from "next/navigation";

export function PreviewLanding() {
  const [slides, setSlides] = useState(0)
  const currentSlide = data[slides]
  const router = useRouter()
  const handleClick=()=>{
    if (slides < data.length - 1) {
      setSlides(slides+1)
    }
    else
    router.push("/login")
  }
  
  return (
    <>
    <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[90vh] "><Image src={currentSlide.image} alt="swimming" fill className="object-cover"/></div>
    <Card className="fixed bottom-0 px-12 w-full h-100 rounded-none rounded-t-2xl flex flex-col gap-12 bg-orange-50">
      <div className="flex justify-center gap-4">{data.map((_,index)=>(
        <div className={`h-3 w-3 rounded-md ring-1 ring-black/40 ${slides === index? "bg-cyan-600" : "bg-gray-600"}`} key={index} ></div>
      ))}
      </div>
      <div className="top-20 gap-10 flex flex-col">
        <CardTitle className="text-center text-2xl font-normal">{currentSlide.title}</CardTitle>
        <div className="text-center">{currentSlide.desc}</div>
      </div>
      <div>
        <Button onClick={handleClick} className="bottom-20 w-full bg-yellow-500">
          ต่อไป
        </Button>
      </div>
    </Card>
    </>
  )
}
