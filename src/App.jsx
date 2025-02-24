import React, { useEffect, useRef, useState } from 'react'
import Logo from './components/logo'
import { IoSearchOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { FaDownload } from "react-icons/fa";
import axios from 'axios';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGES_PER_PAGE = 20;

const App = () => {
  const [query, setQuery] = useState("nature");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch Images 
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}?query=${query}&page=${page}&per_page=${IMAGES_PER_PAGE}&client_id=${import.meta.env.VITE_API_KEY}`);
        console.log('response', response.data);
        setImages(response.data.results);
        setTotalPages(response.data.total_pages)
      } catch (error) {
        console.error('Error fetching images:', error);
      }
      setLoading(false);
    }
    fetchImages();
  }, [query, page]);

  // Search Query 
  const searchInput = useRef(null);
  const searchHandler = () => {
    const trimmmedQuery = searchInput.current.value.trim();
    if (!trimmmedQuery) return;
    setPage(1)
    setQuery(trimmmedQuery);
  };

  // Filter Images 
  const handleFilter = (filter) => {
    searchInput.current.value = filter;
    setPage(1)
    setQuery(filter);
  }

  // Filter Images Btns 
  const categories = ["All", "Wallpaper", "Cars", "Cats"];

  // Close Modal Function 
  const closeModal = () => {
    setSelectedImage(null);
  }

  // Download Function 
  const downloadImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'download-image.jpeg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  }

  return (
    <div className='bg-[#021526] text-white w-full  min-h-screen'>

      {/* Logo  */}
      <Logo />

      {/* Search & Filter  */}
      <div id="searchbar" className='flex flex-col gap-4 items-center justify-center'>
        <div className=' w-[90%] sm:w-3/4 flex items-center justify-center'>

          <input
            ref={searchInput}
            className="w-full bg-white h-10 flex items-center justify-center text-black border-2 border-red-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none px-4 py-2 rounded-l-2xl placeholder:text-gray-500"
            type="text"
            placeholder="Search..."
            onKeyDown={(e) => e.key === 'Enter' && searchHandler()}
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

      {/* Images Container  */}
      {loading ? (
        <div className="flex justify-center items-center mt-7">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-700 border-t-transparent"></div>
        </div>
      ) : images.length === 0 ? (
        // No Images Found Message
        <div className="text-center text-gray-400 mt-7 text-lg">
          No images found. Try a different search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-2 py-4">
            {images.map((image) => (
              <div key={image.id} onClick={() => setSelectedImage(image.urls.regular)} className="relative h-[300px] overflow-hidden rounded-lg shadow-md">
                <img
                  src={image.urls.small}
                  alt={image.alt_description || "Image"}
                  className="w-full h-full object-cover"
                />

              </div>
            ))}

          </div>

          {/* Full Screen Modal  */}
          {selectedImage &&
            <div
              className="fixed inset-0 bg-[#021526] bg-opacity-80 flex justify-center items-center z-50"
              onClick={closeModal}
            >
              <div
                className='relative'
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={(e) => e.stopPropagation()}
              >
                <img src={selectedImage} alt="Image" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg" />

                {isHovered && (<button
                  className='absolute top-4 right-4 text-red-700 bg-black w-10 h-10 flex items-center justify-center rounded-full text-2xl cursor-pointer hover:text-red-500 transition duration-300'
                  onClick={closeModal}><IoClose /></button>)}

                {
                  isHovered && (<div className='flex items-center justify-center gap-4 absolute bottom-4 right-4'>
                    <button
                      onClick={() => downloadImage(selectedImage)}
                      className=' text-red-700 bg-black w-10 h-10 flex items-center justify-center rounded-full text-lg cursor-pointer hover:text-red-500 transition duration-300'>
                      <FaDownload />
                    </button>

                    {/* import { FaShareSquare } from "react-icons/fa"; */}
                    {/* <button
                       onClick={() => {
                        navigator.clipboard.writeText(selectedImage);}}
                      className=' text-red-700 bg-black w-10 h-10 flex items-center justify-center rounded-full text-lg cursor-pointer hover:text-red-500 transition duration-300'>
                      <FaShareSquare />
                    </button> */}

                  </div>)
                }

              </div>

            </div>
          }

          {/* Pagination  */}
          <div id="pagination" className='w-full flex items-center justify-center gap-4 pb-5 pt-3'>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`px-3 py-2 cursor-pointer rounded-sm transition duration-200 ${page === 1 ? "bg-gray-500 cursor-not-allowed" : "bg-red-700 hover:bg-red-600"}`}
            >
              Previous
            </button>
            <span>{`Page ${page} of ${totalPages}`}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className={`px-3 py-2 cursor-pointer rounded-sm transition duration-200 ${page >= totalPages ? "bg-gray-500 cursor-not-allowed" : "bg-red-700 hover:bg-red-600"}`}
            >
              Next
            </button>
          </div>

        </>
      )}

    </div>
  )
}

export default App