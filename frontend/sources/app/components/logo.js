import Image from 'next/image'
import "../app_css/global.css"
import { useRouter } from 'next/navigation';

export default function Logo(){
    let router = useRouter()
    return (
            <h1 className='logo cursor-pointer' onClick={() =>{
                router.push("/")
            }}>PINGP <Image
                src="/global/logo.png"
                alt="logo"
                width="50"
                height="50"
                className="imagePadel"
              loading="lazy"

                ></Image>NG</h1>
    );
};