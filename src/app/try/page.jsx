'use client'

import { use, useEffect } from "react"




const Page =() => {


    const time=()=>{
        return new Promise((resolve)=>{
            setTimeout(()=>{
                resolve('hello bangladesh')
            },3000) })    

       }


        const fetchData = async () => {
           
      try{
        const res=await fetch('https://jsonplaceholder.typicode.com/postss')
        console.log('fetching data...')
        await time()
        const data=await res.json()
            
      

        return data;
      }
      catch(err){
       return err
      }
   
  
    }
   
    const handleButton=async()=>{
     try{
       const res= await fetchData()
       console.log(res);
       console.log("Data fetched ");
     }
     catch(err){
        console.log(err)
     }

    }
  
    return (
        <div>
           hellos bangladesh 
           <button onClick={handleButton} className="bg-green-100 px-5 py-3 ml-3">click</button>
        </div>
    );
}

export default Page;
