import AboutDoggo from "../components/home/AboutDoggo"
import ContactUs from "../components/home/ContactUs"
import Footer from "../components/home/Footer"
import Home from "../components/home/Home"
import Navbar from "../components/home/Navbar"
import OurTeam from "../components/home/OurTeam"

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Home />
      <AboutDoggo />
      <OurTeam />
      <ContactUs />
      <Footer />
    </div>
  )
}

export default LandingPage