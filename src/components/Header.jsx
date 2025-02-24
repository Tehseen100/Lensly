import React, { useRef } from 'react'
import { IoSearchOutline } from "react-icons/io5";

const Header = () => {

    const searchInput = useRef(null);

    const searchHandler = () => {
        console.log(searchInput.current.value)
    }
    const handleFilter = (filter) => {
        searchInput.current.value = filter;
    }

    const categories = ["All", "Wallpaper", "Cars", "Cats"];

    return (
        <div>
            <div id="searchbar" className='flex flex-col gap-4 items-center justify-center'>
                <div className=' w-[90%] sm:w-3/4 flex items-center justify-center'>

                    <input
                        ref={searchInput}
                        className="w-full bg-white h-10 flex items-center justify-center text-black border-2 border-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none px-4 py-2 rounded-l-2xl placeholder:text-gray-500"
                        type="text"
                        placeholder="Search..."
                    />
                    <div onClick={searchHandler}
                        className='bg-red-700 text-white h-10 flex items-center justify-center py-1 px-3 text-xl rounded-r-2xl hover:ring-1 hover:ring-red-500 transition duration-300 hover:bg-red-600 cursor-pointer'>
                        < IoSearchOutline />
                    </div>
                </div>
                <div id="btnsContainer" className='flex items-center justify-center gap-3 flex-wrap'>

                    {
                        categories.map((category) => (
                            <button
                                onClick={() => handleFilter(category)}
                                key={category}
                                className='bg-red-700 px-3 py-1 rounded-md cursor-pointer hover:bg-red-600 transition duration-300'>
                                {category}
                            </button>
                        ))
                    }

                </div>

            </div>
        </div >
    )
}

export default Header