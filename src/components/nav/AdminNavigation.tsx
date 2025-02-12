import {useQueryClient} from '@tanstack/react-query'
import { toast } from 'sonner'

export default function AdminNavigation() {

    const queryClient = useQueryClient()

    const logout = () => {
        toast.success('Cerrando Sesión...')
        localStorage.removeItem('AUTH_TOKEN')
        queryClient.invalidateQueries({queryKey: ['user']})
    }
    return (
        <button
            className=" bg-lime-500 p-2 text-slate-800 uppercase font-black text-xs rounded-lg cursor-pointer"
            onClick={logout}
        >
            Cerrar Sesión
        </button>
    )
}
