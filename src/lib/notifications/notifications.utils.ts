export function timeAgo(iso: string) {
    const t = new Date(iso).getTime();
    const diff = Date.now() - t;
  
    const min = Math.floor(diff / (1000 * 60));
    if (min < 1) return "เมื่อสักครู่";
    if (min < 60) return `${min} นาทีที่แล้ว`;
  
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ชม. ที่แล้ว`;
  
    const day = Math.floor(hr / 24);
    return `${day} วันที่แล้ว`;
  }
  