import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import Herosection from "./Herosection";
import Servicessection from "./Servicessection";
import AboutSection from "./AboutSection";
import Homepart3 from "./Homepart3";
import Footer from "./Footer";


const Home = React.memo(function Home({user}) {
    const location = useLocation();

    // Handle hash fragments when navigating from other pages
    useEffect(() => {
        const scrollToSection = (sectionId) => {
            if (sectionId) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 200);
            }
        };

        // Check React Router location state for scrollTo
        if (location.state?.scrollTo) {
            scrollToSection(location.state.scrollTo);
            // Clear the state to prevent re-scrolling on re-renders
            window.history.replaceState({ ...location.state, scrollTo: undefined }, '');
        }
        // Check React Router location hash
        else if (location.hash) {
            const sectionId = location.hash.substring(1);
            scrollToSection(sectionId);
        } 
        // Also check window.location.hash (in case React Router doesn't capture it)
        else if (window.location.hash) {
            const sectionId = window.location.hash.substring(1);
            scrollToSection(sectionId);
        }
    }, [location.hash, location.pathname, location.state]);
    // const [user, setUser] = useState(null);
    // useEffect(() => {
    //     const getProfile = async (userId) => {
    //       const { data, error } = await supabase
    //         .from("users")
    //         .select("*")
    //         .eq("id", userId) // assuming 'id' in users matches auth id
    //         .single();
      
    //       if (error) {
    //         console.error("Error fetching user profile:", error);
    //       } else {
    //         setUser(data);
    //         console.log("Fetched user profile:", data); 
           
    //       }
    //     };
      
    //     supabase.auth.getSession().then(({ data }) => {
    //       const sessionUser = data.session?.user;
    //       if (sessionUser) getProfile(sessionUser.id);
    //     });
      
    //     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    //       const sessionUser = session?.user;
    //       if (sessionUser) getProfile(sessionUser.id);
    //       else setUser(null); // user logged out
    //     });
      
      //   return () => {
      //     listener?.subscription.unsubscribe();
      //   };
      // }, []);
      
  
     

    return (
        <div>
            <Navbar  user={user} />
            <Herosection />
            <div id="features" style={{ scrollMarginTop: '100px' }}>
                <Servicessection />
            </div>
            <div id="how-it-works" style={{ scrollMarginTop: '100px' }}>
                <AboutSection />
            </div>
            <div id="faq" style={{ scrollMarginTop: '100px' }}>
                <Homepart3 />
            </div>
            <div id="about" style={{ scrollMarginTop: '100px' }}>
                <Footer />
            </div>
        </div>
    )
});

Home.displayName = 'Home';

export default Home;