// "use client";

// import { Camera } from "lucide-react";
// import AppImage from "@/components/ui/AppImage";
// import { DEFAULT_IMAGE } from "@/lib/constants";

// export default function PetAvatarPicker(props: {
//   preview?: string;
//   onPick: (file: File | null, previewUrl: string) => void;
// }) {
//   const { preview, onPick } = props;

//   return (
//     <div className="flex justify-center">
//       <div className="relative">
//         <div className="h-24 w-24 rounded-full bg-white ring-1 ring-black/10 overflow-hidden grid place-items-center">
//           <AppImage src={preview || DEFAULT_IMAGE} alt="pet" className="h-full w-full object-cover" />
//         </div>

//         <label
//           className="
//             absolute -right-1 -bottom-1
//             grid h-9 w-9 place-items-center
//             rounded-full bg-white ring-1 ring-black/20
//             shadow-sm
//             hover:bg-black/5 active:scale-95 transition cursor-pointer
//           "
//           aria-label="อัปโหลดรูป"
//         >
//           <Camera className="h-4 w-4 text-gray-900" />
//           <input
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={(e) => {
//               const f = e.target.files?.[0] || null;
//               if (!f) return onPick(null, "");
//               const url = URL.createObjectURL(f);
//               onPick(f, url);
//             }}
//           />
//         </label>
//       </div>
//     </div>
//   );
// }
