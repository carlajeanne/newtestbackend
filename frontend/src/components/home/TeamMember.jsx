const TeamMember = ({ 
  name, role, image, description, facebookLink, instagramLink, linkedInLink, onToggle, isOpen, onImageClick, isImageEnlarged 
}) => {
  return (
      <div className="flex flex-col items-center m-4">
          <img
              src={image}
              alt={`${name}'s photo`}
              onClick={onImageClick}
              className={`cursor-pointer rounded-full border-2 border-dark-grayish-orange mb-2 transition-transform duration-300 ${
                  isImageEnlarged ? 'w-64 h-64' : 'w-32 h-32'
              }`}
          />
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
          <div className="flex space-x-4 mt-2">
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                  <i className="fab fa-facebook-f"></i>
              </a>
              <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                  <i className="fab fa-instagram"></i>
              </a>
              <a href={linkedInLink} target="_blank" rel="noopener noreferrer" className="text-black text-2xl hover:text-gray-500">
                  <i className="fab fa-linkedin-in"></i>
              </a>
          </div>
          <button 
              onClick={onToggle} 
              className="mt-3 bg-dark-pastel-orange text-white rounded px-4 py-2 hover:bg-dark-grayish-orange transition"
          >
              {isOpen ? 'Hide Details' : 'See Details'}
          </button>
          
          {isOpen && (
              <div className="mt-2 p-4 bg-gray-100 rounded shadow">
                  <p>{description}</p>
              </div>
          )}
      </div>
  );
};

export default TeamMember;