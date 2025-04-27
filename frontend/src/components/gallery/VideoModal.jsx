import React, { useState } from 'react';
import { MoreVertical, Trash2, Download } from 'lucide-react';

const VideoModal = ({ video, onClose, onVideoDeleted }) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleDownload = () => {
    try {
      setIsDownloading(true);
      
      // Get user ID from local storage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        throw new Error('User not logged in');
      }
      
      // Generate download URL using backend endpoint
      const downloadUrl = `http://localhost:3001/api/gallery/download/${video.id}?user_id=${userId}`;
      
      // Create and click a download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = ''; // Let the server set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error initiating download:', error);
      alert('Failed to download video. Please try again later.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          throw new Error('User not logged in');
        }
        
        const response = await fetch('http://localhost:3001/api/gallery/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gallery_id: video.id,
            user_id: userId
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete video');
        }
        
        console.log('Video deleted successfully:', result);
        
        // Ensure we call onVideoDeleted to update the parent component
        if (onVideoDeleted) {
          onVideoDeleted(video.id);
        }
        
        // Close the modal
        onClose();
      } catch (error) {
        console.error('Error deleting video:', error);
        alert(`Failed to delete video: ${error.message}`);
      } finally {
        setIsDeleting(false);
        setIsDropdownOpen(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg max-w-xl w-full relative">
        <button 
          className="absolute top-2 right-2 text-xl bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300" 
          onClick={onClose}
          disabled={isDeleting || isDownloading}
        >
          ✕
        </button>
        
        <div className="bg-black rounded-lg overflow-hidden mb-3">
          <video 
            src={video.url} 
            controls
            className="w-full max-h-96 object-contain"
          />
        </div>

        <div className='flex justify-between items-center'>
          <div>
            <p className="text-sm text-gray-700 font-medium mt-1">Emotion: {video.emotion || "Unknown"}</p>
            <p className="text-sm text-gray-500 mt-1">
              Recorded on {new Date(video.created_at).toLocaleDateString()} at {new Date(video.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="relative">
            <button 
              onClick={toggleDropdown} 
              className="text-gray-600 mt-3 p-2 hover:bg-gray-100 rounded-full"
              disabled={isDeleting || isDownloading}
            >
              <MoreVertical size={20} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 w-52 bg-white border rounded shadow-lg z-10 mt-1">
                <button
                  className="flex w-full text-left px-4 py-2 hover:bg-gray-100 items-center"
                  onClick={handleDownload}
                  disabled={isDeleting || isDownloading}
                >
                  <Download size={16} className="mr-2" />
                  {isDownloading ? 'Downloading...' : 'Save Video'}
                </button>
                <button
                  className="flex w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 items-center"
                  onClick={handleDelete}
                  disabled={isDeleting || isDownloading}
                >
                  <Trash2 size={16} className="mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Video'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;