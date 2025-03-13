
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Ta({setFlBl}) {
  return (
    <div className="tabs mb-[25px]">
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2 list">
        <TabsTrigger value="account" className="Text" onClick={() => {
            setFlBl(false);
                  
                  }}>Friends</TabsTrigger>
        <TabsTrigger value="password" className="Text" onClick={() =>{
          setFlBl(true);
        }}>Blocks</TabsTrigger>
      </TabsList>
      </Tabs>

    </div>
      )
}