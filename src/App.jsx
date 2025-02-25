import React, { useEffect, useRef, useState } from 'react'
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

  // Open Modal & Update Browser History
  const openModal = (image) => {
    setSelectedImage(image);
    window.history.pushState({ modalOpen: true }, ""); // Add history entry
  };

  // Close Modal & Handle Back Button
  const closeModal = () => {
    setSelectedImage(null);
    window.history.back(); // Remove history entry
  };

  useEffect(() => {
    const handleBack = () => {
      setSelectedImage(null);
    };

    window.addEventListener("popstate", handleBack);
    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  // Download Function 
  const downloadImage = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Extract file extension from URL (default to jpg)
      const fileExtension = imageUrl.split('.').pop().split('?')[0] || "jpg";

      // Final filename (use image name if available, else generate a unique name)
      const finalFileName = imageName
        ? `${imageName.replace(/\s+/g, "_")}.${fileExtension}`
        : `unsplash_image_${new Date().getTime()}.${fileExtension}`;

      // Create a temporary <a> tag for download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = finalFileName;

      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };



  return (
    <div className='bg-[#021526] text-white w-full  min-h-screen'>

      {/* Logo  */}
      <div className='w-full flex items-center justify-center p-5'>
        <h1 className='text-4xl'>Lensly</h1>
      </div>

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
              <div key={image.id} onClick={() => openModal(image)} className="relative h-[300px] overflow-hidden rounded-lg shadow-md">
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

                onClick={(e) => e.stopPropagation()}
              >
                <img src={selectedImage.urls.regular} alt={selectedImage.alt_description || "Image"} className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg" />

                <button
                  className='absolute top-4 right-4 text-red-700 bg-black w-10 h-10 flex items-center justify-center rounded-full text-2xl cursor-pointer hover:text-red-500 transition duration-300'
                  onClick={closeModal}><IoClose /></button>


                <div className='flex items-center justify-center gap-4 absolute bottom-4 right-4'>
                  <button
                    onClick={() => downloadImage(selectedImage.urls.full, selectedImage.alt_description)}
                    className=' text-red-700 bg-black w-10 h-10 flex items-center justify-center rounded-full text-lg cursor-pointer hover:text-red-500 transition duration-300'>
                    <FaDownload />
                  </button>


                </div>


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