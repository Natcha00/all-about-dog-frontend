import ServiceCards, { ServiceItemProps } from "@/components/ui/boxService";


const services:ServiceItemProps[] = [
    {title:"รับฝากเลี้ยง",icon:"/images/dogHouse.png",path:"/service/boarding/select-pet", type: "boarding"},
    {title:"สระว่ายน้ำ",icon:"/images/swimmingPool.png",path:"/service/swimming/select-pet", type: "swimming"}
]

const histories:ServiceItemProps[] = [
    {title:"ตารางนัด",icon:"/images/calenda.png",path:"/service/schedule",type: "schedule"},
    {title:"ประวัติการใช้",icon:"/images/history.png",path:"/service/history",type: "history"}
]
export default function Service() {

    return(
    <>
        <div>

        <div className="text-center text-2xl font-semibold m-4 text-gray-700"> บริการ </div>
        <ServiceCards items={services}/>
        </div>

        <div className="w-full h-[2px] bg-gray-300 mt-12"></div>

        <div>
        <div className="text-left text-sm font-semibold m-4 text-gray-700"> การนัดหมายและประวัติการใช้บริการ </div>
        <ServiceCards items={histories}/>
        </div>

    </>
    )
}
