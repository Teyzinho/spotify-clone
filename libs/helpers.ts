import { Price } from "@/types";

//Fetch our Url dependendo em que site estiver
export const getURL = () => {
    let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? 
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? //Autimaticamente setado pelo Vercel
    'http://localhost:3000/';

    //Inclui https:// se não tiver
    url = url.includes('http') ? url : `https://${url}`;

    //Adiciona a '/' no final da url se não houver
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    return url;
}

//Fetch Data
export const postData = async ({
    url,
    data
  }: {
    url: string;
    data?: { price: Price };
  }) => {
    console.log('posting,', url, data);
  
    const res: Response = await fetch(url, {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });
  
    if (!res.ok) {
      console.log('Error in postData', { url, data, res });
  
      throw Error(res.statusText);
    }
  
    return res.json();
  };
  
  export const toDateTime = (secs: number) => {
    var t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
    t.setSeconds(secs);
    return t;
  };