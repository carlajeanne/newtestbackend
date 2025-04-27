import React, { useState, useEffect } from 'react';
import VideoModal from './VideoModal';
import PhotoModal from './PhotoModal';
import { useNavigate } from 'react-router-dom';
import VIDEO from '/public/favicon.png';


const Gallery = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch photos and videos from backend
  const fetchGalleryItems = async () => {
    const user_id = localStorage.getItem("user_id");
    
    if (!user_id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Fetch photos
      const photosResponse = await fetch(`https://testdockerbackend.azurewebsites.net/api/gallery/photos?user_id=${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!photosResponse.ok) {
        throw new Error(`Error fetching photos: ${photosResponse.status}`);
      }
      
      const photosData = await photosResponse.json();
      
      // Fetch videos
      const videosResponse = await fetch(`https://testdockerbackend.azurewebsites.net/api/gallery/videos?user_id=${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!videosResponse.ok) {
        throw new Error(`Error fetching videos: ${videosResponse.status}`);
      }
      
      const videosData = await videosResponse.json();
      
      setPhotos(photosData.photos || []);
      setVideos(videosData.videos || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError(`Failed to load gallery: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handlePhotoDeleted = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleVideoDeleted = (videoId) => {
    setVideos(videos.filter(video => video.id !== videoId));
  };

  const handleDashboardButtonClick = () => {
    navigate('/dashboard-page');
  };

  return (
    <div id="home"
    className='text-black bg-very-bright-pastel-orange bg-cover bg-center min-h-screen items-center px-20 py-8 font-montserrat'
    >
      <button
        onClick={handleDashboardButtonClick}
        className="absolute top-4 left-4 bg-dark-grayish-orange text-white px-4 py-2 rounded hover:bg-yellow"
      >
        Your Dog's Emotion
      </button>

      {/* Logo Section */}
      <div className="flex justify-center mt-20 ">
        <img src="/public/logo.png" alt="Logo" className="w-25 h-20" />
      </div>

      {/* Error and Loading States */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-40 mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-pastel-orange"></div>
          <p className="ml-3">Loading gallery...</p>
        </div>
      ) : (
        <>
          {/* Photos Section */}
          <h2 className="text-2xl font-bold mt-8 mb-4">Photos</h2>
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.length > 0 ? (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white shadow-lg p-4 rounded cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {/* Photo Thumbnail */}
                  <div className="bg-gray-200 rounded w-full h-40 overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={`${photo.pet_name || 'Pet'} photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Photo Information */}
                  <div className="mt-2 text-left">
                    <p className="text-sm text-gray-500">{photo.emotion || "Emotion"}</p>
                    <p className="text-sm text-gray-500">{new Date(photo.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>No photos yet. Capture some moments with your pet!</p>
              </div>
            )}
          </div>

          {/* Videos Section */}
          <h2 className="text-2xl font-bold mt-12 mb-4">Videos</h2>
          <div className="pt-4 grid grid-cols-2 gap-8">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video.id}
                  className={`bg-white shadow-lg p-4 rounded cursor-pointer hover:shadow-xl transition-shadow ${
                    video.shape === 'rectangle' ? 'col-span-2' : 'col-span-1'
                  }`}
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-full h-48 rounded overflow-hidden bg-gray-200">
                    <img
                      src={video.url || VIDEO}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <span className="text-white text-4xl">▶</span>
                    </div>
                  </div>

                  {/* Video Information */}
                  <div className="mt-2 text-left">
                    <h3 className="text-lg font-semibold">{video.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(video.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p>No videos yet. Record some fun moments with your pet!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Video Modal */}
      {selectedVideo &&  (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          onVideoDeleted={handleVideoDeleted}
        />
      )}
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onPhotoDeleted={handlePhotoDeleted}
        />
      )}
    </div>
  );
};

export default Gallery;