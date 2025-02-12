import { useEffect, useState } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput"
import { isValidURL } from "../utils"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateProfile } from "../api/DevTreeAPI"
import { SocialNetwork, User } from "../types"

export default function LinkTreeView() {
    const [devTreeLinks, setDevTreeLinks] = useState(social)

    const queryClient = useQueryClient()
    const user: User = queryClient.getQueryData(['user'])!


    const {mutate} = useMutation({
        mutationFn: updateProfile,
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            toast.success('Actualizado correctamente')
        }
    })

    useEffect(() => {
        const updatedData = devTreeLinks.map( item => {
            const userLink = JSON.parse(user.links).find((link : SocialNetwork) => link.name === item.name)
            if(userLink) {
                return { ...item, url: userLink.url, enabled: userLink.enabled }
            }
            return item
        })
        setDevTreeLinks(updatedData)
    },[])

    const handleUrlChange = (e :React.ChangeEvent<HTMLInputElement>) => {
        const updatedLinks = devTreeLinks.map( link => link.name === e.target.name ? {...link, url: e.target.value} : link)
        setDevTreeLinks(updatedLinks)
        
    }

    const links : SocialNetwork[] = JSON.parse(user.links)

    const handleEnableLink = (socialNework: string) => {
        const updatedLinks = devTreeLinks.map( link => {
            if(link.name === socialNework) {
                if(isValidURL(link.url)) {
                    return {...link, enabled: !link.enabled}
                } else {
                    toast.error('URL no válida')
                }
            } 
            return link
        })
        setDevTreeLinks(updatedLinks)

        let updatedItems: SocialNetwork[] = [] 
        const selectedSocialNetwork = updatedLinks.find( link => link.name === socialNework)
        if(selectedSocialNetwork?.enabled) {
            const id = links.filter(link => link.id).length + 1
            if(links.some(link => link.name === socialNework)) {
                updatedItems = links.map( link => {
                    if(link.name === socialNework) {
                        return {
                            ...link,
                            enabled: true,
                            id
                        }
                    } else {
                        return link
                    }
                })
            } else {
                const newItem = {
                    ...selectedSocialNetwork,
                    id
                }
    
                updatedItems = [...links, newItem]
            }
            
        } else {
            const indexToUpdate = links.findIndex(link => link.name === socialNework)
            updatedItems = links.map(link => {
                if(link.name === socialNework) {
                    return {
                        ...link,
                        id: 0,
                        enabled: false
                    }
                } else if( link.id > indexToUpdate && (indexToUpdate !== 0 && link.id ===1 )) {
                    return {
                        ...link,
                        id: link.id - 1
                    }
                } else {
                    return link
                }
            })

        }

        //Almacenar en BD
        queryClient.setQueryData(['user'], (prevData: User) => {
            return {
                ...prevData,
                links: JSON.stringify(updatedItems)
            }
        })
    }
    

    return (
        <div className=" space-y-5">
            {devTreeLinks.map( item => (
                <DevTreeInput 
                    key={item.name}
                    item={item}
                    handleUrlChange={handleUrlChange}
                    handleEnableLink={handleEnableLink}
                />
            ))}

            <button
                type="button"
                className=" bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold"
                onClick={() => mutate(queryClient.getQueryData(['user'])!)}
            >Guardar Cambios</button>
            
        </div>
    )
}
