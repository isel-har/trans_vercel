
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function NotiTa({setNtFr}) {
  return (
    <div className="tabs mb-[25px]">
    <Tabs defaultValue="account" className="w-[350px]">
      <TabsList className="grid w-full grid-cols-2 list">
        <TabsTrigger value="account" className="Text" onClick={() => {
            setNtFr(false);
                  }}>Notifications</TabsTrigger>
        <TabsTrigger value="password" className="Text" onClick={() =>{

          setNtFr(true);
        }}>FriendRequests</TabsTrigger>
      </TabsList>
      </Tabs>

    </div>
      )
}