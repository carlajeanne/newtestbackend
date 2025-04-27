import { useState } from "react";
import TeamMember from './TeamMember';
import GOLENA from '../../assets/GOLENA.jpg';
import DORADO from '../../assets/DORADO.png';
import REYES from '../../assets/REYES.jpg';
import TAPAR from '../../assets/TAPAR.png';



const OurTeam = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [enlargedIndex, setEnlargedIndex] = useState(null);

  const teamMembers = [
      {
          name: 'Carla Jeanne B. Goleña',
          role: 'Team Leader',
          image: GOLENA,
          description: 'Oversees project execution and ensures team collaboration.',
          facebookLink: 'https://facebook.com',
          instagramLink: 'https://instagram.com',
          linkedInLink: 'https://linkedin.com'
      },
      {
          name: 'Noah B. Dorado',
          role: 'Computer Vision Lead',
          image: DORADO,
          description: 'Leads the development of computer vision applications.',
          facebookLink: 'https://facebook.com',
          instagramLink: 'https://instagram.com',
          linkedInLink: 'https://linkedin.com'
      },
      {
          name: 'Ahijah Reign M. Reyes',
          role: 'Hardware Lead',
          image: REYES,
          description: 'Manages hardware design and integration.',
          facebookLink: 'https://facebook.com',
          instagramLink: 'https://instagram.com',
          linkedInLink: 'https://linkedin.com'
      },
      {
          name: 'Edel Mae T. Tapar',
          role: 'Website Development Lead',
          image: TAPAR,
          description: 'Directs the design and development of websites.',
          facebookLink: 'https://facebook.com',
          instagramLink: 'https://instagram.com',
          linkedInLink: 'https://linkedin.com'
      },
  ];

  const handleToggle = (index) => {
      setOpenIndex(openIndex === index ? null : index);
  };

  const handleImageClick = (index) => {
      setEnlargedIndex(enlargedIndex === index ? null : index);
  };

  return (
      <div 
          id = "team"
          className="bg-our-team-background min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      >
          <div className="bg-opacity-70 bg-white py-8">
              <div className="container mx-auto text-center">
                  <h1 className="text-3xl text-dark-pastel-orange font-bold mb-4">Meet Our Team</h1>
                  <div className="flex flex-wrap justify-center items-center">
                      {teamMembers.map((member, index) => (
                          <TeamMember 
                              key={index} 
                              name={member.name} 
                              role={member.role} 
                              image={member.image} 
                              description={member.description}
                              facebookLink={member.facebookLink}
                              instagramLink={member.instagramLink}
                              linkedInLink={member.linkedInLink}
                              onToggle={() => handleToggle(index)}
                              isOpen={openIndex === index} 
                              onImageClick={() => handleImageClick(index)}
                              isImageEnlarged={enlargedIndex === index}
                          />
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );
};

export default OurTeam;