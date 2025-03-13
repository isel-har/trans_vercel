
import Image from "next/image"

export default function Chat(){
    return (
        <Image
            src="/simo/4-chat/e.png"
            width={500}
            height={500}
            alt="Picture of the author"
            className="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]"
            loading="lazy"

        />
    )
}