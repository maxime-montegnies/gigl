import create from 'zustand'
export interface iStateGame {
    blocksCount: number
    phase: string
    start: Function 
    restart: Function 
    end: Function 
    inc: Function 
}
export default create((set) =>
{
    return {
        blocksCount: 3,
        phase: 'ready',

        inc: () =>
        {
            set((state:iStateGame) =>
            {
                return { blocksCount: state.blocksCount+1 }
            })
        },
        start: () =>
        {
            set(() =>
            {
                return { phase: 'playing' }
            })
        },

        restart: () =>
        {
            set(() =>
            {
                return { phase: 'ready' }
            })
        },

        end: () =>
        {
            set(() =>
            {
                return { phase: 'ended' }
            })
        }
    }
})