"use client"

//npm i query-string
import qs from "query-string"

import useDebounce from "@/hooks/useDebounce";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react";
import Input from "./Input";


const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState<string>("");
    const deboncedValue = useDebounce<string>(value, 500);

    //Função que muda a url de acordo com a pesquisa
    useEffect(() => {
      const query = {
        title: deboncedValue,
      }
      const url = qs.stringifyUrl({
        url: '/search',
        query: query
      })

      router.push(url)

    }, [deboncedValue , router])
    

  return (
    <Input 
        placeholder="Oque você quer ouvir?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
  )
}

export default SearchInput